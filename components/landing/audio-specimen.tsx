"use client"

import React, { useState } from "react"
import {
  Volume2 as RiVolumeUpLine,
  Activity as RiVoiceprintLine,
  Sliders as RiSoundModuleLine,
  Cpu as RiCpuLine
} from "lucide-react"
import { sound } from "@/lib/sound"
import { DoodleSparkle } from "@/components/common/doodles"

const SYNTH_KEYS = [
  {
    label: "C4",
    note: "261.6 Hz",
    freq: 261.63,
    type: "sine" as const,
    desc: "Fundamental",
  },
  {
    label: "E4",
    note: "329.6 Hz",
    freq: 329.63,
    type: "sine" as const,
    desc: "Major 3rd",
  },
  {
    label: "G4",
    note: "392.0 Hz",
    freq: 392.0,
    type: "sine" as const,
    desc: "Fifth",
  },
  {
    label: "B4",
    note: "493.8 Hz",
    freq: 493.88,
    type: "sine" as const,
    desc: "Major 7th",
  },
  {
    label: "C5",
    note: "523.2 Hz",
    freq: 523.25,
    type: "triangle" as const,
    desc: "Octave",
  },
  {
    label: "SUB",
    note: "82.4 Hz",
    freq: 82.41,
    type: "sine" as const,
    desc: "Sub Bass",
  },
]

export function AudioSpecimen() {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [lastFrequency, setLastFrequency] = useState<string>("Opus 48kHz Ready")
  const [volumeMeter, setVolumeMeter] = useState(0)

  const handlePlay = (key: (typeof SYNTH_KEYS)[number]) => {
    setActiveKey(key.label)
    setLastFrequency(`${key.label} • ${key.note} (${key.type.toUpperCase()})`)
    sound.playTone(key.freq, key.type, 0.28)
    setVolumeMeter(Math.floor(Math.random() * 40) + 60)

    setTimeout(() => {
      setActiveKey(null)
      setVolumeMeter(0)
    }, 280)
  }

  return (
    <section className="relative mx-auto w-full max-w-6xl py-12">
      {/* Specimen Sheet Frame */}
      <div className="poster-card relative rounded-3xl border-2 border-foreground bg-card p-6 sm:p-10">
        {/* Top Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b-2 border-foreground/15 pb-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-foreground px-2.5 py-0.5 font-mono text-xs font-black tracking-widest text-background uppercase">
                SPECIMEN // 03
              </span>
              <span className="font-mono text-xs font-bold text-muted-foreground">
                LIVE WEB AUDIO SYNTHESIZER
              </span>
            </div>
            <h3 className="mt-2 font-display text-2xl font-black tracking-tight text-foreground uppercase sm:text-4xl">
              Opus 48kHz Acoustic Laboratory
            </h3>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-muted-foreground">OUTPUT:</span>
            <span className="rounded-xl border border-foreground/20 bg-muted px-3 py-1.5 font-bold text-foreground">
              {lastFrequency}
            </span>
          </div>
        </div>

        {/* Interactive Piano Keys / Tone Triggers */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SYNTH_KEYS.map((k) => {
            const isActive = activeKey === k.label
            return (
              <button
                key={k.label}
                onClick={() => handlePlay(k)}
                className={`flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-colors ${
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/30 bg-background text-foreground hover:border-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-black">
                    {k.label}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold ${isActive ? "text-background/80" : "text-muted-foreground"}`}
                  >
                    {k.desc}
                  </span>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-current/20 pt-3 font-mono text-[11px] font-bold">
                  <span>{k.note}</span>
                  <RiVolumeUpLine size={14} />
                </div>
              </button>
            )
          })}
        </div>

        {/* Dynamic Telemetry & Hardware Spec */}
        <div className="mt-8 grid grid-cols-1 gap-4 border-t-2 border-foreground/15 pt-6 font-mono text-xs sm:grid-cols-3">
          <div className="rounded-2xl border border-foreground/15 bg-muted/50 p-4">
            <span className="mb-1 block text-[10px] font-black tracking-widest text-muted-foreground uppercase">
              SAMPLE RATE
            </span>
            <span className="text-sm font-black text-foreground">
              48,000 Hz Stereo (Lossless)
            </span>
          </div>
          <div className="rounded-2xl border border-foreground/15 bg-muted/50 p-4">
            <span className="mb-1 block text-[10px] font-black tracking-widest text-muted-foreground uppercase">
              LATENCY BUFFER
            </span>
            <span className="text-sm font-black text-foreground">
              ~24ms Audio Roundtrip
            </span>
          </div>
          <div className="rounded-2xl border border-foreground/15 bg-muted/50 p-4">
            <span className="mb-1 block text-[10px] font-black tracking-widest text-muted-foreground uppercase">
              NOISE REJECTION
            </span>
            <span className="text-sm font-black text-foreground">
              Neural Krisp SFU Embedded
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
