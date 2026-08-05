/* eslint-disable @next/next/no-img-element */
"use client"

import {
  RiArrowRightLine,
  RiShuffleLine,
  RiVolumeUpLine,
  RiMicLine,
  RiMicOffLine,
} from "@remixicon/react"
import Link from "next/link"
import React, { useState, useEffect } from "react"

import {
  DoodleArrow,
  DoodleCurlyArrow,
  DoodleCircle,
  DoodleSparkle,
  DoodleUnderline,
  DoodleAsterisk,
  DoodleStar,
  DoodleBurstBadge,
} from "@/components/common/doodles"
import { ALL_USERPICS, userpicUrl, getCharacterCollection } from "@/lib/userpics"
import { sound } from "@/lib/sound"

const HERO_PERSONAS = [
  {
    seed: "OSLO-1",
    name: "OSLO • 01",
    quote: "A pure frequency space for vector souls.",
    tagline: "48kHz Stereo Master",
  },
  {
    seed: "Upstream-3",
    name: "UPSTREAM • 03",
    quote: "No logins. No passwords. No algorithmic feeds.",
    tagline: "LiveKit SFU Mesh",
  },
  {
    seed: "Afterclap-2",
    name: "AFTERCLAP • 02",
    quote: "Crystal clear edge audio directly in the browser.",
    tagline: "Sub-35ms Latency",
  },
  {
    seed: "Helsinki-2",
    name: "HELSINKI • 02",
    quote: "Pick your face and speak your mind.",
    tagline: "Ephemeral WebRTC",
  },
]

