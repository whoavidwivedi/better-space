"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useEffect } from "react"

import { Toaster } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i)
      if (
        key?.startsWith("space_host_secret_") ||
        key?.startsWith("space_cohost_secret_")
      ) {
        localStorage.removeItem(key)
      }
    }
  }, [])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </NextThemesProvider>
  )
}
