"use client"

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant,
  useIsSpeaking,
  useRoomContext,
  useTrackVolume,
  useParticipantPermissions,
  useRoomInfo,
} from "@livekit/components-react"
import {
  RiMicLine,
  RiMicOffLine,
  RiGroupLine,
  RiFileCopyLine,
  RiCheckLine,
  RiKeyboardBoxLine,
  RiSettings3Line,
  RiEmotionLine,
  RiHeadphoneLine,
  RiMoreFill,
  RiVolumeMuteLine,
  RiUserVoiceLine,
  RiCloseLine,
  RiErrorWarningLine,
} from "@remixicon/react"
import { EmojiClickData, Theme } from "emoji-picker-react"
import EmojiPicker from "emoji-picker-react"
import { RoomEvent, Track } from "livekit-client"
import React, { useEffect, useState, useRef, useMemo } from "react"

import { AudioVisualizer } from "@/components/audio-visualizer"
import { ModeToggle } from "@/components/common/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

export function SpaceRoomLiveKit({
  roomName,
  userName,
  token,
  hostSecret,
  onLeave,
}: {
  roomName: string
  userName: string
  token: string
  hostSecret?: string
  onLeave: () => void
}) {
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  if (!wsUrl || !token) {
    return (
      <div className="bg-background flex min-h-svh items-center justify-center">
        <Spinner className="text-muted-foreground" />
      </div>
    )
  }

  return (
    <LiveKitRoom
      serverUrl={wsUrl}
      token={token}
      connect={true}
      audio={false}
      video={false}
      options={{
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      }}
      onDisconnected={onLeave}
    >
      <RoomAudioRenderer />
      <RoomUI roomName={roomName} userName={userName} hostSecret={hostSecret} token={token} onLeave={onLeave} />
    </LiveKitRoom>
  )
}

