"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Headphones,
  HeadphoneOff,
  Keyboard,
  Mic,
  MicOff,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShieldOff,
  Shuffle,
  UserCheck,
  Volume2,
} from "lucide-react"
import { DotGrid } from "@/components/landing/dot-grid"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"
import { RiSendPlane2Fill } from "@remixicon/react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toSlug } from "@/lib/presets"
import { randomUserpic, userpicUrl } from "@/lib/userpics"
import { cn } from "@/lib/utils"

// Each card is a working copy of a real feature, built from the same
// components the join screen, room and ended screen use. Nothing here touches
// a real room: state is local, except Go live, which opens a real one.

function Face({ seed, className }: { seed: string; className: string }) {
  return (
    <Avatar className={className}>
      <AvatarImage src={userpicUrl(seed)} alt="" className="object-cover" />
      <AvatarFallback />
    </Avatar>
  )
}

function PanelTitle({
  icon,
  children,
}: {
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
      {icon}
      {children}
    </p>
  )
}

// Join screen: persona and name. Go live opens a real room.
function JoinIdentity() {
  const router = useRouter()
  const [seed, setSeed] = useState("Funny Bunny-1")
  const [name, setName] = useState("maya")
  const slug = toSlug(name)

  return (
    <form
      className="w-full max-w-xs space-y-4 rounded-2xl border border-border bg-card p-5 text-left shadow-xl"
      onSubmit={(e) => {
        e.preventDefault()
        if (slug) router.push(`/lobby?space=${encodeURIComponent(slug)}`)
      }}
    >
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Persona</p>
        <div className="flex items-center gap-3">
          <Face
            key={seed}
            seed={seed}
            className="size-14 animate-in border-2 border-border bg-muted duration-200 zoom-in-90 fade-in"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setSeed(randomUserpic())}
          >
            <Shuffle data-icon="inline-start" />
            Shuffle
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <label
          htmlFor="pillar-name"
          className="text-xs font-medium text-muted-foreground"
        >
          Your name
        </label>
        <Input
          id="pillar-name"
          value={name}
          maxLength={24}
          onChange={(e) => setName(e.target.value)}
          className="h-10 bg-background text-sm"
        />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={!slug}>
        <Mic data-icon="inline-start" />
        Go live
      </Button>
    </form>
  )
}

const MICS = [
  { value: "default", label: "Default microphone" },
  { value: "studio", label: "Studio USB mic" },
  { value: "airpods", label: "AirPods Pro" },
]
const SPEAKERS = [
  { value: "default", label: "Default speaker" },
  { value: "airpods", label: "AirPods Pro" },
]

// Same three-note chime the room's Test button plays.
function playChime() {
  try {
    const ctx = new AudioContext()
    ;[523.25, 659.25, 783.99].forEach((freq, i) => {
      const at = ctx.currentTime + i * 0.15
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.setValueAtTime(freq, at)
      gain.gain.setValueAtTime(0.12, at)
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.3)
      osc.connect(gain).connect(ctx.destination)
      osc.start(at)
      osc.stop(at + 0.3)
    })
    setTimeout(() => ctx.close().catch(() => {}), 900)
  } catch {}
}

