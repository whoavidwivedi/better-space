/* eslint-disable @next/next/no-img-element */
"use client"

import {
  Mic as RiMicLine,
  Plus as RiAddLine,
  Search as RiSearchLine,
  Shuffle as RiShuffleLine,
  SquarePen as RiEditLine,
} from "lucide-react"
import React, { useState, useEffect } from "react"

import dynamic from "next/dynamic"
import { CharacterPicker } from "@/components/common/character-picker"
import { Navbar } from "@/components/common/navbar"
import {
  RoomCard,
  RoomCardSkeleton,
  TemplateCard,
  type LiveRoom,
} from "@/components/room-card"

const SpaceRoomLiveKit = dynamic(
  () => import("@/components/livekit-room").then((m) => m.SpaceRoomLiveKit),
  {
    loading: () => (
      <div className="flex h-svh w-screen items-center justify-center bg-background text-foreground">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    ),
  }
)
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { userpicUrl, randomUserpic } from "@/lib/userpics"
import { cn } from "@/lib/utils"
import {
  STARTER_TEMPLATES,
  ROOM_NAME_MAX,
  generateRoomSlug,
  getDisplayRoomTitle,
  stripRoomCode,
  toSlug,
} from "@/lib/presets"

const STARTER_PRESETS = STARTER_TEMPLATES

type RoomInfo = LiveRoom

