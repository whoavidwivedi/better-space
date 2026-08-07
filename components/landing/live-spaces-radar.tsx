/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight as RiArrowRightLine, Plus as RiAddLine } from "lucide-react"
import { userpicUrl } from "@/lib/userpics"
import {
  STARTER_TEMPLATES,
  findTemplate,
  getDisplayRoomTitle,
  StarterTemplate,
} from "@/lib/presets"

type SpaceCard = {
  name: string
  title: string
  topic: string
  host: string
  speakers: string[]
  listenersCount?: number
  isLive: boolean
}

const DEFAULT_ROOMS: SpaceCard[] = STARTER_TEMPLATES.map((t) => ({
  name: t.name,
  title: t.title,
  topic: t.topic,
  host: "OSLO-1",
  speakers: t.speakers,
  isLive: false,
}))

export function LiveSpacesRadar() {
  const [rooms, setRooms] = useState<SpaceCard[]>(DEFAULT_ROOMS)

  useEffect(() => {
    // Attempt to fetch actual live rooms if available
    fetch("/api/livekit/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          const liveList: SpaceCard[] = data.data.map((r: any) => {
            const matchingTemplate = findTemplate(r.name)
            return {
              name: r.name,
              title: matchingTemplate
                ? matchingTemplate.title
                : getDisplayRoomTitle(r.name),
              topic: matchingTemplate
                ? matchingTemplate.topic
                : "Live Broadcast",
              host: r.host || "OSLO-1",
              speakers: r.participants?.map(
                (p: any) => p.avatar || p.identity
              ) || ["OSLO-1"],
              listenersCount: Math.max(r.numParticipants, 1),
              isLive: true,
            }
          })

          // Merge live rooms first, followed by remaining starter templates (up to 3 total)
          const remainingTemplates = DEFAULT_ROOMS.filter(
            (tmpl) =>
              !liveList.some(
                (l) => l.name.toLowerCase() === tmpl.name.toLowerCase()
              )
          )
          setRooms([...liveList, ...remainingTemplates].slice(0, 3))
        }
      })
      .catch(() => {})
  }, [])

  const hasLiveRooms = rooms.some((r) => r.isLive)

  return (
    <section className="relative w-full border-b border-border/80 bg-background py-12 sm:py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <div className="mb-1.5 inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase sm:mb-2 sm:text-xs">
              <span>EXPLORE ACTIVE SPACES</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {hasLiveRooms
                ? "Drop into live discussions."
                : "Drop into live discussions or launch a template."}
            </h2>
          </div>

          <Link
            href="/lobby"
            className="inline-flex items-center gap-2 self-start font-mono text-xs font-bold text-foreground hover:underline sm:self-auto"
          >
            <span>View All Spaces</span>
            <RiArrowRightLine size={16} />
          </Link>
        </div>

        {/* Room Cards Grid (3 Rooms/Templates + 1 Dotted Blank Start Space Card) */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-5">
          {rooms.slice(0, 3).map((room) => (
            <Link
              key={room.name}
              href={`/space/${encodeURIComponent(room.name)}`}
              className="group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card/70 p-4 shadow-sm transition-all duration-200 hover:border-foreground/40 hover:bg-card/95 hover:shadow-md active:scale-[0.99] sm:min-h-[220px] sm:rounded-3xl sm:p-6"
            >
              {/* Card Top */}
              <div>
                <div className="mb-3.5 flex items-center justify-between gap-3 sm:mb-4">
                  {room.isLive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-background uppercase sm:px-3 sm:py-1 sm:text-[11px]">
                      <span className="size-1.5 rounded-full bg-background" />
                      LIVE NOW
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/80 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-muted-foreground uppercase sm:px-3 sm:py-1 sm:text-[11px]">
                      STARTER TEMPLATE
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-muted-foreground sm:text-xs">
                    {room.isLive ? (
                      <span>{room.listenersCount} tuning in</span>
                    ) : (
                      <span className="text-[10px] sm:text-[11px]">
                        Available to launch
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-foreground/90 sm:text-xl md:text-2xl">
                  {room.title}
                </h3>
              </div>

              {/* Card Bottom: Speakers & Action */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3 sm:mt-8 sm:pt-4">
                {/* Speaker Avatars */}
                <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                  <div className="flex shrink-0 -space-x-2">
                    {room.speakers.slice(0, 4).map((avatar, idx) => (
                      <div
                        key={idx}
                        className="size-7 shrink-0 overflow-hidden rounded-full border-2 border-card bg-muted shadow-xs sm:size-8"
                      >
                        <img
                          src={userpicUrl(avatar)}
                          alt="Speaker"
                          className="size-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <span className="truncate font-mono text-[10px] text-muted-foreground sm:text-xs">
                    {room.isLive
                      ? `${room.speakers.length} on mic`
                      : "Preset line-up"}
                  </span>
                </div>

                {/* Enter / Start Button */}
                {room.isLive ? (
                  <div className="ml-auto inline-flex h-8 shrink-0 items-center gap-1 rounded-xl bg-foreground px-3 font-mono text-[10px] font-bold tracking-wider text-background uppercase transition-transform group-hover:bg-foreground/90 group-active:scale-95 sm:ml-0 sm:px-3.5">
                    <span>Join Space</span>
                    <RiArrowRightLine size={13} />
                  </div>
                ) : (
                  <div className="ml-auto inline-flex h-8 shrink-0 items-center gap-1 rounded-xl border border-border bg-background px-3 font-mono text-[10px] font-bold tracking-wider text-foreground uppercase transition-transform group-hover:border-foreground/60 group-active:scale-95 hover:bg-muted sm:ml-0 sm:px-3.5">
                    <RiAddLine size={13} />
                    <span>Start Space</span>
                  </div>
                )}
              </div>
            </Link>
          ))}

          {/* 4th Card: Dotted Blank Start Space Card */}
          <Link
            href="/lobby"
            className="group relative flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/90 bg-card/30 p-5 text-center transition-all duration-200 hover:border-foreground/60 hover:bg-card/70 active:scale-[0.99] sm:min-h-[220px] sm:rounded-3xl sm:p-8"
          >
            <div className="mb-3 flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/50 transition-colors group-hover:border-foreground/60 group-hover:bg-muted sm:size-14">
              <RiAddLine
                size={24}
                className="text-muted-foreground transition-colors group-hover:text-foreground"
              />
            </div>

            <h3 className="mb-1 font-display text-lg font-bold text-foreground sm:text-xl">
              Start Space
            </h3>

            <p className="mb-4 max-w-xs font-mono text-[11px] text-muted-foreground sm:text-xs">
              Host your own room on any topic with instant ephemeral audio.
            </p>

            <div className="inline-flex h-9.5 items-center gap-1.5 rounded-xl bg-foreground px-4 font-mono text-xs font-bold tracking-wider text-background uppercase transition-transform group-hover:bg-foreground/90 group-active:scale-95">
              <RiAddLine size={14} />
              <span>Create New Space</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
