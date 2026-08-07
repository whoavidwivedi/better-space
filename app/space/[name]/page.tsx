"use client"

import React, { Suspense } from "react"

import { SpaceJoin } from "@/components/space-join"

export default function SpacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
          Loading...
        </div>
      }
    >
      <SpaceJoin />
    </Suspense>
  )
}
