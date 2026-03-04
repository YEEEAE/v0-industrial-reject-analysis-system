import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        date::text,
        ROUND((SUM(reject_quantity)::numeric / NULLIF(SUM(produced_quantity), 0) * 100), 2) AS reject_percent
      FROM production_records
      GROUP BY date
      ORDER BY date ASC
    `

    const data = rows.map((r) => ({
      date: r.date,
      rejectPercent: Number(r.reject_percent),
    }))

    // Calculate mean
    const mean = data.reduce((sum, p) => sum + p.rejectPercent, 0) / data.length

    // Calculate standard deviation
    const variance =
      data.reduce((sum, p) => sum + Math.pow(p.rejectPercent - mean, 2), 0) / data.length
    const stdDev = Math.sqrt(variance)

    // SPC control limits: mean +/- 3 sigma
    const ucl = mean + 3 * stdDev
    const lcl = Math.max(0, mean - 3 * stdDev)

    const result = data.map((point) => ({
      ...point,
      mean: Math.round(mean * 100) / 100,
      ucl: Math.round(ucl * 100) / 100,
      lcl: Math.round(lcl * 100) / 100,
      isAnomaly: point.rejectPercent > ucl || point.rejectPercent < lcl,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Control chart error:", error)
    return NextResponse.json({ error: "Failed to fetch control chart" }, { status: 500 })
  }
}
