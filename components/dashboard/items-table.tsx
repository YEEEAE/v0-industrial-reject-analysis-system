"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ItemsTable() {
  const { data, isLoading } = useSWR("/api/items-status")

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 w-40 rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-[200px] rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.error) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Items Status Overview</CardTitle>
        <CardDescription>All items with reject classification and latest data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-3 py-2 font-medium text-muted-foreground">Item Code</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Line</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">Produced</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">Rejected</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">Reject %</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map(
                (item: {
                  item_code: string
                  production_line: string
                  totalProduced: number
                  totalReject: number
                  rejectPercent: number
                  status: "NORMAL" | "WARNING" | "CRITICAL"
                }) => (
                  <tr
                    key={`${item.item_code}-${item.production_line}`}
                    className={`border-b border-border/50 transition-colors hover:bg-muted/50 ${
                      item.status === "CRITICAL" ? "bg-status-critical/5" : ""
                    }`}
                  >
                    <td className="px-3 py-2 font-mono font-medium">{item.item_code}</td>
                    <td className="px-3 py-2">{item.production_line}</td>
                    <td className="px-3 py-2 text-right">{item.totalProduced.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{item.totalReject.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {item.rejectPercent.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        className={
                          item.status === "CRITICAL"
                            ? "bg-status-critical/15 text-status-critical border-status-critical/30"
                            : item.status === "WARNING"
                              ? "bg-status-warning/15 text-status-warning border-status-warning/30"
                              : "bg-status-normal/15 text-status-normal border-status-normal/30"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
