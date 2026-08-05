/* eslint-disable @next/next/no-img-element */
"use client"

import {
  RiAddLine,
  RiTeamLine,
  RiArrowRightLine,
  RiSparklingLine,
  RiUser3Line,
  RiRadio2Line,
  RiRefreshLine,
} from "@remixicon/react"
import React, { useState, useEffect, useRef } from "react"

import { CharacterPicker } from "@/components/common/character-picker"
import { Navbar } from "@/components/common/navbar"
import {
  DoodleArrow,
  DoodleCircle,
  DoodleSparkle,
  DoodleUnderline,
  DoodleAsterisk,
} from "@/components/common/doodles"
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
import { userpicUrl, randomUserpic, getCharacterCollection } from "@/lib/userpics"
import { sound } from "@/lib/sound"

type RoomInfo = {
  name: string
  numParticipants: number
  host: string
  participants: { identity: string; avatar: string }[]
}

export function Lobby() {
  const [rooms, setRooms] = useState<RoomInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createUserName, setCreateUserName] = useState("")
  const [joinUserName, setJoinUserName] = useState("")
  const [activeUserName, setActiveUserName] = useState("")

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

  const [isJoinProfileLocked, setIsJoinProfileLocked] = useState(false)
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

  const handleJoin = async (roomName: string) => {
    const uName = joinUserName.trim()
    if (!uName) return
    setIsJoining(true)
    sound.playClick(500)
    const savedSecret = localStorage.getItem(`space_host_secret_${roomName}`) || ""
    setHostSecret(savedSecret)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const query = new URLSearchParams({
        room: roomName,
        username: uName.trim(),
        avatar: joinAvatarSeed,
      })
      if (savedSecret) query.set("hostSecret", savedSecret)
      const res = await fetch(`${apiUrl}/api/livekit/token?${query.toString()}`)
      const data = await res.json()
      if (data.data?.token) {
        sound.playPop(640)
        setActiveUserName(uName)
        localStorage.setItem("better_space_active_avatar", joinAvatarSeed)
        localStorage.setItem(
          `space_profile_${roomName}`,
          JSON.stringify({ userName: uName, avatarSeed: joinAvatarSeed })
        )
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
    const rName = newSpaceName.trim()
    const uName = createUserName.trim()
    if (!rName || !uName) return
    setIsJoining(true)
    sound.playClick(520)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const query = new URLSearchParams({
        room: rName,
        username: uName,
        isCreate: "true",
        avatar: createAvatarSeed,
      })
      const res = await fetch(`${apiUrl}/api/livekit/token?${query.toString()}`)
      const data = await res.json()

      if (data.data?.token) {
        sound.playStamp()
        if (data.data.hostSecret) {
          localStorage.setItem(`space_host_secret_${rName}`, data.data.hostSecret)
          setHostSecret(data.data.hostSecret)
        }
        localStorage.setItem("better_space_active_avatar", createAvatarSeed)
        localStorage.setItem(
          `space_profile_${rName}`,
          JSON.stringify({ userName: uName, avatarSeed: createAvatarSeed })
        )
        setActiveUserName(uName)
        setToken(data.data.token)
        setActiveRoomName(rName)
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
    sound.playClick(450)
    const profileStr = localStorage.getItem(`space_profile_${roomName}`)
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr)
        if (profile.userName && profile.avatarSeed) {
          setJoinUserName(profile.userName)
          setJoinAvatarSeed(profile.avatarSeed)
          setIsJoinProfileLocked(true)
        } else {
          setIsJoinProfileLocked(false)
        }
      } catch {
        setIsJoinProfileLocked(false)
      }
    } else {
      setIsJoinProfileLocked(false)
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

  const activeCollection = getCharacterCollection(createAvatarSeed)

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col p-4 sm:p-6 md:p-8">
        {/* Minimal Header */}
        <div className="minimal-card mb-8 mt-2 flex flex-col justify-between gap-6 md:flex-row md:items-center rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-muted-foreground uppercase mb-2">
              <span className="size-2 rounded-full bg-foreground animate-ping" />
              <span>LIVE ROOMS</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight">Active Broadcasts</h1>
            <p className="text-muted-foreground mt-1 text-sm font-normal">
              Drop into any active studio space with your vector persona.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Avatar Preview */}
            <div className="flex items-center gap-2.5 bg-muted/40 p-1.5 pl-2.5 rounded-full border border-border">
              <div className="relative">
                <Avatar className="size-9 border border-border">
                  <AvatarImage
                    src={userpicUrl(createAvatarSeed)}
                    alt="Active Avatar"
                    className="object-cover"
                  />
                  <AvatarFallback />
                </Avatar>
                <CharacterPicker
                  value={createAvatarSeed}
                  onSelect={(seed) => {
                    setCreateAvatarSeed(seed)
                    localStorage.setItem("better_space_active_avatar", seed)
                  }}
                  size="sm"
                />
              </div>
              <span className="font-mono text-xs font-bold text-foreground pr-2 truncate max-w-28">
                {createAvatarSeed}
              </span>
            </div>

            {/* Launch Space Button */}
            <Popover open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <PopoverTrigger
                render={
                  <Button
                    onClick={() => sound.playClick(500)}
                    className="h-10 px-5 font-mono text-xs font-bold uppercase tracking-wider gap-1.5 rounded-full bg-foreground text-background"
                  >
                    <RiAddLine size={16} />
                    <span>Launch Space</span>
                  </Button>
                }
              />
              <PopoverContent
                side="bottom"
                align="end"
                className="w-96 rounded-3xl p-6 border border-border bg-card shadow-xl"
              >
                <PopoverHeader>
                  <PopoverTitle className="font-display text-lg font-bold">
                    Launch New Studio
                  </PopoverTitle>
                  <PopoverDescription className="font-mono text-xs text-muted-foreground">
                    Name your room and pick a vector persona.
                  </PopoverDescription>
                </PopoverHeader>

                <form
                  className="space-y-4 pt-3"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleCreateAndJoin()
                  }}
                >
                  <Field>
                    <FieldLabel htmlFor="create-space-name" className="text-xs font-bold font-mono uppercase">
                      Space Name
                    </FieldLabel>
                    <Input
                      id="create-space-name"
                      value={newSpaceName}
                      onChange={(e) =>
                        setNewSpaceName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))
                      }
                      placeholder="e.g. design-studio"
                      maxLength={30}
                      className="rounded-xl font-mono text-xs border border-border"
                    />
                  </Field>

                  <Field>
                    <div className="flex flex-col items-center gap-2 mb-3 mt-1">
                      <div className="relative group/avatar inline-block">
                        <Avatar className="size-20 border border-border shadow-xs">
                          <AvatarImage
                            src={userpicUrl(createAvatarSeed)}
                            alt="Avatar preview"
                            className="object-cover"
                          />
                          <AvatarFallback />
                        </Avatar>
                        <CharacterPicker
                          value={createAvatarSeed}
                          onSelect={setCreateAvatarSeed}
                          size="md"
                        />
                      </div>
                      <span className="font-mono text-xs text-foreground font-bold">
                        {createAvatarSeed} ({activeCollection.name})
                      </span>
                    </div>

                    <FieldLabel htmlFor="create-user-name" className="text-xs font-bold font-mono uppercase">
                      Your Nickname
                    </FieldLabel>
                    <Input
                      id="create-user-name"
                      value={createUserName}
                      onChange={(e) => setCreateUserName(e.target.value)}
                      placeholder="What should people call you?"
                      maxLength={15}
                      className="rounded-xl font-mono text-xs border border-border"
                    />
                  </Field>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-11 font-mono text-xs font-bold uppercase tracking-wider rounded-xl bg-foreground text-background"
                      disabled={
                        !newSpaceName.trim() ||
                        !createUserName.trim() ||
                        isJoining ||
                        rooms.some((r) => r.host === createUserName.trim())
                      }
                    >
                      {isJoining ? <Spinner className="mr-2" /> : null}
                      Create &amp; Enter
                    </Button>
                  </div>
                </form>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Room List Grid */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <Spinner className="size-7 text-foreground animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="minimal-card flex flex-1 flex-col items-center justify-center py-20 text-center rounded-3xl border border-border bg-card p-8">
            <div className="flex size-14 items-center justify-center rounded-2xl mb-4 bg-muted border border-border">
              <RiTeamLine className="size-7 text-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold">No active spaces</h3>
            <p className="text-muted-foreground mt-1 max-w-sm font-mono text-xs">
              Be the first to launch a room and invite your crew.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
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
                  className="minimal-card relative flex flex-col rounded-3xl p-6 text-left border border-border bg-card transition-colors overflow-hidden group"
                >
                  {timeLeft > 0 && (
                    <div className="absolute top-0 left-0 right-0 bg-foreground text-background text-[10px] font-mono font-bold text-center py-1">
                      Host disconnected. Rejoin within {timeLeft}s!
                    </div>
                  )}

                  <div
                    className={`mb-6 flex w-full items-start justify-between ${
                      timeLeft > 0 ? "mt-3" : ""
                    }`}
                  >
                    <div className="truncate pr-3">
                      <h3 className="truncate font-display text-lg font-bold text-foreground group-hover:underline">
                        {room.name}
                      </h3>
                      <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                        Host: <span className="text-foreground">{room.host}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase shrink-0">
                      <span className="size-1.5 rounded-full bg-foreground animate-ping" />
                      Live
                    </div>
                  </div>

                  {/* Participant Avatars Strip */}
                  <div className="mt-auto flex w-full items-center justify-between pt-4 border-t border-border/60">
                    <div className="flex -space-x-2">
                      {room.participants.slice(0, 5).map((p) => (
                        <div
                          key={p.identity}
                          className="bg-card border border-border relative size-8 overflow-hidden rounded-full shadow-xs"
                        >
                          <img
                            src={userpicUrl(p.avatar || p.identity)}
                            alt={p.identity}
                            className="size-full object-cover"
                          />
                        </div>
                      ))}
                      {room.participants.length > 5 && (
                        <div className="bg-muted border border-border text-foreground flex size-8 items-center justify-center rounded-full font-mono text-[10px] font-bold">
                          +{room.participants.length - 5}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-foreground">
                      <span>
                        {room.numParticipants}{" "}
                        {room.numParticipants === 1 ? "Speaker" : "Speakers"}
                      </span>
                      <RiArrowRightLine size={15} />
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
          className="w-96 rounded-3xl p-6 border border-border bg-card shadow-xl"
          anchor={joinAnchorRef.current ?? undefined}
        >
          <PopoverHeader>
            <PopoverTitle className="font-display text-lg font-bold">
              Join {selectedRoom}
            </PopoverTitle>
            <PopoverDescription className="font-mono text-xs text-muted-foreground">
              Confirm your character avatar and nickname.
            </PopoverDescription>
          </PopoverHeader>

          <form
            className="space-y-4 pt-3"
            onSubmit={(e) => {
              e.preventDefault()
              handleJoin(selectedRoom)
            }}
          >
            <Field>
              <div className="flex flex-col items-center gap-2 mb-3 mt-1">
                <div className="relative group/avatar inline-block">
                  <Avatar className="size-20 border border-border shadow-xs">
                    <AvatarImage
                      src={userpicUrl(joinAvatarSeed)}
                      alt="Avatar preview"
                      className="object-cover"
                    />
                    <AvatarFallback />
                  </Avatar>
                  {!isJoinProfileLocked && (
                    <CharacterPicker
                      value={joinAvatarSeed}
                      onSelect={setJoinAvatarSeed}
                      size="md"
                    />
                  )}
                </div>
                <span className="font-mono text-xs text-foreground font-bold">
                  {joinAvatarSeed}
                </span>
              </div>

              <FieldLabel htmlFor="join-user-name" className="text-xs font-bold font-mono uppercase">
                Your Nickname
              </FieldLabel>
              <Input
                id="join-user-name"
                value={joinUserName}
                onChange={(e) => setJoinUserName(e.target.value)}
                disabled={isJoinProfileLocked}
                placeholder="What should people call you?"
                maxLength={15}
                className="rounded-xl font-mono text-xs border border-border"
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
                Enter Room
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}