export function Lobby() {
  const [rooms, setRooms] = useState<RoomInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [createUserName, setCreateUserName] = useState("")
  const [joinUserName, setJoinUserName] = useState("")
  const [activeUserName, setActiveUserName] = useState("")
  const [, setRejoinTick] = useState(0)

  const [createAvatarSeed, setCreateAvatarSeed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("better_space_active_avatar")
      if (saved) return saved
    }
    return randomUserpic()
  })

  const [joinAvatarSeed, setJoinAvatarSeed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("better_space_active_avatar")
      if (saved) return saved
    }
    return randomUserpic()
  })

  const [isJoining, setIsJoining] = useState(false)

  const [hasJoined, setHasJoined] = useState(false)
  const [token, setToken] = useState("")
  const [activeRoomName, setActiveRoomName] = useState("")

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")

  // Every way into Launch space comes through here, with the room name to
  // start from: a template's, one brought from elsewhere, or blank from the
  // button, never left over from last time.
  const openLaunch = (roomName = "") => {
    setNewSpaceName(roomName)
    setIsCreateOpen(true)
  }

  // Arriving with something to open: ?template=… (a template card elsewhere)
  // or ?space=… (the hero's Go live, or a shared /space/<room> link, which
  // redirects here). Read once, then acted on when the rooms have loaded, so a
  // room that is live opens its Join panel and anything else opens Launch.
  const arrival = React.useRef<URLSearchParams | null>(null)
  useEffect(() => {
    arrival.current ??= new URLSearchParams(window.location.search)
    if (window.location.search) window.history.replaceState(null, "", "/lobby")
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("space_username")
    if (saved) {
      setCreateUserName(saved)
      setActiveUserName(saved)
      setJoinUserName(saved)
    }
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/livekit/rooms")
      if (res.ok) {
        const data = await res.json()
        setRooms(data.data || [])
      }
    } catch (e) {
      console.error("Failed to fetch rooms", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchRooms()
      }
    }
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchRooms()
      }
    }, 5000)
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  // Rejoin countdown ticker: only runs every second while the host has an active disconnected room (< 60s)
  useEffect(() => {
    const hasActiveDisconnect = () => {
      if (typeof window === "undefined" || !activeUserName) return false
      return rooms.some((room) => {
        if (room.host !== activeUserName) return false
        const disconnectTimeStr = localStorage.getItem(
          `space_host_disconnected_${room.name}`
        )
        if (!disconnectTimeStr) return false
        const elapsed = Date.now() - parseInt(disconnectTimeStr, 10)
        if (elapsed >= 60000) {
          localStorage.removeItem(`space_host_disconnected_${room.name}`)
          return false
        }
        return true
      })
    }

    if (!hasActiveDisconnect()) return

    const timer = setInterval(() => {
      if (hasActiveDisconnect()) {
        setRejoinTick((t) => t + 1)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [rooms, activeUserName])

  const handleJoin = async (roomName: string) => {
    const uName = joinUserName.trim()
    if (!uName) return
    setIsJoining(true)
    localStorage.setItem("space_username", uName)
    localStorage.setItem("better_space_active_avatar", joinAvatarSeed)
    localStorage.setItem(
      `space_profile_${roomName}`,
      JSON.stringify({ userName: uName, avatarSeed: joinAvatarSeed })
    )

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const query = new URLSearchParams({
        room: roomName,
        username: uName,
        avatar: joinAvatarSeed,
      })
      const res = await fetch(`${apiUrl}/api/livekit/token?${query.toString()}`)
      const data = await res.json()
      if (data.data?.token) {
        setActiveUserName(uName)
        setToken(data.data.token)
        setActiveRoomName(roomName)
        setHasJoined(true)
        setIsJoinOpen(false)
      } else {
        toast.add({
          title: data.error?.message || "Failed to join space",
          type: "error",
        })
      }
    } catch {
      toast.add({ title: "Failed to join space", type: "error" })
    } finally {
      setIsJoining(false)
    }
  }

  const handleCreateAndJoin = async () => {
    const uName = createUserName.trim()
    const rawName = newSpaceName.trim()
    if (!rawName || !uName) return
    const rName = generateRoomSlug(rawName)
    setIsJoining(true)
    localStorage.setItem("space_username", uName)
    localStorage.setItem("better_space_active_avatar", createAvatarSeed)
    localStorage.setItem(
      `space_profile_${rName}`,
      JSON.stringify({ userName: uName, avatarSeed: createAvatarSeed })
    )

    try {
      const res = await fetch("/api/livekit/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: rName,
          hostName: uName,
          avatar: createAvatarSeed,
        }),
      })
      const data = await res.json()

      if (res.ok && data.data?.token) {
        setActiveUserName(uName)
        setToken(data.data.token)
        setActiveRoomName(data.data.roomName || rName)
        setHasJoined(true)
        setIsCreateOpen(false)
      } else {
        toast.add({
          title: data.error?.message || "Failed to create room",
          type: "error",
        })
      }
    } catch {
      toast.add({ title: "Failed to create room", type: "error" })
    } finally {
      setIsJoining(false)
    }
  }

  const onRoomClick = (roomName: string) => {
    const profileStr = localStorage.getItem(`space_profile_${roomName}`)
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr)
        if (profile.userName) setJoinUserName(profile.userName)
        if (profile.avatarSeed) setJoinAvatarSeed(profile.avatarSeed)
      } catch {}
    } else {
      const savedUser = localStorage.getItem("space_username")
      if (savedUser) setJoinUserName(savedUser)
    }

    setSelectedRoom(roomName)
    setIsJoinOpen(true)
  }

  // Act on the arrival (above) once the rooms have loaded.
  useEffect(() => {
    const params = arrival.current
    if (isLoading || !params) return
    arrival.current = new URLSearchParams()
    const template = STARTER_PRESETS.find(
      (t) => t.name === params.get("template")
    )
    if (template) return openLaunch(template.name)
    const space = params.get("space")
    if (!space) return
    if (rooms.some((r) => r.name === space)) return onRoomClick(space)
    openLaunch(toSlug(stripRoomCode(space)).slice(0, ROOM_NAME_MAX))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once rooms load
  }, [isLoading])

  if (hasJoined && token) {
    return (
      <SpaceRoomLiveKit
        roomName={activeRoomName}
        userName={activeUserName}
        token={token}
        onLeave={() => {
          setHasJoined(false)
          setToken("")
          fetchRooms()
        }}
      />
    )
  }

  const joinRoom = rooms.find((r) => r.name === selectedRoom)
  // The template a typed room name falls under, as the lobby will title it.
  const launchTemplate = STARTER_PRESETS.find((t) => t.name === newSpaceName)
  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const liveCount = rooms.length

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Navbar />

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-8 pb-16 sm:px-6 sm:pt-12 lg:px-8">
        {/* Header: what this is, how much is live, and the two things to do */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-xs">
              <span className="relative flex size-1.5" aria-hidden="true">
                <span
                  className={cn(
                    "relative size-1.5 rounded-full",
                    liveCount > 0 ? "bg-emerald-500" : "bg-muted-foreground/50"
                  )}
                />
              </span>
              {isLoading
                ? "Checking who's live…"
                : liveCount === 0
                  ? "No rooms live yet"
                  : `${liveCount} ${liveCount === 1 ? "room" : "rooms"} live now`}
            </span>
            <h1 className="mt-3 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
              Lobby
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground sm:text-base">
              Every live room in one place. Join one to listen in, or start your
              own.
            </p>
          </div>

          <Button
            size="lg"
            className="h-10 shrink-0 self-start rounded-[10px] px-4 text-sm sm:self-auto"
            onClick={() => openLaunch()}
          >
            <RiAddLine data-icon="inline-start" />
            Launch space
          </Button>
        </div>

        {/* Search, once there is something to search */}
        {liveCount > 3 && (
          <div className="relative mt-8 max-w-sm">
            <RiSearchLine className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live rooms"
              aria-label="Search live rooms"
              className="h-10 rounded-[10px] border border-border bg-card pl-10 text-sm"
            />
          </div>
        )}

        {/* Live rooms */}
        <section aria-label="Live rooms" className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room) => {
                const disconnectTimeStr =
                  typeof window !== "undefined"
                    ? localStorage.getItem(
                        `space_host_disconnected_${room.name}`
                      )
                    : null
                let timeLeft = 0
                if (disconnectTimeStr && room.host === activeUserName) {
                  const elapsed = Date.now() - parseInt(disconnectTimeStr, 10)
                  if (elapsed < 60000) {
                    timeLeft = Math.ceil((60000 - elapsed) / 1000)
                  } else {
                    localStorage.removeItem(
                      `space_host_disconnected_${room.name}`
                    )
                  }
                }
                return (
                  <RoomCard
                    key={room.name}
                    room={room}
                    onJoin={() => onRoomClick(room.name)}
                    notice={
                      timeLeft > 0
                        ? `You dropped out. Rejoin within ${timeLeft}s to keep hosting.`
                        : undefined
                    }
                  />
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center sm:py-16">
              <div className="flex -space-x-3" aria-hidden="true">
                {["OSLO-3", "Funny Bunny-3", "Afterclap-2", "Guacamole-1"].map(
                  (seed, i) => (
                    <img
                      key={seed}
                      src={userpicUrl(seed)}
                      alt=""
                      className="size-12 rounded-full border-2 border-background bg-muted object-cover shadow-sm"
                      style={{ zIndex: 4 - i }}
                    />
                  )
                )}
              </div>
              <h2 className="mt-5 font-display text-xl tracking-tight text-foreground sm:text-2xl">
                {searchQuery ? "No rooms match that" : "It's quiet right now"}
              </h2>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                {searchQuery
                  ? "Try another name, or start a room of your own."
                  : "Launch a space and it shows up here for anyone to join, or pick a ready-made topic below."}
              </p>
            </div>
          )}
        </section>

        {/* Ready-made topics */}
        <section aria-labelledby="templates-heading" className="mt-12">
          <h2
            id="templates-heading"
            className="font-display text-lg tracking-tight text-foreground sm:text-xl"
          >
            Start from a template
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A topic and a line-up, ready to go live.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STARTER_PRESETS.map((preset) => (
              <TemplateCard
                key={preset.name}
                template={preset}
                onStart={() => openLaunch(preset.name)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Launch a space: name it, see its card as the lobby will */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SpacePanel
          title="Launch a space"
          description="Name your room, then go live. It shows up in the lobby for anyone to join."
          previewLabel="How it shows in the lobby"
          preview={
            <RoomCard
              room={{
                // A stand-in code, as the live room's name will end in one
                name: `${newSpaceName || "name-your-room"}-000000`,
                host: createUserName.trim() || "you",
                numParticipants: 1,
                createdAt: Date.now() / 1000,
                participants: [
                  {
                    identity: createUserName.trim() || "you",
                    avatar: createAvatarSeed,
                    onMic: true,
                  },
                ],
              }}
            />
          }
        >
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault()
              handleCreateAndJoin()
            }}
          >
            <Field className="gap-1.5">
              <div className="flex items-baseline justify-between">
                <FieldLabel
                  htmlFor="create-space-name"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Room name
                </FieldLabel>
                <span
                  className="text-[11px] text-muted-foreground/70 tabular-nums"
                  aria-hidden="true"
                >
                  {newSpaceName.length}/{ROOM_NAME_MAX}
                </span>
              </div>
              {/* As the hero's room field: the link, filled in */}
              <div className="flex h-11 items-center rounded-2xl border border-border bg-background px-3.5 transition-colors focus-within:border-foreground/40">
                <span className="font-mono text-sm text-muted-foreground">
                  /space/
                </span>
                <input
                  id="create-space-name"
                  value={newSpaceName}
                  onChange={(e) =>
                    setNewSpaceName(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-")
                    )
                  }
                  placeholder="name-your-room"
                  maxLength={ROOM_NAME_MAX}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="h-full min-w-0 flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="mr-0.5 text-xs text-muted-foreground">
                  Try
                </span>
                {STARTER_PRESETS.map((preset) => {
                  const active = launchTemplate?.name === preset.name
                  return (
                    <Button
                      key={preset.name}
                      type="button"
                      variant={active ? "default" : "outline"}
                      size="xs"
                      aria-pressed={active}
                      // Tapping the chosen one again clears it.
                      onClick={() => setNewSpaceName(active ? "" : preset.name)}
                      className="max-w-full rounded-lg"
                    >
                      <span className="truncate">{preset.title}</span>
                    </Button>
                  )
                })}
              </div>
              {launchTemplate && (
                <p className="text-xs text-muted-foreground">
                  The {launchTemplate.title} template. Change the name and it
                  becomes a room of your own.
                </p>
              )}
            </Field>

            <IdentityRow
              id="create-user-name"
              seed={createAvatarSeed}
              onSeed={(seed) => {
                setCreateAvatarSeed(seed)
                setJoinAvatarSeed(seed)
                localStorage.setItem("better_space_active_avatar", seed)
              }}
              name={createUserName}
              onName={setCreateUserName}
            />

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                size="lg"
                className="h-11 w-full rounded-[10px] text-[15px]"
                disabled={
                  !newSpaceName.trim() ||
                  !createUserName.trim() ||
                  isJoining ||
                  rooms.some((r) => r.host === createUserName.trim())
                }
              >
                {isJoining ? <Spinner /> : <RiMicLine />}
                Go live
              </Button>
              {createUserName.trim() &&
              rooms.some((r) => r.host === createUserName.trim()) ? (
                <p className="text-center text-xs font-medium text-destructive">
                  You already host a space. End it to start another.
                </p>
              ) : (
                <p className="text-center text-xs text-muted-foreground">
                  No account. Nothing recorded.
                </p>
              )}
            </div>
          </form>
        </SpacePanel>
      </Dialog>

      {/* Join a room: see yourself in its card before you walk in */}
      <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
        <SpacePanel
          title={getDisplayRoomTitle(selectedRoom)}
          description={
            joinRoom?.host === joinUserName.trim()
              ? "This is your room. Go live to pick up where you left off."
              : "You'll join as a listener. Raise your hand to get the mic."
          }
          previewLabel="You, in the room"
          preview={
            joinRoom && (
              <RoomCard
                room={{
                  ...joinRoom,
                  numParticipants: joinRoom.numParticipants + 1,
                  participants: [
                    {
                      identity: joinUserName.trim() || "you",
                      avatar: joinAvatarSeed,
                    },
                    ...joinRoom.participants,
                  ],
                }}
              />
            )
          }
        >
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault()
              handleJoin(selectedRoom)
            }}
          >
            <IdentityRow
              id="join-user-name"
              seed={joinAvatarSeed}
              onSeed={setJoinAvatarSeed}
              name={joinUserName}
              onName={setJoinUserName}
              autoFocus
            />
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full rounded-[10px] text-[15px]"
              disabled={!joinUserName.trim() || isJoining}
            >
              {isJoining ? <Spinner /> : null}
              {joinRoom?.host === joinUserName.trim()
                ? "Go live"
                : "Join space"}
            </Button>
          </form>
        </SpacePanel>
      </Dialog>
    </div>
  )
}

