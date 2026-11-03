"use client"

import React, { Suspense } from "react"

import { Lobby } from "@/components/lobby"
import { Spinner } from "@/components/ui/spinner"

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
          <Spinner className="size-6 text-foreground" />
          <p className="text-sm font-medium text-foreground">
            Loading voice spaces…
          </p>
        </div>
      }
    >
      <Lobby />
    </Suspense>
  )
}
