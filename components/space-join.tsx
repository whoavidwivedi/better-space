"use client"

import { RiArrowLeftLine, RiLockLine } from "@remixicon/react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import { AvatarPicker } from "@/components/common/avatar-picker"
import { Navbar } from "@/components/common/navbar"
import { SpaceRoomLiveKit } from "@/components/livekit-room"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

export function SpaceJoin() {
  const params = useParams<{ name: string }>()
  const router = useRouter()
  const room = (params?.name || "").trim()

  const [userName, setUserName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState("Felix")
  const [isNameLocked, setIsNameLocked] = useState(false)
  const [isAvatarLocked, setIsAvatarLocked] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [token, setToken] = useState("")
  const [hostSecret, setHostSecret] = useState("")

  useEffect(() => {
    const savedRoomIdentity = localStorage.getItem(`space_identity_${room}`)
    if (savedRoomIdentity) {
      try {
        const parsed = JSON.parse(savedRoomIdentity)
        if (parsed.name && parsed.name.trim()) {
          setUserName(parsed.name.trim())
          setSelectedAvatar(parsed.avatar || "Felix")
          setIsNameLocked(true)
          setIsAvatarLocked(true)
          return
        }
      } catch {}
    }

    const savedName = localStorage.getItem("space_username")
    if (savedName && savedName.trim()) {
      setUserName(savedName.trim())
    }
    const savedAvatar = localStorage.getItem("space_avatar")
    if (savedAvatar && savedAvatar.trim()) {
      setSelectedAvatar(savedAvatar.trim())
    }
    setIsNameLocked(false)
    setIsAvatarLocked(false)
  }, [room])

  useEffect(() => {
    const savedSecret = localStorage.getItem(`space_host_secret_${room}`)
    if (savedSecret) {
      setHostSecret(savedSecret)
    }
  }, [room])

  const handleJoin = async (name: string) => {
    if (!name.trim()) return
    setIsJoining(true)
    const finalName = name.trim()
    const finalAvatar = selectedAvatar.trim() || "Felix"
    localStorage.setItem("space_username", finalName)
    localStorage.setItem("space_avatar", finalAvatar)
    localStorage.setItem(
      `space_identity_${room}`,
      JSON.stringify({ name: finalName, avatar: finalAvatar })
    )
    setIsNameLocked(true)
    setIsAvatarLocked(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const query = new URLSearchParams({
        room,
        username: name.trim(),
        avatar: selectedAvatar,
      })
      const savedSecret =
        localStorage.getItem(`space_host_secret_${room}`) || ""
      if (savedSecret) query.set("hostSecret", savedSecret)
      const res = await fetch(`${apiUrl}/api/livekit/token?${query.toString()}`)
      const data = await res.json()
      if (data.data?.token) {
        setToken(data.data.token)
        setHostSecret(savedSecret)
        setHasJoined(true)
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

  if (hasJoined && token) {
    return (
      <SpaceRoomLiveKit
        roomName={room}
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
    <div className="flex min-h-svh flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4 pb-32 md:p-6 md:pb-12">
        <Link
          href="/lobby"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <RiArrowLeftLine className="size-4" aria-hidden="true" />
          Back to lobby
        </Link>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <h1 className="text-xl font-semibold tracking-tight">{room}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose your permanent character and name to join the space.
          </p>

          <form
            className="mt-6 space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              handleJoin(userName)
            }}
          >
            <AvatarPicker
              selectedAvatar={selectedAvatar}
              onSelectAvatar={setSelectedAvatar}
              isLocked={isAvatarLocked}
            />

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="join-user-name">Your Name</FieldLabel>
                {isNameLocked ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <RiLockLine className="size-3.5" /> Identity locked
                  </span>
                ) : null}
              </div>
              <Input
                id="join-user-name"
                value={userName}
                onChange={(e) => !isNameLocked && setUserName(e.target.value)}
                placeholder="What should we call you?"
                maxLength={15}
                disabled={isNameLocked}
                className={
                  isNameLocked
                    ? "cursor-not-allowed bg-muted/40 text-foreground opacity-90"
                    : ""
                }
                autoFocus={!isNameLocked}
              />
              {isNameLocked ? (
                <p className="text-xs text-muted-foreground">
                  Your identity and character are permanent across spaces.
                </p>
              ) : null}
            </Field>

            <Button
              type="submit"
              className="w-full"
              disabled={!userName.trim() || isJoining}
            >
              {isJoining ? <Spinner className="mr-2" /> : null}
              Join Space
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
