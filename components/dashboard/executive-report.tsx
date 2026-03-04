"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react"

interface ReportData {
  generatedAt: string
  period: string
  kpis: {
    totalProduction: number
    totalReject: number
    overallRejectPercent: number
    criticalItemsCount: number
    monthToDateRejectPercent: number
    topContributors: { item_code: string; reject_percent: number; total_reject: number }[]
    riskLevel: string
  }
  insights: string[]
  recommendations: string[]
  forecast: {
    nextPeriodEstimate: number
    trend: "improving" | "stable" | "deteriorating"
  }
}

export function ExecutiveReport() {
  const [report, setReport] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function generateReport() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/executive-report")
      const data = await res.json()
      setReport(data)
    } catch {
      // Error handling
    }
    setIsLoading(false)
  }

  const TrendIcon = report?.forecast.trend === "improving"
    ? TrendingDown
    : report?.forecast.trend === "deteriorating"
      ? TrendingUp
      : Minus

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4" />
              Executive Report
            </CardTitle>
            <CardDescription>Generate a comprehensive analysis report</CardDescription>
          </div>
          <Button onClick={generateReport} disabled={isLoading} size="sm">
            {isLoading ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </CardHeader>
      {report && (
        <CardContent className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Report Period</p>
              <p className="font-medium">{report.period}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Generated</p>
              <p className="font-medium">{new Date(report.generatedAt).toLocaleString()}</p>
            </div>
            <Badge
              className={
                report.kpis.riskLevel === "CRITICAL"
                  ? "bg-status-critical/15 text-status-critical border-status-critical/30"
                  : report.kpis.riskLevel === "WARNING"
                    ? "bg-status-warning/15 text-status-warning border-status-warning/30"
                    : "bg-status-normal/15 text-status-normal border-status-normal/30"
              }
            >
              Risk Level: {report.kpis.riskLevel}
            </Badge>
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Total Production</p>
              <p className="text-lg font-bold">{report.kpis.totalProduction.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Total Reject</p>
              <p className="text-lg font-bold">{report.kpis.totalReject.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Reject Rate</p>
              <p className="text-lg font-bold">{report.kpis.overallRejectPercent.toFixed(2)}%</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Critical Items</p>
              <p className="text-lg font-bold">{report.kpis.criticalItemsCount}</p>
            </div>
          </div>

          {/* Top Contributors */}
          <div>
            <h4 className="mb-2 text-sm font-semibold">Top Reject Contributors</h4>
            <div className="flex flex-col gap-2">
              {report.kpis.topContributors.map((c, i) => (
                <div key={c.item_code} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="font-mono text-sm font-medium">{c.item_code}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{c.total_reject.toLocaleString()} units</span>
                    <Badge
                      className={
                        c.reject_percent > 7
                          ? "bg-status-critical/15 text-status-critical border-status-critical/30"
                          : c.reject_percent > 5
                            ? "bg-status-warning/15 text-status-warning border-status-warning/30"
                            : "bg-status-normal/15 text-status-normal border-status-normal/30"
                      }
                    >
                      {c.reject_percent.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forecast */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <TrendIcon className="h-4 w-4" />
              Forecast
            </h4>
            <p className="text-sm">
              Next period estimated reject rate:{" "}
              <span className="font-bold">{report.forecast.nextPeriodEstimate.toFixed(2)}%</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Trend:{" "}
              <span
                className={
                  report.forecast.trend === "improving"
                    ? "text-status-normal"
                    : report.forecast.trend === "deteriorating"
                      ? "text-status-critical"
                      : "text-muted-foreground"
                }
              >
                {report.forecast.trend.charAt(0).toUpperCase() + report.forecast.trend.slice(1)}
              </span>
            </p>
          </div>

          {/* Insights */}
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="h-4 w-4" />
              Key Insights
            </h4>
            <ul className="flex flex-col gap-1.5">
              {report.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Recommendations
            </h4>
            <ul className="flex flex-col gap-1.5">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-status-warning/15 text-[10px] font-bold text-status-warning">
                    {i + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
