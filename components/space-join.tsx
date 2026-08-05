"use client"

import { RiArrowLeftLine, RiShuffleLine, RiEditLine } from "@remixicon/react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { CharacterPicker } from "@/components/common/character-picker"
import { Navbar } from "@/components/common/navbar"
import { SpaceRoomLiveKit } from "@/components/livekit-room"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

import { randomUserpic, userpicUrl } from "@/lib/userpics"

export function SpaceJoin() {
  const params = useParams<{ name: string }>()
  const router = useRouter()
  const initialRoom = (params?.name ? decodeURIComponent(params.name) : "").trim()

  const [spaceName, setSpaceName] = useState(initialRoom)
  const [userName, setUserName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [token, setToken] = useState("")
  const [activeRoomName, setActiveRoomName] = useState("")
  const [hostSecret, setHostSecret] = useState("")
  const [avatarSeed, setAvatarSeed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("better_space_active_avatar")
      if (saved) return saved
    }
    return randomUserpic()
  })

  useEffect(() => {
    if (initialRoom) {
      setSpaceName(initialRoom)
    }
    const savedName = localStorage.getItem("space_username")
    if (savedName) {
      setUserName(savedName)
    }
  }, [initialRoom])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanRoom = spaceName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-") || initialRoom || "live-space"
    const cleanUser = userName.trim()

    if (!cleanUser) {
      toast.add({ title: "Please enter your name", type: "error" })
      return
    }

    setIsJoining(true)
    localStorage.setItem("space_username", cleanUser)
    localStorage.setItem("better_space_active_avatar", avatarSeed)
    localStorage.setItem(`space_profile_${cleanRoom}`, JSON.stringify({ userName: cleanUser, avatarSeed }))

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const query = new URLSearchParams({ room: cleanRoom, username: cleanUser, avatar: avatarSeed })
      const savedSecret = localStorage.getItem(`space_host_secret_${cleanRoom}`) || ""
      if (savedSecret) query.set("hostSecret", savedSecret)

      const res = await fetch(`${apiUrl}/api/livekit/token?${query.toString()}`)
      const data = await res.json()

      if (data.data?.token) {
        setToken(data.data.token)
        setActiveRoomName(cleanRoom)
        setHostSecret(savedSecret)
        setHasJoined(true)
        if (cleanRoom !== initialRoom) {
          window.history.replaceState(null, "", `/space/${encodeURIComponent(cleanRoom)}`)
        }
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

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Navbar />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4 sm:p-6 text-center">
        <div className="flex flex-col items-center w-full">
          <Link
            href="/lobby"
            className="text-muted-foreground hover:text-foreground mb-6 sm:mb-8 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors self-start sm:self-center"
          >
            <RiArrowLeftLine className="size-4" aria-hidden="true" />
            <span>Lobby</span>
          </Link>

          {/* Heading */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-foreground">
              Enter Voice Space
            </h1>
            <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm">
              Customize your space name, pick an avatar, and enter your display name.
            </p>
          </div>

          <form
            className="w-full space-y-4 sm:space-y-5 text-left"
            onSubmit={handleJoin}
          >
            {/* Space Name Input (Editable Template/Room Name) */}
            <Field className="space-y-1.5">
              <FieldLabel htmlFor="space-name-input" className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Space Name
              </FieldLabel>
              <div className="relative">
                <Input
                  id="space-name-input"
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-"))}
                  placeholder="e.g. techtwitter-india"
                  maxLength={35}
                  className="h-11 sm:h-12 font-mono text-sm rounded-xl bg-card border-border hover:border-foreground/40 focus:border-foreground transition-colors"
                />
              </div>
            </Field>

            {/* Avatar Picker (Always Editable) */}
            <div className="flex flex-col items-center gap-2.5 py-2">
              <span className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Your Character Avatar
              </span>
              <div className="flex items-center gap-3">
                <div className="relative group inline-block">
                  <CharacterPicker
                    value={avatarSeed}
                    onSelect={setAvatarSeed}
                    size="md"
                    trigger={
                      <button
                        type="button"
                        className="relative block rounded-full focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 cursor-pointer"
                        title="Click to choose avatar persona"
                      >
                        <Avatar className="border-border bg-muted size-20 sm:size-24 border-2 shadow-sm transition-transform group-hover:scale-105">
                          <AvatarImage
                            src={userpicUrl(avatarSeed)}
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
                        <div className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-md border-2 border-background">
                          <RiEditLine size={14} />
                        </div>
                      </button>
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setAvatarSeed(randomUserpic())}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted font-mono text-xs font-semibold text-foreground transition-all active:scale-95 shadow-xs cursor-pointer"
                  title="Randomize avatar"
                >
                  <RiShuffleLine size={13} />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>

            {/* Username Input (Always Editable) */}
            <Field className="space-y-1.5">
              <FieldLabel htmlFor="join-user-name" className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Your Display Name
              </FieldLabel>
              <Input
                id="join-user-name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                autoFocus={!userName}
                className="h-11 sm:h-12 text-sm sm:text-base rounded-xl bg-card border-border hover:border-foreground/40 focus:border-foreground transition-colors"
              />
            </Field>

            {/* Submit Button */}
            <Button
              type="submit"
              className="h-11 sm:h-12 w-full text-sm sm:text-base rounded-xl font-bold uppercase tracking-wider font-mono bg-foreground text-background hover:bg-foreground/90 transition-all"
              disabled={!userName.trim() || !spaceName.trim() || isJoining}
            >
              {isJoining ? <Spinner className="mr-2" /> : null}
              <span>{isJoining ? "Connecting..." : "Join / Launch Space"}</span>
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
