"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight as RiArrowRightLine,
  ChevronLeft,
  Copy,
  Ellipsis,
  Headphones,
  Keyboard,
  Mic,
  MessageSquare,
  MicOff,
  Settings,
  Smile,
  Users,
  VolumeX,
  X,
} from "lucide-react"
import { RiSendPlane2Fill } from "@remixicon/react"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Input } from "@/components/ui/input"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { BetterSpaceMark } from "@/components/brand/better-space-mark"
import {
  Foldable,
  FoldableCover,
  FoldableInsideLeft,
  FoldableInsideRight,
  FoldableSlider,
  FoldableStage,
} from "@/components/foldable"
import { Button, buttonVariants } from "@/components/ui/button"
import { getDisplayRoomTitle, ROOM_NAME_MAX, toSlug } from "@/lib/presets"
import { userpicUrl } from "@/lib/userpics"
import { cn } from "@/lib/utils"

// Start a real room from the hero: name it, press Go live, and the lobby opens
// with its Launch panel filled in (or the room's Join panel, if it is live).
function RoomStarter() {
  const router = useRouter()
  const [name, setName] = useState("")
  const slug = toSlug(name)

  const start = (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug) return
    router.push(`/lobby?space=${encodeURIComponent(slug)}`)
  }

  return (
    <div className="mx-auto max-w-xl">
      <form
        onSubmit={start}
        className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg"
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
            maxLength={ROOM_NAME_MAX}
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

// A pill that leads with a tag drawn as the site's primary button, as the hero
// badge and the iPhone Duo badge show "New" or "Live".
const PILL =
  "inline-flex max-w-full items-center gap-2.5 rounded-xl border border-border bg-card/80 p-1 pr-3.5 text-[13px] font-medium text-foreground shadow-xs backdrop-blur-sm"

function PillTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        buttonVariants({ size: "xs" }),
        "pointer-events-none shrink-0 rounded-lg px-2.5 font-semibold"
      )}
    >
      {children}
    </span>
  )
}

