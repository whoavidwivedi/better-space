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
  RiVolumeUpLine,
  RiShieldCheckLine,
  RiUserVoiceLine,
  RiErrorWarningLine,
} from "@remixicon/react"
import { EmojiClickData, Theme } from "emoji-picker-react"
import EmojiPicker from "emoji-picker-react"
import { RoomEvent, Track } from "livekit-client"
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react"

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
import { userpicUrl } from "@/lib/userpics"
import { getDisplayRoomTitle } from "@/lib/presets"

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
      <RoomUI
        roomName={roomName}
        userName={userName}
        hostSecret={hostSecret}
        token={token}
        onLeave={onLeave}
      />
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

  const intentionalLeaveRef = useRef(false)
  const [hostDisconnectTime, setHostDisconnectTime] = useState<number | null>(null)
  const [disconnectCountdown, setDisconnectCountdown] = useState(60)

  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([])
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedMicId, setSelectedMicId] = useState<string>("default")
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>("default")
  const [isPlayingTestSound, setIsPlayingTestSound] = useState(false)
  const localMicPub = localParticipant.getTrackPublication(Track.Source.Microphone)
  const localMicVolume = useTrackVolume(localMicPub?.audioTrack)

  const micItems = useMemo(() => {
    if (audioInputDevices.length === 0) {
      return [{ value: "default", label: "Default Microphone" }]
    }
    return audioInputDevices.map((device, i) => ({
      value: device.deviceId || `mic-${i}`,
      label: device.label || `Microphone ${i + 1}`,
    }))
  }, [audioInputDevices])

  const speakerItems = useMemo(() => {
    if (audioOutputDevices.length === 0) {
      return [{ value: "default", label: "Default Speaker" }]
    }
    return audioOutputDevices.map((device, i) => ({
      value: device.deviceId || `speaker-${i}`,
      label: device.label || `Speaker ${i + 1}`,
    }))
  }, [audioOutputDevices])

  const [hasRequestedMicLocal, setHasRequestedMicLocal] = useState(false)

  const isMuted = !localParticipant.isMicrophoneEnabled

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

  const canPublish = Boolean(localParticipant.permissions?.canPublish || isHostOrCohost)
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
    intentionalLeaveRef.current = true
    localStorage.removeItem(`space_host_disconnected_${roomName}`)
    try {
      await fetch("/api/livekit/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, token, action: "end" }),
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
              prev.includes(data.identity) ? prev : [...prev, data.identity]
            )
            toast.add({
              title: `${data.identity} requested the microphone.`,
              type: "mic-request",
            })
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
            body: JSON.stringify({
              roomName: deps.roomName,
              token: deps.token,
              action: "end",
            }),
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
      if (isHost && !intentionalLeaveRef.current) {
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
      if (isHost && !intentionalLeaveRef.current) {
        if (shouldHostTimerRunRef.current) {
          localStorage.setItem(`space_host_disconnected_${roomName}`, Date.now().toString())
        } else {
          localStorage.removeItem(`space_host_disconnected_${roomName}`)
        }
      }
    }
  }, [isHost, roomName])

  const handleSendReaction = (emojiOrData: EmojiClickData | string) => {
    const emoji = typeof emojiOrData === "string" ? emojiOrData : emojiOrData.emoji
    if (!emoji) return
    displayReaction(userName, emoji)
    const encoder = new TextEncoder()
    const data = encoder.encode(
      JSON.stringify({ type: "REACTION", emoji, senderIdentity: userName })
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
    const data = encoder.encode(
      JSON.stringify({ type: "MIC_REJECTED", identity: targetIdentity })
    )
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

    localParticipant
      .setAttributes({ isDeafened: nextDeafened ? "true" : "false" })
      .catch(() => {})
  }

  const fetchDevices = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const inputs = devices.filter((d) => d.kind === "audioinput")
      const outputs = devices.filter((d) => d.kind === "audiooutput")
      setAudioInputDevices(inputs)
      setAudioOutputDevices(outputs)

      const activeInput = room.getActiveDevice("audioinput")
      if (activeInput) setSelectedMicId(activeInput)
      const activeOutput = room.getActiveDevice("audiooutput")
      if (activeOutput) setSelectedSpeakerId(activeOutput)
    } catch {}
  }, [room])

  useEffect(() => {
    fetchDevices()
    navigator.mediaDevices?.addEventListener?.("devicechange", fetchDevices)
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", fetchDevices)
  }, [fetchDevices])

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

  const handleMicChange = async (deviceId: string | null) => {
    if (!deviceId) return
    setSelectedMicId(deviceId)
    try {
      await room.switchActiveDevice("audioinput", deviceId)
    } catch {
      toast.add({ title: "Could not switch microphone", type: "error" })
    }
  }

  const handleSpeakerChange = async (deviceId: string | null) => {
    if (!deviceId) return
    setSelectedSpeakerId(deviceId)
    try {
      await room.switchActiveDevice("audiooutput", deviceId)
    } catch {
      toast.add({ title: "Could not switch speaker", type: "error" })
    }
  }

  const playTestSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      setIsPlayingTestSound(true)

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
        gain.gain.setValueAtTime(0.12, ctx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + start)
        osc.stop(ctx.currentTime + start + duration)
      }

      playTone(523.25, 0, 0.2)
      playTone(659.25, 0.15, 0.2)
      playTone(783.99, 0.3, 0.35)

      setTimeout(() => {
        setIsPlayingTestSound(false)
        ctx.close().catch(() => {})
      }, 700)
    } catch {
      setIsPlayingTestSound(false)
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
    <div className="flex min-h-svh flex-col bg-background text-foreground relative">
      <div className="absolute inset-0 bg-studio-grid pointer-events-none opacity-40" />

      {/* Header Bar */}
      <header className="border-border bg-card/80 sticky top-0 z-40 flex h-12 sm:h-14 items-center justify-between gap-2 sm:gap-3 border-b px-2.5 sm:px-4 backdrop-blur-md md:px-6">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <span className="size-1.5 sm:size-2 rounded-full bg-foreground inline-block shrink-0" />
          <h1 className="truncate font-display text-xs sm:text-sm font-bold text-foreground max-w-[180px] sm:max-w-md md:max-w-xl">
            {getDisplayRoomTitle(roomName)}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ModeToggle />

          <HoverCard>
            <HoverCardTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="text-muted-foreground hidden h-8 w-8 cursor-help sm:inline-flex rounded-xl"
                >
                  <RiKeyboardBoxLine size={15} />
                </Button>
              }
            />
            <HoverCardContent className="z-50 w-64 p-4 rounded-2xl border border-border bg-card shadow-xl">
              <div className="space-y-3 font-mono text-xs">
                <h4 className="flex items-center gap-2 font-bold text-foreground">
                  <RiKeyboardBoxLine size={15} /> Keyboard Shortcuts
                </h4>
                <div className="flex flex-col gap-2 text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Toggle Mute</span>
                    <KbdGroup>
                      <Kbd>⌘</Kbd>
                      <Kbd>D</Kbd>
                    </KbdGroup>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Toggle Deafen</span>
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
            className="text-muted-foreground h-8 w-8 rounded-xl"
          >
            {copied ? <RiCheckLine size={15} /> : <RiFileCopyLine size={15} />}
          </Button>

          {isHostOrCohost ? (
            <>
              {isHost && (
                <Popover open={isEndSpaceOpen} onOpenChange={setIsEndSpaceOpen}>
                  <PopoverTrigger
                    render={
                      <Button variant="destructive" size="sm" className="h-8 font-mono text-xs rounded-xl font-bold bg-red-600 text-white hover:bg-red-700">
                        End Space
                      </Button>
                    }
                  />
                  <PopoverContent
                    side="bottom"
                    align="end"
                    className="w-[min(18rem,calc(100vw-2rem))] rounded-2xl p-4 border border-border bg-card shadow-xl"
                  >
                    <PopoverHeader>
                      <PopoverTitle className="text-sm font-bold">End Studio Space</PopoverTitle>
                      <PopoverDescription className="text-xs">
                        Are you sure you want to end this space? Everyone will be disconnected.
                      </PopoverDescription>
                    </PopoverHeader>
                    <div className="flex flex-col gap-2 pt-3 font-mono text-xs">
                      <Button variant="destructive" onClick={handleEndSpace} className="rounded-xl font-bold bg-red-600 text-white hover:bg-red-700">
                        End for everyone
                      </Button>
                      <Button variant="outline" onClick={() => setIsEndSpaceOpen(false)} className="rounded-xl">
                        Cancel
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </>
          ) : (
            <Button variant="ghost"
              onClick={onLeave}
              className="text-red-500 hover:bg-red-500/10 hover:text-red-500 h-8 font-mono text-xs font-bold rounded-xl"
            >
              Leave
            </Button>
          )}
        </div>
      </header>

      {/* Main Stage Grid */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto p-2.5 sm:p-4 pb-[calc(7rem+env(safe-area-inset-bottom))] md:p-6 md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
          <section aria-labelledby="participants-heading" className="space-y-3 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h2
                id="participants-heading"
                className="flex items-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                <RiGroupLine className="size-3.5 sm:size-4" aria-hidden="true" />
                Stage ({participants.length})
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-y-6 gap-x-3 sm:gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
                    setMicRequests((prev) =>
                      prev.filter((id) => id !== participant.identity)
                    )
                  }
                />
              ))}
            </div>
          </section>
        </main>

        {hostDisconnectTime !== null && (
          <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex justify-center">
            <div className="pointer-events-auto flex items-center justify-center rounded-full border border-destructive/20 bg-destructive text-destructive-foreground shadow-xl px-5 py-2.5 font-mono text-xs font-bold">
              <RiErrorWarningLine className="size-4 mr-2 shrink-0" aria-hidden="true" />
              Host disconnected. Space ends in {disconnectCountdown}s
            </div>
          </div>
        )}

        {/* Tactile Hardware Bottom Audio Controls Bar */}
        <div className="border-border bg-card/95 fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex max-w-[calc(100vw-0.75rem)] -translate-x-1/2 rounded-xl sm:rounded-2xl border p-1 sm:p-1.5 md:p-2 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            {/* Audio Settings Popover */}
            <Popover
              onOpenChange={(open) => {
                if (!open) return
                if (audioInputDevices.length === 0 || audioInputDevices.some((d) => !d.label)) {
                  navigator.mediaDevices
                    ?.getUserMedia({ audio: true })
                    .then((stream) => {
                      stream.getTracks().forEach((t) => t.stop())
                      fetchDevices()
                    })
                    .catch(() => fetchDevices())
                } else {
                  fetchDevices()
                }
              }}
            >
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-muted-foreground size-9 sm:size-10 shrink-0 rounded-xl"
                    aria-label="Audio settings"
                  >
                    <RiSettings3Line size={17} />
                  </Button>
                }
              />
              <PopoverContent
                className="w-[min(20rem,calc(100vw-2rem))] p-4 sm:p-5 shadow-2xl rounded-2xl border border-border bg-card"
                align="center"
                side="top"
                sideOffset={12}
              >
                <PopoverHeader className="space-y-1">
                  <PopoverTitle className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2">
                    <RiSettings3Line className="size-3.5" aria-hidden="true" />
                    Audio Hardware Routing
                  </PopoverTitle>
                  <PopoverDescription className="text-xs text-muted-foreground">
                    Configure microphone input &amp; speaker output.
                  </PopoverDescription>
                </PopoverHeader>

                <div className="mt-3 space-y-3 font-mono text-xs">
                  {/* Microphone selection */}
                  <Field className="gap-1.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="mic-select" className="text-xs font-bold flex items-center gap-1.5">
                        <RiMicLine className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        Microphone
                      </FieldLabel>
                      {isMuted && (
                        <span className="text-[10px] text-muted-foreground">Muted</span>
                      )}
                    </div>
                    <Select
                      value={selectedMicId}
                      onValueChange={handleMicChange}
                      items={micItems}
                    >
                      <SelectTrigger id="mic-select" className="w-full h-8 text-xs rounded-lg">
                        <SelectValue placeholder="Select a microphone">
                          {(val: string | null) => {
                            const found = micItems.find((m) => m.value === val)
                            return found?.label || "Default Microphone"
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {micItems.map((item) => (
                          <SelectItem key={item.value} value={item.value} className="text-xs">
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Live Mic Level Test Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Input Signal</span>
                        <span>
                          {isMuted
                            ? "0%"
                            : `${Math.min(100, Math.round(localMicVolume * 100 * 2.5))}%`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-foreground transition-all duration-75 ease-out rounded-full"
                          style={{
                            width: isMuted
                              ? "0%"
                              : `${Math.min(100, Math.round(localMicVolume * 100 * 2.5))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </Field>

                  {/* Speaker / Output device selection */}
                  {audioOutputDevices.length > 0 && (
                    <Field className="gap-1.5 pt-1 border-t border-border/50">
                      <div className="flex items-center justify-between pt-1">
                        <FieldLabel htmlFor="speaker-select" className="text-xs font-bold flex items-center gap-1.5">
                          <RiHeadphoneLine className="size-3.5 text-muted-foreground" aria-hidden="true" />
                          Speaker / Headphones
                        </FieldLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={playTestSound}
                          disabled={isPlayingTestSound}
                          className="h-6 px-2 text-[10px] font-mono text-foreground gap-1"
                        >
                          <RiVolumeUpLine className="size-3" aria-hidden="true" />
                          {isPlayingTestSound ? "Testing..." : "Test"}
                        </Button>
                      </div>
                      <Select
                        value={selectedSpeakerId}
                        onValueChange={handleSpeakerChange}
                        items={speakerItems}
                      >
                        <SelectTrigger id="speaker-select" className="w-full h-8 text-xs rounded-lg">
                          <SelectValue placeholder="Default speaker">
                            {(val: string | null) => {
                              const found = speakerItems.find((s) => s.value === val)
                              return found?.label || "Default Speaker"
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {speakerItems.map((item) => (
                            <SelectItem key={item.value} value={item.value} className="text-xs">
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}

                  {/* Audio enhancement status */}
                  <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-2.5 py-2 text-[10px] text-muted-foreground border border-border/40">
                    <RiShieldCheckLine className="size-3.5 text-foreground shrink-0" aria-hidden="true" />
                    <span>Noise suppression active</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Emoji Reaction Popover */}
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-muted-foreground size-9 sm:size-10 shrink-0 rounded-xl"
                  >
                    <RiEmotionLine size={17} />
                  </Button>
                }
              />
              <PopoverContent className="z-50 w-auto rounded-2xl border border-border p-0 shadow-2xl max-w-[calc(100vw-2rem)] overflow-hidden bg-card">
                <div className="flex items-center justify-between gap-1 p-2 border-b border-border bg-muted/40 overflow-x-auto">
                  {["👏", "🔥", "❤️", "😂", "🎉", "👍", "🚀", "💯"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSendReaction(emoji)}
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-lg hover:bg-muted active:scale-95 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <EmojiPicker
                  onEmojiClick={handleSendReaction}
                  theme={Theme.AUTO}
                  lazyLoadEmojis={true}
                  autoFocusSearch={false}
                  width="min(21.875rem,calc(100vw-1rem))"
                />
              </PopoverContent>
            </Popover>

            {/* Host/Co-host Moderation Popover */}
            {isHostOrCohost && (
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-muted-foreground relative size-9 sm:size-10 shrink-0 rounded-xl"
                    >
                      <RiUserVoiceLine size={17} />
                      {micRequests.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 sm:h-5 min-w-4 sm:min-w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground px-1 font-mono text-[9px] sm:text-[10px] font-bold tabular-nums shadow-xs">
                          {micRequests.length}
                        </span>
                      )}
                    </Button>
                  }
                />
                <PopoverContent
                  className="w-[min(20rem,calc(100vw-2rem))] p-0 shadow-2xl overflow-hidden rounded-2xl border border-border bg-card"
                  align="center"
                  side="top"
                  sideOffset={12}
                >
                  <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                      Mic Requests
                    </h3>
                    {micRequests.length > 0 && (
                      <Badge variant="secondary" className="font-mono text-[10px] font-bold">
                        {micRequests.length} Pending
                      </Badge>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto p-2">
                    {micRequests.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <RiUserVoiceLine className="size-6 text-muted-foreground/40 mb-2" aria-hidden="true" />
                        <p className="font-mono text-xs text-muted-foreground">No pending mic requests</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {micRequests.map((identity) => (
                          <div
                            key={identity}
                            className="flex items-center justify-between rounded-xl p-2 bg-muted/30 border border-border"
                          >
                            <div className="flex items-center min-w-0 gap-2.5 mr-2">
                              <Avatar className="size-7 border border-border">
                                <AvatarImage
                                  src={userpicUrl(identity)}
                                  alt={identity}
                                  className="object-cover"
                                />
                                <AvatarFallback className="text-xs font-bold">
                                  {identity.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate text-xs font-bold text-foreground">
                                {identity}
                              </span>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 font-mono text-[10px] font-bold text-destructive hover:bg-destructive/10"
                                onClick={() => rejectMicRequest(identity)}
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2.5 font-mono text-[10px] font-bold"
                                onClick={() => grantMicToRequest(identity)}
                              >
                                Grant Mic
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

            {/* Mute & Deafen Controls */}
            {canPublish ? (
              <>
                <Button
                  onClick={toggleDeafen}
                  variant={isDeafened ? "destructive" : "secondary"}
                  size="lg"
                  className="h-9 sm:h-10 px-3 sm:px-4 gap-1.5 sm:gap-2 rounded-xl font-mono text-xs font-bold shrink-0"
                >
                  {isDeafened ? <RiVolumeMuteLine size={16} /> : <RiHeadphoneLine size={16} />}
                  <span className="hidden sm:inline">Deafen</span>
                </Button>

                <Button
                  onClick={toggleMute}
                  disabled={isDeafened}
                  variant={isMuted ? "destructive" : "default"}
                  size="lg"
                  className="h-9 sm:h-10 px-3.5 sm:px-5 gap-1.5 sm:gap-2 rounded-xl font-mono text-xs font-bold shadow-xs shrink-0"
                >
                  {isMuted ? (
                    <>
                      <RiMicOffLine size={16} />
                      <span>MIC MUTED</span>
                    </>
                  ) : (
                    <>
                      <RiMicLine size={16} className="text-primary-foreground" />
                      <span>MIC LIVE</span>
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={requestMic}
                disabled={hasRequestedMicLocal}
                size="lg"
                className="h-9 sm:h-10 px-3.5 sm:px-5 gap-1.5 sm:gap-2 rounded-xl font-mono text-xs font-bold shrink-0"
              >
                <RiMicLine size={16} />
                <span>{hasRequestedMicLocal ? "Requested" : "Request Mic"}</span>
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
  const isThisParticipantHost = name === roomHost
  const isThisParticipantCohost = roomCohosts.includes(name)
  const permissions = useParticipantPermissions({ participant })
  const canPublish = Boolean(permissions?.canPublish || isThisParticipantHost || isThisParticipantCohost)

  const avatarSeed = useMemo(() => {
    try {
      if (participant.metadata) {
        const meta = JSON.parse(participant.metadata)
        if (meta.avatar) return meta.avatar
      }
    } catch {}
    return participant.identity || participant.sid || ""
  }, [participant.identity, participant.metadata, participant.sid])

  const trackPub = participant.getTrackPublication(Track.Source.Microphone)
  const volume = useTrackVolume(trackPub?.track)

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

  const isDeafenedRemote = participant.attributes?.isDeafened === "true"

  const avatarElement = (
    <div className="relative group/avatar inline-block cursor-pointer">
      {/* Top Left Role Badge */}
      {isThisParticipantHost && (
        <span className="absolute -top-1.5 -left-1.5 z-20 bg-foreground text-background font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs border border-background leading-none">
          HOST
        </span>
      )}
      {isThisParticipantCohost && !isThisParticipantHost && (
        <span className="absolute -top-1.5 -left-1.5 z-20 bg-blue-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs border border-background leading-none">
          CO-HOST
        </span>
      )}

      {/* Top Right Reaction Badge */}
      {reaction && (
        <div className="animate-in fade-in zoom-in-75 duration-150 absolute -top-2 -right-2 z-30 flex size-7 sm:size-8 items-center justify-center rounded-full bg-card border border-border text-base sm:text-lg shadow-md pointer-events-none select-none">
          <span className="leading-none">{reaction}</span>
        </div>
      )}

      <div
        className={`relative rounded-full ${
          canPublish ? "" : "opacity-75"
        }`}
      >
        <Avatar className="size-14 sm:size-16 md:size-20 border border-border bg-card shadow-xs">
          <AvatarImage
            src={userpicUrl(avatarSeed)}
            alt={name}
            className="object-cover"
          />
          <AvatarFallback className="bg-muted text-foreground font-bold text-sm">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Mic status badge */}
        <div className="absolute -bottom-1 -right-1 z-10 flex size-6 items-center justify-center rounded-full bg-card border border-border shadow-xs">
          {canPublish ? (
            isDeafenedRemote ? (
              <RiVolumeMuteLine size={13} className="text-destructive" />
            ) : isAudioMuted ? (
              <RiMicOffLine size={13} className="text-destructive" />
            ) : (
              <RiMicLine size={13} className="text-foreground" />
            )
          ) : (
            <RiVolumeMuteLine size={13} className="text-muted-foreground" />
          )}
        </div>
      </div>

      {canModerateThisParticipant && !reaction && (
        <div className="absolute -top-1 -right-1 z-20 flex size-6 items-center justify-center rounded-full bg-foreground text-background shadow-xs transition-transform group-hover/avatar:scale-110 pointer-events-none">
          <RiMoreFill size={14} />
        </div>
      )}
    </div>
  )

  return (
    <div className="relative flex w-full flex-col items-center text-center">

      <div className="relative">
        {canModerateThisParticipant ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none cursor-pointer rounded-full hover:opacity-80 transition-opacity">
              {avatarElement}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" className="rounded-2xl font-mono text-xs">
              {!canPublish && !isThisParticipantHost && (
                <DropdownMenuItem
                  onClick={() => handleModerate("grant_mic")}
                  className="text-foreground focus:text-foreground font-semibold"
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
                    Mute Speaker
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleModerate("revoke_mic")}
                    className="text-amber-600 focus:text-amber-600"
                  >
                    Revoke Mic
                  </DropdownMenuItem>
                </>
              )}
              {!isThisParticipantHost && (
                <DropdownMenuItem
                  onClick={() => handleModerate("kick")}
                  className="text-destructive focus:text-destructive"
                >
                  Remove from space
                </DropdownMenuItem>
              )}
              {isHost && !isThisParticipantHost && !isThisParticipantCohost && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleModerate("grant_cohost")}>
                    Make Co-host
                  </DropdownMenuItem>
                </>
              )}
              {isHost && isThisParticipantCohost && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleModerate("revoke_cohost")}
                    className="text-destructive focus:text-destructive"
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

        {hasRequestedMic && isHostOrCohost && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-full bg-amber-500 text-black px-2.5 py-0.5 font-mono text-[9px] font-bold shadow-xs">
            Requested Mic
          </div>
        )}
      </div>

      {/* Participant Name */}
      <div className="mt-2 flex items-center justify-center gap-1 max-w-full truncate px-1">
        <span className="truncate text-xs font-bold text-foreground">
          {name} {name === localUserName ? "(You)" : ""}
        </span>
      </div>

      <span className="font-mono text-[10px] text-muted-foreground mt-0.5">
        {canPublish ? (isAudioMuted ? "Muted" : "Speaker") : "Listener"}
      </span>

      {canPublish && (
        <div className="mt-1.5 w-full max-w-[80px]">
          {isAudioMuted ? (
            <div className="h-3.5 w-full" />
          ) : (
            <AudioVisualizer volume={isSpeaking ? volume : 0} speaking={isSpeaking} />
          )}
        </div>
      )}
    </div>
  )
}
