/* eslint-disable @next/next/no-img-element */
"use client"

import {
  RiMicLine,
  RiMicOffLine,
  RiArrowRightLine,
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
} from "@/components/common/doodles"
import { userpicUrl, getCharacterCollection } from "@/lib/userpics"
import { sound } from "@/lib/sound"

const DEMO_CHARACTERS = [
  {
    id: "oslo-1",
    name: "Avery",
    role: "Host",
    statusText: "Can everyone hear the 48kHz audio stream?",
    avatar: "OSLO-1",
    collection: "OSLO Studio",
  },
  {
    id: "upstream-1",
    name: "Kaito",
    role: "Speaker",
    statusText: "Crystal clear. Zero latency from Tokyo.",
    avatar: "Upstream-1",
    collection: "Upstream",
  },
  {
    id: "afterclap-1",
    name: "Sasha",
    role: "Speaker",
    statusText: "No logins, pure voice. Love this interface.",
    avatar: "Afterclap-1",
    collection: "Afterclap",
  },
]

const EMOJI_BURSTS = ["🎙️", "✨", "🔥", "👏", "⚡"]

export function InteractiveHeroStage() {
  const [activeSpeakerIdx, setActiveSpeakerIdx] = useState(0)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [activeCharacterSeed, setActiveCharacterSeed] = useState("OSLO-1")
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number }[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSpeakerIdx((prev) => {
        const next = (prev + 1) % DEMO_CHARACTERS.length
        setActiveCharacterSeed(DEMO_CHARACTERS[next].avatar)
        return next
      })
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const triggerReaction = (emoji: string) => {
    sound.playReaction(emoji)
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      x: Math.floor(Math.random() * 50) + 25,
    }
    setReactions((prev) => [...prev.slice(-6), newReaction])
  }

  const toggleMic = () => {
    const next = !isMicMuted
    setIsMicMuted(next)
    sound.playMicToggle(next)
  }

  const currentSpeaker = DEMO_CHARACTERS[activeSpeakerIdx]
  const currentCollection = getCharacterCollection(activeCharacterSeed)

  return (
    <div className="relative mx-auto w-full max-w-5xl py-8">
      {/* Minimal Stage Frame */}
      <div className="minimal-card relative rounded-3xl p-6 sm:p-12 overflow-hidden bg-card/80 border border-border">
        {/* Subtle Doodle Callout Top Right */}
        <div className="hidden md:flex items-center gap-2 absolute top-6 right-8 pointer-events-none">
          <span className="font-handwritten text-base text-muted-foreground">
            Live WebRTC Stage
          </span>
          <DoodleAsterisk className="size-4 text-foreground/50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main Giant Character Stage (Left 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left relative">
            {/* Minimal Speech Bubble */}
            <div className="relative mb-6 max-w-md">
              <div className="rounded-2xl border border-border bg-background p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {currentSpeaker.name} • {currentSpeaker.role}
                  </span>
                </div>
                <p className="font-serif-display text-2xl sm:text-3xl italic text-foreground leading-snug">
                  &ldquo;{currentSpeaker.statusText}&rdquo;
                </p>
              </div>
              {/* Pointer */}
              <div className="absolute -bottom-2 left-8 sm:left-12 size-3 bg-background border-r border-b border-border rotate-45" />
            </div>

            {/* Giant Clean Vector Avatar */}
            <div className="relative flex items-center justify-center my-3">
              {/* Hand-drawn doodle circle */}
              <DoodleCircle className="absolute -inset-5 size-64 sm:size-72 text-foreground/15 pointer-events-none rotate-[-4deg]" />

              <div className="relative size-48 sm:size-60 rounded-full border border-border bg-background p-2 shadow-xs">
                <img
                  src={userpicUrl(activeCharacterSeed)}
                  alt="Active Character"
                  className="size-full object-cover rounded-full"
                />

                {/* Minimal Equalizer Waveform Pill */}
                {!isMicMuted && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-foreground text-background px-3 py-1 rounded-full shadow-xs">
                    <div className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 bg-background rounded-full animate-eq-1" />
                      <span className="w-0.5 bg-background rounded-full animate-eq-2" />
                      <span className="w-0.5 bg-background rounded-full animate-eq-3" />
                      <span className="w-0.5 bg-background rounded-full animate-eq-4" />
                    </div>
                    <span className="font-mono text-[9px] font-bold tracking-widest uppercase">
                      SPEAKING
                    </span>
                  </div>
                )}
              </div>

              {/* Floating Reaction Stream */}
              <div className="absolute inset-0 pointer-events-none overflow-visible">
                {reactions.map((r) => (
                  <div
                    key={r.id}
                    className="absolute text-3xl animate-reaction-drift select-none"
                    style={{ left: `${r.x}%`, top: "20%" }}
                  >
                    {r.emoji}
                  </div>
                ))}
              </div>
            </div>

            {/* Minimal Handwritten Annotation */}
            <div className="mt-3 flex items-center gap-2">
              <DoodleArrow className="size-6 text-foreground/60 -rotate-12 hidden sm:block" />
              <span className="font-handwritten text-lg text-foreground">
                Current persona: <strong className="font-sans font-bold">{activeCharacterSeed}</strong>
              </span>
            </div>
          </div>

          {/* Right Column: Clean Cast Selection & Reactions (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Stage Speakers Swapper */}
            <div className="rounded-2xl border border-border p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Switch Persona
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  1 of 96
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {DEMO_CHARACTERS.map((char, idx) => {
                  const isSelected = activeCharacterSeed === char.avatar
                  return (
                    <button
                      key={char.id}
                      onClick={() => {
                        sound.playPop(480 + idx * 60)
                        setActiveCharacterSeed(char.avatar)
                        setActiveSpeakerIdx(idx)
                      }}
                      className={`flex flex-col items-center p-2.5 rounded-xl border transition-colors ${
                        isSelected
                          ? "border-foreground bg-card shadow-xs"
                          : "border-transparent bg-background/50 hover:border-border"
                      }`}
                    >
                      <div className="size-12 rounded-full border border-border overflow-hidden mb-1.5">
                        <img
                          src={userpicUrl(char.avatar)}
                          alt={char.name}
                          className="size-full object-cover"
                        />
                      </div>
                      <span className="font-display font-bold text-xs text-foreground truncate w-full text-center">
                        {char.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mic Toggle & Emoji Reactions */}
            <div className="rounded-2xl border border-border p-4 bg-muted/30 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Audio &amp; Reactions
                </span>
                <button
                  onClick={toggleMic}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-bold border transition-colors ${
                    isMicMuted
                      ? "border-border text-muted-foreground line-through bg-background"
                      : "border-foreground bg-foreground text-background"
                  }`}
                >
                  {isMicMuted ? <RiMicOffLine size={13} /> : <RiMicLine size={13} />}
                  <span>{isMicMuted ? "Muted" : "Mic Live"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-1.5">
                {EMOJI_BURSTS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => triggerReaction(emoji)}
                    className="size-10 rounded-xl border border-border bg-background flex items-center justify-center text-lg hover:border-foreground/40 transition-colors shadow-xs"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Enter CTA */}
            <Link
              href="/lobby"
              className="w-full h-12 rounded-2xl bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span>Enter Live Stage</span>
              <RiArrowRightLine size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
