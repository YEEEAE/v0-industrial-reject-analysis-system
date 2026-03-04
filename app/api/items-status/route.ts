import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getStatus } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        item_code,
        production_line,
        SUM(produced_quantity) AS total_produced,
        SUM(reject_quantity) AS total_reject,
        ROUND((SUM(reject_quantity)::numeric / NULLIF(SUM(produced_quantity), 0) * 100), 2) AS reject_percent,
        MAX(date)::text AS latest_date
      FROM production_records
      GROUP BY item_code, production_line
      ORDER BY reject_percent DESC
    `

    const result = rows.map((r) => ({
      item_code: r.item_code,
      production_line: r.production_line,
      totalProduced: Number(r.total_produced),
      totalReject: Number(r.total_reject),
      rejectPercent: Number(r.reject_percent),
      status: getStatus(Number(r.reject_percent)),
      latestDate: r.latest_date,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Items status error:", error)
    return NextResponse.json({ error: "Failed to fetch items status" }, { status: 500 })
  }
}
