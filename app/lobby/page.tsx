"use client"

import React, { Suspense } from "react"

import { Lobby } from "@/components/lobby"

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
          Loading...
        </div>
      }
    >
      <Lobby />
    </Suspense>
  )
}