function DeviceSelect({
  id,
  items,
}: {
  id: string
  items: { value: string; label: string }[]
}) {
  return (
    <Select defaultValue="default" items={items}>
      <SelectTrigger id={id} className="h-8 w-full rounded-lg text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value} className="text-xs">
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Room: audio settings popover.
function AudioRouting() {
  const [noiseFilter, setNoiseFilter] = useState(true)

  return (
    <div className="w-full max-w-[20rem] space-y-3 rounded-2xl border border-border bg-card p-4 text-left shadow-xl">
      <div>
        <PanelTitle icon={<Settings className="size-4" aria-hidden="true" />}>
          Audio settings
        </PanelTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Configure microphone input and speaker output.
        </p>
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="pillar-mic"
          className="flex items-center gap-1.5 text-xs font-medium"
        >
          <Mic className="size-3.5 text-muted-foreground" aria-hidden="true" />
          Microphone
        </label>
        <DeviceSelect id="pillar-mic" items={MICS} />
        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
          <span>Input level</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="pillar-level h-full w-full rounded-full bg-foreground" />
        </div>
      </div>
      <div className="space-y-1.5 border-t border-border/60 pt-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="pillar-speaker"
            className="flex items-center gap-1.5 text-xs font-medium"
          >
            <Headphones
              className="size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
            Speaker / headphones
          </label>
          <Button variant="outline" size="xs" onClick={playChime}>
            <Volume2 data-icon="inline-start" />
            Test
          </Button>
        </div>
        <DeviceSelect id="pillar-speaker" items={SPEAKERS} />
      </div>
      <button
        type="button"
        aria-pressed={noiseFilter}
        onClick={() => setNoiseFilter((on) => !on)}
        className="flex w-full items-center gap-2 rounded-lg bg-muted/60 px-2.5 py-2 text-left text-[11px] text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {noiseFilter ? (
          <ShieldCheck
            className="size-3.5 shrink-0 text-foreground"
            aria-hidden="true"
          />
        ) : (
          <ShieldOff className="size-3.5 shrink-0" aria-hidden="true" />
        )}
        Noise suppression {noiseFilter ? "active" : "off"}
      </button>
    </div>
  )
}

type Speaker = "speaking" | "muted" | "listener" | "removed"

// Room: tap a speaker to open the host's menu. Each action really applies.
function HostMenu() {
  const [state, setState] = useState<Speaker>("speaking")
  const [coHost, setCoHost] = useState(false)

  if (state === "removed") {
    return (
      <div className="flex w-full max-w-56 flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-xl">
        <p className="text-sm text-muted-foreground">jo was removed.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setState("speaking")}
        >
          <RotateCcw data-icon="inline-start" />
          Undo
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-56 flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-xl">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open host menu for jo"
          className="relative rounded-full transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Face
            seed="Upstream-2"
            className={cn(
              "size-16 border bg-card",
              state === "speaking"
                ? "border-emerald-500 ring-4 ring-emerald-500/20"
                : "border-border"
            )}
          />
          <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border border-border bg-card">
            {state === "speaking" ? (
              <Mic className="size-3.5" aria-hidden="true" />
            ) : (
              <MicOff
                className="size-3.5 text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          side="bottom"
          className="min-w-44 rounded-2xl"
        >
          {state === "listener" ? (
            <DropdownMenuItem onClick={() => setState("speaking")}>
              Grant mic
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem
                disabled={state === "muted"}
                onClick={() => setState("muted")}
              >
                Mute speaker
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setState("listener")}
                className="text-amber-600 focus:text-amber-600"
              >
                Revoke mic
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setState("removed")}
          >
            Remove from space
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCoHost((c) => !c)}>
            {coHost ? "Remove co-host" : "Make co-host"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center gap-1.5 text-sm">
        <span className="font-medium text-foreground">jo</span>
        {coHost && <Badge variant="secondary">Co-host</Badge>}
        <span className="text-muted-foreground">
          {state === "speaking"
            ? "speaking"
            : state === "muted"
              ? "muted"
              : "listening"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">Tap jo to moderate</p>
    </div>
  )
}

const REQUESTS = [
  { name: "kai", seed: "Upstream-3" },
  { name: "meera", seed: "OSLO-3" },
  { name: "sam", seed: "Guacamole-2" },
]

// Room: the host's mic requests popover. Grant and Decline work the queue.
function MicRequests() {
  const [queue, setQueue] = useState(REQUESTS)
  const [onMic, setOnMic] = useState<string[]>([])
  const next = queue[0]

  const resolve = (grant: boolean) => {
    if (grant) setOnMic((m) => [...m, next.name])
    setQueue((q) => q.slice(1))
  }

  return (
    <div className="w-full max-w-[20rem] overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <PanelTitle>Mic requests</PanelTitle>
        <Badge variant="secondary">{queue.length} pending</Badge>
      </div>
      <div className="p-2" aria-live="polite">
        {next ? (
          <div
            key={next.name}
            className="flex animate-in items-center justify-between gap-2 rounded-xl bg-muted/50 p-2 duration-200 fade-in slide-in-from-bottom-1"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <Face seed={next.seed} className="size-8 border border-border" />
              <span className="truncate text-sm font-medium text-foreground">
                {next.name}
              </span>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => resolve(false)}
              >
                Decline
              </Button>
              <Button size="sm" onClick={() => resolve(true)}>
                Grant mic
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 p-2">
            <span className="text-sm text-muted-foreground">
              No pending requests
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQueue(REQUESTS)
                setOnMic([])
              }}
            >
              <RotateCcw data-icon="inline-start" />
              Reset
            </Button>
          </div>
        )}
        {onMic.length > 0 && (
          <p className="px-2 pt-2 pb-1 text-xs text-muted-foreground">
            On the mic: {onMic.join(", ")}
          </p>
        )}
      </div>
    </div>
  )
}

