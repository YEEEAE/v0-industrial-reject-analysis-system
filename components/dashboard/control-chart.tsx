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
  ResponsiveContainer,
  Legend,
  Scatter,
  ComposedChart,
} from "recharts"
import { format, parseISO } from "date-fns"

export function ControlChart() {
  const { data, isLoading } = useSWR("/api/control-chart")

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

  const formatted = data.map(
    (d: { date: string; rejectPercent: number; mean: number; ucl: number; lcl: number; isAnomaly: boolean }) => ({
      ...d,
      dateLabel: format(parseISO(d.date), "MMM dd"),
      anomalyPoint: d.isAnomaly ? d.rejectPercent : null,
    })
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">SPC Control Chart</CardTitle>
        <CardDescription>
          Statistical Process Control with UCL/LCL limits (3-sigma)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
              formatter={(value: number | null, name: string) => {
                if (value === null) return ["N/A", name]
                const labels: Record<string, string> = {
                  rejectPercent: "Reject %",
                  mean: "Mean",
                  ucl: "UCL",
                  lcl: "LCL",
                  anomalyPoint: "Anomaly",
                }
                return [`${value.toFixed(2)}%`, labels[name] || name]
              }}
            />
            <Legend />
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
              dataKey="mean"
              stroke="var(--color-chart-2)"
              strokeWidth={1.5}
              strokeDasharray="8 4"
              dot={false}
              name="Mean"
            />
            <Line
              type="monotone"
              dataKey="ucl"
              stroke="var(--color-status-critical)"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
              name="UCL"
            />
            <Line
              type="monotone"
              dataKey="lcl"
              stroke="var(--color-status-normal)"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
              name="LCL"
            />
            <Scatter
              dataKey="anomalyPoint"
              fill="var(--color-status-critical)"
              name="Anomaly"
              shape="diamond"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
