/* eslint-disable @next/next/no-img-element */
"use client"

import {
  RiAddLine,
  RiTeamLine,
  RiArrowRightSLine,
  RiLockLine,
  RiHistoryLine,
  RiTimerLine,
  RiArrowRightLine,
  RiShieldCheckLine,
} from "@remixicon/react"
import React, { useState, useEffect, useRef } from "react"

import { AvatarPicker } from "@/components/common/avatar-picker"
import { Navbar } from "@/components/common/navbar"
import { SpaceRoomLiveKit } from "@/components/livekit-room"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
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
import { getAvatarUrl } from "@/lib/avatars"

type RoomParticipant = {
  identity: string
  avatar: string
}

type RoomInfo = {
  name: string
  displayName?: string
  numParticipants: number
  host: string
  hostAvatar?: string
  participants: (string | RoomParticipant)[]
}

type RecentRoomInfo = {
  name: string
  displayName?: string
  host: string
  speakers: string[]
  numParticipants: number
  endedAt: number
  reason?: string
}

function formatTimeAgo(timestamp: number) {
  const diff = Math.max(0, Date.now() - timestamp)
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes === 1) return "1 min ago"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return "1h ago"
  return `${hours}h ago`
}

function getParticipantAvatar(p: string | RoomParticipant): string {
  if (typeof p === "object" && p !== null) {
    return p.avatar || p.identity || "Felix"
  }
  return p || "Felix"
}

function getParticipantIdentity(p: string | RoomParticipant): string {
  if (typeof p === "object" && p !== null) {
    return p.identity || "Speaker"
  }
  return p || "Speaker"
}