type ChatLine = { id: number; mine: boolean; text: string; time: string }

const REPLIES = ["ha, same", "100%", "say more?", "good point", "👏👏"]
const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

// The room's chat panel, same markup and styling as components/chat-panel.tsx:
// grouped bubbles, avatar on the last message, time underneath, typing line.
// Send something and meera answers. Reactions float up from the tray.
function ChatAndReactions() {
  const [lines, setLines] = useState<ChatLine[]>([
    { id: 0, mine: false, text: "dropping the link here", time: "9:41" },
    { id: 1, mine: false, text: "who's up next?", time: "9:41" },
    { id: 2, mine: true, text: "joining now", time: "9:42" },
  ])
  const [draft, setDraft] = useState("")
  const [typing, setTyping] = useState(false)
  const [burst, setBurst] = useState<{ id: number; emoji: string }[]>([])
  const nextId = useRef(3)
  const list = useRef<HTMLDivElement>(null)

  useEffect(() => {
    list.current?.scrollTo({
      top: list.current.scrollHeight,
      behavior: "smooth",
    })
  }, [lines, typing])

  const add = (mine: boolean, text: string) =>
    setLines((l) =>
      [...l, { id: nextId.current++, mine, text, time: now() }].slice(-8)
    )

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    add(true, text)
    setDraft("")
    setTimeout(() => setTyping(true), 400)
    setTimeout(() => {
      setTyping(false)
      add(false, REPLIES[Math.floor(Math.random() * REPLIES.length)])
    }, 1800)
  }

  const react = (emoji: string) => {
    const id = nextId.current++
    setBurst((b) => [...b, { id, emoji }])
    setTimeout(() => setBurst((b) => b.filter((x) => x.id !== id)), 1200)
  }

  // Consecutive messages from the same side form one group.
  const groups: ChatLine[][] = []
  for (const line of lines) {
    const last = groups.at(-1)
    if (last && last[0].mine === line.mine) last.push(line)
    else groups.push([line])
  }

  return (
    <div className="relative w-full max-w-[20rem] space-y-3 text-left">
      <div className="flex h-80 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-card to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-card to-transparent" />
          <div
            ref={list}
            aria-live="polite"
            className="flex size-full flex-col gap-4 overflow-y-auto p-3"
          >
            {groups.map((group) => (
              <MessageGroup key={group[0].id} className="flex flex-col gap-1">
                {group.map((line, i) => {
                  const isLast = i === group.length - 1
                  return (
                    <Message
                      key={line.id}
                      align={line.mine ? "end" : "start"}
                      className="w-full animate-in duration-200 fade-in slide-in-from-bottom-1"
                    >
                      <MessageAvatar>
                        {isLast ? (
                          <Face
                            seed={line.mine ? "Funny Bunny-1" : "OSLO-3"}
                            className="size-7"
                          />
                        ) : null}
                      </MessageAvatar>
                      <MessageContent>
                        {i === 0 && (
                          <MessageHeader>
                            <span className="text-[11px] font-bold text-muted-foreground">
                              {line.mine ? "You" : "meera"}
                            </span>
                          </MessageHeader>
                        )}
                        <Bubble variant={line.mine ? "default" : "muted"}>
                          <BubbleContent className="text-xs break-words">
                            {line.text}
                          </BubbleContent>
                        </Bubble>
                        {isLast && (
                          <MessageFooter>
                            <span className="text-[11px] text-muted-foreground">
                              {line.time}
                            </span>
                          </MessageFooter>
                        )}
                      </MessageContent>
                    </Message>
                  )
                })}
              </MessageGroup>
            ))}
            {typing && (
              <div className="flex animate-in items-center gap-1.5 px-2 py-1 text-[11px] text-muted-foreground fade-in slide-in-from-bottom-2">
                <span className="font-medium">meera is typing</span>
                <span className="flex items-center gap-0.5" aria-hidden="true">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="size-1 animate-bounce rounded-full bg-muted-foreground/60 motion-reduce:animate-none"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>
        <form
          onSubmit={send}
          className="flex items-center gap-2 border-t border-border p-3"
        >
          <label htmlFor="pillar-chat" className="sr-only">
            Message
          </label>
          <Input
            id="pillar-chat"
            value={draft}
            maxLength={80}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
            className="h-10 flex-1 rounded-xl border-border bg-muted/50 px-4 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-primary/50"
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
      <div className="relative flex flex-wrap items-center justify-center gap-0.5 rounded-2xl border border-border bg-card p-1.5">
        {["👏", "🔥", "❤️", "😂", "🎉", "👍", "🚀", "💯"].map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="icon-sm"
            className="text-lg"
            aria-label={`React ${emoji}`}
            onClick={() => react(emoji)}
          >
            {emoji}
          </Button>
        ))}
        {burst.map((b) => (
          <span
            key={b.id}
            aria-hidden="true"
            className="pillar-float pointer-events-none absolute bottom-full left-1/2 text-2xl"
          >
            {b.emoji}
          </span>
        ))}
      </div>
    </div>
  )
}

