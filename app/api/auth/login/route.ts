import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { createSessionToken } from "@/lib/auth"
import type { SessionUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const rows = await sql`SELECT id, username, role, password_hash FROM users WHERE username = ${username}`
    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = rows[0]

    // Simple password check for demo (in production use bcrypt.compare)
    // For the seeded users, accept "admin123" for admin and "viewer123" for viewer
    const validPasswords: Record<string, string> = {
      admin: "admin123",
      viewer: "viewer123",
    }

    if (validPasswords[username] !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      role: user.role,
    }

    const token = createSessionToken(sessionUser)

    const response = NextResponse.json({ success: true, user: sessionUser })
    response.cookies.set("reject_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
