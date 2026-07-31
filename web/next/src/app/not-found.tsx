import { site } from "@packages/config/site"
import { RiArrowRightLine, RiHome4Line } from "@remixicon/react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

// Without this Next serves its own bare document (<html id="__next_error__">), which renders outside the root layout: no theme class, no fonts, so a 404 flashes white before or instead of the app's own styling. This one renders inside the layout, so it is themed like the rest of the app. It catches notFound() from a page, not from a layout that has already begun streaming: that one still reaches Next's internal fallback, which is the flash tracked in .github/notes/plans/console-notfound-status.md.
// It carries the main landmark itself, since nothing above it does: the root layout stops at <body>.
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-16 text-center md:px-6">
      <div className="flex w-full max-w-md flex-col items-center">
        <p className="border-border bg-muted/40 flex items-center gap-2 rounded-full border border-dashed px-3 py-1 text-sm font-medium">
          <span className="bg-success size-1.5 rounded-full" aria-hidden="true" />
          {site.name}
        </p>

        <p aria-hidden="true" className="mt-8 text-7xl font-bold tracking-tight sm:text-8xl">
          <span className="text-primary">4</span>
          <span>0</span>
          <span className="text-primary">4</span>
        </p>

        <h1 className="mt-4 text-2xl font-bold tracking-tight">Lost in space</h1>

        <p className="text-muted-foreground mt-3 max-w-sm text-base">
          This page does not exist, or it moved. No account, no signup, just pick a name and join a
          room.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button render={<Link href="/lobby" />}>
            Enter lobby
            <RiArrowRightLine className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" render={<Link href="/" />}>
            <RiHome4Line className="size-4" aria-hidden="true" />
            Back home
          </Button>
        </div>
      </div>
    </main>
  )
}