// Top badge: who is talking right now (same endpoint the lobby polls), or
// the latest release when nobody is live.
function HeroBadge({ live }: { live: Live | null }) {
  return (
    <Link
      href={live ? "/lobby" : "/changelog"}
      className={cn(
        PILL,
        "group transition-[border-color,box-shadow] duration-(--duration-quick) ease-(--ease-out) hover:border-foreground/25 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      )}
    >
      <PillTag>
        {live ? (
          <span className="relative flex size-1.5" aria-hidden="true">
            <span className="relative size-1.5 rounded-full bg-emerald-400" />
          </span>
        ) : null}
        {live ? "Live" : "New"}
      </PillTag>
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
// A docked control: round and icon-only, as the room's `dock:` classes draw it.
const ROUND = "size-11 rounded-full px-0 @[40rem]:size-11 @[40rem]:px-0"

// The space screen itself, drawn at a real device's size. Breakpoints are
// container queries at the room's own viewport breakpoints (sm 40rem, md
// 48rem, lg 64rem, xl 80rem), so a 402pt phone and a 1470pt Mac lay it out
// exactly as components/livekit-room.tsx would. You are the host here, so
// Mute, Deafen, reactions and End Space all respond. Nobody is connected.
// When rooms are live, it wears the busiest one's name and faces. `dock` is
// the room's `dock` variant (the iPhone Duo's screens, a phone on its side):
// the controls stand as a column of round buttons at the bottom right, centred
// in a strip `rail` points wide that the room keeps clear (Apple's Duo layout
// puts status and toolbars in that strip). `split` is the room's `spread` variant (the Duo
// unfolded): the space fills the left half, chat sits centred in the right,
// meeting at the hinge. `still` holds the speaker, so copies of one screen
// (the Duo's blurred cover) stay identical.
function RoomPreview({
  live,
  dock,
  split,
  still,
  rail = 72,
}: {
  live: Live | null
  dock?: boolean
  split?: boolean
  still?: boolean
  rail?: number
}) {
  const [speaker, setSpeaker] = useState(0)
  const [muted, setMuted] = useState(true)
  const [deafened, setDeafened] = useState(false)
  const [reaction, setReaction] = useState<string | null>(null)
  const [ended, setEnded] = useState(false)
  const reactionTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (still || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(
      () => setSpeaker((i) => (i + 1 + Math.floor(Math.random() * 2)) % 3),
      2400
    )
    return () => clearInterval(id)
  }, [still])

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
    <div
      className="@container relative flex size-full flex-col overflow-hidden bg-background text-left text-foreground"
      style={{ "--rail": `${rail}px` } as React.CSSProperties}
    >
      {/* Header bar */}
      <div
        className={cn(
          "flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border bg-card/80 px-2.5 @[40rem]:h-14 @[40rem]:gap-3 @[40rem]:px-4 @[48rem]:px-6",
          dock && "pr-(--rail) @[40rem]:pr-(--rail) @[48rem]:pr-(--rail)"
        )}
      >
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
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-4 p-2.5 pb-28 @[40rem]:flex-row @[40rem]:p-4 @[40rem]:pb-28 @[48rem]:p-6 @[48rem]:pb-36",
          dock &&
            "pr-(--rail) pb-4 @[40rem]:pr-(--rail) @[40rem]:pb-4 @[48rem]:pr-(--rail) @[48rem]:pb-6",
          split &&
            "grid grid-cols-2 gap-0 p-0 pr-0 pb-0 @[40rem]:p-0 @[40rem]:pr-0 @[40rem]:pb-0 @[48rem]:p-0 @[48rem]:pr-0 @[48rem]:pb-0"
        )}
      >
        <div className={cn("min-w-0 flex-1", split && "overflow-hidden p-6")}>
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
        {split ? (
          <div className="flex min-h-0 items-center justify-center p-6 pr-(--rail)">
            <ChatPeek className="@[40rem]:mt-0 @[40rem]:self-center" />
          </div>
        ) : (
          <ChatPeek />
        )}
      </div>

      {/* Control bar */}
      <div
        role="toolbar"
        aria-label="Space controls (preview)"
        className={cn(
          "absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-card/95 p-1 shadow-2xl backdrop-blur-md @[40rem]:gap-1.5 @[40rem]:rounded-2xl @[40rem]:p-1.5 @[48rem]:gap-2 @[48rem]:p-2",
          dock &&
            "right-[calc((var(--rail)-58px)/2)] left-auto translate-x-0 flex-col gap-1.5 rounded-full p-1.5 @[40rem]:gap-1.5 @[40rem]:rounded-full @[40rem]:p-1.5 @[48rem]:gap-1.5 @[48rem]:p-1.5"
        )}
      >
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground @[40rem]:size-10",
            dock && ROUND
          )}
        >
          <Settings className="size-[17px]" aria-hidden="true" />
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Send a reaction"
          onClick={react}
          className={cn(
            "size-9 shrink-0 rounded-xl text-muted-foreground @[40rem]:size-10",
            dock && ROUND
          )}
        >
          <Smile className="size-[17px]" />
        </Button>
        <Button
          onClick={() => setDeafened((d) => !d)}
          aria-label={deafened ? "Undeafen" : "Deafen"}
          aria-pressed={deafened}
          variant={deafened ? "destructive" : "secondary"}
          size="lg"
          className={cn(
            "h-9 shrink-0 gap-1.5 rounded-xl px-3 font-mono text-xs font-bold @[40rem]:h-10 @[40rem]:gap-2 @[40rem]:px-4",
            dock && ROUND
          )}
        >
          {deafened ? <VolumeX /> : <Headphones />}
          {!dock && <span className="hidden @[40rem]:inline">Deafen</span>}
        </Button>
        <Button
          onClick={() => setMuted((m) => !m)}
          disabled={deafened}
          aria-label={muted ? "Unmute microphone" : "Mute microphone"}
          aria-pressed={muted}
          variant={muted ? "destructive" : "default"}
          size="lg"
          className={cn(
            "h-9 shrink-0 gap-1.5 rounded-xl px-3.5 font-mono text-xs font-bold @[40rem]:h-10 @[40rem]:gap-2 @[40rem]:px-5",
            dock && ROUND
          )}
        >
          {muted ? <MicOff /> : <Mic />}
          {!dock && <span>{muted ? "MIC MUTED" : "MIC LIVE"}</span>}
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

