import type { Metadata, Viewport } from "next"

import { Providers } from "@/app/providers"
import {
  dmSans,
  jetbrainsMono,
  bricolageGrotesque,
  instrumentSerif,
  googleSansFlex,
  kalam,
  syne,
  playfairDisplay,
} from "@/lib/fonts"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

import "@/app/globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://space.whoavidwivedi.work"),
  title: {
    default: `${site.name} - ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    title: `${site.name} - ${site.tagline}`,
    description: site.description,
    url: "/",
    images: [
      {
        url: "/og-image.png",
        secureUrl: "/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: `${site.name} - ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: `@${site.creator.handle}`,
    creator: `@${site.creator.handle}`,
    title: `${site.name} - ${site.tagline}`,
    description: site.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${site.name} - ${site.tagline}`,
      },
    ],
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
        dmSans.variable,
        jetbrainsMono.variable,
        bricolageGrotesque.variable,
        instrumentSerif.variable,
        googleSansFlex.variable,
        kalam.variable,
        syne.variable,
        playfairDisplay.variable,
        "antialiased"
      )}
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-svh selection:bg-foreground selection:text-background font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
