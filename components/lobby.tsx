/* eslint-disable @next/next/no-img-element */
"use client"

import {
  Users as RiTeamLine,
  ArrowRight as RiArrowRightLine,
  Search as RiSearchLine,
  Shuffle as RiShuffleLine,
  SquarePen as RiEditLine,
  X as RiCloseLine,
} from "lucide-react"
import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"

import { CharacterPicker } from "@/components/common/character-picker"
import { Navbar } from "@/components/common/navbar"
import { SpaceRoomLiveKit } from "@/components/livekit-room"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { userpicUrl, randomUserpic } from "@/lib/userpics"
import {
  STARTER_TEMPLATES,
  getDisplayRoomTitle,
  generateRoomSlug,
} from "@/lib/presets"

const STARTER_PRESETS = STARTER_TEMPLATES

type RoomInfo = {
  name: string
  numParticipants: number
  host: string
  participants: { identity: string; avatar: string }[]
}

export function Lobby() {
  const [rooms, setRooms] = useState<RoomInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [createUserName, setCreateUserName] = useState("")
  const [joinUserName, setJoinUserName] = useState("")
  const [activeUserName, setActiveUserName] = useState("")

  const [, setTick] = useState(0)

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
  const joinAnchorRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("space_username")
    if (saved) {
      setCreateUserName(saved)
      setActiveUserName(saved)
      setJoinUserName(saved)
    }
  }, [])

  useEffect(() => {
    if (!isCreateOpen) return

    const scrollY = window.scrollY
    const body = document.body
    const html = document.documentElement
    const previousBody = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    }
    const previousHtmlOverflow = html.style.overflow

    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.width = "100%"
    body.style.overflow = "hidden"
    html.style.overflow = "hidden"

    return () => {
      body.style.overflow = previousBody.overflow
      body.style.position = previousBody.position
      body.style.top = previousBody.top
      body.style.width = previousBody.width
      html.style.overflow = previousHtmlOverflow
      window.scrollTo(0, scrollY)
    }
  }, [isCreateOpen])

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

  // Timer ticker to update rejoin countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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

  const onRoomClick = (roomName: string, el?: HTMLElement) => {
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
    joinAnchorRef.current = el ?? null
    setIsJoinOpen(true)
  }

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

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Navbar />

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col p-3.5 sm:p-6 md:p-8">
        {/* Header Hero Card */}
        <div className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card/80 p-4 shadow-xs sm:mb-8 sm:gap-5 sm:rounded-3xl sm:p-6 md:flex-row md:items-center md:p-8">
          <div className="min-w-0">
            <div className="mb-1.5 inline-flex items-center gap-2 font-mono text-[10px] font-bold text-muted-foreground uppercase sm:mb-2 sm:text-[11px]">
              <span className="size-1.5 rounded-full bg-foreground" />
              <span>LIVE AUDIO LOUNGE</span>
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
              Active Broadcasts
            </h1>
            <p className="mt-1 max-w-xl text-xs font-normal text-muted-foreground sm:text-sm">
              Drop into ongoing voice spaces or launch a fresh room with instant
              WebRTC audio.
            </p>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center justify-between gap-2.5 sm:flex-nowrap sm:justify-end sm:gap-3 md:w-auto">
            {/* Active Persona Selector */}
            <CharacterPicker
              value={createAvatarSeed}
              onSelect={(seed) => {
                setCreateAvatarSeed(seed)
                setJoinAvatarSeed(seed)
                localStorage.setItem("better_space_active_avatar", seed)
              }}
              size="sm"
              trigger={
                <Button
                  variant="outline"
                  className="h-10 rounded-xl pr-3.5 pl-2 font-mono text-xs font-bold tracking-wider text-foreground uppercase shadow-xs"
                  title="Change avatar persona"
                >
                  <div className="relative">
                    <Avatar className="size-6 border border-border shadow-xs">
                      <AvatarImage
                        src={userpicUrl(createAvatarSeed)}
                        alt="Active Avatar"
                        className="object-cover"
                      />
                      <AvatarFallback />
                    </Avatar>
                    <div className="absolute -right-0.5 -bottom-0.5 flex size-2.5 items-center justify-center rounded-full bg-foreground text-background shadow-xs ring-1 ring-card">
                      <RiEditLine size={6} />
                    </div>
                  </div>
                  <span>Change Avatar</span>
                </Button>
              }
            />

            {/* Launch Space Popover Button */}
            <Popover open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <PopoverTrigger
                render={
                  <Button className="h-10 gap-2 rounded-xl bg-foreground px-4 font-mono text-xs font-bold tracking-wider text-background uppercase shadow-sm hover:bg-foreground/90">
                    <span>Launch Space</span>
                    <RiArrowRightLine size={15} />
                  </Button>
                }
              />
              <PopoverContent
                side="bottom"
                align="end"
                collisionAvoidance={{
                  side: "none",
                  align: "shift",
                  fallbackAxisSide: "none",
                }}
                className="w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
              >
                <PopoverHeader className="mb-4">
                  <div className="flex items-center gap-2">
                    <RiTeamLine
                      size={16}
                      className="shrink-0 text-foreground"
                    />
                    <div className="min-w-0 flex-1">
                      <PopoverTitle className="font-display text-base font-extrabold text-foreground">
                        Launch New Space
                      </PopoverTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setIsCreateOpen(false)}
                      aria-label="Close"
                      className="rounded-lg"
                    >
                      <RiCloseLine size={16} aria-hidden="true" />
                    </Button>
                  </div>
                  <PopoverDescription className="mt-1 font-mono text-[10px] leading-normal text-muted-foreground">
                    Name your room and set your display identity.
                  </PopoverDescription>
                </PopoverHeader>

                <form
                  className="flex flex-col gap-4.5"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleCreateAndJoin()
                  }}
                >
                  <Field className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <FieldLabel
                        htmlFor="create-space-name"
                        className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                      >
                        Space Name
                      </FieldLabel>
                      <span
                        className="font-mono text-[9px] text-muted-foreground/60 tabular-nums"
                        aria-hidden="true"
                      >
                        {newSpaceName.length}/30
                      </span>
                    </div>
                    <Input
                      id="create-space-name"
                      value={newSpaceName}
                      onChange={(e) =>
                        setNewSpaceName(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_-]/g, "-")
                        )
                      }
                      placeholder="e.g. design-crit"
                      maxLength={30}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      className="h-10 rounded-xl border border-border bg-background font-mono text-xs focus:border-foreground"
                      autoFocus
                    />
                    {/* Quick template suggestions */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="mr-0.5 font-mono text-[9px] text-muted-foreground/70">
                        Templates:
                      </span>
                      {STARTER_PRESETS.map((preset) => (
                        <Button
                          key={preset.name}
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setNewSpaceName(preset.name)}
                          className="h-6 rounded-lg font-mono text-[9px] font-bold tracking-wider text-foreground uppercase hover:bg-muted"
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </Field>

                  <Field className="space-y-1.5">
                    <FieldLabel
                      htmlFor="create-user-name"
                      className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                    >
                      Your Display Name
                    </FieldLabel>
                    <Input
                      id="create-user-name"
                      value={createUserName}
                      onChange={(e) => setCreateUserName(e.target.value)}
                      placeholder="What should people call you?"
                      maxLength={20}
                      autoComplete="nickname"
                      className="h-10 rounded-xl border border-border bg-background font-mono text-xs focus:border-foreground"
                    />
                  </Field>

                  <div className="mt-1.5 flex items-center justify-between gap-4 border-t border-border/40 pt-4">
                    {createUserName.trim() &&
                    rooms.some((r) => r.host === createUserName.trim()) ? (
                      <span className="font-mono text-[9px] font-semibold text-destructive">
                        Already hosting a space.
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] text-muted-foreground">
                        Instant WebRTC &middot; no account
                      </span>
                    )}
                    <Button
                      type="submit"
                      className="h-10 shrink-0 rounded-xl bg-foreground px-5 font-mono text-xs font-bold tracking-wider text-background uppercase shadow-sm hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-foreground/25"
                      disabled={
                        !newSpaceName.trim() ||
                        !createUserName.trim() ||
                        isJoining ||
                        rooms.some((r) => r.host === createUserName.trim())
                      }
                    >
                      {isJoining ? <Spinner className="mr-2" /> : null}
                      <span>Go Live</span>
                    </Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Search & Stats Bar */}
        <div className="mb-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <RiSearchLine className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active spaces..."
              className="h-10 rounded-xl border border-border bg-card pl-9 font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-2 self-end font-mono text-xs text-muted-foreground sm:self-auto">
            <span>
              {rooms.length} {rooms.length === 1 ? "room live" : "rooms live"}
            </span>
          </div>
        </div>

        {/* Room List Grid / Empty State */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <Spinner className="size-7 animate-spin text-foreground" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="space-y-6">
            {/* Empty State Card */}
            <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card/60 p-6 py-12 text-center shadow-xs sm:p-8 sm:py-16">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-border bg-muted">
                <RiTeamLine className="size-7 text-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold">
                {searchQuery
                  ? "No matching spaces found"
                  : "No active voice spaces right now"}
              </h3>
              <p className="mt-1 max-w-sm font-mono text-xs text-muted-foreground">
                {searchQuery
                  ? "Try searching for a different room name or start a new space."
                  : "Be the first to start a room, or launch one of the popular topics below."}
              </p>
            </div>

            {/* Quick Starter Topics */}
            <div>
              <div className="mb-3.5 px-1 font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
                <span>QUICK LAUNCH TEMPLATES</span>
              </div>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {STARTER_PRESETS.map((preset) => (
                  <Link
                    key={preset.name}
                    href={`/space/${preset.name}`}
                    className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-4 text-left shadow-xs hover:border-foreground/40 hover:bg-card/90 sm:p-5"
                  >
                    <div>
                      <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] font-bold text-muted-foreground uppercase">
                        Template
                      </span>
                      <h4 className="font-display text-base font-bold text-foreground group-hover:text-foreground">
                        {preset.title}
                      </h4>
                      <p className="mt-1 line-clamp-2 font-mono text-[11px] text-muted-foreground">
                        {preset.desc}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-xs font-bold text-foreground">
                      <span className="font-mono text-xs font-bold">
                        Launch Template
                      </span>
                      <RiArrowRightLine size={14} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {filteredRooms.map((room) => {
              const disconnectTimeStr =
                typeof window !== "undefined"
                  ? localStorage.getItem(`space_host_disconnected_${room.name}`)
                  : null
              let timeLeft = 0
              if (disconnectTimeStr && room.host === activeUserName) {
                const disconnectTime = parseInt(disconnectTimeStr, 10)
                const elapsed = Date.now() - disconnectTime
                if (elapsed < 60000) {
                  timeLeft = Math.ceil((60000 - elapsed) / 1000)
                }
              }

              return (
                <button
                  key={room.name}
                  onClick={(e) => onRoomClick(room.name, e.currentTarget)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-xs transition-all duration-200 hover:border-foreground/40 hover:bg-muted/10 sm:rounded-3xl sm:p-6"
                >
                  {timeLeft > 0 && (
                    <div className="absolute top-0 right-0 left-0 bg-foreground py-1 text-center font-mono text-[10px] font-bold text-background">
                      Host disconnected. Rejoin in {timeLeft}s!
                    </div>
                  )}

                  <div className={`w-full ${timeLeft > 0 ? "mt-4" : ""}`}>
                    {/* Top Row: Live badge & Equalizer */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 rounded-md border border-foreground/15 bg-muted/65 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-foreground uppercase">
                        <span className="relative flex size-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/25 opacity-75"></span>
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground"></span>
                        </span>
                        Live
                      </div>

                      {/* Audio Equalizer animation */}
                      <div className="flex h-3.5 w-4 shrink-0 items-end gap-[2px]">
                        <span
                          className="animate-eq-1 w-[2px] rounded-full bg-foreground/80"
                          style={{ height: "30%" }}
                        />
                        <span
                          className="animate-eq-2 w-[2px] rounded-full bg-foreground/80"
                          style={{ height: "70%" }}
                        />
                        <span
                          className="animate-eq-3 w-[2px] rounded-full bg-foreground/80"
                          style={{ height: "50%" }}
                        />
                        <span
                          className="animate-eq-4 w-[2px] rounded-full bg-foreground/80"
                          style={{ height: "90%" }}
                        />
                      </div>
                    </div>

                    {/* Room title & Host badge */}
                    <div className="space-y-3">
                      <h3 className="line-clamp-1 font-display text-lg font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
                        {getDisplayRoomTitle(room.name)}
                      </h3>

                      {/* Host identity tag */}
                      <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 py-0.5 pr-2.5 pl-1.5 text-xs">
                        <div className="relative size-4.5 overflow-hidden rounded-full border border-border bg-card">
                          <img
                            src={userpicUrl(room.host)}
                            alt={room.host}
                            className="size-full object-cover"
                          />
                        </div>
                        <span className="font-mono text-[9px] font-semibold text-muted-foreground">
                          host:{" "}
                          <span className="font-bold text-foreground">
                            {room.host}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-4.5 w-full border-t border-border/40" />

                  {/* Bottom Row: Participants overlap avatars list & join button */}
                  <div className="mt-auto flex w-full items-center justify-between gap-4">
                    {/* Avatars */}
                    <div className="flex shrink-0 -space-x-1.5">
                      {room.participants.slice(0, 4).map((p, idx) => (
                        <div
                          key={p.identity}
                          className="relative size-7.5 overflow-hidden rounded-full border-2 border-card bg-card shadow-xs transition-transform group-hover:scale-105"
                          style={{
                            zIndex: 4 - idx,
                            transitionDelay: `${idx * 50}ms`,
                          }}
                        >
                          <img
                            src={userpicUrl(p.avatar || p.identity)}
                            alt={p.identity}
                            className="size-full object-cover"
                          />
                        </div>
                      ))}
                      {room.participants.length > 4 && (
                        <div
                          className="flex size-7.5 items-center justify-center rounded-full border-2 border-card bg-muted font-mono text-[9px] font-bold text-foreground shadow-xs"
                          style={{ zIndex: 0 }}
                        >
                          +{room.participants.length - 4}
                        </div>
                      )}
                    </div>

                    {/* CTA Join Button */}
                    <div className="flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider text-background uppercase shadow-sm transition-all group-hover:bg-foreground/90">
                      <span>
                        {room.numParticipants}{" "}
                        {room.numParticipants === 1 ? "speaker" : "speakers"}
                      </span>
                      <span className="h-3 w-px bg-background/25" />
                      <RiArrowRightLine
                        size={12}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>

      {/* Join Space Popover */}
      <Popover open={isJoinOpen} onOpenChange={setIsJoinOpen}>
        <PopoverContent
          side="top"
          align="center"
          className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-5 shadow-xl sm:rounded-3xl sm:p-6"
          anchor={joinAnchorRef.current ?? undefined}
        >
          <PopoverHeader>
            <PopoverTitle className="font-display text-lg font-bold">
              Join {selectedRoom}
            </PopoverTitle>
            <PopoverDescription className="font-mono text-xs text-muted-foreground">
              Confirm your persona and display name.
            </PopoverDescription>
          </PopoverHeader>

          <form
            className="space-y-4 pt-3"
            onSubmit={(e) => {
              e.preventDefault()
              handleJoin(selectedRoom)
            }}
          >
            <Field className="space-y-1.5">
              <div className="mt-1 mb-2 flex items-center justify-center gap-3">
                <div className="group relative inline-block">
                  <CharacterPicker
                    value={joinAvatarSeed}
                    onSelect={setJoinAvatarSeed}
                    size="md"
                    trigger={
                      <button
                        type="button"
                        className="relative block cursor-pointer rounded-full focus:ring-2 focus:ring-foreground focus:outline-none"
                        title="Click to choose avatar persona"
                      >
                        <Avatar className="size-16 border border-border shadow-xs sm:size-20">
                          <AvatarImage
                            src={userpicUrl(joinAvatarSeed)}
                            alt="Avatar preview"
                            className="object-cover"
                          />
                          <AvatarFallback />
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-foreground uppercase">
                            Change
                          </span>
                        </div>
                        <div className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-md">
                          <RiEditLine size={13} />
                        </div>
                      </button>
                    }
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setJoinAvatarSeed(randomUserpic())}
                  className="h-9 rounded-xl font-mono text-xs font-bold tracking-wider text-foreground uppercase"
                  title="Randomize avatar"
                >
                  <RiShuffleLine size={13} />
                  <span>Shuffle</span>
                </Button>
              </div>

              <FieldLabel
                htmlFor="join-user-name"
                className="font-mono text-xs font-bold text-muted-foreground uppercase"
              >
                Your Display Name
              </FieldLabel>
              <Input
                id="join-user-name"
                value={joinUserName}
                onChange={(e) => setJoinUserName(e.target.value)}
                placeholder="What should people call you?"
                maxLength={20}
                autoComplete="off"
                className="h-11 rounded-xl border border-border bg-background font-mono text-xs"
                autoFocus
              />
            </Field>

            <div className="pt-2">
              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-foreground font-mono text-xs font-bold tracking-wider text-background uppercase"
                disabled={!joinUserName.trim() || isJoining}
              >
                {isJoining ? <Spinner className="mr-2" /> : null}
                <span>
                  {rooms.find((r) => r.name === selectedRoom)?.host ===
                  joinUserName.trim()
                    ? "Go Live"
                    : "Join Space"}
                </span>
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}
