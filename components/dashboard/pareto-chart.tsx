"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

export function ParetoChart() {
  const { data, isLoading } = useSWR("/api/pareto-analysis")

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Pareto Analysis</CardTitle>
        <CardDescription>Reject count with cumulative percentage line</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="item_code" className="text-xs" tick={{ fill: "var(--color-muted-foreground)" }} />
            <YAxis
              yAxisId="left"
              className="text-xs"
              tick={{ fill: "var(--color-muted-foreground)" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              className="text-xs"
              tick={{ fill: "var(--color-muted-foreground)" }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-card-foreground)",
              }}
              formatter={(value: number, name: string) => {
                if (name === "totalReject") return [value.toLocaleString(), "Total Rejects"]
                return [`${value}%`, "Cumulative %"]
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="totalReject" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} name="Total Rejects" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulativePercent"
              stroke="var(--color-chart-4)"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Cumulative %"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
