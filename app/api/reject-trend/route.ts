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

    // Calculate 7-day moving average
    const data = rows.map((r) => ({
      date: r.date,
      rejectPercent: Number(r.reject_percent),
    }))

    const result = data.map((point, i) => {
      if (i < 6) {
        return { ...point, movingAverage: null }
      }
      const window = data.slice(i - 6, i + 1)
      const avg = window.reduce((sum, p) => sum + p.rejectPercent, 0) / window.length
      return { ...point, movingAverage: Math.round(avg * 100) / 100 }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Reject trend error:", error)
    return NextResponse.json({ error: "Failed to fetch reject trend" }, { status: 500 })
  }
}
