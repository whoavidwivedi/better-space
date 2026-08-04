"use client"

import { RiArrowLeftLine } from "@remixicon/react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { RiShuffleLine } from "@remixicon/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Navbar } from "@/components/common/navbar"
import { SpaceRoomLiveKit } from "@/components/livekit-room"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

export function SpaceJoin() {
  const params = useParams<{ name: string }>()
  const router = useRouter()
  const room = (params?.name || "").trim()

  const [userName, setUserName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [token, setToken] = useState("")
  const [hostSecret, setHostSecret] = useState("")
  const [avatarSeed, setAvatarSeed] = useState(() => Math.random().toString(36).substring(2, 9))
  const [isProfileLocked, setIsProfileLocked] = useState(false)

  useEffect(() => {
    const profileStr = localStorage.getItem(`space_profile_${room}`)
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr)
        if (profile.userName && profile.avatarSeed) {
          setUserName(profile.userName)
          setAvatarSeed(profile.avatarSeed)
          setIsProfileLocked(true)
          return
        }
      } catch {}
    }
    const saved = localStorage.getItem("space_username")
    if (saved) {
      setUserName(saved)
    }
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
    localStorage.setItem("space_username", name.trim())
    localStorage.setItem(`space_profile_${room}`, JSON.stringify({ userName: name.trim(), avatarSeed }))
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const query = new URLSearchParams({ room, username: name.trim(), avatar: avatarSeed })
      const savedSecret = localStorage.getItem(`space_host_secret_${room}`) || ""
      if (savedSecret) query.set("hostSecret", savedSecret)
      const res = await fetch(`${apiUrl}/api/livekit/token?${query.toString()}`)
      const data = await res.json()
      if (data.data?.token) {
        setToken(data.data.token)
        setHostSecret(savedSecret)
        setHasJoined(true)
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

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4 md:p-6 text-center">
        <div className="flex flex-col items-center">
          <Link
            href="/lobby"
            className="text-muted-foreground hover:text-foreground mb-10 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <RiArrowLeftLine className="size-4" aria-hidden="true" />
            Lobby
          </Link>
          
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{room}</h1>
          <p className="text-muted-foreground mt-3 text-base">
            Tell us what to call you, then jump into the conversation.
          </p>

          <form
            className="mt-10 w-full space-y-5 text-left"
            onSubmit={(e) => {
              e.preventDefault()
              handleJoin(userName)
            }}
          >
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative group/avatar inline-block">
                <Avatar className="border-border bg-muted size-24 border-2">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}&backgroundColor=ffffff`}
                    alt="Avatar preview"
                    className="object-contain"
                  />
                  <AvatarFallback />
                </Avatar>
                {!isProfileLocked && (
                  <button
                    type="button"
                    onClick={() => setAvatarSeed(Math.random().toString(36).substring(2, 9))}
                    className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-md transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <RiShuffleLine size={16} />
                  </button>
                )}
              </div>
            </div>
            <Field>
              <Input
                id="join-user-name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isProfileLocked}
                placeholder="Your name..."
                maxLength={15}
                autoFocus
                className="h-12 text-base rounded-xl bg-muted/50 border-transparent hover:bg-muted/80 focus:bg-background transition-colors"
              />
            </Field>
            <Button type="submit" className="h-12 w-full text-base rounded-xl font-medium" disabled={!userName.trim() || isJoining}>
              {isJoining ? <Spinner className="mr-2" /> : null}
              Join Space
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
