"use client"

import React from "react"
import {
  DoodleArrow,
  DoodleCurlyArrow,
  DoodleSparkle,
  DoodleAsterisk,
} from "@/components/common/doodles"

export function SignalChain() {
  const features = [
    {
      num: "01",
      title: "Audio Capture & AEC",
      desc: "Hardware echo cancellation and Krisp neural noise filtering processed directly on-device in Web Audio.",
      spec: "Web Audio • 48kHz Stereo",
    },
    {
      num: "02",
      title: "Low-Latency SFU",
      desc: "WebRTC Selective Forwarding Units stream Opus packets with sub-35ms glass-to-glass latency.",
      spec: "LiveKit SFU • <35ms Latency",
    },
    {
      num: "03",
      title: "Zero-Account Privacy",
      desc: "No passwords, forms, or tracking cookies. All tokens and sessions dissolve upon stage exit.",
      spec: "100% Ephemeral • Zero Tracking",
    },
  ]

  return (
    <section
      id="architecture"
      className="relative mx-auto w-full max-w-5xl py-16"
    >
      {/* Minimal Header */}
      <div className="mb-12 flex flex-col justify-between gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
              ARCHITECTURE
            </span>
            <span className="font-serif-display text-base text-foreground italic">
              Under the Hood
            </span>
          </div>
          <h2 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-6xl">
            Pure Voice Signal
          </h2>
        </div>
        <div className="flex items-center gap-2 font-handwritten text-lg text-muted-foreground">
          <span>Sub-35ms Edge WebRTC</span>
          <DoodleAsterisk className="size-4 text-foreground/60" />
        </div>
      </div>

      {/* 3 Minimal Columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.num}
            className="minimal-card flex flex-col justify-between rounded-3xl border border-border bg-card p-6 sm:p-7"
          >
            <div>
              <span className="mb-4 block font-display text-4xl font-black text-foreground/40 sm:text-5xl">
                {f.num}
              </span>
              <h3 className="font-display text-lg font-bold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>

            <div className="mt-6 border-t border-border/60 pt-4 font-mono text-[11px] text-muted-foreground">
              {f.spec}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
