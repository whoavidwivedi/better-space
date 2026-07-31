"use client"

import React, { Suspense } from "react"

import { SpaceJoin } from "@/components/space-join"

export default function SpacePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-muted-foreground flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <SpaceJoin />
    </Suspense>
  )
}
