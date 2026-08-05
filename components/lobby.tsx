/* eslint-disable @next/next/no-img-element */
"use client"

import {
  RiAddLine,
  RiTeamLine,
  RiArrowRightLine,
  RiSearchLine,
  RiShuffleLine,
  RiEditLine,
  RiCloseLine,
} from "@remixicon/react"
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
import { STARTER_TEMPLATES, getDisplayRoomTitle } from "@/lib/presets"

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
  const [hostSecret, setHostSecret] = useState("")

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

    const savedSecret = localStorage.getItem(`space_host_secret_${roomName}`) || ""
    setHostSecret(savedSecret)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const query = new URLSearchParams({
        room: roomName,
        username: uName,
        avatar: joinAvatarSeed,
      })
      if (savedSecret) query.set("hostSecret", savedSecret)
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
    const rName = newSpaceName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")
    const uName = createUserName.trim()
    if (!rName || !uName) return
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
        const secret = data.data.hostSecret
        if (secret) {
          localStorage.setItem(`space_host_secret_${data.data.roomName || rName}`, secret)
          setHostSecret(secret)
        }
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
        hostSecret={hostSecret}
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
        <div className="mb-5 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-5 md:flex-row md:items-center rounded-2xl sm:rounded-3xl border border-border bg-card/80 p-4 sm:p-6 md:p-8 shadow-xs">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase mb-1.5 sm:mb-2">
              <span className="size-1.5 rounded-full bg-foreground" />
              <span>LIVE AUDIO LOUNGE</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Active Broadcasts
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm font-normal max-w-xl">
              Drop into ongoing voice spaces or launch a fresh room with instant WebRTC audio.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-between sm:justify-end shrink-0">
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
                <button
                  type="button"
                  className="flex items-center gap-2 bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-full border border-border/80 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-foreground shrink-0"
                  title="Change avatar persona"
                >
                  <div className="relative">
                    <Avatar className="size-7 sm:size-8 md:size-9 border border-border">
                      <AvatarImage
                        src={userpicUrl(createAvatarSeed)}
                        alt="Active Avatar"
                        className="object-cover"
                      />
                      <AvatarFallback />
                    </Avatar>
                    <div className="absolute -right-0.5 -bottom-0.5 flex size-3.5 sm:size-4 items-center justify-center rounded-full bg-foreground text-background shadow-xs">
                      <RiEditLine size={9} />
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-muted-foreground group-hover:text-foreground pr-1 transition-colors">
                    Change Avatar
                  </span>
                </button>
              }
            />

            {/* Launch Space Popover Button */}
            <Popover open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <PopoverTrigger
                render={
                  <Button
                    className="h-9 sm:h-10 px-4 sm:px-5 font-mono text-xs font-bold uppercase tracking-wider gap-1.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-95 shrink-0"
                  >
                    <RiAddLine size={15} />
                    <span>Launch Space</span>
                  </Button>
                }
              />
              <PopoverContent
                side="bottom"
                align="end"
                className="w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card p-0 shadow-2xl"
              >
                <PopoverHeader className="px-5 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-border/70">
                  <div className="flex items-center gap-3">
                    <div className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-muted border border-border shrink-0">
                      <RiTeamLine size={14} className="text-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <PopoverTitle className="font-display text-base font-bold text-foreground leading-tight">
                        Launch New Space
                      </PopoverTitle>
                      <PopoverDescription className="font-mono text-[10px] sm:text-[11px] text-muted-foreground truncate">
                        Name your room and set your display identity.
                      </PopoverDescription>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(false)}
                      aria-label="Close"
                      className="grid size-7 sm:size-8 shrink-0 place-items-center rounded-full border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-foreground/25 cursor-pointer"
                    >
                      <RiCloseLine size={15} aria-hidden="true" />
                    </button>
                  </div>
                </PopoverHeader>

                <form
                  className="flex flex-col gap-5 p-5 sm:p-6"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleCreateAndJoin()
                  }}
                >
                  <Field className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <FieldLabel htmlFor="create-space-name" className="text-xs font-bold font-mono uppercase text-muted-foreground">
                        Space Name
                      </FieldLabel>
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70" aria-hidden="true">
                        {newSpaceName.length}/30
                      </span>
                    </div>
                    <Input
                      id="create-space-name"
                      value={newSpaceName}
                      onChange={(e) =>
                        setNewSpaceName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-"))
                      }
                      placeholder="e.g. design-crit"
                      maxLength={30}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      className="h-11 rounded-xl font-mono text-xs border border-border bg-background"
                      autoFocus
                    />
                    {/* Quick template suggestions */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="font-mono text-[10px] text-muted-foreground/80 mr-1">Templates:</span>
                      {STARTER_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setNewSpaceName(preset.name)}
                          className="font-mono text-[10px] px-2 py-0.5 rounded-md border border-border bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field className="space-y-1.5">
                    <FieldLabel htmlFor="create-user-name" className="text-xs font-bold font-mono uppercase text-muted-foreground">
                      Your Display Name
                    </FieldLabel>
                    <Input
                      id="create-user-name"
                      value={createUserName}
                      onChange={(e) => setCreateUserName(e.target.value)}
                      placeholder="What should people call you?"
                      maxLength={20}
                      autoComplete="nickname"
                      className="h-11 rounded-xl font-mono text-xs border border-border bg-background"
                    />
                  </Field>

                  <div className="mt-1 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 flex flex-col sm:flex-row items-center justify-between gap-2 px-5 sm:px-6 py-3.5 border-t border-border/70 bg-muted/30">
                    {createUserName.trim() && rooms.some((r) => r.host === createUserName.trim()) ? (
                      <span className="font-mono text-[10px] sm:text-xs font-medium text-destructive">
                        Already hosting an active space.
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                        Instant WebRTC audio &middot; no accounts
                      </span>
                    )}
                    <Button
                      type="submit"
                      className="font-mono text-xs font-bold uppercase tracking-wider rounded-full bg-foreground text-background hover:bg-foreground/90 px-5 h-10 shrink-0 focus-visible:ring-4 focus-visible:ring-foreground/25"
                      disabled={
                        !newSpaceName.trim() ||
                        !createUserName.trim() ||
                        isJoining ||
                        rooms.some((r) => r.host === createUserName.trim())
                      }
                    >
                      {isJoining ? <Spinner className="mr-2" /> : null}
                      <span>Create &amp; Enter</span>
                    </Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Search & Stats Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <RiSearchLine className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 size-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active spaces..."
              className="pl-9 h-10 rounded-xl font-mono text-xs border border-border bg-card"
            />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground self-end sm:self-auto">
            <span>{rooms.length} {rooms.length === 1 ? "room live" : "rooms live"}</span>
          </div>
        </div>

        {/* Room List Grid / Empty State */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <Spinner className="size-7 text-foreground animate-spin" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="space-y-6">
            {/* Empty State Card */}
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center rounded-3xl border border-border bg-card/60 p-6 sm:p-8 shadow-xs">
              <div className="flex size-14 items-center justify-center rounded-2xl mb-4 bg-muted border border-border">
                <RiTeamLine className="size-7 text-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold">
                {searchQuery ? "No matching spaces found" : "No active voice spaces right now"}
              </h3>
              <p className="text-muted-foreground mt-1 max-w-sm font-mono text-xs">
                {searchQuery
                  ? "Try searching for a different room name or start a new space."
                  : "Be the first to start a room, or launch one of the popular topics below."}
              </p>
            </div>

            {/* Quick Starter Topics */}
            <div>
              <div className="mb-3.5 px-1 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>QUICK LAUNCH TEMPLATES</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {STARTER_PRESETS.map((preset) => (
                  <Link
                    key={preset.name}
                    href={`/space/${preset.name}`}
                    className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-foreground/40 hover:bg-card/90 transition-all active:scale-98 shadow-xs text-left"
                  >
                    <div>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full mb-2">
                        Template
                      </span>
                      <h4 className="font-display text-base font-bold text-foreground group-hover:text-foreground">
                        {preset.title}
                      </h4>
                      <p className="font-mono text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        {preset.desc}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/60 font-mono text-xs font-bold text-foreground">
                      <span className="font-mono text-xs font-bold">Launch Template</span>
                      <RiArrowRightLine size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-left border border-border bg-card hover:border-foreground/40 hover:bg-card/95 transition-all active:scale-[0.99] shadow-xs overflow-hidden"
                >
                  {timeLeft > 0 && (
                    <div className="absolute top-0 left-0 right-0 bg-foreground text-background text-[10px] font-mono font-bold text-center py-1">
                      Host disconnected. Rejoin within {timeLeft}s!
                    </div>
                  )}

                  <div className={`mb-5 sm:mb-6 flex w-full items-start justify-between ${timeLeft > 0 ? "mt-3" : ""}`}>
                    <div className="truncate pr-2.5 min-w-0">
                      <h3 className="truncate font-display text-base sm:text-lg font-bold text-foreground group-hover:underline">
                        {getDisplayRoomTitle(room.name)}
                      </h3>
                      <p className="text-muted-foreground mt-0.5 font-mono text-[11px] sm:text-xs truncate">
                        Host: <span className="text-foreground">{room.host}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-foreground text-background px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase shrink-0">
                      <span className="size-1.5 rounded-full bg-background" />
                      Live
                    </div>
                  </div>

                  {/* Participant Avatars Strip */}
                  <div className="mt-auto flex w-full items-center justify-between gap-2 pt-3 sm:pt-4 border-t border-border/60">
                    <div className="flex -space-x-1.5 sm:-space-x-2 shrink-0">
                      {room.participants.slice(0, 4).map((p) => (
                        <div
                          key={p.identity}
                          className="bg-card border border-border relative size-7 sm:size-8 overflow-hidden rounded-full shadow-xs"
                        >
                          <img
                            src={userpicUrl(p.avatar || p.identity)}
                            alt={p.identity}
                            className="size-full object-cover"
                          />
                        </div>
                      ))}
                      {room.participants.length > 4 && (
                        <div className="bg-muted border border-border text-foreground flex size-7 sm:size-8 items-center justify-center rounded-full font-mono text-[9px] sm:text-[10px] font-bold">
                          +{room.participants.length - 4}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 font-mono text-[11px] sm:text-xs font-bold text-foreground shrink-0">
                      <span>
                        {room.numParticipants}{" "}
                        {room.numParticipants === 1 ? "Speaker" : "Speakers"}
                      </span>
                      <RiArrowRightLine size={14} />
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
          className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-border bg-card shadow-xl"
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
              <div className="flex items-center justify-center gap-3 mb-2 mt-1">
                <div className="relative group inline-block">
                  <CharacterPicker
                    value={joinAvatarSeed}
                    onSelect={setJoinAvatarSeed}
                    size="md"
                    trigger={
                      <button
                        type="button"
                        className="relative block rounded-full focus:outline-none focus:ring-2 focus:ring-foreground cursor-pointer"
                        title="Click to choose avatar persona"
                      >
                        <Avatar className="size-16 sm:size-20 border border-border shadow-xs transition-transform group-hover:scale-105">
                          <AvatarImage
                            src={userpicUrl(joinAvatarSeed)}
                            alt="Avatar preview"
                            className="object-cover"
                          />
                          <AvatarFallback />
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="font-mono text-[10px] font-bold text-foreground uppercase tracking-wider bg-card px-2 py-0.5 rounded-full border border-border">
                            Change
                          </span>
                        </div>
                        <div className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-foreground text-background shadow-md border-2 border-background">
                          <RiEditLine size={13} />
                        </div>
                      </button>
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setJoinAvatarSeed(randomUserpic())}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted font-mono text-xs font-semibold text-foreground transition-all active:scale-95 shadow-xs cursor-pointer"
                  title="Randomize avatar"
                >
                  <RiShuffleLine size={13} />
                  <span>Shuffle</span>
                </button>
              </div>

              <FieldLabel htmlFor="join-user-name" className="text-xs font-bold font-mono uppercase text-muted-foreground">
                Your Display Name
              </FieldLabel>
              <Input
                id="join-user-name"
                value={joinUserName}
                onChange={(e) => setJoinUserName(e.target.value)}
                placeholder="What should people call you?"
                maxLength={20}
                autoComplete="off"
                className="h-11 rounded-xl font-mono text-xs border border-border bg-background"
                autoFocus
              />
            </Field>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-11 font-mono text-xs font-bold uppercase tracking-wider rounded-xl bg-foreground text-background"
                disabled={!joinUserName.trim() || isJoining}
              >
                {isJoining ? <Spinner className="mr-2" /> : null}
                <span>Enter Space</span>
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}
