"use client"

import React, { useState } from "react"
import {
  RiVolumeUpLine,
  RiVoiceprintLine,
  RiSoundModuleLine,
  RiCpuLine,
} from "@remixicon/react"
import { sound } from "@/lib/sound"
import { DoodleSparkle } from "@/components/common/doodles"

const SYNTH_KEYS = [
  { label: "C4", note: "261.6 Hz", freq: 261.63, type: "sine" as const, desc: "Fundamental" },
  { label: "E4", note: "329.6 Hz", freq: 329.63, type: "sine" as const, desc: "Major 3rd" },
  { label: "G4", note: "392.0 Hz", freq: 392.0, type: "sine" as const, desc: "Fifth" },
  { label: "B4", note: "493.8 Hz", freq: 493.88, type: "sine" as const, desc: "Major 7th" },
  { label: "C5", note: "523.2 Hz", freq: 523.25, type: "triangle" as const, desc: "Octave" },
  { label: "SUB", note: "82.4 Hz", freq: 82.41, type: "sine" as const, desc: "Sub Bass" },
]

export function AudioSpecimen() {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [lastFrequency, setLastFrequency] = useState<string>("Opus 48kHz Ready")
  const [volumeMeter, setVolumeMeter] = useState(0)

  const handlePlay = (key: typeof SYNTH_KEYS[number]) => {
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
      <div className="poster-card relative rounded-3xl bg-card border-2 border-foreground p-6 sm:p-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-foreground/15 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-black uppercase tracking-widest bg-foreground text-background px-2.5 py-0.5 rounded-md">
                SPECIMEN // 03
              </span>
              <span className="font-mono text-xs font-bold text-muted-foreground">
                LIVE WEB AUDIO SYNTHESIZER
              </span>
            </div>
            <h3 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground mt-2">
              Opus 48kHz Acoustic Laboratory
            </h3>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-muted-foreground">OUTPUT:</span>
            <span className="font-bold text-foreground bg-muted px-3 py-1.5 rounded-xl border border-foreground/20">
              {lastFrequency}
            </span>
          </div>
        </div>

        {/* Interactive Piano Keys / Tone Triggers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SYNTH_KEYS.map((k) => {
            const isActive = activeKey === k.label
            return (
              <button
                key={k.label}
                onClick={() => handlePlay(k)}
                className={`flex flex-col justify-between p-4 rounded-2xl border-2 text-left transition-colors ${
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/30 bg-background text-foreground hover:border-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-black">{k.label}</span>
                  <span className={`font-mono text-[10px] font-bold ${isActive ? "text-background/80" : "text-muted-foreground"}`}>
                    {k.desc}
                  </span>
                </div>
                <div className="mt-6 pt-3 border-t border-current/20 flex items-center justify-between font-mono text-[11px] font-bold">
                  <span>{k.note}</span>
                  <RiVolumeUpLine size={14} />
                </div>
              </button>
            )
          })}
        </div>

        {/* Dynamic Telemetry & Hardware Spec */}
        <div className="mt-8 pt-6 border-t-2 border-foreground/15 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-muted/50 p-4 rounded-2xl border border-foreground/15">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
              SAMPLE RATE
            </span>
            <span className="text-sm font-black text-foreground">48,000 Hz Stereo (Lossless)</span>
          </div>
          <div className="bg-muted/50 p-4 rounded-2xl border border-foreground/15">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
              LATENCY BUFFER
            </span>
            <span className="text-sm font-black text-foreground">~24ms Audio Roundtrip</span>
          </div>
          <div className="bg-muted/50 p-4 rounded-2xl border border-foreground/15">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
              NOISE REJECTION
            </span>
            <span className="text-sm font-black text-foreground">Neural Krisp SFU Embedded</span>
          </div>
        </div>
      </div>
    </section>
  )
}
