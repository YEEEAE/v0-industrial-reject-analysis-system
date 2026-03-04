export interface DashboardSummary {
  totalProduction: number
  totalReject: number
  overallRejectPercent: number
  criticalItemsCount: number
  monthToDateProduction: number
  monthToDateReject: number
  monthToDateRejectPercent: number
  topContributors: { item_code: string; reject_percent: number; total_reject: number }[]
  riskLevel: "NORMAL" | "WARNING" | "CRITICAL"
}

export interface RejectTrendPoint {
  date: string
  rejectPercent: number
  movingAverage: number | null
}

export interface ParetoItem {
  item_code: string
  totalReject: number
  rejectPercent: number
  cumulativePercent: number
}

export interface ControlChartPoint {
  date: string
  rejectPercent: number
  mean: number
  ucl: number
  lcl: number
  isAnomaly: boolean
}

export interface ItemStatus {
  item_code: string
  production_line: string
  totalProduced: number
  totalReject: number
  rejectPercent: number
  status: "NORMAL" | "WARNING" | "CRITICAL"
  latestDate: string
}

export interface ExecutiveReport {
  generatedAt: string
  period: string
  kpis: DashboardSummary
  insights: string[]
  recommendations: string[]
  forecast: { nextPeriodEstimate: number; trend: "improving" | "stable" | "deteriorating" }
}

export function getStatus(rejectPercent: number): "NORMAL" | "WARNING" | "CRITICAL" {
  if (rejectPercent <= 5) return "NORMAL"
  if (rejectPercent <= 7) return "WARNING"
  return "CRITICAL"
}
