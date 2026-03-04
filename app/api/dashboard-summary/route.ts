import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getStatus } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Overall totals
    const totals = await sql`
      SELECT
        COALESCE(SUM(produced_quantity), 0) AS total_production,
        COALESCE(SUM(reject_quantity), 0) AS total_reject
      FROM production_records
    `

    const totalProduction = Number(totals[0].total_production)
    const totalReject = Number(totals[0].total_reject)
    const overallRejectPercent = totalProduction > 0 ? (totalReject / totalProduction) * 100 : 0

    // Month-to-date
    const mtd = await sql`
      SELECT
        COALESCE(SUM(produced_quantity), 0) AS mtd_production,
        COALESCE(SUM(reject_quantity), 0) AS mtd_reject
      FROM production_records
      WHERE date >= date_trunc('month', CURRENT_DATE)
    `
    const mtdProd = Number(mtd[0].mtd_production)
    const mtdRej = Number(mtd[0].mtd_reject)
    const mtdPercent = mtdProd > 0 ? (mtdRej / mtdProd) * 100 : 0

    // Critical items count
    const criticalItems = await sql`
      SELECT COUNT(DISTINCT item_code) AS cnt
      FROM (
        SELECT item_code,
               SUM(reject_quantity)::float / NULLIF(SUM(produced_quantity), 0) * 100 AS rp
        FROM production_records
        GROUP BY item_code
      ) sub
      WHERE rp > 7
    `

    // Top 3 reject contributors
    const topContributors = await sql`
      SELECT item_code,
             ROUND((SUM(reject_quantity)::numeric / NULLIF(SUM(produced_quantity), 0) * 100), 2) AS reject_percent,
             SUM(reject_quantity) AS total_reject
      FROM production_records
      GROUP BY item_code
      ORDER BY reject_percent DESC
      LIMIT 3
    `

    return NextResponse.json({
      totalProduction,
      totalReject,
      overallRejectPercent: Math.round(overallRejectPercent * 100) / 100,
      criticalItemsCount: Number(criticalItems[0].cnt),
      monthToDateProduction: mtdProd,
      monthToDateReject: mtdRej,
      monthToDateRejectPercent: Math.round(mtdPercent * 100) / 100,
      topContributors: topContributors.map((r) => ({
        item_code: r.item_code,
        reject_percent: Number(r.reject_percent),
        total_reject: Number(r.total_reject),
      })),
      riskLevel: getStatus(overallRejectPercent),
    })
  } catch (error) {
    console.error("Dashboard summary error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard summary" }, { status: 500 })
  }
}