// Room (host-left banner), then the ended screen once the clock runs out.
// End space closes it at once, as in the room; Leave shows the countdown
// everyone gets when the host drops.
function Ended() {
  const [seconds, setSeconds] = useState<number | null>(null)

  useEffect(() => {
    if (!seconds) return
    const id = setTimeout(() => setSeconds((s) => (s ? s - 1 : s)), 1000)
    return () => clearTimeout(id)
  }, [seconds])

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      {seconds === null ? (
        <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2.5">
            <Face
              seed="OSLO-1"
              className="size-9 border-2 border-emerald-500 bg-muted"
            />
            <span className="text-sm text-foreground">
              avi <span className="text-muted-foreground">is hosting</span>
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSeconds(10)}>
              Leave
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setSeconds(0)}
            >
              End space
            </Button>
          </div>
        </div>
      ) : seconds > 0 ? (
        <div
          role="status"
          className="w-full animate-in rounded-2xl border border-destructive/30 bg-card p-4 text-left duration-300 fade-in slide-in-from-bottom-1"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertCircle className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                Host disconnected
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                The space ends in
              </p>
            </div>
            <span className="font-display text-2xl text-destructive tabular-nums">
              {seconds}s
            </span>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-destructive/15">
            <div
              className="h-full rounded-full bg-destructive transition-[width] duration-1000 ease-linear"
              style={{ width: `${(seconds / 10) * 100}%` }}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setSeconds(0)}>
              Skip ahead
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full animate-in rounded-2xl border border-border bg-card p-5 text-left duration-300 zoom-in-95 fade-in">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted">
              <MicOff
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg text-foreground">
                This space has ended
              </p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">
                /space/design-systems-motion-craft
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserCheck
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Face
                seed="OSLO-1"
                className="size-8 border border-border bg-muted"
              />
              <span className="text-sm text-foreground">
                avi <span className="text-muted-foreground">hosted</span>
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                aria-label="Replay"
                onClick={() => setSeconds(null)}
              >
                <RotateCcw />
              </Button>
              <Link href="/lobby" className={buttonVariants({ size: "sm" })}>
                Browse live spaces
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Room header: keyboard shortcuts. Focus the panel and press them for real.
function Shortcuts() {
  const [muted, setMuted] = useState(false)
  const [deafened, setDeafened] = useState(false)

  const onKey = (e: React.KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey)) return
    const key = e.key.toLowerCase()
    if (key === "d") setMuted((m) => !m)
    else if (key === "e") setDeafened((d) => !d)
    else return
    e.preventDefault()
  }

  const rows = [
    {
      action: "Toggle mute",
      key: "D",
      on: muted,
      toggle: () => setMuted((m) => !m),
    },
    {
      action: "Toggle deafen",
      key: "E",
      on: deafened,
      toggle: () => setDeafened((d) => !d),
    },
  ]

  return (
    <div
      tabIndex={0}
      onKeyDown={onKey}
      aria-label="Keyboard shortcuts. Press Command or Control with D or E."
      className="w-full max-w-64 space-y-3 rounded-2xl border border-border bg-card p-4 text-left shadow-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <PanelTitle icon={<Keyboard className="size-4" aria-hidden="true" />}>
        Keyboard shortcuts
      </PanelTitle>
      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        {rows.map((row) => (
          <button
            key={row.action}
            type="button"
            aria-pressed={row.on}
            onClick={row.toggle}
            className="-mx-2 flex items-center justify-between rounded-lg px-2 py-1 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <span>{row.action}</span>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>{row.key}</Kbd>
            </KbdGroup>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-border/60 pt-3">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full border transition-colors",
            muted
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-border"
          )}
        >
          {muted ? (
            <MicOff className="size-4" aria-hidden="true" />
          ) : (
            <Mic className="size-4" aria-hidden="true" />
          )}
        </span>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full border transition-colors",
            deafened
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-border"
          )}
        >
          {deafened ? (
            <HeadphoneOff className="size-4" aria-hidden="true" />
          ) : (
            <Headphones className="size-4" aria-hidden="true" />
          )}
        </span>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {muted ? "Muted" : "Live"}
          {deafened ? " · deafened" : ""}
        </span>
      </div>
    </div>
  )
}

