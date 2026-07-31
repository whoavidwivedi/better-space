"use client"

import { useEffect, useRef, useState } from "react"

const BAR_COUNT = 5
const IDLE_HEIGHT = 15
const MAX_HEIGHT = 100

function clamp(value: number, min = 10, max = MAX_HEIGHT) {
  return Math.min(max, Math.max(min, value))
}

export function AudioVisualizer({
  volume = 0,
  speaking = false,
}: {
  volume?: number
  speaking?: boolean
}) {
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: BAR_COUNT }, () => IDLE_HEIGHT),
  )
  const volumeRef = useRef(volume)
  const speakingRef = useRef(speaking)
  const envelopeRef = useRef(0)
  const driftRef = useRef(Array.from({ length: BAR_COUNT }, () => Math.random() * 2 - 1))

  useEffect(() => {
    volumeRef.current = volume
  }, [volume])

  useEffect(() => {
    speakingRef.current = speaking
  }, [speaking])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let animationFrameId = 0
    let lastTime = 0

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate)
      if (time - lastTime < 90) return
      lastTime = time

      const speakingNow = speakingRef.current
      const volumeNow = volumeRef.current

      envelopeRef.current +=
        (volumeNow - envelopeRef.current) *
        (speakingNow && volumeNow > envelopeRef.current ? 0.5 : 0.18)

      const next = Array.from({ length: BAR_COUNT }, (_, i) => {
        driftRef.current[i] = clamp(driftRef.current[i] + (Math.random() - 0.5) * 0.7, -1, 1)
        const drift = driftRef.current[i]

        if (speakingNow && envelopeRef.current > 0.02) {
          const peak = clamp(IDLE_HEIGHT + envelopeRef.current * 240)
          const dip = 0.4 + Math.abs(drift) * 0.6
          return clamp(peak * (drift >= 0 ? 1 : dip))
        }

        return clamp(IDLE_HEIGHT + drift * 6)
      })

      setLevels(next)
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div className="flex h-6 w-full items-center justify-center gap-1">
      {levels.map((vol, i) => (
        <div
          key={i}
          className="bg-primary w-1 rounded-full transition-[height] duration-100 ease-out"
          style={{ height: `${vol}%` }}
        />
      ))}
    </div>
  )
}
