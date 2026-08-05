/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  RiMicLine,
  RiMicOffLine,
  RiArrowRightLine,
  RiSparklingLine,
  RiVolumeUpLine,
  RiAddLine,
  RiRadio2Line,
  RiUser3Line,
} from "@remixicon/react"
import { userpicUrl } from "@/lib/userpics"

const DEMO_SPEAKERS = [
  { id: "sora", name: "Sora", role: "Host", avatar: "OSLO-1", isSpeaking: true, note: "Talking about design tokens" },
  { id: "elena", name: "Elena", role: "Speaker", avatar: "OSLO-3", isSpeaking: false, note: "Listening in" },
  { id: "marcus", name: "Marcus", role: "Speaker", avatar: "Upstream-2", isSpeaking: true, note: "Sharing feedback" },
  { id: "kai", name: "Kai", role: "Speaker", avatar: "Afterclap-4", isSpeaking: false, note: "Just joined" },
  { id: "maya", name: "Maya", role: "Speaker", avatar: "Funny Bunny-1", isSpeaking: false, note: "Has mic queued" },
]

export function LiveStageHero() {
  const [isMuted, setIsMuted] = useState(false)
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0)
  const [myAvatar, setMyAvatar] = useState("OSLO-1")
  const [spaceName, setSpaceName] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("better_space_active_avatar")
      if (saved) setMyAvatar(saved)
    }
  }, [])

  const handleSeatClick = (speaker: typeof DEMO_SPEAKERS[0], index: number) => {
    setActiveSpeakerIndex(index)
  }

  const handleLaunchQuick = (e: React.FormEvent) => {
    e.preventDefault()
    const rName = spaceName.trim() || "design-lounge"
    localStorage.setItem("better_space_active_avatar", myAvatar)
    window.location.href = `/space/${encodeURIComponent(rName)}`
  }

  return (
    <section className="relative w-full border-b border-border/80 bg-background pt-6 pb-12 sm:pt-10 sm:pb-16 md:pt-14 md:pb-24">
      {/* Background Atmosphere Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top Product Badge */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="inline-flex items-center rounded-full border border-border bg-card/80 px-3 py-1 sm:px-4 sm:py-1.5 backdrop-blur-md shadow-xs text-center max-w-full">
            <span className="font-mono text-[10px] sm:text-xs font-semibold tracking-wide text-foreground truncate">
              LIVE SPATIAL AUDIO • ZERO LOGINS • 100% EPHEMERAL
            </span>
          </div>
        </div>

        {/* Core Headline */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] sm:leading-[1.08]">
            Voice spaces for <span className="font-serif italic font-normal text-muted-foreground">real-time</span> conversations.
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto font-normal leading-relaxed px-1">
            Drop into live voice rooms directly in your browser. Claim the mic and talk with crisp WebRTC audio. No accounts, no passwords, 100% ephemeral.
          </p>
        </div>

        {/* Live Interactive Stage Simulator */}
        <div className="relative mx-auto max-w-3xl rounded-2xl sm:rounded-3xl border border-border bg-card/90 p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-xl overflow-hidden">
          {/* Stage Room Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                Design &amp; Engineering Stage
              </h3>
              <span className="font-mono text-[11px] sm:text-xs text-muted-foreground">
                5 on stage • 42 listeners tuning in
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/lobby"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-mono font-semibold text-foreground hover:bg-muted transition-colors active:scale-95"
              >
                <span>Browse All Rooms</span>
                <RiArrowRightLine size={14} />
              </Link>
            </div>
          </div>

          {/* Speakers Stage Layout */}
          <div className="relative py-6 sm:py-10 w-full flex items-center justify-center">
            {/* Speakers Circle Layout */}
            <div className="relative z-10 grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-6 w-full max-w-2xl px-1 sm:px-2 justify-items-center">
              {DEMO_SPEAKERS.map((speaker, idx) => {
                const isSelected = activeSpeakerIndex === idx
                return (
                  <button
                    key={speaker.id}
                    onClick={() => handleSeatClick(speaker, idx)}
                    className="group relative flex flex-col items-center text-center transition-transform active:scale-95 focus:outline-none"
                  >
                    {/* Avatar Container */}
                    <div className="relative size-14 sm:size-20">
                      <div
                        className={`size-full rounded-full border-2 overflow-hidden bg-muted transition-all ${
                          isSelected
                            ? "border-foreground ring-2 ring-foreground/20"
                            : "border-border/80 group-hover:border-foreground/60"
                        }`}
                      >
                        <img
                          src={userpicUrl(speaker.avatar)}
                          alt={speaker.name}
                          className="size-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Name & Role */}
                    <div className="mt-1.5 sm:mt-2">
                      <span className="font-display text-[11px] sm:text-xs font-bold text-foreground block truncate max-w-[70px] sm:max-w-[80px]">
                        {speaker.name}
                      </span>
                      <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground block">
                        {speaker.role}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Interactive Stage Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border/70">
            {/* Mic Toggle & Status */}
            <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-mono font-bold transition-all active:scale-95 ${
                  isMuted
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                {isMuted ? <RiMicOffLine size={15} /> : <RiMicLine size={15} />}
                <span>{isMuted ? "Mic Muted" : "Mic Live"}</span>
              </button>

              <span className="font-mono text-[11px] sm:text-xs text-muted-foreground">
                Tap speaker to select
              </span>
            </div>

            <Link
              href="/lobby"
              className="inline-flex items-center justify-center sm:justify-start gap-1.5 font-mono text-xs font-bold text-foreground hover:underline pt-1 sm:pt-0"
            >
              <span>Join live discussion</span>
              <RiArrowRightLine size={14} />
            </Link>
          </div>
        </div>

        {/* Quick Launch Station */}
        <div className="mt-6 sm:mt-8 max-w-xl mx-auto w-full">
          <form
            onSubmit={handleLaunchQuick}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-card border border-border p-2 rounded-2xl sm:rounded-full shadow-lg"
          >
            <div className="flex items-center gap-2 px-3 py-1 sm:py-0 w-full sm:w-auto flex-1">
              <RiRadio2Line className="text-muted-foreground shrink-0" size={18} />
              <input
                type="text"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                placeholder="Name your space (e.g. design-crit)"
                maxLength={25}
                className="w-full bg-transparent text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none py-1"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-full bg-foreground text-background px-5 sm:px-6 py-2.5 sm:py-3 font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-transform active:scale-95 shrink-0"
            >
              <RiAddLine size={16} />
              <span>Launch Space</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
