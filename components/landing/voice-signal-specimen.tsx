"use client"

import React, { useState } from "react"
import {
  RiVolumeUpLine,
  RiBroadcastLine,
  RiShieldCheckLine,
  RiCpuLine,
} from "@remixicon/react"
import {
  DoodleArrow,
  DoodleCurlyArrow,
  DoodleSparkle,
  DoodleAsterisk,
} from "@/components/common/doodles"
import { sound } from "@/lib/sound"

const FREQ_KEYS = [
  { note: "C4", freq: 261.63, type: "sine" as const },
  { note: "E4", freq: 329.63, type: "sine" as const },
  { note: "G4", freq: 392.0, type: "triangle" as const },
  { note: "B4", freq: 493.88, type: "triangle" as const },
  { note: "C5", freq: 523.25, type: "sine" as const },
]

export function VoiceSignalSpecimen() {
  const [activeNote, setActiveNote] = useState<string | null>(null)

  const playFreq = (note: string, freq: number, type: "sine" | "triangle") => {
    setActiveNote(note)
    sound.playTone(freq, type, 0.4)
    setTimeout(() => setActiveNote(null), 400)
  }

  const pillars = [
    {
      num: "01",
      title: "Audio Capture & AEC",
      desc: "Hardware echo cancellation and Krisp neural noise filtering processed directly on-device in Web Audio.",
      spec: "Web Audio • 48kHz Stereo",
      icon: RiCpuLine,
    },
    {
      num: "02",
      title: "Low-Latency SFU",
      desc: "WebRTC Selective Forwarding Units stream Opus packets with sub-35ms glass-to-glass latency.",
      spec: "LiveKit SFU • <35ms Latency",
      icon: RiBroadcastLine,
    },
    {
      num: "03",
      title: "Zero-Account Ephemeral",
      desc: "No passwords, forms, or tracking cookies. All tokens and sessions dissolve upon room exit.",
      spec: "100% Ephemeral • Zero Tracking",
      icon: RiShieldCheckLine,
    },
  ]

  return (
    <section
      id="architecture"
      className="relative mx-auto w-full max-w-5xl py-16"
    >
      {/* Header */}
      <div className="mb-12 flex flex-col justify-between gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
              SIGNAL // 03
            </span>
            <span className="font-serif-display text-base text-foreground italic">
              Pure Web Audio Engine
            </span>
          </div>
          <h2 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-6xl">
            Acoustic Signal Path
          </h2>
        </div>

        <div className="flex items-center gap-2 font-handwritten text-lg text-muted-foreground">
          <span>Sub-35ms Edge WebRTC</span>
          <DoodleAsterisk className="size-4 text-foreground/60" />
        </div>
      </div>

      {/* 3 Minimal Pillars */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {pillars.map((p) => {
          const Icon = p.icon
          return (
            <div
              key={p.num}
              className="minimal-card flex flex-col justify-between rounded-3xl border border-border bg-card p-6 sm:p-7"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-display text-4xl font-black text-foreground/40 sm:text-5xl">
                    {p.num}
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted text-foreground">
                    <Icon size={16} />
                  </div>
                </div>

                <h3 className="font-display text-lg font-bold text-foreground">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
              </div>

              <div className="mt-6 border-t border-border/60 pt-4 font-mono text-[11px] text-muted-foreground">
                {p.spec}
              </div>
            </div>
          )
        })}
      </div>

      {/* Interactive Web Audio Synthesizer Specimen Key */}
      <div className="minimal-card mt-8 flex flex-col items-center justify-between gap-6 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:p-8">
        <div>
          <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            INTERACTIVE ACOUSTIC TESTBED
          </span>
          <h4 className="mt-1 font-display text-xl font-bold text-foreground">
            Test Browser Web Audio Engine
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Click keys to trigger real-time synthesized harmonic frequencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {FREQ_KEYS.map((k) => (
            <button
              key={k.note}
              onClick={() => playFreq(k.note, k.freq, k.type)}
              className={`h-11 rounded-xl border px-3.5 font-mono text-xs font-bold transition-colors ${
                activeNote === k.note
                  ? "border-foreground bg-foreground text-background shadow-xs"
                  : "border-border bg-background hover:border-foreground"
              }`}
            >
              {k.note}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
