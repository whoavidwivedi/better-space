import type { Metadata, Viewport } from "next"

import { Providers } from "@/app/providers"
import { dmSans, jetbrainsMono } from "@/lib/fonts"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

import "@/app/globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: `${site.name} - ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: site.name,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      className={cn(dmSans.variable, jetbrainsMono.variable, "antialiased")}
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-svh">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
