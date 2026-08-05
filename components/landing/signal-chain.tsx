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
    <section id="architecture" className="relative mx-auto w-full max-w-5xl py-16">
      {/* Minimal Header */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              ARCHITECTURE
            </span>
            <span className="font-serif-display italic text-base text-foreground">
              Under the Hood
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-foreground">
            Pure Voice Signal
          </h2>
        </div>
        <div className="flex items-center gap-2 font-handwritten text-lg text-muted-foreground">
          <span>Sub-35ms Edge WebRTC</span>
          <DoodleAsterisk className="size-4 text-foreground/60" />
        </div>
      </div>

      {/* 3 Minimal Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.num}
            className="minimal-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between bg-card border border-border"
          >
            <div>
              <span className="font-display text-4xl sm:text-5xl font-black text-foreground/40 block mb-4">
                {f.num}
              </span>
              <h3 className="font-display text-lg font-bold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 font-mono text-[11px] text-muted-foreground">
              {f.spec}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
