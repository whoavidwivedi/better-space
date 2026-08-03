"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

import { PWAProvider } from "@/components/common/pwa-provider"
import { Toaster } from "@/components/ui/toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <PWAProvider>
        {children}
        <Toaster />
      </PWAProvider>
    </NextThemesProvider>
  )
}