export function MonumentHero() {
  const [selectedSeed, setSelectedSeed] = useState("OSLO-1")
  const [activeIdx, setActiveIdx] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [quickRoomName, setQuickRoomName] = useState("")

  const persona = HERO_PERSONAS[activeIdx] || {
    seed: selectedSeed,
    name: selectedSeed,
    quote: "96 vector characters, zero tracking.",
    tagline: "Infinite Resolution",
  }

  // Automatic gentle persona rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => {
        const next = (prev + 1) % HERO_PERSONAS.length
        setSelectedSeed(HERO_PERSONAS[next].seed)
        return next
      })
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const handleSelectSeed = (seed: string, idx: number) => {
    sound.playPop(520 + idx * 40)
    setSelectedSeed(seed)
    setActiveIdx(idx)
    localStorage.setItem("better_space_active_avatar", seed)
  }

  const handleRandomize = () => {
    const randomSeed = ALL_USERPICS[Math.floor(Math.random() * ALL_USERPICS.length)]
    sound.playPop(650)
    setSelectedSeed(randomSeed)
    setActiveIdx(-1)
    localStorage.setItem("better_space_active_avatar", randomSeed)
  }

  const playPersonaHarmonic = () => {
    let hash = 0
    for (let i = 0; i < selectedSeed.length; i++) {
      hash = (hash * 31 + selectedSeed.charCodeAt(i)) >>> 0
    }
    const freq = 220 + (hash % 480)
    sound.playTone(freq, "triangle", 0.35)
  }

  const toggleMic = () => {
    const next = !isMuted
    setIsMuted(next)
    sound.playMicToggle(next)
  }

  return (
    <section className="relative w-full pt-8 pb-20 border-b border-border/80">
      {/* 1. ARCHITECTURAL MASTHEAD META */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-12 border-b border-border text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-foreground animate-ping" />
          <span className="font-bold tracking-widest uppercase">
            SPECIMEN NO. 01 — 2026 EDITION
          </span>
        </div>
        <div className="flex items-center gap-6 text-muted-foreground font-medium">
          <span>96 VECTOR PERSONAS</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">48KHZ STEREO OPUS</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">ZERO LOGINS</span>
        </div>
      </div>

      {/* 2. MONUMENTAL TYPOGRAPHY HERO TITLE */}
      <div className="relative mb-16">
        {/* Handwritten margin note */}
        <div className="absolute -top-7 left-1 hidden sm:flex items-center gap-2 font-handwritten text-lg text-muted-foreground">
          <span>(100% ephemeral voice rooms)</span>
          <DoodleArrow className="size-5 text-foreground/50 rotate-45" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between flex-wrap gap-4">
            <h1 className="font-syne text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black uppercase tracking-tight text-foreground leading-[0.82] select-none">
              VOICE
            </h1>
            <span className="font-serif-display italic text-2xl sm:text-4xl md:text-5xl text-muted-foreground self-end pb-2">
              pure &amp; unscripted
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <h1 className="font-syne text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black uppercase tracking-tight text-foreground leading-[0.82] select-none">
              SPACE
            </h1>

            {/* Embedded Active Character Pill */}
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-xs">
              <div className="size-10 sm:size-14 rounded-full overflow-hidden border border-border bg-background">
                <img
                  src={userpicUrl(selectedSeed)}
                  alt={selectedSeed}
                  className="size-full object-cover"
                />
              </div>
              <div className="font-mono flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  {selectedSeed}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {persona.tagline}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MONUMENTAL SPLIT: GIGANTIC CHARACTER STAGE + EDITORIAL MANIFESTO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left 7 Cols: Large Character Portrait & Equalizer */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start">
          {/* Dynamic Editorial Speech Quote */}
          <div className="relative mb-8 w-full max-w-lg">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-muted-foreground uppercase mb-2">
                <span>{persona.name}</span>
                <span>SPEAKER // LIVE</span>
              </div>
              <p className="font-serif-display italic text-2xl sm:text-3xl text-foreground leading-snug">
                &ldquo;{persona.quote}&rdquo;
              </p>
            </div>
            <div className="absolute -bottom-2 left-10 size-3.5 bg-card border-r border-b border-border rotate-45" />
          </div>

          {/* Huge Character Avatar (300px+) */}
          <div className="relative flex items-center justify-center my-4">
            {/* Hand-drawn doodle circle */}
            <DoodleCircle className="absolute -inset-6 size-72 sm:size-84 text-foreground/15 pointer-events-none rotate-[-6deg]" />

            <div className="relative size-60 sm:size-72 rounded-full border-2 border-foreground bg-background p-3 shadow-md">
              <img
                src={userpicUrl(selectedSeed)}
                alt={selectedSeed}
                className="size-full object-cover rounded-full"
              />

              {/* 48kHz Live Waveform Indicator */}
              {!isMuted && (
                <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-foreground text-background px-3.5 py-1.5 rounded-full shadow-xs">
                  <div className="flex items-end gap-0.5 h-3.5">
                    <span className="w-0.5 bg-background rounded-full animate-eq-1" />
                    <span className="w-0.5 bg-background rounded-full animate-eq-2" />
                    <span className="w-0.5 bg-background rounded-full animate-eq-3" />
                    <span className="w-0.5 bg-background rounded-full animate-eq-4" />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                    48KHZ LIVE
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Persona Swapper Dock */}
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs font-bold text-muted-foreground uppercase">
              Swap Cast:
            </span>
            <div className="flex items-center gap-2">
              {HERO_PERSONAS.map((p, idx) => (
                <button
                  key={p.seed}
                  onClick={() => handleSelectSeed(p.seed, idx)}
                  className={`size-10 sm:size-11 rounded-full border overflow-hidden transition-transform ${
                    selectedSeed === p.seed
                      ? "border-foreground scale-110 shadow-xs"
                      : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={userpicUrl(p.seed)}
                    alt={p.name}
                    className="size-full object-cover"
                  />
                </button>
              ))}
              <button
                onClick={handleRandomize}
                title="Random Character"
                className="size-10 sm:size-11 rounded-full border border-border flex items-center justify-center text-foreground hover:border-foreground transition-colors"
              >
                <RiShuffleLine size={16} />
              </button>
            </div>

            <button
              onClick={playPersonaHarmonic}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-muted-foreground hover:text-foreground transition-colors pl-2"
            >
              <RiVolumeUpLine size={14} />
              <span>Harmonic Tone</span>
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Minimal Launch Station & Manifesto */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DoodleSparkle className="size-4 text-foreground/70" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                ZERO ONBOARDING
              </span>
            </div>
            <h2 className="font-syne text-3xl sm:text-4xl font-bold uppercase tracking-tight text-foreground leading-tight">
              Instant voice rooms without the friction.
            </h2>
            <p className="mt-3 text-base text-muted-foreground font-normal leading-relaxed">
              Every room is fully ephemeral. No user accounts, no passwords, no email collection. Simply name your studio space and enter with your vector persona.
            </p>
          </div>

          {/* Direct Room Launch Input */}
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3.5 shadow-xs">
            <div className="flex items-center justify-between font-mono text-[11px] font-bold text-muted-foreground uppercase">
              <span>Quick Room Entry</span>
              <button
                onClick={toggleMic}
                className="inline-flex items-center gap-1 text-foreground hover:underline"
              >
                {isMuted ? <RiMicOffLine size={13} /> : <RiMicLine size={13} />}
                <span>{isMuted ? "Mic Muted" : "Mic Live"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickRoomName}
                onChange={(e) =>
                  setQuickRoomName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))
                }
                placeholder="e.g. design-critique"
                className="h-11 flex-1 rounded-xl border border-border bg-background px-3.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
              />
              <Link
                href={
                  quickRoomName.trim()
                    ? `/space/${quickRoomName.trim()}`
                    : "/lobby"
                }
                className="h-11 px-5 rounded-xl bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <span>Enter</span>
                <RiArrowRightLine size={15} />
              </Link>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
              <span>Active Persona: @{selectedSeed.toLowerCase()}</span>
              <Link href="/lobby" className="text-foreground hover:underline font-bold">
                Browse All Rooms →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
