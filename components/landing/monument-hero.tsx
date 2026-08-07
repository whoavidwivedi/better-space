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
import {
  ALL_USERPICS,
  userpicUrl,
  getCharacterCollection,
} from "@/lib/userpics"
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
    const randomSeed =
      ALL_USERPICS[Math.floor(Math.random() * ALL_USERPICS.length)]
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
    <section className="relative w-full border-b border-border/80 pt-8 pb-20">
      {/* 1. ARCHITECTURAL MASTHEAD META */}
      <div className="mb-12 flex flex-col justify-between gap-4 border-b border-border pb-6 font-mono text-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-foreground" />
          <span className="font-bold tracking-widest uppercase">
            SPECIMEN NO. 01 — 2026 EDITION
          </span>
        </div>
        <div className="flex items-center gap-6 font-medium text-muted-foreground">
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
        <div className="absolute -top-7 left-1 hidden items-center gap-2 font-handwritten text-lg text-muted-foreground sm:flex">
          <span>(100% ephemeral voice rooms)</span>
          <DoodleArrow className="size-5 rotate-45 text-foreground/50" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h1 className="font-syne text-6xl leading-[0.82] font-black tracking-tight text-foreground uppercase select-none sm:text-8xl md:text-9xl lg:text-[11rem]">
              VOICE
            </h1>
            <span className="self-end pb-2 font-serif-display text-2xl text-muted-foreground italic sm:text-4xl md:text-5xl">
              pure &amp; unscripted
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <h1 className="font-syne text-6xl leading-[0.82] font-black tracking-tight text-foreground uppercase select-none sm:text-8xl md:text-9xl lg:text-[11rem]">
              SPACE
            </h1>

            {/* Embedded Active Character Pill */}
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-xs">
              <div className="size-10 overflow-hidden rounded-full border border-border bg-background sm:size-14">
                <img
                  src={userpicUrl(selectedSeed)}
                  alt={selectedSeed}
                  className="size-full object-cover"
                />
              </div>
              <div className="flex flex-col font-mono">
                <span className="text-xs font-bold text-foreground sm:text-sm">
                  {selectedSeed}
                </span>
                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  {persona.tagline}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MONUMENTAL SPLIT: GIGANTIC CHARACTER STAGE + EDITORIAL MANIFESTO */}
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Left 7 Cols: Large Character Portrait & Equalizer */}
        <div className="flex flex-col items-center lg:col-span-7 lg:items-start">
          {/* Dynamic Editorial Speech Quote */}
          <div className="relative mb-8 w-full max-w-lg">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="mb-2 flex items-center justify-between font-mono text-[11px] font-bold text-muted-foreground uppercase">
                <span>{persona.name}</span>
                <span>SPEAKER // LIVE</span>
              </div>
              <p className="font-serif-display text-2xl leading-snug text-foreground italic sm:text-3xl">
                &ldquo;{persona.quote}&rdquo;
              </p>
            </div>
            <div className="absolute -bottom-2 left-10 size-3.5 rotate-45 border-r border-b border-border bg-card" />
          </div>

          {/* Huge Character Avatar (300px+) */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Hand-drawn doodle circle */}
            <DoodleCircle className="pointer-events-none absolute -inset-6 size-72 rotate-[-6deg] text-foreground/15 sm:size-84" />

            <div className="relative size-60 rounded-full border-2 border-foreground bg-background p-3 shadow-md sm:size-72">
              <img
                src={userpicUrl(selectedSeed)}
                alt={selectedSeed}
                className="size-full rounded-full object-cover"
              />

              {/* 48kHz Live Waveform Indicator */}
              {!isMuted && (
                <div className="absolute right-3 bottom-3 flex items-center gap-2 rounded-full bg-foreground px-3.5 py-1.5 text-background shadow-xs">
                  <div className="flex h-3.5 items-end gap-0.5">
                    <span className="animate-eq-1 w-0.5 rounded-full bg-background" />
                    <span className="animate-eq-2 w-0.5 rounded-full bg-background" />
                    <span className="animate-eq-3 w-0.5 rounded-full bg-background" />
                    <span className="animate-eq-4 w-0.5 rounded-full bg-background" />
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
                    48KHZ LIVE
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Persona Swapper Dock */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs font-bold text-muted-foreground uppercase">
              Swap Cast:
            </span>
            <div className="flex items-center gap-2">
              {HERO_PERSONAS.map((p, idx) => (
                <button
                  key={p.seed}
                  onClick={() => handleSelectSeed(p.seed, idx)}
                  className={`size-10 overflow-hidden rounded-full border transition-transform sm:size-11 ${
                    selectedSeed === p.seed
                      ? "scale-110 border-foreground shadow-xs"
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
                className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground sm:size-11"
              >
                <RiShuffleLine size={16} />
              </button>
            </div>

            <button
              onClick={playPersonaHarmonic}
              className="inline-flex items-center gap-1.5 pl-2 font-mono text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              <RiVolumeUpLine size={14} />
              <span>Harmonic Tone</span>
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Minimal Launch Station & Manifesto */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <DoodleSparkle className="size-4 text-foreground/70" />
              <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
                ZERO ONBOARDING
              </span>
            </div>
            <h2 className="font-syne text-3xl leading-tight font-bold tracking-tight text-foreground uppercase sm:text-4xl">
              Instant voice rooms without the friction.
            </h2>
            <p className="mt-3 text-base leading-relaxed font-normal text-muted-foreground">
              Every room is fully ephemeral. No user accounts, no passwords, no
              email collection. Simply name your studio space and enter with
              your vector persona.
            </p>
          </div>

          {/* Direct Room Launch Input */}
          <div className="flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-5 shadow-xs">
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
                  setQuickRoomName(
                    e.target.value.replace(/[^a-zA-Z0-9_-]/g, "")
                  )
                }
                placeholder="e.g. design-critique"
                className="h-11 flex-1 rounded-xl border border-border bg-background px-3.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
              <Link
                href={
                  quickRoomName.trim()
                    ? `/space/${quickRoomName.trim()}`
                    : "/lobby"
                }
                className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-foreground px-5 font-mono text-xs font-bold tracking-wider text-background uppercase transition-opacity hover:opacity-90"
              >
                <span>Enter</span>
                <RiArrowRightLine size={15} />
              </Link>
            </div>

            <div className="flex items-center justify-between pt-1 font-mono text-[11px] text-muted-foreground">
              <span>Active Persona: @{selectedSeed.toLowerCase()}</span>
              <Link
                href="/lobby"
                className="font-bold text-foreground hover:underline"
              >
                Browse All Rooms →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
