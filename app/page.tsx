import React from "react"
import { Navbar } from "@/components/common/navbar"
import { LiveStageHero } from "@/components/landing/live-stage-hero"
import { LiveSpacesRadar } from "@/components/landing/live-spaces-radar"
import { SpaceStats } from "@/components/landing/space-stats"
import { ProductPillars } from "@/components/landing/product-pillars"
import { Footer } from "@/components/landing/footer"
import { site } from "@/lib/site"

// Structured data so search engines know the site, the app and its maker.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      description: site.description,
      inLanguage: "en",
      publisher: { "@id": `${site.url}/#creator` },
    },
    {
      "@type": "WebApplication",
      name: site.name,
      url: site.url,
      description: site.description,
      applicationCategory: "CommunicationApplication",
      operatingSystem: "Any (web browser)",
      browserRequirements: "Requires a WebRTC-capable browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Live voice rooms in the browser",
        "No account or sign-up",
        "Nothing recorded",
        "Live chat in every room",
        "Host and cohost moderation",
      ],
      image: `${site.url}/opengraph-image`,
      author: { "@id": `${site.url}/#creator` },
    },
    {
      "@type": "Person",
      "@id": `${site.url}/#creator`,
      name: site.creator.name,
      url: site.creator.website,
      sameAs: Object.values(site.creator.social),
    },
  ],
}

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground selection:bg-foreground selection:text-background">
      <script
        type="application/ld+json"
        // Static data from lib/site; escape "<" so it cannot close the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />
      <main className="flex flex-1 flex-col">
        <LiveStageHero />
        <LiveSpacesRadar />
        <SpaceStats />
        <ProductPillars />
      </main>
      <Footer />
    </div>
  )
}
