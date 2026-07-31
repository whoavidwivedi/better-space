"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

import { NotificationCenter } from "@/components/notification-center"

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
      <NotificationCenter />
    </NextThemesProvider>
  )
}
