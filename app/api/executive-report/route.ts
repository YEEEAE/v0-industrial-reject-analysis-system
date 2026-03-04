import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getStatus } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Overall KPIs
    const totals = await sql`
      SELECT
        COALESCE(SUM(produced_quantity), 0) AS total_production,
        COALESCE(SUM(reject_quantity), 0) AS total_reject
      FROM production_records
    `
    const totalProduction = Number(totals[0].total_production)
    const totalReject = Number(totals[0].total_reject)
    const overallRejectPercent = totalProduction > 0 ? (totalReject / totalProduction) * 100 : 0

    // MTD
    const mtd = await sql`
      SELECT
        COALESCE(SUM(produced_quantity), 0) AS p,
        COALESCE(SUM(reject_quantity), 0) AS r
      FROM production_records
      WHERE date >= date_trunc('month', CURRENT_DATE)
    `
    const mtdProd = Number(mtd[0].p)
    const mtdRej = Number(mtd[0].r)

    // Critical items
    const criticalItems = await sql`
      SELECT item_code,
             ROUND((SUM(reject_quantity)::numeric / NULLIF(SUM(produced_quantity), 0) * 100), 2) AS rp
      FROM production_records
      GROUP BY item_code
      HAVING (SUM(reject_quantity)::float / NULLIF(SUM(produced_quantity), 0) * 100) > 7
    `

    // Top contributors
    const topContributors = await sql`
      SELECT item_code,
             ROUND((SUM(reject_quantity)::numeric / NULLIF(SUM(produced_quantity), 0) * 100), 2) AS reject_percent,
             SUM(reject_quantity) AS total_reject
      FROM production_records
      GROUP BY item_code
      ORDER BY reject_percent DESC
      LIMIT 3
    `

    // Trend data for forecast
    const trendData = await sql`
      SELECT
        date::text,
        ROUND((SUM(reject_quantity)::numeric / NULLIF(SUM(produced_quantity), 0) * 100), 2) AS reject_percent
      FROM production_records
      GROUP BY date
      ORDER BY date ASC
    `

    // Simple linear regression for forecast
    const n = trendData.length
    const xValues = trendData.map((_, i) => i)
    const yValues = trendData.map((r) => Number(r.reject_percent))
    const xMean = xValues.reduce((a, b) => a + b, 0) / n
    const yMean = yValues.reduce((a, b) => a + b, 0) / n

    let numerator = 0
    let denominator = 0
    for (let i = 0; i < n; i++) {
      numerator += (xValues[i] - xMean) * (yValues[i] - yMean)
      denominator += Math.pow(xValues[i] - xMean, 2)
    }
    const slope = denominator !== 0 ? numerator / denominator : 0
    const intercept = yMean - slope * xMean
    const nextPeriodEstimate = Math.round((slope * n + intercept) * 100) / 100

    let trend: "improving" | "stable" | "deteriorating" = "stable"
    if (slope < -0.05) trend = "improving"
    else if (slope > 0.05) trend = "deteriorating"

    // Generate insights
    const insights: string[] = []
    insights.push(
      `Overall reject rate is ${(Math.round(overallRejectPercent * 100) / 100).toFixed(2)}%, classified as ${getStatus(overallRejectPercent)}.`
    )
    if (criticalItems.length > 0) {
      insights.push(
        `${criticalItems.length} item(s) exceed the 7% critical threshold: ${criticalItems.map((i) => `${i.item_code} (${i.rp}%)`).join(", ")}.`
      )
    }
    insights.push(
      `Top reject contributor is ${topContributors[0]?.item_code} at ${topContributors[0]?.reject_percent}%.`
    )
    insights.push(
      `Month-to-date reject rate: ${mtdProd > 0 ? ((mtdRej / mtdProd) * 100).toFixed(2) : 0}%.`
    )

    // Generate recommendations
    const recommendations: string[] = []
    if (overallRejectPercent > 7) {
      recommendations.push("URGENT: Implement immediate corrective actions for critical reject levels.")
    }
    if (criticalItems.length > 0) {
      recommendations.push(
        `Focus root cause analysis on: ${criticalItems.map((i) => i.item_code).join(", ")}.`
      )
    }
    if (trend === "deteriorating") {
      recommendations.push("Trend is deteriorating. Review recent process changes and quality controls.")
    } else if (trend === "improving") {
      recommendations.push("Positive trend detected. Continue current improvement initiatives.")
    }
    recommendations.push("Conduct Pareto analysis to prioritize improvement efforts on the vital few items.")

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      period: `Last 30 days ending ${new Date().toISOString().split("T")[0]}`,
      kpis: {
        totalProduction,
        totalReject,
        overallRejectPercent: Math.round(overallRejectPercent * 100) / 100,
        criticalItemsCount: criticalItems.length,
        monthToDateProduction: mtdProd,
        monthToDateReject: mtdRej,
        monthToDateRejectPercent: mtdProd > 0 ? Math.round((mtdRej / mtdProd) * 10000) / 100 : 0,
        topContributors: topContributors.map((r) => ({
          item_code: r.item_code,
          reject_percent: Number(r.reject_percent),
          total_reject: Number(r.total_reject),
        })),
        riskLevel: getStatus(overallRejectPercent),
      },
      insights,
      recommendations,
      forecast: { nextPeriodEstimate, trend },
    })
  } catch (error) {
    console.error("Executive report error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
