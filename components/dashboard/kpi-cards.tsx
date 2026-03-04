"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Factory, AlertTriangle, TrendingDown, Package } from "lucide-react"

export function KPICards() {
  const { data, isLoading } = useSWR("/api/dashboard-summary")

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data || data.error) return null

  const cards = [
    {
      title: "Total Production",
      value: data.totalProduction?.toLocaleString() ?? "0",
      icon: Factory,
      description: `MTD: ${data.monthToDateProduction?.toLocaleString() ?? "0"}`,
      color: "text-primary",
    },
    {
      title: "Total Reject",
      value: data.totalReject?.toLocaleString() ?? "0",
      icon: Package,
      description: `MTD: ${data.monthToDateReject?.toLocaleString() ?? "0"}`,
      color: "text-status-warning",
    },
    {
      title: "Overall Reject %",
      value: `${data.overallRejectPercent?.toFixed(2) ?? "0.00"}%`,
      icon: TrendingDown,
      description: `Status: ${data.riskLevel}`,
      color:
        data.riskLevel === "CRITICAL"
          ? "text-status-critical"
          : data.riskLevel === "WARNING"
            ? "text-status-warning"
            : "text-status-normal",
    },
    {
      title: "Critical Items",
      value: data.criticalItemsCount ?? 0,
      icon: AlertTriangle,
      description: data.criticalItemsCount > 0 ? "Items above 7% threshold" : "All items within limits",
      color: data.criticalItemsCount > 0 ? "text-status-critical" : "text-status-normal",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
