import type { Metadata, Viewport } from "next"

import { site } from "@/lib/site"
import { cn } from "@/lib/utils"
import { Providers } from "@/app/providers"
import { geist, geistMono } from "@/lib/fonts"

import "@/app/globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

const title = `${site.name}: ${site.tagline}`

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [...site.keywords],
  authors: [{ name: site.creator.name, url: site.creator.website }],
  creator: site.creator.name,
  publisher: site.creator.name,
  category: "communication",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: site.name,
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    title,
    description: site.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    site: `@${site.creator.handle}`,
    creator: `@${site.creator.handle}`,
    title,
    description: site.description,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      className={cn(
        geist.variable,
        geistMono.variable,
        "font-sans antialiased"
      )}
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-svh font-sans selection:bg-foreground selection:text-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
