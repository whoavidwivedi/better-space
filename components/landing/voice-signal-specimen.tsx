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
    <section id="architecture" className="relative mx-auto w-full max-w-5xl py-16">
      {/* Header */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              SIGNAL // 03
            </span>
            <span className="font-serif-display italic text-base text-foreground">
              Pure Web Audio Engine
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-foreground">
            Acoustic Signal Path
          </h2>
        </div>

        <div className="flex items-center gap-2 font-handwritten text-lg text-muted-foreground">
          <span>Sub-35ms Edge WebRTC</span>
          <DoodleAsterisk className="size-4 text-foreground/60" />
        </div>
      </div>

      {/* 3 Minimal Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pillars.map((p) => {
          const Icon = p.icon
          return (
            <div
              key={p.num}
              className="minimal-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between bg-card border border-border"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-4xl sm:text-5xl font-black text-foreground/40">
                    {p.num}
                  </span>
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-foreground">
                    <Icon size={16} />
                  </div>
                </div>

                <h3 className="font-display text-lg font-bold text-foreground">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 font-mono text-[11px] text-muted-foreground">
                {p.spec}
              </div>
            </div>
          )
        })}
      </div>

      {/* Interactive Web Audio Synthesizer Specimen Key */}
      <div className="mt-8 minimal-card rounded-3xl p-6 sm:p-8 bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            INTERACTIVE ACOUSTIC TESTBED
          </span>
          <h4 className="font-display text-xl font-bold text-foreground mt-1">
            Test Browser Web Audio Engine
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Click keys to trigger real-time synthesized harmonic frequencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {FREQ_KEYS.map((k) => (
            <button
              key={k.note}
              onClick={() => playFreq(k.note, k.freq, k.type)}
              className={`h-11 px-3.5 rounded-xl border font-mono text-xs font-bold transition-colors ${
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