export function Lobby() {
  const [rooms, setRooms] = useState<RoomInfo[]>([])
  const [recentRooms, setRecentRooms] = useState<RecentRoomInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState("Felix")
  const [isJoinNameLocked, setIsJoinNameLocked] = useState(false)
  const [isJoinAvatarLocked, setIsJoinAvatarLocked] = useState(false)
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

  // Host disconnect countdown tracking
  const [hostGraceRoom, setHostGraceRoom] = useState<string | null>(null)
  const [hostSecondsLeft, setHostSecondsLeft] = useState<number>(0)

  useEffect(() => {
    const savedName = localStorage.getItem("space_username")
    if (savedName && savedName.trim()) {
      setUserName(savedName.trim())
    }
    const savedAvatar = localStorage.getItem("space_avatar")
    if (savedAvatar && savedAvatar.trim()) {
      setSelectedAvatar(savedAvatar.trim())
    }
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/livekit/rooms")
      if (res.ok) {
        const data = await res.json()
        setRooms(data.data || [])
        setRecentRooms(data.recent || [])
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

  // Check host disconnect timer across active rooms
  useEffect(() => {
    if (!userName.trim() || rooms.length === 0) {
      setHostGraceRoom(null)
      setHostSecondsLeft(0)
      return
    }

    const checkHostDisconnect = () => {
      let activeGraceRoom: string | null = null
      let minSeconds = 0

      for (const room of rooms) {
        if (room.host === userName.trim()) {
          const disconnectTimeStr = localStorage.getItem(
            `space_host_disconnected_${room.name}`
          )
          if (disconnectTimeStr) {
            const disconnectTime = parseInt(disconnectTimeStr, 10)
            const elapsed = Date.now() - disconnectTime
            if (elapsed < 60000) {
              const remaining = Math.ceil((60000 - elapsed) / 1000)
              activeGraceRoom = room.name
              minSeconds = remaining
              break
            } else {
              localStorage.removeItem(`space_host_disconnected_${room.name}`)
            }
          }
        }
      }

      setHostGraceRoom(activeGraceRoom)
      setHostSecondsLeft(minSeconds)
    }

    checkHostDisconnect()
    const timer = setInterval(checkHostDisconnect, 1000)
    return () => clearInterval(timer)
  }, [rooms, userName])

  const handleJoin = async (
    room: string,
    nameToUse?: string,
    avatarToUse?: string
  ) => {
    const finalName = (nameToUse ?? userName).trim()
    const finalAvatar = (avatarToUse ?? selectedAvatar).trim() || "Felix"
    if (!finalName) return
    setIsJoining(true)
    localStorage.setItem("space_username", finalName)
    localStorage.setItem("space_avatar", finalAvatar)
    localStorage.setItem(
      `space_identity_${room}`,
      JSON.stringify({ name: finalName, avatar: finalAvatar })
    )
    const savedSecret = localStorage.getItem(`space_host_secret_${room}`) || ""
    setHostSecret(savedSecret)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const query = new URLSearchParams({
        room,
        username: finalName,
        avatar: finalAvatar,
      })
      if (savedSecret) query.set("hostSecret", savedSecret)
      const res = await fetch(`${apiUrl}/api/livekit/token?${query.toString()}`)
      const data = await res.json()
      if (data.data?.token) {
        setToken(data.data.token)
        setActiveRoomName(room)
        setUserName(finalName)
        setSelectedAvatar(finalAvatar)
        setHasJoined(true)
        setIsJoinOpen(false)
        setIsCreateOpen(false)
        // Clear host disconnect timer upon joining
        localStorage.removeItem(`space_host_disconnected_${room}`)
        setHostGraceRoom(null)
        setHostSecondsLeft(0)
      } else {
        toast.add({
          title:
            "Failed to connect: " + (data.error?.message || "Unknown error"),
          type: "error",
        })
      }
    } catch {
      toast.add({ title: "Failed to connect to LiveKit server", type: "error" })
    } finally {
      setIsJoining(false)
    }
  }

  const handleCreateAndJoin = async () => {
    if (!newSpaceName.trim() || !userName.trim()) return
    setIsJoining(true)
    const finalName = userName.trim()
    const finalAvatar = selectedAvatar.trim() || "Felix"
    localStorage.setItem("space_username", finalName)
    localStorage.setItem("space_avatar", finalAvatar)
    try {
      const res = await fetch("/api/livekit/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: newSpaceName,
          hostName: finalName,
          avatar: finalAvatar,
        }),
      })
      const data = await res.json()
      if (res.ok && data.data?.token) {
        const createdRoom = data.data.roomName
        localStorage.setItem(
          `space_identity_${createdRoom}`,
          JSON.stringify({ name: finalName, avatar: finalAvatar })
        )
        setToken(data.data.token)
        setActiveRoomName(createdRoom)
        const secret = data.data.hostSecret || ""
        setHostSecret(secret)
        if (secret)
          localStorage.setItem(`space_host_secret_${createdRoom}`, secret)
        setHasJoined(true)
        setIsJoinOpen(false)
        setIsCreateOpen(false)
        setNewSpaceName("")
      } else {
        toast.add({
          title:
            "Failed to create room: " +
            (data.error?.message || "Unknown error"),
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
    const savedIdentityStr =
      typeof window !== "undefined"
        ? localStorage.getItem(`space_identity_${roomName}`)
        : null
    if (savedIdentityStr) {
      try {
        const parsed = JSON.parse(savedIdentityStr)
        if (parsed.name) {
          handleJoin(roomName, parsed.name, parsed.avatar || "Felix")
          return
        }
      } catch {}
    }
    // If not previously joined this space, open the join popover with editable name/avatar
    setSelectedRoom(roomName)
    joinAnchorRef.current = el ?? null
    setIsJoinNameLocked(false)
    setIsJoinAvatarLocked(false)
    setIsJoinOpen(true)
  }

  if (hasJoined && token) {
    return (
      <SpaceRoomLiveKit
        roomName={activeRoomName}
        userName={userName}
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

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-4 pb-32 md:p-6 md:pb-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                Active Spaces
              </h1>
              {userName && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  <img
                    src={getAvatarUrl(selectedAvatar)}
                    alt=""
                    className="size-4 rounded-full object-cover"
                  />
                  <span>{userName}</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Select an active space to join the conversation.
            </p>
          </div>

          <Popover open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <PopoverTrigger
              render={
                <Button className="w-full gap-2 sm:w-auto">
                  <RiAddLine size={16} />
                  Start Space
                </Button>
              }
            />
            <PopoverContent
              side="bottom"
              align="end"
              className="w-84 max-w-[calc(100vw-1.5rem)] p-3.5 sm:w-88"
            >
              <PopoverHeader className="pb-0.5">
                <PopoverTitle className="text-sm font-semibold">
                  Start a new space
                </PopoverTitle>
                <PopoverDescription className="text-[11px]">
                  Pick a character and title to start.
                </PopoverDescription>
              </PopoverHeader>
              <form
                className="space-y-2.5 pt-1"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleCreateAndJoin()
                }}
              >
                <AvatarPicker
                  selectedAvatar={selectedAvatar}
                  onSelectAvatar={setSelectedAvatar}
                  isLocked={false}
                />

                <Field className="gap-1">
                  <FieldLabel
                    htmlFor="create-space-name"
                    className="text-xs font-medium"
                  >
                    Space Title
                  </FieldLabel>
                  <Input
                    id="create-space-name"
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                    placeholder="e.g. Design Critique"
                    maxLength={30}
                    className="h-8 text-xs"
                    autoFocus
                  />
                </Field>
                <Field className="gap-1">
                  <FieldLabel
                    htmlFor="create-user-name"
                    className="text-xs font-medium"
                  >
                    Your Name
                  </FieldLabel>
                  <Input
                    id="create-user-name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="What should we call you?"
                    maxLength={15}
                    className="h-8 text-xs"
                  />
                </Field>
                <div className="pt-1">
                  {userName.trim() &&
                    rooms.some((r) => r.host === userName.trim()) && (
                      <div className="mb-2 text-xs font-medium text-destructive">
                        You are already hosting an active space.
                      </div>
                    )}
                  <Button
                    type="submit"
                    className="h-8.5 w-full text-xs font-medium"
                    disabled={
                      !newSpaceName.trim() ||
                      !userName.trim() ||
                      isJoining ||
                      rooms.some((r) => r.host === userName.trim())
                    }
                  >
                    {isJoining ? <Spinner className="mr-2 size-3.5" /> : null}
                    Start & Join Space
                  </Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Spinner />
          </div>
        ) : rooms.length === 0 ? (
          <Empty className="rounded-xl border border-dashed border-border bg-card py-20">
            <EmptyMedia variant="icon">
              <RiTeamLine />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>It&apos;s quiet in here.</EmptyTitle>
              <EmptyDescription>
                No active spaces right now. Be the first to start one.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const isUserHost = room.host === userName.trim()
              const isRoomInGrace =
                isUserHost && hostGraceRoom === room.name && hostSecondsLeft > 0
              const shortTag = room.name.includes("-")
                ? room.name.split("-").pop()
                : null

              return (
                <button
                  key={room.name}
                  type="button"
                  onClick={(e) => onRoomClick(room.name, e.currentTarget)}
                  className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card p-5 text-left shadow-xs transition-all hover:border-primary/50 ${
                    isRoomInGrace ? "ring-1 ring-primary/40" : ""
                  }`}
                >
                  <div className="mb-6 flex w-full items-start justify-between">
                    <div className="truncate pr-4">
                      <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-primary">
                        {room.displayName || room.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span>Host: {room.host}</span>
                        {isUserHost && (
                          <span className="py-0.2 inline-flex items-center gap-0.5 rounded border border-primary/20 bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                            <RiShieldCheckLine className="size-2.5" /> You
                          </span>
                        )}
                        {shortTag && (
                          <span className="font-mono text-xs text-muted-foreground/50">
                            #{shortTag}
                          </span>
                        )}
                      </p>
                    </div>
                    {isRoomInGrace ? (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-primary/20 bg-primary/10 font-mono text-xs text-primary"
                      >
                        <RiTimerLine className="mr-1 inline size-3" />
                        Rejoin • {hostSecondsLeft}s
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-emerald-500/20 bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                      >
                        <span className="mr-1 size-1.5 animate-pulse rounded-full bg-emerald-500" />
                        Live
                      </Badge>
                    )}
                  </div>

                  <div className="mt-auto flex w-full items-center justify-between">
                    <div className="flex -space-x-2">
                      {room.participants.slice(0, 5).map((p, idx) => (
                        <div
                          key={idx}
                          className="relative size-7 overflow-hidden rounded-full border-2 border-background bg-muted"
                        >
                          <img
                            src={getAvatarUrl(getParticipantAvatar(p))}
                            alt={getParticipantIdentity(p)}
                            className="size-full object-contain p-0.5"
                          />
                        </div>
                      ))}
                      {room.participants.length > 5 && (
                        <div className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
                          +{room.participants.length - 5}
                        </div>
                      )}
                    </div>

                    {isRoomInGrace ? (
                      <div className="flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover:underline">
                        Rejoin as Host
                        <RiArrowRightLine size={15} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                        {room.numParticipants}{" "}
                        {room.numParticipants === 1 ? "speaker" : "speakers"}
                        <RiArrowRightSLine size={16} />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Recent Spaces Section */}
        {recentRooms.length > 0 && (
          <div className="mt-14">
            <div className="mb-4 flex items-center gap-2">
              <RiHistoryLine className="size-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold tracking-tight">
                Recent Spaces
              </h2>
            </div>
            <p className="-mt-3 mb-5 text-sm text-muted-foreground">
              Spaces that were recently active and concluded.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentRooms.map((recent) => {
                const shortTag = recent.name.includes("-")
                  ? recent.name.split("-").pop()
                  : null
                return (
                  <div
                    key={`${recent.name}-${recent.endedAt}`}
                    className="relative flex cursor-not-allowed flex-col rounded-xl border border-dashed border-border/70 bg-card/40 p-5 text-left opacity-80 transition-opacity select-none"
                    aria-disabled="true"
                  >
                    <div className="mb-5 flex w-full items-start justify-between">
                      <div className="truncate pr-4">
                        <h3 className="truncate text-base font-semibold text-muted-foreground">
                          {recent.displayName || recent.name}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground/70">
                          <span>
                            Host: {recent.host} •{" "}
                            {formatTimeAgo(recent.endedAt)}
                          </span>
                          {shortTag && (
                            <span className="font-mono text-[10px] opacity-70">
                              #{shortTag}
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 border-border text-[11px] text-muted-foreground"
                      >
                        Ended
                      </Badge>
                    </div>

                    <div className="mt-auto flex w-full items-center justify-between">
                      <div className="flex -space-x-2 opacity-70 grayscale">
                        {recent.speakers.slice(0, 5).map((speaker, idx) => (
                          <div
                            key={idx}
                            className="relative size-7 overflow-hidden rounded-full border-2 border-background bg-muted"
                          >
                            <img
                              src={getAvatarUrl(speaker)}
                              alt={speaker}
                              className="size-full object-cover"
                            />
                          </div>
                        ))}
                        {recent.speakers.length > 5 && (
                          <div className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
                            +{recent.speakers.length - 5}
                          </div>
                        )}
                      </div>

                      <div className="text-xs font-medium text-muted-foreground/70">
                        Host ended space
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Join Space Popover */}
      <Popover open={isJoinOpen} onOpenChange={setIsJoinOpen}>
        <PopoverContent
          side="top"
          align="center"
          className="w-84 max-w-[calc(100vw-1.5rem)] p-3.5 sm:w-88"
          anchor={joinAnchorRef.current ?? undefined}
        >
          <PopoverHeader className="pb-0.5">
            <PopoverTitle className="text-sm font-semibold">
              Join{" "}
              {rooms.find((r) => r.name === selectedRoom)?.displayName ||
                selectedRoom}
            </PopoverTitle>
            <PopoverDescription className="text-[11px]">
              Confirm your character and identity to enter.
            </PopoverDescription>
          </PopoverHeader>
          <form
            className="space-y-2.5 pt-1"
            onSubmit={(e) => {
              e.preventDefault()
              handleJoin(selectedRoom)
            }}
          >
            <AvatarPicker
              selectedAvatar={selectedAvatar}
              onSelectAvatar={setSelectedAvatar}
              isLocked={isJoinAvatarLocked}
            />

            <Field className="gap-1">
              <div className="flex items-center justify-between">
                <FieldLabel
                  htmlFor="join-user-name"
                  className="text-xs font-medium"
                >
                  Your Name
                </FieldLabel>
                {isJoinNameLocked && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <RiLockLine className="size-3" /> Locked
                  </span>
                )}
              </div>
              <Input
                id="join-user-name"
                value={userName}
                onChange={(e) =>
                  !isJoinNameLocked && setUserName(e.target.value)
                }
                placeholder="What should we call you?"
                maxLength={15}
                disabled={isJoinNameLocked}
                className={`h-8 text-xs ${isJoinNameLocked ? "cursor-not-allowed bg-muted/40 text-foreground opacity-90" : ""}`}
                autoFocus={!isJoinNameLocked}
              />
            </Field>
            <div className="pt-1">
              <Button
                type="submit"
                className="h-8.5 w-full text-xs font-medium"
                disabled={!userName.trim() || isJoining}
              >
                {isJoining ? <Spinner className="mr-2 size-3.5" /> : null}
                Join Space
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}
