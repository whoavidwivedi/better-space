"use client"

import { RiArrowLeftLine } from "@remixicon/react"
import Link from "next/link"
import { useParams } from "next/navigation"
import React, { useEffect, useState } from "react"

import { Navbar } from "@/components/common/navbar"
import { SpaceRoomLiveKit } from "@/components/livekit-room"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

export function SpaceJoin() {
  const params = useParams<{ name: string }>()
  const room = (params?.name || "").trim()

  const [userName, setUserName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [token, setToken] = useState("")
  const [hostSecret, setHostSecret] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("space_username")
    if (saved) {
      setUserName(saved)
    }
  }, [])

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
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const query = new URLSearchParams({ room, username: name.trim() })
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

  useEffect(() => {
    if (!room) return
    const saved = localStorage.getItem("space_username")
    if (saved) {
      handleJoin(saved)
    }
  }, [room])

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
        }}
      />
    )
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4 md:p-6">
        <Link
          href="/lobby"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <RiArrowLeftLine className="size-4" aria-hidden="true" />
          Back to lobby
        </Link>

        <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">{room}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tell us what to call you, then jump into the conversation.
          </p>

          {!userName ? (
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                handleJoin(userName)
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
              <Button type="submit" className="w-full" disabled={!userName.trim() || isJoining}>
                {isJoining ? <Spinner className="mr-2" /> : null}
                Join Space
              </Button>
            </form>
          ) : (
            <div className="mt-6">
              <Button className="w-full" onClick={() => handleJoin(userName)} disabled={isJoining}>
                {isJoining ? <Spinner className="mr-2" /> : null}
                Join as {userName}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
