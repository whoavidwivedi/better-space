/* eslint-disable @next/next/no-img-element */
"use client"

import { RiAddLine, RiTeamLine, RiArrowRightSLine } from "@remixicon/react"
import React, { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RiShuffleLine } from "@remixicon/react"

import { Navbar } from "@/components/common/navbar"
import { SpaceRoomLiveKit } from "@/components/livekit-room"
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

  const [createAvatarSeed, setCreateAvatarSeed] = useState(() => Math.random().toString(36).substring(2, 9))
  const [joinAvatarSeed, setJoinAvatarSeed] = useState(() => Math.random().toString(36).substring(2, 9))
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
    const uName = joinUserName.trim();
    if (!uName) return;
    setIsJoining(true)
    const savedSecret = localStorage.getItem(`space_host_secret_${roomName}`) || ""
    setHostSecret(savedSecret)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const query = new URLSearchParams({ room: roomName, username: uName.trim(), avatar: joinAvatarSeed })
      if (savedSecret) query.set("hostSecret", savedSecret)
      const res = await fetch(`${apiUrl}/api/livekit/token?${query.toString()}`)
      const data = await res.json()
      if (data.data?.token) {
        setActiveUserName(uName)
        localStorage.setItem(`space_profile_${roomName}`, JSON.stringify({ userName: uName, avatarSeed: joinAvatarSeed }))
        setToken(data.data.token)
        setActiveRoomName(roomName)
        setHasJoined(true)
        setIsJoinOpen(false)
        setIsCreateOpen(false)
      } else {
        toast.add({
          title: "Failed to connect: " + (data.error?.message || "Unknown error"),
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
    const uName = createUserName.trim()
    if (!uName) return
    if (!newSpaceName.trim() || !uName) return
    setIsJoining(true)
    localStorage.setItem("space_username", uName)
    try {
      const res = await fetch("/api/livekit/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: newSpaceName, hostName: uName, avatar: createAvatarSeed }),
      })
      const data = await res.json()
      if (res.ok && data.data?.token) {
        setToken(data.data.token)
        setActiveRoomName(newSpaceName)
        const secret = data.data.hostSecret
        setActiveUserName(uName)
        localStorage.setItem(`space_profile_${newSpaceName}`, JSON.stringify({ userName: uName, avatarSeed: createAvatarSeed }))
        setHostSecret(secret)
        if (secret) localStorage.setItem(`space_host_secret_${data.data.roomName}`, secret)
        setHasJoined(true)
        setIsJoinOpen(false)
        setIsCreateOpen(false)
      } else {
        toast.add({
          title: "Failed to create room: " + (data.error?.message || "Unknown error"),
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

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-4 md:p-6">
        <div className="mb-12 mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Active Spaces</h1>
            <p className="text-muted-foreground mt-2">
              Select an active space to join the conversation.
            </p>
          </div>

          <Popover open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <PopoverTrigger
              render={
                <Button className="w-full gap-2 sm:w-auto font-medium">
                  <RiAddLine size={18} />
                  Start Space
                </Button>
              }
            />
            <PopoverContent side="bottom" align="end" className="w-80">
              <PopoverHeader>
                <PopoverTitle>Start a new space</PopoverTitle>
                <PopoverDescription>
                  Pick a name for your space and jump in. Friends can join from the lobby.
                </PopoverDescription>
              </PopoverHeader>
              <form
                className="space-y-4 pt-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleCreateAndJoin()
                }}
              >
                <Field>
                  <FieldLabel htmlFor="create-space-name">Space Name</FieldLabel>
                  <Input
                    id="create-space-name"
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                    placeholder="e.g. design-critique"
                    maxLength={30}
                  />
                </Field>
                <Field>
                  <div className="flex flex-col items-center gap-4 mb-4 mt-2">
                    <div className="relative group/avatar inline-block">
                      <Avatar className="border-border bg-muted size-20 border-2">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${createAvatarSeed}&backgroundColor=ffffff`}
                          alt="Avatar preview"
                          className="object-contain"
                        />
                        <AvatarFallback />
                      </Avatar>
                      <button
                        type="button"
                        onClick={() => setCreateAvatarSeed(Math.random().toString(36).substring(2, 9))}
                        className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-foreground text-background shadow-md transition-transform hover:scale-110 focus:outline-none"
                      >
                        <RiShuffleLine size={14} />
                      </button>
                    </div>
                  </div>
                  <FieldLabel htmlFor="create-user-name">Your Name</FieldLabel>
                  <Input
                    id="create-user-name"
                    value={createUserName}
                    onChange={(e) => setCreateUserName(e.target.value)}
                    placeholder="What should we call you?"
                    maxLength={15}
                  />
                </Field>
                <div className="pt-2">
                  {createUserName.trim() && rooms.some((r) => r.host === createUserName.trim()) && (
                    <div className="text-destructive text-sm font-medium mb-3">
                      You are already hosting a space.
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !newSpaceName.trim() || 
                      !createUserName.trim() ||
                      isJoining || 
                      rooms.some((r) => r.host === createUserName.trim())
                    }
                  >
                    {isJoining ? <Spinner className="mr-2" /> : null}
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
          <div className="flex flex-1 flex-col items-center justify-center py-32 text-center">
            <div className="bg-muted flex size-16 items-center justify-center rounded-2xl mb-6">
              <RiTeamLine className="text-muted-foreground size-8" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">It&apos;s quiet in here.</h3>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm">
              No active spaces right now. Be the first to start one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const disconnectTimeStr = typeof window !== "undefined" ? localStorage.getItem(`space_host_disconnected_${room.name}`) : null;
              let timeLeft = 0;
              if (disconnectTimeStr && room.host === activeUserName) {
                const disconnectTime = parseInt(disconnectTimeStr, 10);
                const elapsed = Date.now() - disconnectTime;
                if (elapsed < 60000) {
                  timeLeft = Math.ceil((60000 - elapsed) / 1000);
                }
              }

              return (
                <button
                  key={room.name}
                  onClick={(e) => onRoomClick(room.name, e.currentTarget)}
                  className="bg-card flex flex-col rounded-2xl border-none p-6 text-left shadow-sm transition-all hover:scale-[1.01] hover:shadow-md relative overflow-hidden ring-1 ring-border/50"
                >
                  {timeLeft > 0 && (
                    <div className="absolute top-0 left-0 right-0 bg-warning text-warning-foreground text-[10px] font-bold text-center py-0.5 animate-pulse">
                      Host disconnected. Rejoin within {timeLeft}s!
                    </div>
                  )}
                  <div className={`mb-8 flex w-full items-start justify-between ${timeLeft > 0 ? 'mt-2' : ''}`}>
                    <div className="truncate pr-4">
                      <h3 className="truncate text-lg font-semibold tracking-tight">{room.name}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">Host: {room.host}</p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success shrink-0">
                      <span className="size-1.5 rounded-full bg-success animate-pulse" />
                      Live
                    </div>
                  </div>

                  <div className="mt-auto flex w-full items-center justify-between">
                    <div className="flex -space-x-2">
                      {room.participants.slice(0, 5).map((p) => (
                        <div
                          key={p.identity}
                          className="bg-muted border-card relative size-8 overflow-hidden rounded-full border-2 shadow-sm"
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.avatar || p.identity}&backgroundColor=ffffff`}
                            alt={p.identity}
                            className="size-full object-cover"
                          />
                        </div>
                      ))}
                      {room.participants.length > 5 && (
                        <div className="bg-muted border-card text-muted-foreground flex size-8 items-center justify-center rounded-full border-2 text-[10px] font-medium shadow-sm">
                          +{room.participants.length - 5}
                        </div>
                      )}
                    </div>

                    <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                      {room.numParticipants} {room.numParticipants === 1 ? "speaker" : "speakers"}
                      <RiArrowRightSLine size={18} className="opacity-50" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>

      {/* Create Space Dialog */}
      {/* Join Space Popover */}
      <Popover open={isJoinOpen} onOpenChange={setIsJoinOpen}>
        <PopoverContent
          side="top"
          align="center"
          className="w-80"
          anchor={joinAnchorRef.current ?? undefined}
        >
          <PopoverHeader>
            <PopoverTitle>Join {selectedRoom}</PopoverTitle>
            <PopoverDescription>
              Tell us what to call you, then jump into the conversation.
            </PopoverDescription>
          </PopoverHeader>
          <form
            className="space-y-4 pt-2"
            onSubmit={(e) => {
              e.preventDefault()
              handleJoin(selectedRoom)
            }}
          >
            <Field>
              <div className="flex flex-col items-center gap-4 mb-4 mt-2">
                <div className="relative group/avatar inline-block">
                  <Avatar className="border-border bg-muted size-20 border-2">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${joinAvatarSeed}&backgroundColor=ffffff`}
                      alt="Avatar preview"
                      className="object-contain"
                    />
                    <AvatarFallback />
                  </Avatar>
                  {!isJoinProfileLocked && (
                    <button
                      type="button"
                      onClick={() => setJoinAvatarSeed(Math.random().toString(36).substring(2, 9))}
                      className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-foreground text-background shadow-md transition-transform hover:scale-110 focus:outline-none"
                    >
                      <RiShuffleLine size={14} />
                    </button>
                  )}
                </div>
              </div>
              <FieldLabel htmlFor="join-user-name">Your Name</FieldLabel>
              <Input
                id="join-user-name"
                value={joinUserName}
                onChange={(e) => setJoinUserName(e.target.value)}
                disabled={isJoinProfileLocked}
                placeholder="What should we call you?"
                maxLength={15}
                autoFocus
              />
            </Field>
            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={!joinUserName.trim() || isJoining}>
                {isJoining ? <Spinner className="mr-2" /> : null}
                Join Space
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}
