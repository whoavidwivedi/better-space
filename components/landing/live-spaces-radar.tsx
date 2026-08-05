/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  RiRadio2Line,
  RiTeamLine,
  RiArrowRightLine,
  RiVolumeUpLine,
  RiSparklingLine,
  RiAddLine,
} from "@remixicon/react"
import { userpicUrl } from "@/lib/userpics"

type LiveRoom = {
  name: string
  title: string
  topic: string
  host: string
  speakers: string[]
  listenersCount: number
}

const FEATURED_ROOMS: LiveRoom[] = [
  {
    name: "design-systems",
    title: "Design Systems, Motion & Craft",
    topic: "Design",
    host: "OSLO-1",
    speakers: ["OSLO-1", "OSLO-3", "Upstream-2", "Afterclap-4"],
    listenersCount: 28,
  },
  {
    name: "indie-founders",
    title: "Building & Shipping Micro-SaaS",
    topic: "Startups",
    host: "Upstream-5",
    speakers: ["Upstream-5", "Funny Bunny-2", "Teamwork-1"],
    listenersCount: 44,
  },
  {
    name: "ambient-lounge",
    title: "Late Night Ambient & Deep Work",
    topic: "Music & Hangout",
    host: "Afterclap-8",
    speakers: ["Afterclap-8", "OSLO-12", "Guacamole-1"],
    listenersCount: 19,
  },
  {
    name: "ai-agents",
    title: "Autonomous Coding & Local LLMs",
    topic: "Engineering",
    host: "OSLO-6",
    speakers: ["OSLO-6", "Upstream-14", "Funny Bunny-7", "Delivery boy-1"],
    listenersCount: 63,
  },
]

export function LiveSpacesRadar() {
  const [rooms, setRooms] = useState<LiveRoom[]>(FEATURED_ROOMS)

  useEffect(() => {
    // Attempt to fetch actual live rooms if available
    fetch("/api/livekit/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          const mapped: LiveRoom[] = data.data.map((r: any) => ({
            name: r.name,
            title: r.name.replace(/[-_]/g, " ").toUpperCase(),
            topic: "Live Broadcast",
            host: r.host || "OSLO-1",
            speakers: r.participants?.map((p: any) => p.avatar || p.identity) || ["OSLO-1"],
            listenersCount: Math.max(r.numParticipants, 1),
          }))
          setRooms([...mapped, ...FEATURED_ROOMS.slice(mapped.length)])
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="relative w-full border-b border-border/80 bg-background py-12 sm:py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 sm:mb-2">
              <span>EXPLORE ACTIVE SPACES</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Drop into ongoing discussions.
            </h2>
          </div>

          <Link
            href="/lobby"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold text-foreground hover:underline self-start sm:self-auto"
          >
            <span>View All Spaces ({rooms.length})</span>
            <RiArrowRightLine size={16} />
          </Link>
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {rooms.slice(0, 4).map((room) => (
            <Link
              key={room.name}
              href={`/space/${encodeURIComponent(room.name)}`}
              className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border bg-card/70 p-5 sm:p-7 hover:border-foreground/40 hover:bg-card/95 transition-all duration-200 active:scale-[0.99] shadow-sm hover:shadow-md overflow-hidden"
            >
              {/* Card Top */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-3.5 sm:mb-4">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 sm:px-3 sm:py-1 font-mono text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase">
                    {room.topic}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs font-semibold text-muted-foreground">
                    <span>{room.listenersCount} tuning in</span>
                  </div>
                </div>

                <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-foreground group-hover:text-foreground/90 transition-colors">
                  {room.title}
                </h3>
              </div>

              {/* Card Bottom: Speakers & Join Action */}
              <div className="mt-6 sm:mt-8 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-3.5 sm:pt-4 border-t border-border/60">
                {/* Speaker Avatars */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex -space-x-2 sm:-space-x-2.5">
                    {room.speakers.slice(0, 4).map((avatar, idx) => (
                      <div
                        key={idx}
                        className="size-8 sm:size-9 rounded-full border-2 border-card bg-muted overflow-hidden shadow-xs shrink-0"
                      >
                        <img
                          src={userpicUrl(avatar)}
                          alt="Speaker"
                          className="size-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <span className="font-mono text-[11px] sm:text-xs text-muted-foreground">
                    {room.speakers.length} on mic
                  </span>
                </div>

                {/* Enter Button */}
                <div className="inline-flex items-center gap-1 rounded-full bg-foreground text-background px-3.5 py-1.5 sm:px-4 sm:py-2 font-mono text-xs font-bold uppercase tracking-wider group-hover:bg-foreground/90 transition-transform group-active:scale-95">
                  <span>Enter</span>
                  <RiArrowRightLine size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
