import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        item_code,
        SUM(reject_quantity) AS total_reject,
        ROUND((SUM(reject_quantity)::numeric / NULLIF(SUM(produced_quantity), 0) * 100), 2) AS reject_percent
      FROM production_records
      GROUP BY item_code
      ORDER BY total_reject DESC
    `

    const grandTotal = rows.reduce((sum, r) => sum + Number(r.total_reject), 0)
    let cumulative = 0

    const result = rows.map((r) => {
      const totalReject = Number(r.total_reject)
      cumulative += totalReject
      return {
        item_code: r.item_code,
        totalReject,
        rejectPercent: Number(r.reject_percent),
        cumulativePercent: Math.round((cumulative / grandTotal) * 10000) / 100,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Pareto analysis error:", error)
    return NextResponse.json({ error: "Failed to fetch pareto analysis" }, { status: 500 })
  }
}