const FEATURES = [
  {
    title: "Just a name and a face.",
    description:
      "No account, no password, no email. Pick one of 95 hand-drawn personas, type what people should call you, and go live.",
    visual: <JoinIdentity />,
    span: "lg:col-span-3",
  },
  {
    title: "Studio-clean sound.",
    description:
      "Krisp noise filtering, echo cancellation and auto gain on every mic. Switch mics and speakers live, and test before you talk.",
    visual: <AudioRouting />,
    span: "lg:col-span-3",
  },
  {
    title: "The host runs the room.",
    description:
      "Tap a speaker to mute them, take the mic back, make them co-host, or remove them.",
    visual: <HostMenu />,
    span: "lg:col-span-2",
  },
  {
    title: "Raise your hand.",
    description:
      "Listeners ask for the mic. The host sees the request and grants it in one tap.",
    visual: <MicRequests />,
    span: "lg:col-span-2",
  },
  {
    title: "Chat and react.",
    description:
      "Live chat with typing indicators, and quick reactions that pop up on the speaker.",
    visual: <ChatAndReactions />,
    span: "lg:col-span-2",
  },
  {
    title: "Gone when you go.",
    description:
      "Rooms are never recorded. The host can end the space, and if they drop, everyone gets 60 seconds. Afterwards only who hosted remains.",
    visual: <Ended />,
    span: "lg:col-span-4",
  },
  {
    title: "Hands on the keyboard.",
    description: "Mute and deafen without reaching for the mouse.",
    visual: <Shortcuts />,
    span: "sm:col-span-2 lg:col-span-2",
  },
]

export function ProductPillars() {
  return (
    <section
      id="technology"
      className="relative w-full border-b border-border/80 bg-background py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Architecture &amp; principles
          </span>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Engineered for pure, immediate voice.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Everything a conversation needs, and nothing it doesn&rsquo;t.
          </p>
        </div>

        {/* One frame, hairline dividers between cells (gap-px over a border-coloured
            backdrop), copy first and the real UI underneath on a fading dot grid. */}
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-6">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className={`flex flex-col bg-card ${f.span}`}
            >
              <div className="p-6 pb-2 sm:p-8 sm:pb-2">
                <h3 className="font-display text-lg text-foreground">
                  {f.title}
                </h3>
                <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
              <div className="relative flex min-h-60 flex-1 items-center justify-center overflow-hidden p-6 sm:p-8">
                <DotGrid />
                <div className="relative flex w-full justify-center">
                  {f.visual}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
