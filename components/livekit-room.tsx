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
import { HugeiconsIcon } from "@/components/ui/hugeicons-icon"
import {
  Mic as Mic01Icon,
  MicOff as MicOff01Icon,
  Users as GroupIcon,
  Copy as Copy01Icon,
  Check as CheckIcon,
  Keyboard as KeyboardIcon,
  Settings as Settings01Icon,
  Smile as Happy01Icon,
  Headphones as HeadphonesIcon,
  MoreHorizontal as More01Icon,
  VolumeX as VolumeMute01Icon,
  Volume2 as VolumeUpIcon,
  Shield as Shield01Icon,
  AudioLines as VoiceIcon,
  AlertTriangle as Alert01Icon,
} from "lucide-react"
import { EmojiClickData, Theme } from "emoji-picker-react"
import EmojiPicker from "emoji-picker-react"
import { RoomEvent, Track } from "livekit-client"
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react"

import { AudioVisualizer } from "@/components/audio-visualizer"
import { BetterSpaceMark } from "@/components/brand/better-space-mark"
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
      <div className="flex min-h-svh items-center justify-center bg-background">
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
  const [hostDisconnectTime, setHostDisconnectTime] = useState<number | null>(
    null
  )
  const [disconnectCountdown, setDisconnectCountdown] = useState(60)

  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>(
    []
  )
  const [audioOutputDevices, setAudioOutputDevices] = useState<
    MediaDeviceInfo[]
  >([])
  const [selectedMicId, setSelectedMicId] = useState<string>("default")
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>("default")
  const [isPlayingTestSound, setIsPlayingTestSound] = useState(false)
  const localMicPub = localParticipant.getTrackPublication(
    Track.Source.Microphone
  )
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

  const canPublish = Boolean(
    localParticipant.permissions?.canPublish || isHostOrCohost
  )
  const prevCanPublish = useRef(canPublish)

  useEffect(() => {
    if (prevCanPublish.current === undefined) {
      prevCanPublish.current = canPublish
      return
    }

    if (canPublish && !prevCanPublish.current) {
      toast.add({ title: "Host granted you the microphone!", type: "success" })
      localParticipant.setMicrophoneEnabled(true).catch(() => {
        toast.add({
          title: "Could not automatically enable microphone.",
          type: "error",
        })
      })
    } else if (!canPublish && prevCanPublish.current) {
      toast.add({
        title: "Host revoked your microphone access.",
        type: "error",
      })
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
          displayReaction(
            participant?.identity || data.senderIdentity,
            data.emoji
          )
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
            toast.add({
              title: "Your microphone request was declined.",
              type: "info",
            })
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
    const anyCohostInRoom = participants.some((p) =>
      roomCohosts.includes(p.identity)
    )

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
    const anyCohostInRoom = participants.some((p) =>
      roomCohosts.includes(p.identity)
    )
    shouldHostTimerRunRef.current = !anyCohostInRoom
  }, [participants, roomCohosts])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isHost && !intentionalLeaveRef.current) {
        if (shouldHostTimerRunRef.current) {
          localStorage.setItem(
            `space_host_disconnected_${roomName}`,
            Date.now().toString()
          )
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
          localStorage.setItem(
            `space_host_disconnected_${roomName}`,
            Date.now().toString()
          )
        } else {
          localStorage.removeItem(`space_host_disconnected_${roomName}`)
        }
      }
    }
  }, [isHost, roomName])

  const handleSendReaction = (emojiOrData: EmojiClickData | string) => {
    const emoji =
      typeof emojiOrData === "string" ? emojiOrData : emojiOrData.emoji
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
    const data = encoder.encode(
      JSON.stringify({ type: "MIC_REQUEST", identity: userName })
    )
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
      toast.add({
        title: `Granted microphone to ${targetIdentity}`,
        type: "success",
      })
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
          title:
            "Cannot access microphone. You must use an HTTPS connection to test audio.",
          type: "error",
        })
      } else {
        toast.add({
          title: "Failed to toggle microphone: " + e.message,
          type: "error",
        })
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
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.enumerateDevices
    )
      return
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
    return () =>
      navigator.mediaDevices?.removeEventListener?.(
        "devicechange",
        fetchDevices
      )
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
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      setIsPlayingTestSound(true)

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
        gain.gain.setValueAtTime(0.12, ctx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + start + duration
        )
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
    <div className="relative flex min-h-svh flex-col bg-background text-foreground">
      <div className="bg-studio-grid pointer-events-none absolute inset-0 opacity-40" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between gap-2 border-b border-border bg-card/80 px-2.5 backdrop-blur-md sm:h-14 sm:gap-3 sm:px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <BetterSpaceMark
            className="size-3.5 shrink-0 text-foreground sm:size-4"
            strokeWidth={4}
          />
          <h1 className="max-w-[180px] truncate font-display text-xs font-bold text-foreground sm:max-w-md sm:text-sm md:max-w-xl">
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
                  className="hidden h-8 w-8 cursor-help rounded-xl text-muted-foreground sm:inline-flex"
                >
                  <HugeiconsIcon icon={KeyboardIcon} size={15} />
                </Button>
              }
            />
            <HoverCardContent className="z-50 w-64 rounded-2xl border border-border bg-card p-4 shadow-xl">
              <div className="space-y-3 font-mono text-xs">
                <h4 className="flex items-center gap-2 font-bold text-foreground">
                  <HugeiconsIcon icon={KeyboardIcon} size={15} /> Keyboard
                  Shortcuts
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

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon"
                  onClick={copyInviteLink}
                  disabled={copied}
                  variant="outline"
                  aria-label="Copy invite link"
                  className="h-8 w-8 rounded-xl text-muted-foreground"
                >
                  {copied ? (
                    <HugeiconsIcon icon={CheckIcon} size={15} />
                  ) : (
                    <HugeiconsIcon icon={Copy01Icon} size={15} />
                  )}
                </Button>
              }
            />
            <TooltipContent side="bottom">Copy link</TooltipContent>
          </Tooltip>

          {isHostOrCohost ? (
            <>
              <Popover open={isEndSpaceOpen} onOpenChange={setIsEndSpaceOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 font-mono text-xs font-bold"
                    >
                      End Space
                    </Button>
                  }
                />
                <PopoverContent
                  side="bottom"
                  align="end"
                  className="w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-4 shadow-xl"
                >
                  <PopoverHeader>
                    <PopoverTitle className="text-sm font-bold">
                      End Studio Space
                    </PopoverTitle>
                    <PopoverDescription className="text-xs">
                      Are you sure you want to end this space? Everyone will be
                      disconnected.
                    </PopoverDescription>
                  </PopoverHeader>
                  <div className="flex flex-col gap-2 pt-3 font-mono text-xs">
                    <Button
                      variant="destructive"
                      onClick={handleEndSpace}
                      className="font-bold"
                    >
                      End for everyone
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEndSpaceOpen(false)}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <Button
              variant="ghost"
              onClick={onLeave}
              className="h-8 rounded-xl font-mono text-xs font-bold text-red-500 hover:bg-red-500/10 hover:text-red-500"
            >
              Leave
            </Button>
          )}
        </div>
      </header>

      {/* Main Stage Grid */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto p-2.5 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:p-4 md:p-6 md:pb-[calc(9rem+env(safe-area-inset-bottom))]">
          <section
            aria-labelledby="participants-heading"
            className="space-y-3 sm:space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2
                id="participants-heading"
                className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase sm:gap-2 sm:text-xs"
              >
                <HugeiconsIcon
                  icon={GroupIcon}
                  className="size-3.5 sm:size-4"
                  aria-hidden="true"
                />
                Stage ({participants.length})
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
            <div className="pointer-events-auto flex items-center justify-center rounded-full border border-destructive/20 bg-destructive px-5 py-2.5 font-mono text-xs font-bold text-destructive-foreground shadow-xl">
              <HugeiconsIcon
                icon={Alert01Icon}
                className="mr-2 size-4 shrink-0"
                aria-hidden="true"
              />
              Host disconnected. Space ends in {disconnectCountdown}s
            </div>
          </div>
        )}

        {/* Tactile Hardware Bottom Audio Controls Bar */}
        <div className="fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex max-w-[calc(100vw-0.75rem)] -translate-x-1/2 rounded-xl border border-border bg-card/95 p-1 shadow-2xl backdrop-blur-md sm:rounded-2xl sm:p-1.5 md:p-2">
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            {/* Audio Settings Popover */}
            <Popover
              onOpenChange={(open) => {
                if (!open) return
                if (
                  audioInputDevices.length === 0 ||
                  audioInputDevices.some((d) => !d.label)
                ) {
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
              <Tooltip>
                <TooltipTrigger
                  render={
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-9 shrink-0 rounded-xl text-muted-foreground sm:size-10"
                          aria-label="Audio settings"
                        >
                          <HugeiconsIcon icon={Settings01Icon} size={17} />
                        </Button>
                      }
                    />
                  }
                />
                <TooltipContent>Audio settings</TooltipContent>
              </Tooltip>
              <PopoverContent
                className="w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-4 shadow-2xl sm:p-5"
                align="center"
                side="top"
                sideOffset={12}
              >
                <PopoverHeader className="space-y-1">
                  <PopoverTitle className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider uppercase">
                    <HugeiconsIcon
                      icon={Settings01Icon}
                      className="size-3.5"
                      aria-hidden="true"
                    />
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
                      <FieldLabel
                        htmlFor="mic-select"
                        className="flex items-center gap-1.5 text-xs font-bold"
                      >
                        <HugeiconsIcon
                          icon={Mic01Icon}
                          className="size-3.5 text-muted-foreground"
                          aria-hidden="true"
                        />
                        Microphone
                      </FieldLabel>
                      {isMuted && (
                        <span className="text-[10px] text-muted-foreground">
                          Muted
                        </span>
                      )}
                    </div>
                    <Select
                      value={selectedMicId}
                      onValueChange={handleMicChange}
                      items={micItems}
                    >
                      <SelectTrigger
                        id="mic-select"
                        className="h-8 w-full rounded-lg text-xs"
                      >
                        <SelectValue placeholder="Select a microphone">
                          {(val: string | null) => {
                            const found = micItems.find((m) => m.value === val)
                            return found?.label || "Default Microphone"
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {micItems.map((item) => (
                          <SelectItem
                            key={item.value}
                            value={item.value}
                            className="text-xs"
                          >
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
                          className="h-full rounded-full bg-foreground transition-all duration-75 ease-out"
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
                    <Field className="gap-1.5 border-t border-border/50 pt-1">
                      <div className="flex items-center justify-between pt-1">
                        <FieldLabel
                          htmlFor="speaker-select"
                          className="flex items-center gap-1.5 text-xs font-bold"
                        >
                          <HugeiconsIcon
                            className="size-3.5 text-muted-foreground"
                            aria-hidden="true"
                            icon={HeadphonesIcon}
                          />
                          Speaker / Headphones
                        </FieldLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={playTestSound}
                          disabled={isPlayingTestSound}
                          className="h-6 gap-1 px-2 font-mono text-[10px] text-foreground"
                        >
                          <HugeiconsIcon
                            className="size-3"
                            aria-hidden="true"
                            icon={VolumeUpIcon}
                          />
                          {isPlayingTestSound ? "Testing..." : "Test"}
                        </Button>
                      </div>
                      <Select
                        value={selectedSpeakerId}
                        onValueChange={handleSpeakerChange}
                        items={speakerItems}
                      >
                        <SelectTrigger
                          id="speaker-select"
                          className="h-8 w-full rounded-lg text-xs"
                        >
                          <SelectValue placeholder="Default speaker">
                            {(val: string | null) => {
                              const found = speakerItems.find(
                                (s) => s.value === val
                              )
                              return found?.label || "Default Speaker"
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {speakerItems.map((item) => (
                            <SelectItem
                              key={item.value}
                              value={item.value}
                              className="text-xs"
                            >
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}

                  {/* Audio enhancement status */}
                  <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/40 px-2.5 py-2 text-[10px] text-muted-foreground">
                    <HugeiconsIcon
                      className="size-3.5 shrink-0 text-foreground"
                      aria-hidden="true"
                      icon={Shield01Icon}
                    />
                    <span>Noise suppression active</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Emoji Reaction Popover */}
            <Popover>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-9 shrink-0 rounded-xl text-muted-foreground sm:size-10"
                        >
                          <HugeiconsIcon icon={Happy01Icon} size={17} />
                        </Button>
                      }
                    />
                  }
                />
                <TooltipContent>Emoji</TooltipContent>
              </Tooltip>
              <PopoverContent className="z-50 w-auto max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-2xl">
                <div className="flex items-center justify-between gap-1 overflow-x-auto border-b border-border bg-muted/40 p-2">
                  {["👏", "🔥", "❤️", "😂", "🎉", "👍", "🚀", "💯"].map(
                    (emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        aria-label={`React with ${emoji}`}
                        onClick={() => handleSendReaction(emoji)}
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 rounded-lg text-lg active:scale-95"
                      >
                        {emoji}
                      </Button>
                    )
                  )}
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
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            size="icon"
                            className="relative size-9 shrink-0 rounded-xl text-muted-foreground sm:size-10"
                          >
                            <HugeiconsIcon icon={VoiceIcon} size={17} />
                            {micRequests.length > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[9px] font-bold text-destructive-foreground tabular-nums shadow-xs sm:h-5 sm:min-w-5 sm:text-[10px]">
                                {micRequests.length}
                              </span>
                            )}
                          </Button>
                        }
                      />
                    }
                  />
                  <TooltipContent>Mic requests</TooltipContent>
                </Tooltip>
                <PopoverContent
                  className="w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-2xl"
                  align="center"
                  side="top"
                  sideOffset={12}
                >
                  <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                    <h3 className="font-mono text-xs font-bold tracking-wider text-foreground uppercase">
                      Mic Requests
                    </h3>
                    {micRequests.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="font-mono text-[10px] font-bold"
                      >
                        {micRequests.length} Pending
                      </Badge>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto p-2">
                    {micRequests.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <HugeiconsIcon
                          className="mb-2 size-6 text-muted-foreground/40"
                          aria-hidden="true"
                          icon={VoiceIcon}
                        />
                        <p className="font-mono text-xs text-muted-foreground">
                          No pending mic requests
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {micRequests.map((identity) => (
                          <div
                            key={identity}
                            className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-2"
                          >
                            <div className="mr-2 flex min-w-0 items-center gap-2.5">
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
                  className="h-9 shrink-0 gap-1.5 rounded-xl px-3 font-mono text-xs font-bold sm:h-10 sm:gap-2 sm:px-4"
                >
                  {isDeafened ? (
                    <HugeiconsIcon icon={VolumeMute01Icon} size={16} />
                  ) : (
                    <HugeiconsIcon icon={HeadphonesIcon} size={16} />
                  )}
                  <span className="hidden sm:inline">Deafen</span>
                </Button>

                <Button
                  onClick={toggleMute}
                  disabled={isDeafened}
                  variant={isMuted ? "destructive" : "default"}
                  size="lg"
                  className="h-9 shrink-0 gap-1.5 rounded-xl px-3.5 font-mono text-xs font-bold shadow-xs sm:h-10 sm:gap-2 sm:px-5"
                >
                  {isMuted ? (
                    <>
                      <HugeiconsIcon icon={MicOff01Icon} size={16} />
                      <span>MIC MUTED</span>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={Mic01Icon}
                        size={16}
                        className="text-primary-foreground"
                      />
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
                className="h-9 shrink-0 gap-1.5 rounded-xl px-3.5 font-mono text-xs font-bold sm:h-10 sm:gap-2 sm:px-5"
              >
                <HugeiconsIcon icon={Mic01Icon} size={16} />
                <span>
                  {hasRequestedMicLocal ? "Requested" : "Request Mic"}
                </span>
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
  const canPublish = Boolean(
    permissions?.canPublish || isThisParticipantHost || isThisParticipantCohost
  )

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
    <div className="group/avatar relative inline-block cursor-pointer">
      {/* Top Left Role Badge */}
      {isThisParticipantHost && (
        <span className="absolute -top-1.5 -left-1.5 z-20 rounded-full border border-background bg-foreground px-1.5 py-0.5 font-mono text-[9px] leading-none font-black text-background shadow-xs">
          HOST
        </span>
      )}
      {isThisParticipantCohost && !isThisParticipantHost && (
        <span className="absolute -top-1.5 -left-1.5 z-20 rounded-full border border-background bg-blue-600 px-1.5 py-0.5 font-mono text-[9px] leading-none font-bold text-white shadow-xs">
          CO-HOST
        </span>
      )}

      {/* Top Right Reaction Badge */}
      {reaction && (
        <div className="pointer-events-none absolute -top-2 -right-2 z-30 flex size-7 animate-in items-center justify-center rounded-full border border-border bg-card text-base shadow-md duration-150 select-none zoom-in-75 fade-in sm:size-8 sm:text-lg">
          <span className="leading-none">{reaction}</span>
        </div>
      )}

      <div
        className={`relative rounded-full ${canPublish ? "" : "opacity-75"}`}
      >
        <Avatar className="size-14 border border-border bg-card shadow-xs sm:size-16 md:size-20">
          <AvatarImage
            src={userpicUrl(avatarSeed)}
            alt={name}
            className="object-cover"
          />
          <AvatarFallback className="bg-muted text-sm font-bold text-foreground">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Mic status badge */}
        <div className="absolute -right-1 -bottom-1 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-card shadow-xs">
          {canPublish ? (
            isDeafenedRemote ? (
              <HugeiconsIcon
                icon={VolumeMute01Icon}
                size={13}
                className="text-destructive"
              />
            ) : isAudioMuted ? (
              <HugeiconsIcon
                icon={MicOff01Icon}
                size={13}
                className="text-destructive"
              />
            ) : (
              <HugeiconsIcon
                icon={Mic01Icon}
                size={13}
                className="text-foreground"
              />
            )
          ) : (
            <HugeiconsIcon
              icon={VolumeMute01Icon}
              size={13}
              className="text-muted-foreground"
            />
          )}
        </div>
      </div>

      {canModerateThisParticipant && !reaction && (
        <div className="pointer-events-none absolute -top-1 -right-1 z-20 flex size-6 items-center justify-center rounded-full bg-foreground text-background shadow-xs transition-transform group-hover/avatar:scale-110">
          <HugeiconsIcon icon={More01Icon} size={14} />
        </div>
      )}
    </div>
  )

  return (
    <div className="relative flex w-full flex-col items-center text-center">
      <div className="relative">
        {canModerateThisParticipant ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer rounded-full transition-opacity hover:opacity-80 focus:outline-none">
              {avatarElement}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              side="top"
              className="rounded-2xl font-mono text-xs"
            >
              {!canPublish && !isThisParticipantHost && (
                <DropdownMenuItem
                  onClick={() => handleModerate("grant_mic")}
                  className="font-semibold text-foreground focus:text-foreground"
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
          <div className="absolute -bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-amber-500 px-2.5 py-0.5 font-mono text-[9px] font-bold whitespace-nowrap text-black shadow-xs">
            Requested Mic
          </div>
        )}
      </div>

      {/* Participant Name */}
      <div className="mt-2 flex max-w-full items-center justify-center gap-1 truncate px-1">
        <span className="truncate text-xs font-bold text-foreground">
          {name} {name === localUserName ? "(You)" : ""}
        </span>
      </div>

      <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
        {canPublish ? (isAudioMuted ? "Muted" : "Speaker") : "Listener"}
      </span>

      {canPublish && (
        <div className="mt-1.5 w-full max-w-[80px]">
          {isAudioMuted ? (
            <div className="h-3.5 w-full" />
          ) : (
            <AudioVisualizer
              volume={isSpeaking ? volume : 0}
              speaking={isSpeaking}
            />
          )}
        </div>
      )}
    </div>
  )
}
