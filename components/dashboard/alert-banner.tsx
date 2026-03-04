"use client"

import useSWR from "swr"
import { AlertTriangle, XCircle } from "lucide-react"
import { useState } from "react"

export function AlertBanner() {
  const { data } = useSWR("/api/dashboard-summary")
  const { data: itemsData } = useSWR("/api/items-status")
  const [dismissed, setDismissed] = useState<string[]>([])

  if (!data) return null

  const alerts: { id: string; level: "warning" | "critical"; message: string }[] = []

  if (data.overallRejectPercent > 7) {
    alerts.push({
      id: "overall-critical",
      level: "critical",
      message: `CRITICAL: Overall reject rate at ${data.overallRejectPercent.toFixed(2)}% exceeds 7% threshold`,
    })
  } else if (data.overallRejectPercent > 5) {
    alerts.push({
      id: "overall-warning",
      level: "warning",
      message: `WARNING: Overall reject rate at ${data.overallRejectPercent.toFixed(2)}% exceeds 5% threshold`,
    })
  }

  if (itemsData && Array.isArray(itemsData)) {
    const criticalItems = itemsData.filter(
      (item: { status: string; item_code: string }) => item.status === "CRITICAL"
    )
    criticalItems.forEach((item: { item_code: string; rejectPercent: number }) => {
      alerts.push({
        id: `item-${item.item_code}`,
        level: "critical",
        message: `${item.item_code} reject rate at ${item.rejectPercent.toFixed(2)}% - immediate attention required`,
      })
    })
  }

  const visibleAlerts = alerts.filter((a) => !dismissed.includes(a.id))
  if (visibleAlerts.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
            alert.level === "critical"
              ? "border-status-critical/30 bg-status-critical/10 text-status-critical"
              : "border-status-warning/30 bg-status-warning/10 text-status-warning"
          }`}
          role="alert"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setDismissed((prev) => [...prev, alert.id])}
            className="ml-2 shrink-0 opacity-70 hover:opacity-100"
            aria-label="Dismiss alert"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
