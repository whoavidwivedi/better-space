/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { ArrowRight, Plus } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  findTemplate,
  getDisplayRoomTitle,
  type StarterTemplate,
} from "@/lib/presets"
import { userpicUrl } from "@/lib/userpics"
import { cn } from "@/lib/utils"

// A live room as /api/livekit/rooms lists it.
export type LiveRoom = {
  name: string
  numParticipants: number
  host: string
  /** Seconds since the epoch, from LiveKit. */
  createdAt?: number
  participants: { identity: string; avatar: string; onMic?: boolean }[]
}

const CARD =
  "group relative flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 text-left shadow-xs transition-[border-color,box-shadow,translate] duration-(--duration-quick) ease-(--ease-out) hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:rounded-3xl sm:p-5"

function startedAgo(createdAt?: number) {
  if (!createdAt) return null
  const minutes = Math.max(0, Math.floor((Date.now() / 1000 - createdAt) / 60))
  if (minutes < 1) return "just started"
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
}

export function Faces({
  seeds,
  extra = 0,
  ringed = 0,
}: {
  seeds: string[]
  /** Count past the faces shown. */
  extra?: number
  /** How many of the first faces are on the mic, ringed as speaking. */
  ringed?: number
}) {
  return (
    <div className="flex shrink-0 -space-x-2">
      {seeds.map((seed, i) => (
        <span
          key={`${seed}-${i}`}
          className={cn(
            "relative size-8 overflow-hidden rounded-full border-2 border-card bg-muted shadow-xs",
            i < ringed && "ring-2 ring-emerald-500/70"
          )}
          style={{ zIndex: seeds.length - i }}
        >
          <img
            src={userpicUrl(seed)}
            alt=""
            className="size-full object-cover"
          />
        </span>
      ))}
      {extra > 0 && (
        <span className="relative flex size-8 items-center justify-center rounded-full border-2 border-card bg-muted text-[11px] font-semibold text-muted-foreground tabular-nums">
          +{extra}
        </span>
      )}
    </div>
  )
}

export function LivePill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
      <span className="relative flex size-1.5" aria-hidden="true">
        <span className="relative size-1.5 rounded-full bg-emerald-500" />
      </span>
      Live
    </span>
  )
}

// A live room: who hosts it, who is on stage, how long it has run. Opens with
// `onJoin` (the lobby asks for a name first) or goes to the room at `href`.
export function RoomCard({
  room,
  href,
  onJoin,
  notice,
  className,
}: {
  room: LiveRoom
  href?: string
  onJoin?: (anchor: HTMLElement) => void
  /** A line over the card, such as a host's rejoin countdown. */
  notice?: string
  className?: string
}) {
  const template = findTemplate(room.name)
  const title = getDisplayRoomTitle(room.name)
  // Speakers first, so the ringed faces lead.
  const people = [...room.participants].sort(
    (a, b) => Number(Boolean(b.onMic)) - Number(Boolean(a.onMic))
  )
  const shown = people.slice(0, 5)
  const onMic = shown.filter((p) => p.onMic).length
  const ago = startedAgo(room.createdAt)

  const body = (
    <>
      {notice && (
        <span className="-mx-4 -mt-4 mb-3 bg-foreground px-4 py-1.5 text-center text-xs font-medium text-background sm:-mx-5 sm:-mt-5">
          {notice}
        </span>
      )}
      <span className="flex items-center justify-between gap-3">
        <LivePill />
        <span className="text-xs text-muted-foreground tabular-nums">
          {room.numParticipants}{" "}
          {room.numParticipants === 1 ? "person" : "people"}
          {ago && ` · ${ago}`}
        </span>
      </span>
      <span className="mt-4 block">
        <span className="line-clamp-2 font-display text-lg leading-snug font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </span>
        <span className="mt-1 block truncate text-sm text-muted-foreground">
          {template ? `${template.topic} · ` : ""}Hosted by {room.host}
        </span>
      </span>
      <span className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4">
        <Faces
          seeds={shown.map((p) => p.avatar || p.identity)}
          extra={room.numParticipants - shown.length}
          ringed={onMic}
        />
        <span
          className={cn(
            buttonVariants({ size: "sm" }),
            "pointer-events-none rounded-[10px] px-3"
          )}
        >
          Join
          <ArrowRight
            data-icon="inline-end"
            className="transition-transform duration-(--duration-quick) group-hover:translate-x-0.5"
          />
        </span>
      </span>
    </>
  )

  const cls = cn(CARD, "min-h-48 gap-0", className)
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <button
      type="button"
      className={cls}
      onClick={(e) => onJoin?.(e.currentTarget)}
    >
      {body}
    </button>
  )
}

// A starter template: a ready topic and line-up, started with one tap.
// `onStart` opens the Launch panel with it; otherwise it links to `href`, by
// default the lobby with that panel open.
export function TemplateCard({
  template,
  href = `/lobby?template=${template.name}`,
  onStart,
  className,
}: {
  template: StarterTemplate
  href?: string
  onStart?: () => void
  className?: string
}) {
  const body = (
    <>
      <span className="text-xs font-medium text-muted-foreground">
        {template.topic}
      </span>
      <span className="mt-2 line-clamp-2 font-display text-lg leading-snug font-semibold tracking-tight text-foreground">
        {template.title}
      </span>
      <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {template.desc}
      </span>
      <span className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4">
        <Faces seeds={template.speakers.slice(0, 4)} />
        <span
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "pointer-events-none rounded-[10px] px-3"
          )}
        >
          <Plus data-icon="inline-start" />
          Start space
        </span>
      </span>
    </>
  )
  const cls = cn(CARD, "min-h-44", className)
  return onStart ? (
    <button type="button" className={cls} onClick={onStart}>
      {body}
    </button>
  ) : (
    <Link href={href} className={cls}>
      {body}
    </Link>
  )
}

// Stand-ins while rooms load, the size of a room card.
export function RoomCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-48 flex-col rounded-2xl border border-border bg-card p-4 sm:rounded-3xl sm:p-5"
    >
      <span className="h-6 w-16 animate-pulse rounded-full bg-muted" />
      <span className="mt-4 h-5 w-3/4 animate-pulse rounded-md bg-muted" />
      <span className="mt-2 h-4 w-1/2 animate-pulse rounded-md bg-muted" />
      <span className="mt-auto flex items-center justify-between border-t border-border/70 pt-4">
        <span className="h-8 w-24 animate-pulse rounded-full bg-muted" />
        <span className="h-7 w-16 animate-pulse rounded-full bg-muted" />
      </span>
    </div>
  )
}
