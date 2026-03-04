"use client"

import { SWRConfig } from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        refreshInterval: 30000, // Auto-refresh every 30s
        revalidateOnFocus: true,
      }}
    >
      {children}
    </SWRConfig>
  )
}
