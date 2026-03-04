"use client"

import { createContext, useContext, useCallback } from "react"
import useSWR from "swr"

interface User {
  id: number
  username: string
  role: "admin" | "viewer"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, mutate, isLoading } = useSWR("/api/auth/session")

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        await mutate()
        return true
      }
      return false
    },
    [mutate]
  )

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    await mutate()
  }, [mutate])

  return (
    <AuthContext.Provider
      value={{
        user: data?.authenticated ? data.user : null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
