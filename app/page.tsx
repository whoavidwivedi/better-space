import React from "react"
import { Navbar } from "@/components/common/navbar"
import { LiveStageHero } from "@/components/landing/live-stage-hero"
import { LiveSpacesRadar } from "@/components/landing/live-spaces-radar"
import { ProductPillars } from "@/components/landing/product-pillars"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <LiveStageHero />
        <LiveSpacesRadar />
        <ProductPillars />
      </main>
      <Footer />
    </div>
  )
}
