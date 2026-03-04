"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

const COLORS = {
  NORMAL: "var(--color-status-normal)",
  WARNING: "var(--color-status-warning)",
  CRITICAL: "var(--color-status-critical)",
}

export function SeverityPieChart() {
  const { data, isLoading } = useSWR("/api/items-status")

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

  const counts = { NORMAL: 0, WARNING: 0, CRITICAL: 0 }
  data.forEach((item: { status: keyof typeof counts }) => {
    counts[item.status]++
  })

  const pieData = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Severity Distribution</CardTitle>
        <CardDescription>Items by reject severity classification</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              paddingAngle={3}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {pieData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name as keyof typeof COLORS]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-card-foreground)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
