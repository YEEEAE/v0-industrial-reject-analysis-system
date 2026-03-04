import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { z } from "zod"

export const dynamic = "force-dynamic"

const recordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  item_code: z.string().min(1, "Item code is required").max(50),
  production_line: z.string().min(1, "Production line is required").max(50),
  produced_quantity: z.number().int().positive("Must be a positive integer"),
  reject_quantity: z.number().int().min(0, "Cannot be negative"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = recordSchema.parse(body)

    if (validated.reject_quantity > validated.produced_quantity) {
      return NextResponse.json(
        { error: "Reject quantity cannot exceed produced quantity" },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO production_records (date, item_code, production_line, produced_quantity, reject_quantity)
      VALUES (${validated.date}, ${validated.item_code}, ${validated.production_line}, ${validated.produced_quantity}, ${validated.reject_quantity})
      RETURNING id
    `

    return NextResponse.json({ success: true, id: result[0].id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Add record error:", error)
    return NextResponse.json({ error: "Failed to add record" }, { status: 500 })
  }
}