// The room's chat panel (components/chat-panel.tsx), built from the same
// message, bubble, input and button components, minus LiveKit: what you send
// stays here. On phones it starts as a collapsed pill showing the last message
// and opens on tap; from sm up it sits open beside the stage.
type ChatLine = { who: string; seed: string; text: string; me?: boolean }

const CHAT: ChatLine[] = [
  { who: "meera", seed: "OSLO-3", text: "dropping the link here" },
  { who: "kai", seed: "Afterclap-2", text: "who's up next?" },
]

function ChatPeek({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState(CHAT)
  const [draft, setDraft] = useState("")

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setLines((l) => [...l, { who: "you", seed: "OSLO-1", text, me: true }])
    setDraft("")
  }

  return (
    <div
      className={cn(
        "relative mt-2 shrink-0 self-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] @[40rem]:mt-auto @[40rem]:h-[280px] @[40rem]:w-[280px] @[40rem]:self-end @[48rem]:h-[320px] @[48rem]:w-[320px] @[80rem]:h-[380px] @[80rem]:w-[380px]",
        open ? "h-[260px] w-[260px]" : "h-[40px] w-[220px]",
        className
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
          {lines.at(-1)?.text}
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
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <div className="relative flex-1 overflow-hidden">
            <MessageScroller className="size-full overflow-hidden">
              <MessageScrollerViewport className="relative p-3 @[40rem]:p-4">
                <MessageScrollerContent className="flex flex-col gap-1">
                  {lines.map((l, i) => {
                    const isFirst = lines[i - 1]?.who !== l.who
                    const isLast = lines[i + 1]?.who !== l.who
                    return (
                      <MessageScrollerItem
                        key={i}
                        messageId={String(i)}
                        scrollAnchor={l.me && isLast}
                        className={cn(isFirst && i > 0 && "mt-3")}
                      >
                        <Message align={l.me ? "end" : "start"}>
                          <MessageAvatar>
                            {isLast ? (
                              <Avatar className="size-7 @[40rem]:size-8">
                                <AvatarImage
                                  src={userpicUrl(l.seed)}
                                  alt={l.who}
                                  className="object-cover"
                                />
                                <AvatarFallback className="text-xs font-bold">
                                  {l.who.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ) : null}
                          </MessageAvatar>
                          <MessageContent>
                            {isFirst && (
                              <MessageHeader>
                                <span className="text-[11px] font-bold text-muted-foreground @[40rem]:text-xs">
                                  {l.me ? "You" : l.who}
                                </span>
                              </MessageHeader>
                            )}
                            <Bubble variant={l.me ? "default" : "muted"}>
                              <BubbleContent className="text-xs @[40rem]:text-sm">
                                {l.text}
                              </BubbleContent>
                            </Bubble>
                            {isLast && (
                              <MessageFooter>
                                <span className="text-[11px] text-muted-foreground">
                                  09:41
                                </span>
                              </MessageFooter>
                            )}
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )
                  })}
                </MessageScrollerContent>
              </MessageScrollerViewport>
            </MessageScroller>
          </div>
        </MessageScrollerProvider>
        <form
          onSubmit={send}
          className="flex items-center gap-2 border-t border-border p-3 @[40rem]:p-4"
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            aria-label="Message (preview)"
            maxLength={200}
            className="h-10 flex-1 rounded-xl border-border bg-muted/50 px-4 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-primary/50 @[40rem]:text-sm"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Send message"
            disabled={!draft.trim()}
            className="size-10 shrink-0 rounded-xl shadow-none"
          >
            <RiSendPlane2Fill className="size-4" />
          </Button>
        </form>
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

// Apple's product bezels (developer.apple.com/design/resources), downscaled
// to WebP. `screen` is the transparent display cutout in the source PNG's
// pixels, from which the bezel art was measured: the live screen sits under
// the image, which masks its corners, notch and Dynamic Island.
type BezelArt = {
  src: string
  size: [number, number]
  screen: [x: number, y: number, w: number, h: number]
  points: [number, number]
}

// MacBook Pro 14" M5: 3024×1964 panel, 1512×982 points.
const MACBOOK_PRO: BezelArt = {
  src: "/devices/macbook-pro-m5.webp",
  size: [3860, 2540],
  screen: [418, 288, 3024, 1964],
  points: [1512, 982],
}
// iPhone 18 Pro: 1206×2622 at 3x, 402×874 points.
const IPHONE_18_PRO: BezelArt = {
  src: "/devices/iphone-18-pro.webp",
  size: [1350, 2760],
  screen: [72, 69, 1206, 2622],
  points: [402, 874],
}

function Bezel({
  art,
  children,
}: {
  art: BezelArt
  children: React.ReactNode
}) {
  const [w, h] = art.size
  const [x, y, sw, sh] = art.screen
  return (
    <div className="relative w-full" style={{ aspectRatio: `${w} / ${h}` }}>
      <div
        className="absolute overflow-hidden bg-background"
        style={{
          left: `${(x / w) * 100}%`,
          top: `${(y / h) * 100}%`,
          width: `${(sw / w) * 100}%`,
          height: `${(sh / h) * 100}%`,
        }}
      >
        <Screen width={art.points[0]} height={art.points[1]}>
          {children}
        </Screen>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={art.src}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className="pointer-events-none absolute inset-0 size-full drop-shadow-2xl select-none"
      />
    </div>
  )
}

function MacBook({ live }: { live: Live | null }) {
  return (
    <Bezel art={MACBOOK_PRO}>
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
    </Bezel>
  )
}

// iOS status bar glyphs, drawn at their size in points: cellular, Wi-Fi and
// battery, in the text colour.
function StatusIcons({ className }: { className?: string }) {
  return (
    <span
      className={cn("flex items-center gap-[7px] text-foreground", className)}
    >
      <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor">
        <rect x="0" y="7.5" width="3.2" height="4.5" rx="1" />
        <rect x="5" y="5" width="3.2" height="7" rx="1" />
        <rect x="10" y="2.5" width="3.2" height="9.5" rx="1" />
        <rect x="15" y="0" width="3.2" height="12" rx="1" />
      </svg>
      <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
        <path d="M8.5 2.3c2.3 0 4.4.9 6 2.4.1.1.3.1.4 0l1.2-1.2c.1-.1.1-.3 0-.4A10.6 10.6 0 0 0 8.5 0 10.6 10.6 0 0 0 .9 3.1c-.1.1-.1.3 0 .4l1.2 1.2c.1.1.3.1.4 0a8.6 8.6 0 0 1 6-2.4Z" />
        <path d="M8.5 6c1.3 0 2.5.5 3.4 1.3.1.1.3.1.4 0l1.2-1.2c.1-.1.1-.3 0-.4a7 7 0 0 0-10 0c-.1.1-.1.3 0 .4l1.2 1.2c.1.1.3.1.4 0C6 6.5 7.2 6 8.5 6Z" />
        <path d="m10.8 9.1-2.1 2.2a.3.3 0 0 1-.4 0L6.2 9.1c-.1-.1-.1-.3 0-.4a3.3 3.3 0 0 1 4.6 0c.1.1.1.3 0 .4Z" />
      </svg>
      <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
        <rect
          x="0.5"
          y="0.5"
          width="23"
          height="12"
          rx="3.8"
          stroke="currentColor"
          strokeOpacity="0.35"
        />
        <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
        <path
          d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z"
          fill="currentColor"
          fillOpacity="0.4"
        />
      </svg>
    </span>
  )
}

// Safari's chrome, drawn after Apple's current Safari (iOS and iPadOS 26 and
// later): glass controls on the page, the address in a pill.
const SAFARI_ADDRESS = "space.whoavidwivedi.work"
const GLASS =
  "border border-foreground/10 bg-foreground/[0.07] text-foreground shadow-sm backdrop-blur-xl"

// Safari's compact bar: back, the address, and more.
function SafariBottomBar() {
  return (
    <div
      aria-hidden="true"
      className="flex h-[68px] shrink-0 items-center gap-2.5 bg-background px-4 pb-1.5"
    >
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          GLASS
        )}
      >
        <ChevronLeft className="size-[22px]" />
      </span>
      <span
        className={cn(
          "flex h-12 min-w-0 flex-1 items-center justify-center rounded-full px-4 text-[15px] font-medium",
          GLASS
        )}
      >
        <span className="truncate">{SAFARI_ADDRESS}</span>
      </span>
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          GLASS
        )}
      >
        <Ellipsis className="size-[22px]" />
      </span>
    </div>
  )
}

// How the Duo's screens lay out, after Apple's iOS 27 Duo template: no top
// status bar; a strip down the right edge holds the time at its top (under the
// camera on the cover) and the room's docked controls, and the room fills the
// full height beside it. Strip widths are in points: the cover's is centred on
// its camera (x ≈ 411, y 30–66pt).
const DUO_RAIL = {
  cover: { rail: 94, status: "top-[74px]" },
  inner: { rail: 79, status: "top-[14px]" },
}

// A phone's screen. The iPhone 18 Pro's: an iOS status bar beside the Dynamic
// Island, then the room. The Duo's: the room beside its status strip.
// Cutouts (Dynamic Island, the Duo cover's camera) come from the bezel art.
function PhoneScreen({
  live,
  split,
  still,
  duo,
}: {
  live: Live | null
  split?: boolean
  still?: boolean
  duo?: keyof typeof DUO_RAIL
}) {
  if (duo) {
    const { rail, status } = DUO_RAIL[duo]
    // Better Space open in Safari: the room, then the compact bar at the foot.
    return (
      <div className="relative flex size-full flex-col bg-background">
        <div className="min-h-0 flex-1">
          <RoomPreview
            live={live}
            dock
            split={split}
            still={still}
            rail={rail}
          />
        </div>
        <SafariBottomBar />
        <div
          aria-hidden="true"
          className={cn(
            "absolute right-0 flex flex-col items-center text-foreground",
            status
          )}
          style={{ width: rail }}
        >
          <span className="text-[15px] leading-none font-semibold tracking-tight">
            9:41
          </span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex size-full flex-col bg-background">
      <div aria-hidden="true" className="relative h-[54px] shrink-0">
        <span className="absolute top-[29px] left-[52px] -translate-y-1/2 text-[17px] leading-none font-semibold tracking-tight text-foreground">
          9:41
        </span>
        <StatusIcons className="absolute top-[29px] right-[32px] -translate-y-1/2" />
      </div>
      <div className="min-h-0 flex-1">
        <RoomPreview live={live} still={still} />
      </div>
    </div>
  )
}

// The iPhone Duo, in the pixels of Apple's bezels (both at one scale), folding
// as chanhdai's Foldable does (components/foldable.tsx): its screens stay flat
// and blur, dim and fade as the cover turns, while Apple's frames turn in 3D
// as the fold's body. A page of the fold is the screen area beside the hinge:
// from the hinge to the cover screen's far edge, as tall as the cover screen,
// its top at the open bezel's y 107. The closed bezel lies spine on the hinge,
// eased 1.7% narrower so its body spans one half of the open bezel.
const DUO_FIT = 3093 / 2 / 1574
const DUO_PAGE = { w: (88 + 1398) * DUO_FIT, h: 2034, top: 107 }
const DUO_OPEN = {
  src: "/devices/iphone-duo-open.webp",
  w: 3093,
  h: 2247,
  hinge: 3093 / 2,
}
const DUO_CLOSED = {
  src: "/devices/iphone-duo-closed.webp",
  w: 1574 * DUO_FIT,
  h: 2194,
  top: 58 - 31,
}
// Screens on the page in Apple's pixels: the cover's, and the inner one,
// which spans the spread (its left edge measured from the hinge).
const DUO_COVER_SCREEN = { x: 88 * DUO_FIT, y: 0, w: 1398 * DUO_FIT, h: 2034 }
const DUO_INNER_SCREEN = {
  x: 120 - DUO_OPEN.hinge,
  y: 120 - DUO_PAGE.top,
  w: 2853,
  h: 2007,
}
// Points are the screens' pixels at 3x, so the room fills each one exactly.
const DUO_COVER_POINTS = [DUO_COVER_SCREEN.w / 3, DUO_COVER_SCREEN.h / 3]
const DUO_INNER_POINTS = [DUO_INNER_SCREEN.w / 3, DUO_INNER_SCREEN.h / 3]
// Screen corners in page widths, a touch rounder than Apple's openings, so at
// a corner the frame's black rim shows rather than the screen's edge.
const r = (n: number) => `calc(var(--foldable-w) * ${n})`
const DUO_COVER_RADIUS = `${r(0.054)} ${r(0.126)} ${r(0.126)} ${r(0.054)}`
const DUO_INNER_RADIUS = r(0.106)

// A box in Apple's pixels, placed on the page in percent.
function onPage(x: number, y: number, w: number, h: number) {
  return {
    left: `${(x / DUO_PAGE.w) * 100}%`,
    top: `${(y / DUO_PAGE.h) * 100}%`,
    width: `${(w / DUO_PAGE.w) * 100}%`,
    height: `${(h / DUO_PAGE.h) * 100}%`,
  }
}

function DuoFrame({ src, style }: { src: string; style: React.CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      decoding="async"
      className="absolute max-w-none select-none"
      style={style}
    />
  )
}

// The cover screen, on the cover's page (flat; the fold blurs it as it turns).
function DuoCoverScreen({ live }: { live: Live | null }) {
  const s = DUO_COVER_SCREEN
  return (
    <div
      className="absolute overflow-hidden"
      style={{ ...onPage(s.x, s.y, s.w, s.h), borderRadius: DUO_COVER_RADIUS }}
    >
      <Screen width={DUO_COVER_POINTS[0]} height={DUO_COVER_POINTS[1]}>
        <PhoneScreen live={live} still duo="cover" />
        {/* The camera, from the closed bezel: drawn over the screen, which
            lies over the frame. Centre (411, 48), 36 across, in points. */}
        <span
          aria-hidden="true"
          className="absolute top-[30px] left-[393px] size-9 rounded-full bg-black ring-2 ring-neutral-800"
        />
      </Screen>
    </div>
  )
}

// One page's window onto the inner screen, which spans the spread. The left
// page lies left of the hinge, so its x runs a page further.
function DuoInnerScreen({
  side,
  live,
}: {
  side: "left" | "right"
  live: Live | null
}) {
  const s = DUO_INNER_SCREEN
  const x = s.x + (side === "left" ? DUO_PAGE.w : 0)
  return (
    <div
      className="absolute overflow-hidden"
      style={{ ...onPage(x, s.y, s.w, s.h), borderRadius: DUO_INNER_RADIUS }}
    >
      <Screen width={DUO_INNER_POINTS[0]} height={DUO_INNER_POINTS[1]}>
        <PhoneScreen live={live} split still duo="inner" />
      </Screen>
    </div>
  )
}

// Black behind a screen's opening, so wherever the flat screen does not
// reach (the wedges as the cover rises) the phone reads as an unlit display.
function DuoBlack({
  x,
  y,
  w,
  h,
  radius,
}: {
  x: number
  y: number
  w: number
  h: number
  radius: string
}) {
  return (
    <div
      className="absolute bg-black"
      style={{ ...onPage(x, y, w, h), borderRadius: radius }}
    />
  )
}

// The fold's body, Apple's frames: the closed bezel on the cover's front, the
// open bezel's left half on its back, and its right half flat beneath. Each is
// cut at the hinge so a half never shows past it.
function DuoFront() {
  const s = DUO_COVER_SCREEN
  return (
    <>
      <DuoBlack {...s} radius={DUO_COVER_RADIUS} />
      <DuoFrame
        src={DUO_CLOSED.src}
        style={onPage(
          0,
          DUO_CLOSED.top - DUO_PAGE.top,
          DUO_CLOSED.w,
          DUO_CLOSED.h
        )}
      />
    </>
  )
}

function DuoOpenHalf({ side }: { side: "left" | "right" }) {
  const s = DUO_INNER_SCREEN
  const shift = side === "left" ? DUO_PAGE.w : 0
  return (
    <div
      className="absolute inset-0"
      style={{
        clipPath:
          side === "left"
            ? "inset(-50% 0 -50% -50%)"
            : "inset(-50% -50% -50% 0)",
      }}
    >
      <DuoBlack {...s} x={s.x + shift} radius={DUO_INNER_RADIUS} />
      <DuoFrame
        src={DUO_OPEN.src}
        style={onPage(
          shift - DUO_OPEN.hinge,
          -DUO_PAGE.top,
          DUO_OPEN.w,
          DUO_OPEN.h
        )}
      />
    </div>
  )
}

// The iPhone Duo in Apple's frame. Drag, flick or tap it, or use the slider.
// The page's own surface and edge line are see-through: Apple's frame is the
// edge. Size it with --foldable-w, one page's width.
function Duo({ live, className }: { live: Live | null; className?: string }) {
  return (
    <Foldable
      className={cn(
        "[--foldable-h:calc(var(--foldable-w)*2034/1460)] [--foldable-line:transparent] [--foldable-radius:calc(var(--foldable-w)*0.126)] [--foldable-surface:transparent] supports-[height:round(1px,1px)]:[--foldable-h:round(var(--foldable-w)*2034/1460,1px)]",
        className
      )}
    >
      <FoldableStage
        front={<DuoFront />}
        back={<DuoOpenHalf side="left" />}
        under={<DuoOpenHalf side="right" />}
      >
        <FoldableInsideRight>
          <DuoInnerScreen side="right" live={live} />
        </FoldableInsideRight>
        <FoldableCover>
          <DuoCoverScreen live={live} />
        </FoldableCover>
        <FoldableInsideLeft>
          <DuoInnerScreen side="left" live={live} />
        </FoldableInsideLeft>
      </FoldableStage>
      <FoldableSlider label="Drag, tap or slide to unfold the iPhone Duo." />
    </Foldable>
  )
}

// The iPhone Duo's own spot: what changed, beside the phone to fold. Its
// column is as wide as the open phone, so unfolding never covers the copy.
function DuoSection({ live }: { live: Live | null }) {
  return (
    <section
      aria-labelledby="duo-heading"
      className="mt-16 grid items-center gap-10 border-t border-border/70 pt-14 text-left sm:mt-24 sm:pt-20 md:grid-cols-[1fr_46cqw] md:gap-12"
    >
      <div className="text-center md:text-left">
        <p className={cn(PILL, "mb-4")}>
          <PillTag>New</PillTag>
          iPhone Duo
        </p>
        <h2
          id="duo-heading"
          className="font-display text-3xl leading-tight text-foreground sm:text-4xl"
        >
          Better Space now supports iPhone Duo.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:mx-0">
          Controls by your thumb on the cover screen. Unfold it for the space on
          the left and chat on the right.
        </p>
      </div>
      <Duo
        live={live}
        className="[--foldable-w:min(9.9rem,calc(50cqw-1rem))] md:[--foldable-w:21.7cqw]"
      />
    </section>
  )
}

// The same room on a MacBook Pro and an iPhone 18 Pro at true relative scale
// (the iPhone is 22.9% of the Mac's width), then the iPhone Duo's section.
// Phones skip the Mac, which would be too small to read.
function Devices({ live }: { live: Live | null }) {
  return (
    <div className="@container mx-auto mt-14 max-w-5xl sm:mt-20">
      <div className="relative hidden md:block">
        <div className="w-[88%]">
          <MacBook live={live} />
        </div>
        <div className="absolute right-0 -bottom-4 z-20 w-[20.2%]">
          <Bezel art={IPHONE_18_PRO}>
            <PhoneScreen live={live} />
          </Bezel>
        </div>
      </div>
      <DuoSection live={live} />
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
