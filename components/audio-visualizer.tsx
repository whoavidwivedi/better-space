"use client"

import React from "react"
import { cn } from "@/lib/utils"

const BAR_ANIMATIONS = [
  "animate-eq-scale-1",
  "animate-eq-scale-2",
  "animate-eq-scale-3",
  "animate-eq-scale-4",
  "animate-eq-scale-5",
]

export function AudioVisualizer({
  volume = 0,
  speaking = false,
  className,
}: {
  volume?: number
  speaking?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-5 w-full items-center justify-center gap-1 select-none",
        className
      )}
    >
      {BAR_ANIMATIONS.map((anim, i) => (
        <span
          key={i}
          className={cn(
            "h-full w-1 origin-center rounded-full bg-primary transition-opacity duration-200",
            speaking ? cn(anim, "opacity-100") : "scale-y-[0.25] opacity-35"
          )}
        />
      ))}
    </div>
  )
}
