"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { format, parseISO } from "date-fns"

export function TrendLineChart() {
  const { data, isLoading } = useSWR("/api/reject-trend")

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 w-40 rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.error) return null

  const formatted = data.map((d: { date: string; rejectPercent: number; movingAverage: number | null }) => ({
    ...d,
    dateLabel: format(parseISO(d.date), "MMM dd"),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Reject Trend Over Time</CardTitle>
        <CardDescription>Daily reject % with 7-day moving average</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="dateLabel" className="text-xs" tick={{ fill: "var(--color-muted-foreground)" }} interval="preserveStartEnd" />
            <YAxis className="text-xs" tick={{ fill: "var(--color-muted-foreground)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-card-foreground)",
              }}
              formatter={(value: number | null, name: string) => [
                value !== null ? `${value.toFixed(2)}%` : "N/A",
                name === "rejectPercent" ? "Reject %" : "7-Day Avg",
              ]}
            />
            <Legend />
            <ReferenceLine y={5} stroke="var(--color-status-warning)" strokeDasharray="5 5" />
            <ReferenceLine y={7} stroke="var(--color-status-critical)" strokeDasharray="5 5" />
            <Line
              type="monotone"
              dataKey="rejectPercent"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Reject %"
            />
            <Line
              type="monotone"
              dataKey="movingAverage"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              name="7-Day Avg"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
