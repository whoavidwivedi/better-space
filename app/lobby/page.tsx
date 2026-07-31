"use client"

import React, { Suspense } from "react"

import { Lobby } from "@/components/lobby"

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-muted-foreground flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <Lobby />
    </Suspense>
  )
}