function RoomUI({
  roomName,
  userName,
  hostSecret,
  token,
  onLeave,
}: {
  roomName: string
  userName: string
  hostSecret?: string
  token: string
  onLeave: () => void
}) {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const participants = useParticipants()
  const { metadata } = useRoomInfo()

  const [isDeafened, setIsDeafened] = useState(false)
  const [copied, setCopied] = useState(false)
  const [permUpdate, setPermUpdate] = useState(0)

  const [hostDisconnectTime, setHostDisconnectTime] = useState<number | null>(null)
  const [disconnectCountdown, setDisconnectCountdown] = useState(60)

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedMicId, setSelectedMicId] = useState<string>("default")

  const [hasRequestedMicLocal, setHasRequestedMicLocal] = useState(false)

  const isMuted = !localParticipant.isMicrophoneEnabled

  const canPublish = localParticipant.permissions?.canPublish
  const prevCanPublish = useRef(canPublish)

  useEffect(() => {
    if (prevCanPublish.current === undefined) {
      prevCanPublish.current = canPublish
      return
    }

    if (canPublish && !prevCanPublish.current) {
      toast.add({ title: "Host granted you the microphone!", type: "success" })
      localParticipant.setMicrophoneEnabled(true).catch(() => {
        toast.add({ title: "Could not automatically enable microphone.", type: "error" })
      })
    } else if (!canPublish && prevCanPublish.current) {
      toast.add({ title: "Host revoked your microphone access.", type: "error" })
    }
    prevCanPublish.current = canPublish

    if (canPublish) {
      setHasRequestedMicLocal(false)
    }
  }, [canPublish, localParticipant])

  const { roomHost, roomCohosts } = useMemo(() => {
    let host = ""
    let cohosts: string[] = []
    try {
      if (metadata) {
        const meta = JSON.parse(metadata)
        host = meta.host || ""
        cohosts = meta.cohosts || []
      }
    } catch {}
    return { roomHost: host, roomCohosts: cohosts }
  }, [metadata])

  const isHost = localParticipant.identity === roomHost
  const isCohost = roomCohosts.includes(localParticipant.identity)
  const isHostOrCohost = isHost || isCohost

  const hostInRoom = participants.some((p) => p.identity === roomHost)

  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.identity === roomHost) return -1
    if (b.identity === roomHost) return 1
    const aPublish = a.permissions?.canPublish ? 1 : 0
    const bPublish = b.permissions?.canPublish ? 1 : 0
    if (aPublish !== bPublish) return bPublish - aPublish
    const aTime = a.joinedAt?.getTime() || 0
    const bTime = b.joinedAt?.getTime() || 0
    if (aTime !== bTime) return aTime - bTime
    return a.identity.localeCompare(b.identity)
  })

  const [isEndSpaceOpen, setIsEndSpaceOpen] = useState(false)

  const handleEndSpace = async () => {
    setIsEndSpaceOpen(false)
    try {
      await fetch("/api/livekit/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, targetIdentity: userName, token, action: "end" }),
      })
    } catch {
      toast.add({ title: "Failed to end space", type: "error" })
    }
  }

  const [micRequests, setMicRequests] = useState<string[]>([])
  const [reactions, setReactions] = useState<Record<string, string>>({})
  const reactionTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})

  const displayReaction = (identity: string, emoji: string) => {
    setReactions((prev) => ({ ...prev, [identity]: emoji }))
    if (reactionTimeoutsRef.current[identity]) {
      clearTimeout(reactionTimeoutsRef.current[identity])
    }
    reactionTimeoutsRef.current[identity] = setTimeout(() => {
      setReactions((prev) => {
        const next = { ...prev }
        delete next[identity]
        return next
      })
    }, 4000)
  }

  useEffect(() => {
    const handleData = (payload: Uint8Array, participant?: any) => {
      try {
        const decoder = new TextDecoder()
        const data = JSON.parse(decoder.decode(payload))
        if (data.type === "REACTION" && data.emoji) {
          displayReaction(participant?.identity || data.senderIdentity, data.emoji)
        } else if (data.type === "MIC_REQUEST") {
          if (isHostOrCohost && data.identity) {
            setMicRequests((prev) =>
              prev.includes(data.identity) ? prev : [...prev, data.identity],
            )
            toast.add({ title: `${data.identity} requested the microphone.`, type: "mic-request" })
          }
        } else if (data.type === "MIC_REJECTED") {
          if (data.identity === userName) {
            setHasRequestedMicLocal(false)
            toast.add({ title: "Your microphone request was declined.", type: "info" })
          } else if (isHostOrCohost) {
            setMicRequests((prev) => prev.filter((id) => id !== data.identity))
          }
        }
      } catch {}
    }

    const handleDisconnected = () => {
      onLeave()
    }

    room.on(RoomEvent.DataReceived, handleData)
    room.on(RoomEvent.Disconnected, handleDisconnected)
    return () => {
      room.off(RoomEvent.DataReceived, handleData)
      room.off(RoomEvent.Disconnected, handleDisconnected)
    }
  }, [room, isHostOrCohost, localParticipant, onLeave, userName])

  useEffect(() => {
    setMicRequests((prev) => {
      if (prev.length === 0) return prev
      const filtered = prev.filter((identity) => {
        const p = participants.find((pt) => pt.identity === identity)
        if (!p) return false
        if (p.permissions?.canPublish) return false
        return true
      })
      if (filtered.length !== prev.length) return filtered
      return prev
    })
  }, [participants])

  useEffect(() => {
    if (!roomHost || isHost) {
      setHostDisconnectTime(null)
      return
    }
    const hostInRoom = participants.some((p) => p.identity === roomHost)
    const anyCohostInRoom = participants.some((p) => roomCohosts.includes(p.identity))
    
    if (!hostInRoom && !anyCohostInRoom) {
      setHostDisconnectTime((prev) => prev || Date.now())
    } else {
      setHostDisconnectTime(null)
    }
  }, [participants, roomHost, isHost, roomCohosts])

  const timeoutDeps = useRef({ isCohost, onLeave, roomName, userName, token })
  useEffect(() => {
    timeoutDeps.current = { isCohost, onLeave, roomName, userName, token }
  }, [isCohost, onLeave, roomName, userName, token])

  useEffect(() => {
    if (hostDisconnectTime === null) return

    const tick = () => {
      const elapsed = Date.now() - hostDisconnectTime
      const remaining = Math.ceil((60000 - elapsed) / 1000)
      if (remaining <= 0) {
        const deps = timeoutDeps.current
        if (deps.isCohost) {
          fetch("/api/livekit/moderate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomName: deps.roomName, targetIdentity: deps.userName, token: deps.token, action: "end" }),
          }).catch(() => {})
        } else {
          deps.onLeave()
        }
        return true
      }
      setDisconnectCountdown(remaining)
      return false
    }

    tick()
    const interval = setInterval(() => {
      if (tick()) clearInterval(interval)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [hostDisconnectTime])

  const shouldHostTimerRunRef = useRef(false)
  useEffect(() => {
    const anyCohostInRoom = participants.some((p) => roomCohosts.includes(p.identity))
    shouldHostTimerRunRef.current = !anyCohostInRoom
  }, [participants, roomCohosts])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isHost) {
        if (shouldHostTimerRunRef.current) {
          localStorage.setItem(`space_host_disconnected_${roomName}`, Date.now().toString())
        } else {
          localStorage.removeItem(`space_host_disconnected_${roomName}`)
        }
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (isHost) {
        if (shouldHostTimerRunRef.current) {
          localStorage.setItem(`space_host_disconnected_${roomName}`, Date.now().toString())
        } else {
          localStorage.removeItem(`space_host_disconnected_${roomName}`)
        }
      }
    }
  }, [isHost, roomName])

  const handleSendReaction = (emojiObject: EmojiClickData) => {
    const emoji = emojiObject.emoji
    displayReaction(userName, emoji)
    const encoder = new TextEncoder()
    const data = encoder.encode(
      JSON.stringify({ type: "REACTION", emoji, senderIdentity: userName }),
    )
    localParticipant.publishData(data, { reliable: true })
  }

  const requestMic = () => {
    if (hasRequestedMicLocal) return
    setHasRequestedMicLocal(true)
    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify({ type: "MIC_REQUEST", identity: userName }))
    localParticipant.publishData(data, { reliable: true })
    toast.add({ title: "Microphone request sent.", type: "success" })
  }

  const grantMicToRequest = async (targetIdentity: string) => {
    try {
      const res = await fetch("/api/livekit/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          targetIdentity,
          token,
          action: "grant_mic",
        }),
      })
      if (!res.ok) throw new Error("API error")
      setMicRequests((prev) => prev.filter((id) => id !== targetIdentity))
      toast.add({ title: `Granted microphone to ${targetIdentity}`, type: "success" })
    } catch {
      toast.add({ title: `Failed to grant microphone`, type: "error" })
    }
  }

  const rejectMicRequest = (targetIdentity: string) => {
    setMicRequests((prev) => prev.filter((id) => id !== targetIdentity))
    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify({ type: "MIC_REJECTED", identity: targetIdentity }))
    localParticipant.publishData(data, { reliable: true })
  }

  const copyInviteLink = () => {
    if (copied) return
    const url = `${window.location.origin}/space/${encodeURIComponent(roomName)}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.add({ title: "Link copied to clipboard!", type: "success" })
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleMute = async () => {
    try {
      if (isDeafened) {
        toast.add({ title: "You cannot unmute while deafened", type: "error" })
        return
      }
      await localParticipant.setMicrophoneEnabled(isMuted)
    } catch (e: any) {
      if (e.message?.includes("getUserMedia")) {
        toast.add({
          title: "Cannot access microphone. You must use an HTTPS connection to test audio.",
          type: "error",
        })
      } else {
        toast.add({ title: "Failed to toggle microphone: " + e.message, type: "error" })
      }
    }
  }

  const toggleDeafen = () => {
    const nextDeafened = !isDeafened
    setIsDeafened(nextDeafened)

    room.remoteParticipants.forEach((p) => {
      p.audioTrackPublications.forEach((pub) => {
        if (pub.track && pub.track.mediaStreamTrack) {
          pub.track.mediaStreamTrack.enabled = !nextDeafened
        }
      })
    })

    if (nextDeafened && !isMuted) {
      localParticipant.setMicrophoneEnabled(false).catch(() => {})
    }

    localParticipant.setAttributes({ isDeafened: nextDeafened ? "true" : "false" }).catch(() => {})
  }

  const fetchDevices = async () => {
    if (!navigator.mediaDevices) return
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      setAudioDevices(devices.filter((d) => d.kind === "audioinput"))
    } catch {}
  }

  useEffect(() => {
    fetchDevices()
    navigator.mediaDevices?.addEventListener?.("devicechange", fetchDevices)
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", fetchDevices)
  }, [])

  const processedTracks = useRef(new WeakSet<any>())
  useEffect(() => {
    const pub = localParticipant.getTrackPublication(Track.Source.Microphone)
    if (pub && pub.track) {
      const track = pub.track
      if (!processedTracks.current.has(track)) {
        processedTracks.current.add(track)
        import("@livekit/krisp-noise-filter")
          .then(({ KrispNoiseFilter }) => {
            track.setProcessor(KrispNoiseFilter() as any).catch(console.error)
          })
          .catch(() => {
            console.warn("Could not load Krisp noise filter")
          })
      }
    }
  }, [localParticipant, isMuted])

  const handleDeviceChange = async (deviceId: string | null) => {
    if (!deviceId) return
    setSelectedMicId(deviceId)
    try {
      await room.switchActiveDevice("audioinput", deviceId)
    } catch {
      toast.add({ title: "Could not switch device", type: "error" })
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
        e.preventDefault()
        toggleDeafen()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault()
        toggleMute()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMuted, isDeafened])

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-border bg-background/80 sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b px-4 backdrop-blur-md md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-sm font-semibold">{roomName}</h1>
          <Badge
            variant="outline"
            className="border-success/20 bg-success/10 text-success shrink-0 gap-1.5"
          >
            <span
              className="bg-success size-1.5 rounded-full motion-safe:animate-pulse"
              aria-hidden="true"
            />
            Live
          </Badge>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ModeToggle />

          <HoverCard>
            <HoverCardTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="text-muted-foreground hidden h-8 w-8 cursor-help sm:inline-flex"
                >
                  <RiKeyboardBoxLine size={16} />
                </Button>
              }
            />
            <HoverCardContent className="z-50 w-64 p-4">
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <RiKeyboardBoxLine size={16} /> Keyboard Shortcuts
                </h4>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Toggle Mute</span>
                    <KbdGroup>
                      <Kbd>⌘</Kbd>
                      <Kbd>D</Kbd>
                    </KbdGroup>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Toggle Deafen</span>
                    <KbdGroup>
                      <Kbd>⌘</Kbd>
                      <Kbd>E</Kbd>
                    </KbdGroup>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          <Button
            size="icon"
            onClick={copyInviteLink}
            disabled={copied}
            variant="outline"
            aria-label="Copy invite link"
            className="text-muted-foreground"
          >
            {copied ? <RiCheckLine size={16} /> : <RiFileCopyLine size={16} />}
          </Button>

          {isHostOrCohost ? (
            <>
              {isHost && (
                <Popover open={isEndSpaceOpen} onOpenChange={setIsEndSpaceOpen}>
                  <PopoverTrigger
                    render={
                      <Button variant="destructive" size="sm">
                        End Space
                      </Button>
                    }
                  />
                  <PopoverContent side="bottom" align="end" className="w-72">
                    <PopoverHeader>
                      <PopoverTitle>End Space</PopoverTitle>
                      <PopoverDescription>
                        Are you sure you want to end this space? Everyone will be disconnected
                        immediately.
                      </PopoverDescription>
                    </PopoverHeader>
                    <div className="flex flex-col gap-2 pt-1">
                      <Button variant="destructive" onClick={handleEndSpace}>
                        End for everyone
                      </Button>
                      <Button variant="outline" onClick={() => setIsEndSpaceOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </>
          ) : (
            <Button
              variant="ghost"
              onClick={onLeave}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Leave
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto p-4 pb-[calc(8rem+env(safe-area-inset-bottom))] md:p-6 md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
          <section aria-labelledby="participants-heading" className="space-y-4">
            <h2 id="participants-heading" className="flex items-center gap-2 text-sm font-semibold">
              <RiGroupLine className="text-muted-foreground size-4" aria-hidden="true" />
              In this space
              <Badge variant="outline" className="rounded-full">
                {participants.length}
              </Badge>
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {sortedParticipants.map((participant) => (
                <ParticipantTile
                  key={participant.sid || participant.identity}
                  participant={participant}
                  reaction={reactions[participant.identity]}
                  isHost={isHost}
                  isHostOrCohost={isHostOrCohost}
                  roomCohosts={roomCohosts}
                  roomHost={roomHost}
                  roomName={roomName}
                  localUserName={userName}
                  token={token}
                  hasRequestedMic={micRequests.includes(participant.identity)}
                  onClearRequest={() =>
                    setMicRequests((prev) => prev.filter((id) => id !== participant.identity))
                  }
                />
              ))}
            </div>
          </section>
        </main>

        {hostDisconnectTime !== null && (
          <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex justify-center">
            <div className="pointer-events-auto flex items-center justify-center rounded-full border border-destructive/20 bg-destructive text-destructive-foreground shadow-xl px-5 py-2.5 text-sm font-medium tracking-tight animate-in fade-in slide-in-from-bottom-4">
              <RiErrorWarningLine className="size-4 mr-2 shrink-0" aria-hidden="true" />
              Host disconnected. Space ends in {disconnectCountdown}s
            </div>
          </div>
        )}

        <div className="border-border bg-card/95 fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 rounded-lg border p-1.5 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <Popover
              onOpenChange={(open) => {
                if (!open) return
                navigator.mediaDevices
                  ?.getUserMedia({ audio: true })
                  .then((stream) => {
                    stream.getTracks().forEach((t) => t.stop())
                    fetchDevices()
                  })
                  .catch(() => fetchDevices())
              }}
            >
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-muted-foreground size-10 shrink-0"
                  >
                    <RiSettings3Line size={18} />
                  </Button>
                }
              />
              <PopoverContent className="w-64 p-4" align="center">
                <PopoverHeader>
                  <PopoverTitle>Audio Settings</PopoverTitle>
                  <PopoverDescription>Choose the microphone you want to use.</PopoverDescription>
                </PopoverHeader>
                <Field>
                  <FieldLabel htmlFor="mic-select">Microphone</FieldLabel>
                  <Select value={selectedMicId} onValueChange={handleDeviceChange}>
                    <SelectTrigger id="mic-select" className="w-full">
                      <SelectValue placeholder="Select a microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      {audioDevices.length === 0 ? (
                        <p className="text-muted-foreground p-2 text-sm">No microphones found</p>
                      ) : (
                        audioDevices.map((device, i) => (
                          <SelectItem
                            key={device.deviceId || `mic-${i}`}
                            value={device.deviceId || `mic-${i}`}
                          >
                            {device.label || `Microphone ${i + 1}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-muted-foreground size-10 shrink-0"
                  >
                    <RiEmotionLine size={18} />
                  </Button>
                }
              />
              <PopoverContent className="z-50 w-auto rounded-xl border-none p-0 shadow-xl">
                <EmojiPicker
                  onEmojiClick={handleSendReaction}
                  theme={Theme.AUTO}
                  lazyLoadEmojis={true}
                  autoFocusSearch={false}
                  width="min(21.875rem,calc(100vw-1rem))"
                />
              </PopoverContent>
            </Popover>

            {isHostOrCohost && (
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-muted-foreground relative size-10 shrink-0"
                    >
                      <RiUserVoiceLine size={18} />
                      {micRequests.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow-sm ring-2 ring-background dark:bg-red-600">
                          {micRequests.length}
                        </span>
                      )}
                    </Button>
                  }
                />
                <PopoverContent className="w-[320px] p-0 shadow-xl overflow-hidden rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl" align="center" side="top" sideOffset={12}>
                  <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-4 py-3">
                    <h3 className="text-sm font-semibold tracking-tight">Mic Requests</h3>
                    {micRequests.length > 0 && (
                      <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                        {micRequests.length}
                      </Badge>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-1.5">
                    {micRequests.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="mb-3 rounded-full bg-muted/50 p-3">
                          <RiUserVoiceLine className="size-6 text-muted-foreground/50" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-medium">All caught up</p>
                        <p className="text-xs text-muted-foreground mt-0.5">No pending mic requests</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {micRequests.map((identity) => (
                          <div
                            key={identity}
                            className="group flex items-center justify-between rounded-lg p-2 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center min-w-0 gap-3 mr-3">
                              <Avatar className="border-border bg-muted size-8 border shadow-sm">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${participants.find((p) => p.identity === identity)?.sid || identity}&backgroundColor=ffffff`}
                                  alt={identity}
                                  className="object-contain"
                                />
                                <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                                  {identity.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate text-sm font-medium">{identity}</span>
                            </div>
                            <div className="flex shrink-0 gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => rejectMicRequest(identity)}
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-3 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={() => grantMicToRequest(identity)}
                              >
                                Accept
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {localParticipant.permissions?.canPublish ? (
              <>
                <Button
                  onClick={toggleDeafen}
                  variant={isDeafened ? "destructive" : "secondary"}
                  size="lg"
                  className="h-10 gap-2 rounded-lg"
                >
                  {isDeafened ? <RiVolumeMuteLine size={18} /> : <RiHeadphoneLine size={18} />}
                  <span className="hidden sm:inline">Deafen</span>
                </Button>

                <Button
                  onClick={toggleMute}
                  disabled={isDeafened}
                  variant={isMuted ? "destructive" : "secondary"}
                  size="lg"
                  className="h-10 gap-2 rounded-lg"
                >
                  {isMuted ? <RiMicOffLine size={18} /> : <RiMicLine size={18} />}
                  <span className="hidden sm:inline">Mute</span>
                </Button>
              </>
            ) : (
              <Button onClick={requestMic} disabled={hasRequestedMicLocal} size="lg" className="h-10 gap-2 rounded-lg">
                <RiMicLine size={18} />
                {hasRequestedMicLocal ? "Requested" : "Request Mic"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ParticipantTile({
  participant,
  reaction,
  isHost,
  isHostOrCohost,
  roomCohosts = [],
  roomHost,
  roomName,
  localUserName,
  token,
  hasRequestedMic = false,
  onClearRequest,
}: {
  participant: any
  reaction?: string
  isHost?: boolean
  isHostOrCohost?: boolean
  roomCohosts?: string[]
  roomHost?: string
  roomName: string
  localUserName: string
  token?: string
  hasRequestedMic?: boolean
  onClearRequest?: () => void
}) {
  const isSpeaking = useIsSpeaking(participant)
  const isAudioMuted = !participant.isMicrophoneEnabled
  const name = participant.identity || "Unknown"
  const permissions = useParticipantPermissions({ participant })
  const canPublish = permissions?.canPublish ?? false

  const [avatarSeed, setAvatarSeed] = useState(() => Math.random().toString(36).substring(2, 9))

  useEffect(() => {
    let count = 0
    const targetSeed = participant.sid || Math.random().toString(36).substring(2, 10)
    const interval = setInterval(() => {
      setAvatarSeed(Math.random().toString(36).substring(2, 9))
      count++
      if (count > 8) {
        setAvatarSeed(targetSeed)
        clearInterval(interval)
      }
    }, 120)
    return () => clearInterval(interval)
  }, [participant.sid])

  const trackPub = participant.getTrackPublication(Track.Source.Microphone)
  const volume = useTrackVolume(trackPub?.track)

  const isDeafenedRemote = participant.attributes?.isDeafened === "true"
  const isThisParticipantHost = name === roomHost
  const isThisParticipantCohost = roomCohosts.includes(name)

  const handleModerate = async (action: string) => {
    try {
      const res = await fetch("/api/livekit/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          hostName: localUserName,
          targetIdentity: name,
          token,
          action,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.add({
          title: `Failed to ${action}: ${data.error?.message || "Unknown"}`,
          type: "error",
        })
      } else {
        if (action === "grant_mic") {
          toast.add({ title: `Granted mic to ${name}`, type: "success" })
          if (onClearRequest) onClearRequest()
        } else if (action === "revoke_mic") {
          toast.add({ title: `Revoked mic from ${name}`, type: "success" })
        } else if (action === "kick") {
          toast.add({ title: `Removed ${name} from space`, type: "success" })
        } else if (action === "grant_cohost") {
          toast.add({ title: `Made ${name} a co-host`, type: "success" })
        } else if (action === "revoke_cohost") {
          toast.add({ title: `Removed ${name} as co-host`, type: "success" })
        } else if (action === "mute") {
          toast.add({ title: `Muted ${name}`, type: "success" })
        } else {
          toast.add({ title: `Action successful`, type: "success" })
        }
      }
    } catch {
      toast.add({ title: `Failed to ${action}`, type: "error" })
    }
  }

  const canModerateThisParticipant =
    isHostOrCohost &&
    name !== localUserName &&
    !isThisParticipantHost &&
    (isHost || !isThisParticipantCohost)

  const avatarElement = (
    <div className="relative group/avatar inline-block">
      <div
        className={`rounded-full transition-shadow ${canPublish && isSpeaking ? "ring-primary ring-offset-background ring-2 ring-offset-2" : ""}`}
      >
        <Avatar className="border-border bg-muted size-16 border-2">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}&backgroundColor=ffffff`}
            alt={name}
            className="object-contain"
          />
          <AvatarFallback />
        </Avatar>
      </div>
      {canModerateThisParticipant && (
        <div className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full bg-foreground text-background shadow-md transition-transform group-hover/avatar:scale-110 pointer-events-none">
          <RiMoreFill size={16} />
        </div>
      )}
    </div>
  )

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="relative">
        {canModerateThisParticipant ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none cursor-pointer rounded-full hover:opacity-80 transition-opacity">
              {avatarElement}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top">
              {!canPublish && !isThisParticipantHost && (
                <DropdownMenuItem
                  onClick={() => handleModerate("grant_mic")}
                  className="text-success focus:bg-success/10 focus:text-success"
                >
                  Grant Mic
                </DropdownMenuItem>
              )}
              {canPublish && !isThisParticipantHost && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleModerate("mute")}
                    disabled={isAudioMuted}
                  >
                    Mute
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleModerate("revoke_mic")}
                    className="text-warning focus:bg-warning/10 focus:text-warning"
                  >
                    Revoke Mic
                  </DropdownMenuItem>
                </>
              )}
              {!isThisParticipantHost && (
                <DropdownMenuItem
                  onClick={() => handleModerate("kick")}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  Remove from space
                </DropdownMenuItem>
              )}
              {isHost && !isThisParticipantHost && !isThisParticipantCohost && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleModerate("grant_cohost")}
                  >
                    Make Co-host
                  </DropdownMenuItem>
                </>
              )}
              {isHost && isThisParticipantCohost && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleModerate("revoke_cohost")}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    Remove Co-host
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          avatarElement
        )}

        {reaction && (
          <div className="bg-background border-border absolute -top-2 -right-2 z-10 flex size-8 items-center justify-center rounded-full border text-lg shadow-sm">
            <span className="leading-none select-none">{reaction}</span>
          </div>
        )}

        {hasRequestedMic && isHostOrCohost && (
          <div className="bg-primary text-primary-foreground absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap shadow-sm">
            Requests Mic
          </div>
        )}

        {canPublish && (
          <div className="bg-background border-border absolute -right-1 -bottom-1 rounded-full border p-1 shadow-sm">
            {isDeafenedRemote ? (
              <RiVolumeMuteLine size={14} className="text-destructive" aria-hidden="true" />
            ) : isAudioMuted ? (
              <RiMicOffLine size={14} className="text-muted-foreground" aria-hidden="true" />
            ) : (
              <RiMicLine size={14} className="text-primary" aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex w-full flex-col items-center gap-2 text-center">
        <p className="flex w-full items-center justify-center gap-1 truncate text-sm font-medium">
          <span className="truncate">{name}</span>
          {isThisParticipantHost && (
            <Badge variant="outline" className="h-4 px-1 text-xs uppercase shrink-0">
              Host
            </Badge>
          )}
          {isThisParticipantCohost && (
            <Badge variant="outline" className="h-4 px-1 text-xs uppercase shrink-0">
              Co-host
            </Badge>
          )}
        </p>

        <p className="text-muted-foreground flex items-center gap-1 text-xs">
          <RiHeadphoneLine className="size-3.5" aria-hidden="true" />
          {canPublish ? "Speaker" : "Listener"}
        </p>

        {canPublish &&
          (isAudioMuted ? (
            <div className="h-6 w-full" />
          ) : (
            <AudioVisualizer volume={isSpeaking ? volume : 0} speaking={isSpeaking} />
          ))}
      </div>
    </div>
  )
}

