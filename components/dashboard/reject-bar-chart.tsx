"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts"

export function RejectBarChart() {
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
        <CardTitle className="text-base font-semibold">Reject % per Item</CardTitle>
        <CardDescription>Bar chart showing reject percentage by item code</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="item_code" className="text-xs" tick={{ fill: "var(--color-muted-foreground)" }} />
            <YAxis className="text-xs" tick={{ fill: "var(--color-muted-foreground)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-card-foreground)",
              }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, "Reject %"]}
            />
            <ReferenceLine y={5} stroke="var(--color-status-warning)" strokeDasharray="5 5" label={{ value: "Warning 5%", fill: "var(--color-status-warning)", fontSize: 11 }} />
            <ReferenceLine y={7} stroke="var(--color-status-critical)" strokeDasharray="5 5" label={{ value: "Critical 7%", fill: "var(--color-status-critical)", fontSize: 11 }} />
            <Bar dataKey="rejectPercent" radius={[4, 4, 0, 0]}>
              {data.map((entry: { rejectPercent: number }, index: number) => (
                <Cell
                  key={index}
                  fill={
                    entry.rejectPercent > 7
                      ? "var(--color-status-critical)"
                      : entry.rejectPercent > 5
                        ? "var(--color-status-warning)"
                        : "var(--color-status-normal)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
