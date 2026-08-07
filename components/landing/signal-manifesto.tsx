"use client"

import React, { useState } from "react"
import {
  Volume2 as RiVolumeUpLine,
  Radio as RiBroadcastLine,
  ShieldCheck as RiShieldCheckLine,
  Cpu as RiCpuLine,
} from "lucide-react"
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

export function SignalManifesto() {
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
      desc: "Hardware acoustic echo cancellation and Krisp neural noise filtration processed directly in Web Audio.",
      spec: "Web Audio • 48kHz Stereo Opus",
      icon: RiCpuLine,
    },
    {
      num: "02",
      title: "Low-Latency Edge SFU",
      desc: "WebRTC Selective Forwarding Units stream Opus packets with sub-35ms glass-to-glass global latency.",
      spec: "LiveKit SFU • <35ms Latency",
      icon: RiBroadcastLine,
    },
    {
      num: "03",
      title: "Zero-Account Ephemeral",
      desc: "No passwords, forms, or tracking cookies. All tokens and sessions dissolve completely upon room exit.",
      spec: "100% Ephemeral • Zero Tracking",
      icon: RiShieldCheckLine,
    },
  ]

  return (
    <section
      id="architecture"
      className="relative w-full border-b border-border/80 py-20"
    >
      {/* 1. Header Typography */}
      <div className="mb-14 flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
            <span>INDEX NO. 03</span>
            <span>•</span>
            <span className="font-serif-display text-base text-foreground italic">
              Acoustic Architecture
            </span>
          </div>
          <h2 className="font-syne text-5xl font-black tracking-tight text-foreground uppercase sm:text-7xl">
            Signal Path
          </h2>
        </div>

        <div className="flex items-center gap-2 font-handwritten text-xl text-muted-foreground">
          <span>Sub-35ms Edge Latency</span>
          <DoodleAsterisk className="size-5 text-foreground/60" />
        </div>
      </div>

      {/* 2. 3 Minimal Columns */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {pillars.map((p) => {
          const Icon = p.icon
          return (
            <div
              key={p.num}
              className="flex flex-col justify-between rounded-3xl border border-border bg-card p-8 shadow-xs"
            >
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-syne text-5xl font-black text-foreground/30">
                    {p.num}
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground">
                    <Icon size={18} />
                  </div>
                </div>

                <h3 className="font-syne text-xl font-bold text-foreground uppercase">
                  {p.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
              </div>

              <div className="mt-8 border-t border-border pt-4 font-mono text-xs text-muted-foreground">
                {p.spec}
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Interactive Web Audio Synthesizer */}
      <div className="mt-10 flex flex-col items-center justify-between gap-6 rounded-3xl border border-border bg-card p-8 shadow-xs sm:flex-row">
        <div>
          <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
            INTERACTIVE ACOUSTIC TESTBED
          </span>
          <h4 className="mt-1 font-syne text-2xl font-bold text-foreground uppercase">
            Test Audio Frequency Response
          </h4>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Click keys to trigger real-time synthesized harmonic frequencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {FREQ_KEYS.map((k) => (
            <button
              key={k.note}
              onClick={() => playFreq(k.note, k.freq, k.type)}
              className={`h-12 rounded-xl border px-4 font-mono text-xs font-bold transition-colors ${
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
