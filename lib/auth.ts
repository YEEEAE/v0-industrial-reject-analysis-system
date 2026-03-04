import { cookies } from "next/headers"
import { sql } from "./db"

export type UserRole = "admin" | "viewer"

export interface SessionUser {
  id: number
  username: string
  role: UserRole
}

const SESSION_COOKIE = "reject_session"

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)
  if (!sessionCookie) return null

  try {
    const decoded = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    )
    const rows = await sql`SELECT id, username, role FROM users WHERE id = ${decoded.id}`
    if (rows.length === 0) return null
    return rows[0] as SessionUser
  } catch {
    return null
  }
}

export function createSessionToken(user: SessionUser): string {
  return Buffer.from(
    JSON.stringify({ id: user.id, username: user.username, role: user.role })
  ).toString("base64")
}
