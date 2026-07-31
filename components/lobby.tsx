/* eslint-disable @next/next/no-img-element */
"use client"

import { RiAddLine, RiTeamLine, RiArrowRightSLine } from "@remixicon/react"
import React, { useState, useEffect, useRef } from "react"

import { Navbar } from "@/components/common/navbar"
import { SpaceRoomLiveKit } from "@/components/livekit-room"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
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
  participants: string[]
}

export function Lobby() {
  const [rooms, setRooms] = useState<RoomInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem("space_username")
    if (saved) {
      setUserName(saved)
    }

    const interval = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

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
    const interval = setInterval(fetchRooms, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleJoin = async (room: string) => {
    if (!userName.trim()) return
    setIsJoining(true)
    localStorage.setItem("space_username", userName.trim())
    const savedSecret = localStorage.getItem(`space_host_secret_${room}`) || ""
    setHostSecret(savedSecret)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const query = new URLSearchParams({ room, username: userName.trim() })
      if (savedSecret) query.set("hostSecret", savedSecret)
      const res = await fetch(`${apiUrl}/api/livekit/token?${query.toString()}`)
      const data = await res.json()
      if (data.data?.token) {
        setToken(data.data.token)
        setActiveRoomName(room)
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
    if (!newSpaceName.trim() || !userName.trim()) return
    setIsJoining(true)
    localStorage.setItem("space_username", userName.trim())
    try {
      const res = await fetch("/api/livekit/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: newSpaceName, hostName: userName }),
      })
      const data = await res.json()
      if (res.ok && data.data?.token) {
        setToken(data.data.token)
        setActiveRoomName(newSpaceName)
        const secret = data.data.hostSecret || ""
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
    if (userName.trim()) {
      handleJoin(roomName)
    } else {
      setSelectedRoom(roomName)
      joinAnchorRef.current = el ?? null
      setIsJoinOpen(true)
    }
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

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-4 md:p-6">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Active Spaces</h1>
            <p className="text-muted-foreground mt-1">
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
                  <FieldLabel htmlFor="create-user-name">Your Name</FieldLabel>
                  <Input
                    id="create-user-name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="What should we call you?"
                    maxLength={15}
                  />
                </Field>
                <div className="pt-2">
                  {userName.trim() && rooms.some((r) => r.host === userName.trim()) && (
                    <div className="text-destructive text-sm font-medium mb-3">
                      You are already hosting a space.
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !newSpaceName.trim() || 
                      !userName.trim() || 
                      isJoining || 
                      rooms.some((r) => r.host === userName.trim())
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
          <Empty className="border-border bg-card rounded-xl border border-dashed py-24">
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
              const disconnectTimeStr = typeof window !== "undefined" ? localStorage.getItem(`space_host_disconnected_${room.name}`) : null;
              let timeLeft = 0;
              if (disconnectTimeStr && room.host === userName) {
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
                  className="bg-card border-border hover:border-border/80 flex flex-col rounded-xl border p-5 text-left shadow-sm transition-colors relative overflow-hidden"
                >
                  {timeLeft > 0 && (
                    <div className="absolute top-0 left-0 right-0 bg-warning text-warning-foreground text-[10px] font-bold text-center py-0.5 animate-pulse">
                      Host disconnected. Rejoin within {timeLeft}s!
                    </div>
                  )}
                  <div className={`mb-6 flex w-full items-start justify-between ${timeLeft > 0 ? 'mt-2' : ''}`}>
                    <div className="truncate pr-4">
                      <h3 className="truncate text-lg font-semibold">{room.name}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">Host: {room.host}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-success/10 text-success border-success/20 shrink-0"
                    >
                      Live
                    </Badge>
                  </div>

                <div className="mt-auto flex w-full items-center justify-between">
                  <div className="flex -space-x-2">
                    {room.participants.slice(0, 5).map((p) => (
                      <div
                        key={p}
                        className="bg-muted border-background relative size-7 overflow-hidden rounded-full border-2"
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p}&backgroundColor=ffffff`}
                          alt={p}
                          className="size-full object-cover"
                        />
                      </div>
                    ))}
                    {room.participants.length > 5 && (
                      <div className="bg-muted border-background text-muted-foreground flex size-7 items-center justify-center rounded-full border-2 text-[10px] font-medium">
                        +{room.participants.length - 5}
                      </div>
                    )}
                  </div>

                  <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                    {room.numParticipants} {room.numParticipants === 1 ? "speaker" : "speakers"}
                    <RiArrowRightSLine size={16} />
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
              <FieldLabel htmlFor="join-user-name">Your Name</FieldLabel>
              <Input
                id="join-user-name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="What should we call you?"
                maxLength={15}
                autoFocus
              />
            </Field>
            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={!userName.trim() || isJoining}>
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
