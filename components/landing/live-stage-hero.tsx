"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight as RiArrowRightLine,
  Copy,
  Headphones,
  Keyboard,
  Mic,
  MessageSquare,
  MicOff,
  Send,
  Settings,
  Smile,
  Users,
  VolumeX,
  X,
} from "lucide-react"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { BetterSpaceMark } from "@/components/brand/better-space-mark"
import { Button, buttonVariants } from "@/components/ui/button"
import { getDisplayRoomTitle, toSlug } from "@/lib/presets"
import { userpicUrl } from "@/lib/userpics"
import { cn } from "@/lib/utils"

// Start a real room from the hero: name it, press Go live, and you land on the
// join screen for that room.
function RoomStarter() {
  const router = useRouter()
  const [name, setName] = useState("")
  const slug = toSlug(name)

  const start = (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug) return
    router.push(`/space/${encodeURIComponent(slug)}`)
  }

  return (
    <div className="mx-auto max-w-xl">
      <form
        onSubmit={start}
        className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg sm:flex-row sm:items-center"
      >
        <label htmlFor="hero-room-name" className="sr-only">
          Name your room
        </label>
        <div className="flex h-12 min-w-0 flex-1 items-center rounded-xl px-3 transition-colors focus-within:bg-muted/50">
          <span className="font-mono text-sm text-muted-foreground">
            /space/
          </span>
          <input
            id="hero-room-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name-your-room"
            maxLength={40}
            autoComplete="off"
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={!slug}
          className="h-12 shrink-0 rounded-xl px-6"
        >
          <Mic data-icon="inline-start" />
          Go live
        </Button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-3 text-sm sm:flex-row sm:justify-center sm:gap-6">
        <Link
          href="/lobby"
          className="group inline-flex items-center gap-1.5 font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground"
        >
          Browse live rooms
          <RiArrowRightLine
            size={15}
            className="transition-transform duration-(--duration-quick) ease-(--ease-out) group-hover:translate-x-0.5"
          />
        </Link>
        <span className="text-muted-foreground">
          No account &middot; Nothing recorded &middot; Any device
        </span>
      </div>
    </div>
  )
}

// Top badge: who is talking right now (same endpoint the lobby polls), or
// the latest release when nobody is live.
function HeroBadge({ live }: { live: Live | null }) {
  return (
    <Link
      href={live ? "/lobby" : "/changelog"}
      className="group inline-flex max-w-full items-center gap-2.5 rounded-full border border-border bg-card p-1 pr-3.5 text-[13px] font-medium text-foreground shadow-xs transition-[border-color,box-shadow] duration-(--duration-quick) ease-(--ease-out) hover:border-foreground/25 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background">
        {live ? (
          <span className="relative flex size-1.5" aria-hidden="true">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
            <span className="relative size-1.5 rounded-full bg-emerald-400" />
          </span>
        ) : null}
        {live ? "Live" : "New"}
      </span>
      <span className="truncate">
        {live
          ? `${live.people} ${live.people === 1 ? "person" : "people"} talking in ${live.rooms} ${live.rooms === 1 ? "room" : "rooms"}`
          : "Live chat in every room"}
      </span>
      <RiArrowRightLine
        size={14}
        aria-hidden="true"
        className="shrink-0 text-muted-foreground transition-[translate,color] duration-(--duration-quick) ease-(--ease-out) group-hover:translate-x-0.5 group-hover:text-foreground"
      />
    </Link>
  )
}

type Live = {
  people: number
  rooms: number
  room: string
  avatars: string[]
}

type Seat = { name: string; seed: string; role: "speaker" | "listener" }

const STAGE: Seat[] = [
  { name: "maya", seed: "Funny Bunny-3", role: "speaker" },
  { name: "kai", seed: "Afterclap-2", role: "speaker" },
  { name: "meera", seed: "OSLO-3", role: "speaker" },
  { name: "jo", seed: "Guacamole-1", role: "listener" },
  { name: "sam", seed: "No gravity-2", role: "listener" },
]
const REACTIONS = ["👏", "🔥", "😂", "🎉", "❤️"]

