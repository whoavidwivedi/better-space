"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

import { Toaster } from "@/components/ui/toast"

export function OuterProvider({ children }: { children: React.ReactNode }) {
  return children
}

export function InnerProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster />
    </NextThemesProvider>
  )
}
