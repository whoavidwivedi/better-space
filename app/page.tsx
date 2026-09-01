import React from "react"
import { Navbar } from "@/components/common/navbar"
import { LiveStageHero } from "@/components/landing/live-stage-hero"
import { LiveSpacesRadar } from "@/components/landing/live-spaces-radar"
import { SpaceStats } from "@/components/landing/space-stats"
import { ProductPillars } from "@/components/landing/product-pillars"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <div className="selection:bg-foreground selection:text-background">
      <div className="relative z-10 flex min-h-svh flex-col rounded-b-[2.5rem] bg-background text-foreground shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <Navbar />
        <main className="flex flex-1 flex-col">
          <LiveStageHero />
          <LiveSpacesRadar />
          <SpaceStats />
          <ProductPillars />
        </main>
      </div>
      <Footer />
    </div>
  )
}
