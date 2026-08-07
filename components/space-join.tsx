"use client"

import { RiShuffleLine, RiMicLine } from "@remixicon/react"
import { useParams, useRouter } from "next/navigation"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { CharacterPicker } from "@/components/common/character-picker"
import { SpaceEnded } from "@/components/ended-space"
import { Navbar } from "@/components/common/navbar"
import { SpaceRoomLiveKit } from "@/components/livekit-room"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

import { randomUserpic, userpicUrl } from "@/lib/userpics"
import {
  findTemplate,
  stripRoomCode,
  toSlug,
  genRoomCode,
  ROOM_CODE_PATTERN,
} from "@/lib/presets"
import type { EndedSpace } from "@/lib/ended-spaces"

export function SpaceJoin() {
  const params = useParams<{ name?: string | string[] }>()
  const router = useRouter()

  const getRouteRoom = useCallback(() => {
    if (params?.name) {
      const raw = Array.isArray(params.name) ? params.name[0] : params.name
      if (raw) return decodeURIComponent(raw).trim()
    }
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/").filter(Boolean)
      const spaceIdx = parts.indexOf("space")
      if (spaceIdx !== -1 && parts[spaceIdx + 1]) {
        return decodeURIComponent(parts[spaceIdx + 1]).trim()
      }
    }
    return ""
  }, [params])

  const initialRoom = getRouteRoom()
  const initialPreset = findTemplate(initialRoom)
  const initialCode = ROOM_CODE_PATTERN.exec(initialRoom)?.[0]?.slice(1) ?? ""
  const [spaceName, setSpaceName] = useState(() =>
    initialPreset ? initialPreset.title : stripRoomCode(getRouteRoom())
  )
  const [roomCode, setRoomCode] = useState(initialCode)
  const codeAssignedRef = useRef(Boolean(initialCode))
  const [userName, setUserName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [token, setToken] = useState("")
  const [activeRoomName, setActiveRoomName] = useState("")
  const [hostSecret, setHostSecret] = useState("")
  const [endedSpace, setEndedSpace] = useState<EndedSpace | null>(null)
  const [avatarSeed, setAvatarSeed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("better_space_active_avatar")
      if (saved) return saved
    }
    return randomUserpic()
  })

  useEffect(() => {
    const current = getRouteRoom()
    if (current) {
      const preset = findTemplate(current)
      setSpaceName(preset ? preset.title : stripRoomCode(current))
    }
    const savedName = localStorage.getItem("space_username")
    if (savedName) {
      setUserName(savedName)
    }
  }, [getRouteRoom])

  /* Assign a stable room code once, when a name first exists */
  useEffect(() => {
    const trimmed = spaceName.trim()
    if (!trimmed) return
    if (codeAssignedRef.current) return
    codeAssignedRef.current = true
    setRoomCode(genRoomCode())
  }, [spaceName])

  const effectiveRoom = useMemo(() => {
    const trimmed = spaceName.trim()
    const preset = findTemplate(trimmed || getRouteRoom())
    const slug = preset ? preset.name : toSlug(trimmed)
    if (!slug) return ""
    return roomCode ? `${slug}-${roomCode}` : slug
  }, [spaceName, roomCode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!effectiveRoom) return
    const target = `/space/${encodeURIComponent(effectiveRoom)}`
    if (getRouteRoom() !== effectiveRoom) {
      window.history.replaceState(null, "", target)
    }
  }, [effectiveRoom]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Pre-join mount check for ended spaces */
  useEffect(() => {
    if (!effectiveRoom) return
    let active = true

    const checkStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
        const res = await fetch(
          `${apiUrl}/api/livekit/token?room=${encodeURIComponent(effectiveRoom)}`
        )
        const data = await res.json()
        if (!active) return

        if (res.status === 410 || data.ended || data.data?.ended) {
          const info = data.space || data.data?.endedInfo
          setEndedSpace(
            (info as EndedSpace) || {
              name: effectiveRoom,
              endedAt: Date.now(),
              host: "Unknown",
              cohosts: [],
              speakers: [],
            }
          )
        }
      } catch {
        // Passive check; error handling on submit
      }
    }

    checkStatus()

    return () => {
      active = false
    }
  }, [effectiveRoom])

  const matchingPreset = findTemplate(spaceName || initialRoom)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanRoom = effectiveRoom
    const cleanUser = userName.trim()

    if (!cleanRoom) {
      toast.add({ title: "Please enter a space name", type: "error" })
      return
    }

    if (!cleanUser) {
      toast.add({ title: "Please enter your name", type: "error" })
      return
    }

    setIsJoining(true)
    localStorage.setItem("space_username", cleanUser)
    localStorage.setItem("better_space_active_avatar", avatarSeed)
    localStorage.setItem(
      `space_profile_${cleanRoom}`,
      JSON.stringify({ userName: cleanUser, avatarSeed })
    )

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const query = new URLSearchParams({
        room: cleanRoom,
        username: cleanUser,
        avatar: avatarSeed,
      })
      const savedSecret =
        localStorage.getItem(`space_host_secret_${cleanRoom}`) || ""
      const res = await fetch(`${apiUrl}/api/livekit/token?${query.toString()}`, {
        headers: savedSecret ? { "x-host-secret": savedSecret } : undefined,
      })
      const data = await res.json()

      if (res.status === 410 || data.ended || data.data?.ended) {
        const info = data.space || data.data?.endedInfo
        setEndedSpace(
          (info as EndedSpace) || {
            name: cleanRoom,
            endedAt: Date.now(),
            host: "Unknown",
            cohosts: [],
            speakers: [],
          }
        )
        return
      }

      if (data.data?.token) {
        const receivedSecret = data.data.hostSecret || savedSecret
        if (receivedSecret) {
          localStorage.setItem(`space_host_secret_${cleanRoom}`, receivedSecret)
          setHostSecret(receivedSecret)
        }
        setToken(data.data.token)
        setActiveRoomName(cleanRoom)
        setHasJoined(true)
        if (cleanRoom !== initialRoom) {
          window.history.replaceState(
            null,
            "",
            `/space/${encodeURIComponent(cleanRoom)}`
          )
        }
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

  if (endedSpace) {
    return <SpaceEnded space={endedSpace} />
  }

  if (hasJoined && token && activeRoomName) {
    return (
      <SpaceRoomLiveKit
        roomName={activeRoomName}
        userName={userName}
        token={token}
        hostSecret={hostSecret}
        onLeave={() => {
          setHasJoined(false)
          setToken("")
          router.push("/lobby")
        }}
      />
    )
  }

  const hasName = Boolean(spaceName.trim())

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Navbar />

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center p-4 sm:p-6">
        <div className="mb-8 flex flex-col items-center text-center">
          <span
            className={`font-display text-xl font-bold tracking-tight sm:text-2xl ${
              hasName ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {spaceName.trim() || "Name your space"}
          </span>
          {effectiveRoom ? (
            <span className="mt-2 font-mono text-[11px] text-muted-foreground">
              /space/{effectiveRoom}
            </span>
          ) : null}
          {matchingPreset && (
            <span className="mt-2 rounded-full bg-muted px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Template
            </span>
          )}
        </div>

        <form className="w-full space-y-4 text-left" onSubmit={handleJoin}>
          {/* Space Name Input */}
          <Field className="space-y-1.5">
            <FieldLabel
              htmlFor="space-name-input"
              className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase"
            >
              Space Name
            </FieldLabel>
            <Input
              id="space-name-input"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              placeholder="Name your space"
              maxLength={65}
              autoComplete="off"
              className="h-11 rounded-xl border-border bg-card font-display text-sm transition-colors hover:border-foreground/40 focus:border-foreground"
            />
          </Field>

          {/* Avatar Picker */}
          <div className="space-y-2.5">
            <FieldLabel
              htmlFor="persona-trigger"
              className="block font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase"
            >
              Persona
            </FieldLabel>
            <div className="flex items-center gap-3">
              <div className="group relative inline-block shrink-0">
                <CharacterPicker
                  value={avatarSeed}
                  onSelect={setAvatarSeed}
                  size="md"
                  trigger={
                    <button
                      id="persona-trigger"
                      type="button"
                      className="relative block cursor-pointer rounded-full focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:outline-none"
                      title="Choose your persona"
                    >
                      <Avatar className="size-14 border-2 border-border bg-muted shadow-sm transition-transform group-hover:scale-105">
                        <AvatarImage
                          src={userpicUrl(avatarSeed)}
                          alt="Your persona"
                          className="object-cover"
                        />
                        <AvatarFallback />
                      </Avatar>
                    </button>
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => setAvatarSeed(randomUserpic())}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 font-mono text-xs font-semibold text-foreground transition-all hover:bg-muted active:scale-95"
                title="Randomize persona"
              >
                <RiShuffleLine size={13} />
                Shuffle
              </button>
            </div>
          </div>

          {/* Username Input */}
          <Field className="space-y-1.5">
            <FieldLabel
              htmlFor="join-user-name"
              className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase"
            >
              Your Name
            </FieldLabel>
            <Input
              id="join-user-name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              autoComplete="off"
              autoFocus={!userName}
              className="h-11 rounded-xl border-border text-sm transition-colors hover:border-foreground/40 focus:border-foreground"
            />
          </Field>

          {/* Submit Button */}
          <Button
            type="submit"
            className="h-12 w-full gap-2 rounded-xl bg-foreground font-mono font-bold tracking-wider text-background uppercase transition-all hover:bg-foreground/90"
            disabled={!userName.trim() || !spaceName.trim() || isJoining}
          >
            {isJoining ? (
              <Spinner className="mr-2" />
            ) : (
              <RiMicLine size={16} aria-hidden="true" />
            )}
            <span>{isJoining ? "Connecting..." : "Go live"}</span>
          </Button>

          <p className="font-google-sans text-center text-[12px] text-muted-foreground">
            No account. No mic until you want it.
          </p>
        </form>
      </main>
    </div>
  )
}