// Who you'll be in the room, the same in both popovers: your face (tap it to
// pick another, or shuffle) and your name, in one row.
function IdentityRow({
  id,
  seed,
  onSeed,
  name,
  onName,
  autoFocus,
}: {
  id: string
  seed: string
  onSeed: (seed: string) => void
  name: string
  onName: (name: string) => void
  autoFocus?: boolean
}) {
  return (
    <Field className="gap-1.5">
      <FieldLabel
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground"
      >
        You&apos;ll appear as
      </FieldLabel>
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-background p-1.5 transition-colors focus-within:border-foreground/40">
        <CharacterPicker
          value={seed}
          onSelect={onSeed}
          size="md"
          trigger={
            <button
              type="button"
              aria-label="Choose your avatar"
              title="Choose your avatar"
              className="relative shrink-0 rounded-full focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <Avatar className="size-10 border border-border">
                <AvatarImage
                  src={userpicUrl(seed)}
                  alt=""
                  className="object-cover"
                />
                <AvatarFallback />
              </Avatar>
              <span className="absolute -right-0.5 -bottom-0.5 flex size-4.5 items-center justify-center rounded-full border-2 border-background bg-foreground text-background">
                <RiEditLine className="size-2.5" />
              </span>
            </button>
          }
        />
        <input
          id={id}
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Your name"
          maxLength={20}
          autoComplete="nickname"
          autoFocus={autoFocus}
          className="h-10 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onSeed(randomUserpic())}
          aria-label="Shuffle avatar"
          title="Shuffle avatar"
          className="rounded-lg text-muted-foreground"
        >
          <RiShuffleLine />
        </Button>
      </div>
    </Field>
  )
}

// The Launch and Join panel: the form, and beside it (above it on phones) the
// room's card as the lobby shows it, filling in as you type. A bottom sheet on
// phones and a centred panel from sm up (components/ui/dialog.tsx).
function SpacePanel({
  title,
  description,
  previewLabel,
  preview,
  children,
}: {
  title: string
  description: string
  previewLabel: string
  preview: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-md sm:p-0 md:max-w-3xl">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:gap-0">
        <div className="sm:px-6 sm:pb-6 md:p-7 md:pr-7">
          <DialogHeader className="pr-8">
            <DialogTitle className="font-display text-xl leading-snug font-semibold tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="font-sans text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">{children}</div>
        </div>
        <div className="order-first flex flex-col justify-center rounded-2xl border border-border/60 bg-muted/30 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[14px_14px] p-4 sm:mx-6 sm:mt-6 md:order-none md:m-0 md:rounded-none md:rounded-r-3xl md:border-0 md:border-l md:p-6">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            {previewLabel}
          </p>
          {/* A picture of the card, not a control */}
          <div inert>{preview}</div>
        </div>
      </div>
    </DialogContent>
  )
}
