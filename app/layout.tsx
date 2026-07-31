import type { Metadata, Viewport } from "next"

import { InnerProvider, OuterProvider } from "@/app/providers"
import { config } from "@/lib/config"
import { dmSans, jetbrainsMono } from "@/lib/fonts"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

import "@/app/globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: {
    default: `${site.name} - ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    url: config.app.url,
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
    <OuterProvider>
      <html
        className={cn(dmSans.variable, jetbrainsMono.variable, "antialiased")}
        lang="en"
        suppressHydrationWarning
      >
        <body className="min-h-svh">
          <InnerProvider>{children}</InnerProvider>
        </body>
      </html>
    </OuterProvider>
  )
}
