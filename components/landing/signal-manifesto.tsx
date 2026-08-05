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
    <section id="architecture" className="relative w-full py-20 border-b border-border/80">
      {/* 1. Header Typography */}
      <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span>INDEX NO. 03</span>
            <span>•</span>
            <span className="font-serif-display italic text-base text-foreground">
              Acoustic Architecture
            </span>
          </div>
          <h2 className="font-syne text-5xl sm:text-7xl font-black uppercase tracking-tight text-foreground">
            Signal Path
          </h2>
        </div>

        <div className="flex items-center gap-2 font-handwritten text-xl text-muted-foreground">
          <span>Sub-35ms Edge Latency</span>
          <DoodleAsterisk className="size-5 text-foreground/60" />
        </div>
      </div>

      {/* 2. 3 Minimal Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pillars.map((p) => {
          const Icon = p.icon
          return (
            <div
              key={p.num}
              className="rounded-3xl border border-border bg-card p-8 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-syne text-5xl font-black text-foreground/30">
                    {p.num}
                  </span>
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground">
                    <Icon size={18} />
                  </div>
                </div>

                <h3 className="font-syne text-xl font-bold uppercase text-foreground">
                  {p.title}
                </h3>
                <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-border font-mono text-xs text-muted-foreground">
                {p.spec}
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Interactive Web Audio Synthesizer */}
      <div className="mt-10 rounded-3xl border border-border bg-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            INTERACTIVE ACOUSTIC TESTBED
          </span>
          <h4 className="font-syne text-2xl font-bold uppercase text-foreground mt-1">
            Test Audio Frequency Response
          </h4>
          <p className="text-sm text-muted-foreground mt-0.5">
            Click keys to trigger real-time synthesized harmonic frequencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {FREQ_KEYS.map((k) => (
            <button
              key={k.note}
              onClick={() => playFreq(k.note, k.freq, k.type)}
              className={`h-12 px-4 rounded-xl border font-mono text-xs font-bold transition-colors ${
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