// The space screen itself, drawn at a real device's size. Breakpoints are
// container queries at the room's own viewport breakpoints (sm 40rem, md
// 48rem, lg 64rem, xl 80rem), so a 402pt phone and a 1470pt Mac lay it out
// exactly as components/livekit-room.tsx would. You are the host here, so
// Mute, Deafen, reactions and End Space all respond. Nobody is connected.
// When rooms are live, it wears the busiest one's name and faces.
function RoomPreview({ live }: { live: Live | null }) {
  const [speaker, setSpeaker] = useState(0)
  const [muted, setMuted] = useState(true)
  const [deafened, setDeafened] = useState(false)
  const [reaction, setReaction] = useState<string | null>(null)
  const [ended, setEnded] = useState(false)
  const reactionTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(
      () => setSpeaker((i) => (i + 1 + Math.floor(Math.random() * 2)) % 3),
      2400
    )
    return () => clearInterval(id)
  }, [])

  const react = () => {
    setReaction(REACTIONS[Math.floor(Math.random() * REACTIONS.length)])
    clearTimeout(reactionTimer.current)
    reactionTimer.current = setTimeout(() => setReaction(null), 2000)
  }

  const stage = STAGE.map((p, i) => ({
    ...p,
    seed: live?.avatars[i] ?? p.seed,
  }))
  const title = live ? getDisplayRoomTitle(live.room) : "Design & UX"

  return (
    <div className="@container relative flex size-full flex-col overflow-hidden bg-background text-left text-foreground">
      {/* Header bar */}
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border bg-card/80 px-2.5 @[40rem]:h-14 @[40rem]:gap-3 @[40rem]:px-4 @[48rem]:px-6">
        <div className="flex min-w-0 items-center gap-1.5 @[40rem]:gap-2">
          <BetterSpaceMark
            className="size-3.5 shrink-0 text-foreground @[40rem]:size-4"
            strokeWidth={4}
          />
          <p className="truncate font-display text-xs font-bold @[40rem]:text-sm">
            {title}
          </p>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-2 py-1 font-mono text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span className="hidden @[40rem]:inline">Connected</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 @[40rem]:gap-2">
          <span className="hidden size-8 items-center justify-center rounded-xl border border-border text-muted-foreground @[40rem]:flex">
            <Keyboard className="size-[15px]" aria-hidden="true" />
          </span>
          <span className="flex size-8 items-center justify-center rounded-xl border border-border text-muted-foreground">
            <Copy className="size-[15px]" aria-hidden="true" />
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setEnded(true)}
            className="h-8 font-mono text-xs font-bold"
          >
            End Space
          </Button>
        </div>
      </div>

      {/* Stage, with the chat panel beside it from sm up */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-2.5 pb-28 @[40rem]:flex-row @[40rem]:p-4 @[40rem]:pb-28 @[48rem]:p-6 @[48rem]:pb-36">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase @[40rem]:gap-2 @[40rem]:text-xs">
            <Users className="size-3.5 @[40rem]:size-4" aria-hidden="true" />
            Stage ({stage.length + 1})
          </p>
          <ul className="mt-3 grid grid-cols-3 gap-x-3 gap-y-6 @[40rem]:mt-6 @[40rem]:gap-6 @[48rem]:grid-cols-4 @[64rem]:grid-cols-5 @[80rem]:grid-cols-6">
            <Tile
              name="you"
              you
              seed="OSLO-1"
              host
              status={deafened ? "deafened" : muted ? "muted" : "speaking"}
              reaction={reaction}
            />
            {stage.map((p, i) => (
              <Tile
                key={p.name}
                name={p.name}
                seed={p.seed}
                status={
                  p.role === "listener"
                    ? "listener"
                    : i === speaker
                      ? "speaking"
                      : "quiet"
                }
              />
            ))}
          </ul>
        </div>
        <ChatPeek />
      </div>

      {/* Control bar */}
      <div
        role="toolbar"
        aria-label="Space controls (preview)"
        className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-card/95 p-1 shadow-2xl backdrop-blur-md @[40rem]:gap-1.5 @[40rem]:rounded-2xl @[40rem]:p-1.5 @[48rem]:gap-2 @[48rem]:p-2"
      >
        <span className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground @[40rem]:size-10">
          <Settings className="size-[17px]" aria-hidden="true" />
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Send a reaction"
          onClick={react}
          className="size-9 shrink-0 rounded-xl text-muted-foreground @[40rem]:size-10"
        >
          <Smile className="size-[17px]" />
        </Button>
        <Button
          onClick={() => setDeafened((d) => !d)}
          aria-label={deafened ? "Undeafen" : "Deafen"}
          aria-pressed={deafened}
          variant={deafened ? "destructive" : "secondary"}
          size="lg"
          className="h-9 shrink-0 gap-1.5 rounded-xl px-3 font-mono text-xs font-bold @[40rem]:h-10 @[40rem]:gap-2 @[40rem]:px-4"
        >
          {deafened ? <VolumeX /> : <Headphones />}
          <span className="hidden @[40rem]:inline">Deafen</span>
        </Button>
        <Button
          onClick={() => setMuted((m) => !m)}
          disabled={deafened}
          aria-label={muted ? "Unmute microphone" : "Mute microphone"}
          aria-pressed={muted}
          variant={muted ? "destructive" : "default"}
          size="lg"
          className="h-9 shrink-0 gap-1.5 rounded-xl px-3.5 font-mono text-xs font-bold @[40rem]:h-10 @[40rem]:gap-2 @[40rem]:px-5"
        >
          {muted ? <MicOff /> : <Mic />}
          <span>{muted ? "MIC MUTED" : "MIC LIVE"}</span>
        </Button>
      </div>

      {/* End Space */}
      {ended && (
        <div className="absolute inset-0 z-20 flex animate-in flex-col items-center justify-center gap-4 bg-background/95 p-6 text-center duration-200 fade-in">
          <p className="font-display text-lg">This space has ended</p>
          <p className="text-sm text-muted-foreground">
            Nothing was recorded. Only who hosted remains.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEnded(false)}>
              Reopen preview
            </Button>
            <Link href="/lobby" className={buttonVariants({ size: "sm" })}>
              Browse live spaces
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// The room's chat panel (components/chat-panel.tsx): on phones it starts as a
// collapsed pill showing the last message and opens on tap; from sm up it
// sits open beside the stage.
const CHAT = [
  { who: "meera", seed: "OSLO-3", text: "dropping the link here" },
  { who: "kai", seed: "Afterclap-2", text: "who's up next?" },
]

function ChatPeek() {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={cn(
        "relative mt-2 shrink-0 self-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] @[40rem]:mt-auto @[40rem]:h-[280px] @[40rem]:w-[280px] @[40rem]:self-end @[48rem]:h-[320px] @[48rem]:w-[320px] @[80rem]:h-[380px] @[80rem]:w-[380px]",
        open ? "h-[260px] w-[260px]" : "h-[40px] w-[220px]"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "absolute inset-0 flex items-center gap-2 px-4 py-2 transition-opacity duration-200 @[40rem]:hidden",
          open
            ? "pointer-events-none z-0 opacity-0"
            : "z-20 opacity-100 delay-100"
        )}
      >
        <MessageSquare
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="truncate text-xs font-medium text-muted-foreground">
          {CHAT.at(-1)?.text}
        </span>
      </button>

      <div
        className={cn(
          "relative flex size-full flex-col transition-opacity duration-200",
          open
            ? "opacity-100 delay-100"
            : "pointer-events-none opacity-0 @[40rem]:pointer-events-auto @[40rem]:opacity-100"
        )}
      >
        <button
          type="button"
          aria-label="Close chat"
          onClick={() => setOpen(false)}
          className="absolute top-2 right-2 z-30 flex size-6 items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground @[40rem]:hidden"
        >
          <X className="size-4" />
        </button>
        <div className="flex flex-1 flex-col justify-end gap-4 overflow-hidden p-3 @[40rem]:p-4">
          {CHAT.map((l) => (
            <div key={l.who} className="flex items-end gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userpicUrl(l.seed)}
                alt=""
                className="size-7 rounded-full object-cover @[40rem]:size-8"
              />
              <div>
                <p className="mb-1 text-[11px] font-bold text-muted-foreground @[40rem]:text-xs">
                  {l.who}
                </p>
                <p className="rounded-2xl bg-muted px-3 py-2 text-xs @[40rem]:text-sm">
                  {l.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-border p-3 @[40rem]:p-4">
          <span className="flex h-10 flex-1 items-center rounded-xl bg-muted/50 px-4 text-xs text-muted-foreground @[40rem]:text-sm">
            Type a message...
          </span>
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Send className="size-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  )
}

// One stage tile, as ParticipantTile draws it.
function Tile({
  name,
  seed,
  status,
  host,
  you,
  reaction,
}: {
  name: string
  seed: string
  status: "speaking" | "quiet" | "muted" | "deafened" | "listener"
  host?: boolean
  you?: boolean
  reaction?: string | null
}) {
  const onMic = status !== "listener"
  const silent = status === "muted" || status === "deafened"
  return (
    <li className="relative flex w-full flex-col items-center text-center">
      <div className="relative">
        {host && (
          <span className="absolute -top-1.5 -left-1.5 z-20 rounded-full border border-background bg-foreground px-1.5 py-0.5 font-mono text-[10px] leading-none font-extrabold text-background shadow-xs">
            HOST
          </span>
        )}
        {reaction && (
          <span className="absolute -top-2 -right-2 z-30 flex size-7 animate-in items-center justify-center rounded-full border border-border bg-card text-base shadow-md duration-150 zoom-in-75 fade-in @[40rem]:size-8 @[40rem]:text-lg">
            {reaction}
          </span>
        )}
        <div className={cn("relative rounded-full", !onMic && "opacity-75")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={userpicUrl(seed)}
            alt=""
            className="size-14 rounded-full border border-border bg-card object-cover shadow-xs @[40rem]:size-16 @[48rem]:size-20"
          />
          <span className="absolute -right-1 -bottom-1 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-card shadow-xs">
            {status === "deafened" ? (
              <VolumeX
                className="size-[13px] text-destructive"
                aria-hidden="true"
              />
            ) : status === "muted" ? (
              <MicOff
                className="size-[13px] text-destructive"
                aria-hidden="true"
              />
            ) : onMic ? (
              <Mic className="size-[13px] text-foreground" aria-hidden="true" />
            ) : (
              <VolumeX
                className="size-[13px] text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </span>
        </div>
      </div>
      <span className="mt-2 max-w-full truncate px-1 text-xs font-bold">
        {name} {you ? "(You)" : ""}
      </span>
      <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
        {!onMic ? "Listener" : silent ? "Muted" : "Speaker"}
      </span>
      {onMic && (
        <div className="mt-1.5 w-full max-w-[80px]">
          {silent ? (
            <div className="h-3.5 w-full" />
          ) : (
            <AudioVisualizer
              volume={status === "speaking" ? 0.5 : 0}
              speaking={status === "speaking"}
            />
          )}
        </div>
      )}
    </li>
  )
}

// Renders children at a device's real size in points, then scales the whole
// thing down to fit the frame, so layout and type keep true proportions.
function Screen({
  width,
  height,
  children,
}: {
  width: number
  height: number
  children: React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  )
}

// MacBook Air 13": 304.1 mm wide, 2560×1664 panel shown at 1470×956 points.
// iPhone 16 Pro: 71.5 mm wide (23.5% of the Mac), 402×874 points.
// Bezels and radii are in cqw, so the frames hold true proportions at any size.
function MacBook({ live }: { live: Live | null }) {
  return (
    <div className="@container w-full">
      <div className="rounded-t-[2.6cqw] bg-neutral-950 p-[1.4cqw] pb-[1.9cqw] shadow-2xl ring-1 ring-neutral-800">
        <div className="relative overflow-hidden rounded-[0.6cqw]">
          <span
            aria-hidden="true"
            className="absolute top-0 left-1/2 z-30 h-[2.15cqw] w-[13cqw] -translate-x-1/2 rounded-b-[0.7cqw] bg-neutral-950"
          />
          <Screen width={1470} height={956}>
            <div className="flex size-full flex-col bg-[linear-gradient(160deg,#c7d2fe,#fbcfe8_45%,#fde68a)] dark:bg-[linear-gradient(160deg,#1e1b4b,#3b0764_45%,#422006)]">
              <div
                aria-hidden="true"
                className="flex h-[37px] shrink-0 items-center justify-between bg-white/40 px-5 text-[13px] font-medium text-neutral-900 backdrop-blur-xl dark:bg-black/30 dark:text-white"
              >
                <span className="flex gap-5">
                  <span className="font-bold">Safari</span>
                  <span>File</span>
                  <span>Edit</span>
                  <span>View</span>
                </span>
                <span>Mon 9:41 AM</span>
              </div>
              <div className="mx-5 mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-xl border border-black/10 bg-background shadow-2xl">
                <div
                  aria-hidden="true"
                  className="flex h-12 shrink-0 items-center gap-4 border-b border-border bg-muted px-4"
                >
                  <span className="flex gap-2">
                    <span className="size-3 rounded-full bg-[#ff5f57]" />
                    <span className="size-3 rounded-full bg-[#febc2e]" />
                    <span className="size-3 rounded-full bg-[#28c840]" />
                  </span>
                  <span className="mx-auto w-[28rem] truncate rounded-lg bg-background px-3 py-1.5 text-center text-[13px] text-muted-foreground">
                    space.whoavidwivedi.work
                  </span>
                  <span className="w-14" />
                </div>
                <div className="min-h-0 flex-1">
                  <RoomPreview live={live} />
                </div>
              </div>
            </div>
          </Screen>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="relative -mx-[1.2cqw] h-[1.5cqw] rounded-b-[1.4cqw] bg-gradient-to-b from-neutral-300 to-neutral-400 shadow-lg dark:from-neutral-600 dark:to-neutral-800"
      >
        <span className="absolute top-0 left-1/2 h-[0.55cqw] w-[13cqw] -translate-x-1/2 rounded-b-[0.6cqw] bg-neutral-400 dark:bg-neutral-900" />
      </div>
    </div>
  )
}

function IPhone({ live }: { live: Live | null }) {
  return (
    <div className="@container w-full">
      <div className="rounded-[14.5cqw] bg-neutral-900 p-[2.6cqw] shadow-2xl ring-1 ring-neutral-700 dark:bg-neutral-800">
        <div className="relative overflow-hidden rounded-[12cqw] bg-background">
          <Screen width={402} height={874}>
            <div className="flex size-full flex-col bg-background">
              <div
                aria-hidden="true"
                className="relative flex h-[54px] shrink-0 items-center justify-between px-8 pt-1 text-[17px] font-semibold text-foreground"
              >
                <span>9:41</span>
                <span className="absolute top-[11px] left-1/2 h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black" />
                <span className="h-[13px] w-[25px] rounded-[4px] border-2 border-foreground/40 p-px">
                  <span className="block h-full w-3/4 rounded-[1.5px] bg-foreground" />
                </span>
              </div>
              <div className="min-h-0 flex-1">
                <RoomPreview live={live} />
              </div>
              <span
                aria-hidden="true"
                className="mx-auto mt-2 mb-2 h-[5px] w-[134px] shrink-0 rounded-full bg-foreground"
              />
            </div>
          </Screen>
        </div>
      </div>
    </div>
  )
}

// The same room on a Mac and an iPhone, at true relative scale. Phones get
// just the iPhone; the Mac would be too small to read.
function Devices({ live }: { live: Live | null }) {
  return (
    <div className="relative mx-auto mt-14 max-w-5xl sm:mt-20">
      <div className="hidden w-[88%] md:block">
        <MacBook live={live} />
      </div>
      <div className="mx-auto w-[17rem] md:absolute md:right-0 md:-bottom-4 md:mx-0 md:w-[20.7%]">
        <IPhone live={live} />
      </div>
    </div>
  )
}

export function LiveStageHero() {
  const [live, setLive] = useState<Live | null>(null)

  useEffect(() => {
    fetch("/api/livekit/rooms")
      .then((res) => res.json())
      .then(
        ({
          data,
        }: {
          data?: {
            name: string
            numParticipants: number
            participants?: { avatar: string }[]
          }[]
        }) => {
          if (!data?.length) return
          const busiest = [...data].sort(
            (a, b) => b.numParticipants - a.numParticipants
          )[0]
          setLive({
            rooms: data.length,
            people: data.reduce((n, r) => n + r.numParticipants, 0),
            room: busiest.name,
            avatars: busiest.participants?.map((p) => p.avatar) ?? [],
          })
        }
      )
      .catch(() => {})
  }, [])

  return (
    <section className="relative w-full overflow-hidden border-b border-border/80 bg-background pt-10 pb-14 sm:pt-14 sm:pb-20 lg:pt-20 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[4rem_4rem] opacity-35" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex justify-center">
            <HeroBadge live={live} />
          </div>
          <h1 className="font-display text-4xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
            Voice spaces for{" "}
            <span className="font-serif-display whitespace-nowrap text-muted-foreground">
              real-time
            </span>{" "}
            conversations.
          </h1>
          <p className="mx-auto mt-5 mb-8 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Drop into live voice rooms right in your browser. Claim the mic and
            talk with crisp, low-latency audio.
          </p>
          <RoomStarter />
        </div>

        <Devices live={live} />
      </div>
    </section>
  )
}
