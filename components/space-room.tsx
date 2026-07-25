"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import Peer, { MediaConnection, DataConnection } from "peerjs";
import { 
  Mic01Icon as Mic, MicOff01Icon as MicOff, UserGroupIcon as Users, 
  Copy01Icon as Copy, CheckmarkBadge01Icon as Check, Logout01Icon as LogOut, 
  Message01Icon as MessageSquare, HeadphonesIcon as Headphones, VolumeOffIcon, KeyboardIcon,
  ArrowDown01Icon as ChevronDown
} from "hugeicons-react";
import { useTheme } from "next-themes";
import { Message, MessageAvatar, MessageContent, MessageHeader } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { AudioVisualizer } from "@/components/audio-visualizer";
import { EmojiClickData, Theme } from "emoji-picker-react";
import EmojiPicker from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { SmileIcon as Smile, Settings01Icon as SettingsIcon } from "hugeicons-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

interface Participant {
  memberId: string;
  peerId: string;
  name: string;
  role: "member";
  isMuted: boolean;
  isDeafened?: boolean;
  isHandRaised: boolean;
  isSpeaking?: boolean;
  reaction?: string;
  isInitial?: boolean;
}

interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  timestamp: string;
}

interface SpaceRoomProps {
  roomName: string;
  userName: string;
  roomId: string;
  onLeave: () => void;
}

export function SpaceRoom({ roomName, userName, roomId, onLeave }: SpaceRoomProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [peerId, setPeerId] = useState<string>("");
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isDeafened, setIsDeafened] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [showChat, setShowChat] = useState<boolean>(false);
  const [streams, setStreams] = useState<Map<string, MediaStream>>(new Map());
  
  // Audio Settings
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>("default");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>("default");
  const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null);

  // Track showChat for async callbacks
  const showChatRef = useRef(showChat);
  useEffect(() => { showChatRef.current = showChat; }, [showChat]);

  const selectedSpeakerIdRef = useRef(selectedSpeakerId);
  useEffect(() => { selectedSpeakerIdRef.current = selectedSpeakerId; }, [selectedSpeakerId]);

  // References
  const peerRef = useRef<Peer | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const memberIdRef = useRef<string>("");
  const localStreamRef = useRef<MediaStream | null>(null);
  const rawStreamRef = useRef<MediaStream | null>(null);
  const callsRef = useRef<Map<string, MediaConnection>>(new Map());
  const dataConnsRef = useRef<Map<string, DataConnection>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const reactionTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Mutable Refs for stale closures in PeerJS callbacks
  const participantsRef = useRef(participants);
  useEffect(() => { 
    participantsRef.current = participants; 
  }, [participants]);
  
  const peerIdRef = useRef(peerId);
  useEffect(() => { peerIdRef.current = peerId; }, [peerId]);



  const isMutedRef = useRef(isMuted);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  const isDeafenedRef = useRef(isDeafened);
  useEffect(() => { isDeafenedRef.current = isDeafened; }, [isDeafened]);

  const getLocalAudioStream = async (deviceId?: string) => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
          ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          // @ts-expect-error chrome specific constraints
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googEchoCancellation: true,
        },
        video: false,
      };
      if (!navigator.mediaDevices) return null;
      const rawStream = await navigator.mediaDevices.getUserMedia(constraints);
      rawStreamRef.current = rawStream;
      localStreamRef.current = rawStream;

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: "Space Room",
          artist: "Ongoing Call",
          album: "Live Audio",
          artwork: [ { src: "/icon.svg", sizes: "512x512", type: "image/svg+xml" } ]
        });
        navigator.mediaSession.playbackState = "paused";
        
        try {
          if ('setMicrophoneActive' in navigator.mediaSession) {
            (navigator.mediaSession as any).setMicrophoneActive(false);
          }
        } catch (e) {}

        const handleMuteToggle = () => {
          setIsMuted(currentMuted => {
            const next = !currentMuted;
            if (rawStreamRef.current) rawStreamRef.current.getAudioTracks().forEach(t => t.enabled = !next);
            if (localStreamRef.current) localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !next);
            if ('mediaSession' in navigator) {
              try {
                if ('setMicrophoneActive' in navigator.mediaSession) (navigator.mediaSession as any).setMicrophoneActive(!next);
                navigator.mediaSession.playbackState = next ? "paused" : "playing";
              } catch (e) {}
            }
            if (channelRef.current) {
              channelRef.current.send({
                type: "broadcast",
                event: "room:update",
                payload: { type: "UPDATE_STATUS", payload: { peerId: peerRef.current?.id, isMuted: next } }
              });
            }
            setParticipants(prev => {
              const map = new Map(prev);
              const me = map.get(memberIdRef.current);
              if (me) map.set(memberIdRef.current, { ...me, isMuted: next });
              return map;
            });
            return next;
          });
        };

        try {
          navigator.mediaSession.setActionHandler('play', handleMuteToggle);
          navigator.mediaSession.setActionHandler('pause', handleMuteToggle);
          navigator.mediaSession.setActionHandler('stop', onLeave);
          if ('togglemicrophone' in navigator.mediaSession) (navigator.mediaSession as any).setActionHandler('togglemicrophone', handleMuteToggle);
        } catch (e) {
          console.warn("MediaSession action handlers not supported", e);
        }
      }

      setLocalStreamState(rawStream);
      rawStream.getAudioTracks().forEach((track) => { track.enabled = !isMuted; });
      return rawStream;
    } catch (err) {
      console.warn("Microphone access denied:", err);
      return null;
    }
  };

  const displayReaction = (targetPeerId: string, emoji: string) => {
    setParticipants((prev) => {
      const next = new Map(prev);
      for (const [id, p] of next) {
        if (p.peerId === targetPeerId) {
          next.set(id, { ...p, reaction: emoji });
          break;
        }
      }
      return next;
    });

    if (reactionTimeoutsRef.current.has(targetPeerId)) {
      clearTimeout(reactionTimeoutsRef.current.get(targetPeerId)!);
    }

    const timeout = setTimeout(() => {
      setParticipants((prev) => {
        const next = new Map(prev);
        for (const [id, p] of next) {
          if (p.peerId === targetPeerId) {
            next.set(id, { ...p, reaction: undefined });
            break;
          }
        }
        return next;
      });
      reactionTimeoutsRef.current.delete(targetPeerId);
    }, 4000);

    reactionTimeoutsRef.current.set(targetPeerId, timeout);
  };

  const handleSendReaction = (emojiObject: EmojiClickData) => {
    const emoji = emojiObject.emoji;
    const payload = { peerId, emoji };
    broadcastData({ type: "REACTION", payload });
    displayReaction(peerId, emoji);
  };

  const handleDeviceChange = async (deviceId: string | null) => {
    if (!deviceId) return;
    setSelectedMicId(deviceId);
    const newStream = await getLocalAudioStream(deviceId);
    if (!newStream) return;

    const newAudioTrack = newStream.getAudioTracks()[0];
    if (!newAudioTrack) return;

    Array.from(callsRef.current.values()).forEach((call) => {
      const sender = call.peerConnection.getSenders().find(s => s.track?.kind === "audio");
      if (sender) sender.replaceTrack(newAudioTrack);
    });
  };

  const handleSpeakerChange = async (deviceId: string | null) => {
    if (!deviceId) return;
    setSelectedSpeakerId(deviceId);
    audioElementsRef.current.forEach((audio) => {
      if (typeof (audio as any).setSinkId === "function") {
        (audio as any).setSinkId(deviceId).catch(console.error);
      }
    });
  };

  function connectToPeer(target: Participant, myParticipantInfo: Participant) {
    const targetPeerId = target.peerId;
    if (!peerRef.current || targetPeerId === peerRef.current.id || callsRef.current.has(targetPeerId)) return;

    const call = peerRef.current.call(targetPeerId, localStreamRef.current as MediaStream, {
      metadata: { participant: myParticipantInfo }
    });

    if (call) {
      call.on("stream", (remoteStream) => attachRemoteStream(targetPeerId, remoteStream));
      call.on("close", () => {
        if (callsRef.current.get(targetPeerId) === call) callsRef.current.delete(targetPeerId);
        removeRemoteStream(targetPeerId);
      });
      callsRef.current.set(targetPeerId, call);
    }
  }

  function attachRemoteStream(peerId: string, stream: MediaStream) {
    if (audioElementsRef.current.has(peerId)) return;
    const audio = document.createElement("audio");
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.muted = isDeafenedRef.current;

    if (typeof (audio as any).setSinkId === "function" && selectedSpeakerIdRef.current !== "default") {
      (audio as any).setSinkId(selectedSpeakerIdRef.current).catch(console.error);
    }

    audio.play().catch(e => console.error("Error playing remote audio", e));
    audioElementsRef.current.set(peerId, audio);
    document.body.appendChild(audio);
    
    setStreams(prev => {
      const next = new Map(prev);
      next.set(peerId, stream);
      return next;
    });
  }

  function removeRemoteStream(peerId: string) {
    const audio = audioElementsRef.current.get(peerId);
    if (audio) {
      audio.remove();
      audioElementsRef.current.delete(peerId);
    }
    
    setStreams(prev => {
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
  }

  useEffect(() => {
    const fetchDevices = async () => {
      if (!navigator.mediaDevices) {
        console.warn("Media devices API not available.");
        return;
      }
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter(d => d.kind === "audioinput");
        const speakers = devices.filter(d => d.kind === "audiooutput");
        setAudioDevices(mics);
        setSpeakerDevices(speakers);
        if (mics.length > 0 && selectedMicId === "default") {
          const def = mics.find(m => m.deviceId === "default") || mics[0];
          setSelectedMicId(def.deviceId);
        }
        if (speakers.length > 0 && selectedSpeakerId === "default") {
          const def = speakers.find(m => m.deviceId === "default") || speakers[0];
          setSelectedSpeakerId(def.deviceId);
        }
      } catch (e) {
        console.error("Could not fetch audio devices", e);
      }
    };
    fetchDevices();
  }, [selectedMicId, selectedSpeakerId]);

  const broadcastData = (data: { type: string; payload?: unknown }) => {
    channelRef.current?.send({ type: "broadcast", event: "room:update", payload: data });
  };

  useEffect(() => {
    const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
      return 'id-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
    };
    
    const storedMemberId = window.sessionStorage.getItem("spacex-member-id") || generateId();
    window.sessionStorage.setItem("spacex-member-id", storedMemberId);
    memberIdRef.current = storedMemberId;

    const peerInstance = new Peer({ debug: 0 });
    peerRef.current = peerInstance;

    const memberFor = (member: { id: string; peerId: string; name: string }, isInitial = false): Participant => ({
      memberId: member.id,
      peerId: member.peerId,
      name: member.name,
      role: "member",
      isMuted: true,
      isDeafened: false,
      isHandRaised: false,
      isInitial,
    });

    const connectRoster = (roster: Participant[]) => {
      const me = participantsRef.current.get(memberIdRef.current) || roster.find((person) => person.memberId === memberIdRef.current);
      if (!me) return;
      roster.filter((person) => person.memberId !== memberIdRef.current).forEach((person) => connectToPeer(person, me));
    };

    const channel = supabase.channel("global-main-room", {
      config: { presence: { key: storedMemberId } }
    });
    channelRef.current = channel;

    const announce = () => {
      if (channel.state === "joined" && peerInstance.open) {
        channel.track({ id: storedMemberId, peerId: peerInstance.id, name: userName });
      }
    };

    peerInstance.on("open", (id) => {
      setPeerId(id);
      const me = memberFor({ id: storedMemberId, peerId: id, name: userName }, true);
      setParticipants((prev) => new Map(prev).set(storedMemberId, me));
      void getLocalAudioStream().then(() => connectRoster(Array.from(participantsRef.current.values())));
      announce();
    });

    peerInstance.on("call", async (call) => {
      const stream = localStreamRef.current || (await getLocalAudioStream());
      call.answer(stream || undefined);
      call.on("stream", (remoteStream) => attachRemoteStream(call.peer, remoteStream));
      call.on("close", () => {
        if (callsRef.current.get(call.peer) === call) callsRef.current.delete(call.peer);
        removeRemoteStream(call.peer);
      });
      callsRef.current.set(call.peer, call);
    });

    peerInstance.on("disconnected", () => peerInstance.reconnect());
    peerInstance.on("error", (error) => {
      if (error.type !== "peer-unavailable") console.warn("PeerJS Warning:", error);
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const roster = [];
        for (const presenceIds in state) {
          const presences = state[presenceIds];
          for (const p of presences) roster.push(memberFor(p as unknown as { id: string; peerId: string; name: string }, true));
        }

        const currentMembers = new Set(roster.map(p => p.memberId));
        participantsRef.current.forEach((p, memberId) => {
          if (!currentMembers.has(memberId) && memberId !== storedMemberId) {
            callsRef.current.get(p.peerId)?.close();
            removeRemoteStream(p.peerId);
          }
        });

        const next = new Map();
        roster.forEach(p => {
          const existing = participantsRef.current.get(p.memberId);
          if (existing) next.set(p.memberId, { ...existing, ...p });
          else next.set(p.memberId, { ...p, isInitial: false });
        });
        
        const me = next.get(storedMemberId);
        if (me) next.set(storedMemberId, { ...me, isMuted: isMutedRef.current, isDeafened: isDeafenedRef.current });
        
        setParticipants(next);
        connectRoster(Array.from(next.values()));
      })
      .on("broadcast", { event: "room:update" }, ({ payload: message }) => {
        if (!message?.type) return;
        if (message.type === "UPDATE_STATUS") {
          const { peerId: targetId, isMuted: muted, isDeafened: deafened, isHandRaised } = message.payload;
          setParticipants((prev) => {
            const next = new Map(prev);
            for (const [id, person] of next) if (person.peerId === targetId) next.set(id, { ...person, isMuted: muted ?? person.isMuted, isDeafened: deafened ?? person.isDeafened, isHandRaised: isHandRaised ?? person.isHandRaised });
            return next;
          });
        } else if (message.type === "REACTION") {
          displayReaction(message.payload.peerId, message.payload.emoji);
        } else if (message.type === "CHAT_MSG") {
          setMessages((prev) => [...prev, message.payload]);
          if (!showChatRef.current && message.payload.senderName !== userName) toast.message(`Message from ${message.payload.senderName}`, { description: message.payload.text });
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") announce();
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      callsRef.current.forEach((call) => call.close());
      dataConnsRef.current.forEach((conn) => conn.close());
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      rawStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioElementsRef.current.forEach((audio) => audio.remove());
      peerInstance.destroy();
      channelRef.current = null;
    };
  }, []);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (rawStreamRef.current) {
      rawStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
    }
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
    }

    if ('mediaSession' in navigator) {
      try {
        if ('setMicrophoneActive' in navigator.mediaSession) {
          (navigator.mediaSession as any).setMicrophoneActive(!nextMuted);
        }
        navigator.mediaSession.playbackState = nextMuted ? "paused" : "playing";
      } catch (e) {}
    }

    const payload = { peerId, isMuted: nextMuted };
    broadcastData({ type: "UPDATE_STATUS", payload });
    setParticipants((prev) => {
      const next = new Map(prev);
      const me = next.get(memberIdRef.current);
      if (me) next.set(memberIdRef.current, { ...me, isMuted: nextMuted });
      return next;
    });
  };

  // Toggle Deafen
  const toggleDeafen = () => {
    const nextDeafened = !isDeafened;
    setIsDeafened(nextDeafened);
    
    // Apply deafen state to all current remote audio elements
    audioElementsRef.current.forEach((audio) => {
      audio.muted = nextDeafened;
    });

    const payload = { peerId, isDeafened: nextDeafened };
    broadcastData({ type: "UPDATE_STATUS", payload });
    setParticipants((prev) => {
      const next = new Map(prev);
      const me = next.get(memberIdRef.current);
      if (me) next.set(memberIdRef.current, { ...me, isDeafened: nextDeafened });
      return next;
    });
    
    // Auto-mute if deafening
    if (nextDeafened && !isMuted) {
      toggleMute();
    }
  };

  // Hotkey for Mute/Unmute (Cmd/Ctrl + D) and Deafen (Cmd/Ctrl + E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        toggleDeafen();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleMute();
      } else if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMuted, isDeafened, peerId, theme]);

  // Media Session API for background mobile mute/unmute
  const toggleMuteRef = useRef(toggleMute);
  useEffect(() => { toggleMuteRef.current = toggleMute; }, [toggleMute]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      const handleToggle = () => toggleMuteRef.current();
      const handlePlay = () => { if (isMuted) toggleMuteRef.current(); };
      const handlePause = () => { if (!isMuted) toggleMuteRef.current(); };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      try { navigator.mediaSession.setActionHandler('togglemicrophone' as any, handleToggle); } catch {}
      try { navigator.mediaSession.setActionHandler('play', handlePlay); } catch {}
      try { navigator.mediaSession.setActionHandler('pause', handlePause); } catch {}
      
      try {
        if (navigator.mediaSession.setMicrophoneActive) {
          navigator.mediaSession.setMicrophoneActive(!isMuted);
        }
      } catch {}
    }
    
    return () => {
      if ('mediaSession' in navigator) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          navigator.mediaSession.setActionHandler('togglemicrophone' as any, null);
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
        } catch {}
      }
    };
  }, [isMuted]);

  // Remove unused host privilege methods

  // Send Chat Message
  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: userName,
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, msg]);
    broadcastData({ type: "CHAT_MSG", payload: msg });
    setChatInput("");
  };

  // Copy Room Link to Clipboard
  const copyInviteLink = () => {
    if (copied) return;
    const url = `${window.location.origin}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Group participants (everyone is a speaker)
  const allList = Array.from(participants.values());

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative">
      {/* Top Bar Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight">Space</span>
            <Badge variant="destructive" className="text-[10px] px-2 py-0 h-5 border-0 font-bold tracking-wider rounded-sm shadow-none">
              LIVE
            </Badge>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] px-2 py-0 h-5 font-mono text-muted-foreground ml-2 rounded-sm">
              {roomId}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:block">
            <HoverCard>
              <HoverCardTrigger render={
              <div className="relative border bg-background hover:bg-muted rounded-md h-8 w-8 flex items-center justify-center cursor-help transition-colors text-muted-foreground">
                <KeyboardIcon className="h-4 w-4" />
              </div>
            } />
            <HoverCardContent className="w-64 p-4 shadow-2xl rounded-xl z-[100]" sideOffset={10} align="end">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <KeyboardIcon className="h-4 w-4" /> Keyboard Shortcuts
                </h4>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Toggle Mute</span>
                    <KbdGroup><Kbd>⌘</Kbd><Kbd>D</Kbd></KbdGroup>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Toggle Deafen</span>
                    <KbdGroup><Kbd>⌘</Kbd><Kbd>E</Kbd></KbdGroup>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Toggle Dark Mode</span>
                    <KbdGroup><Kbd>D</Kbd></KbdGroup>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={copyInviteLink}
            disabled={copied}
            className="w-[140px] active:scale-[0.97] transition-all duration-150 ease-out"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied Link!" : "Invite Friends"}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onLeave}
            className="gap-1.5 active:scale-[0.97] transition-all duration-150 ease-out"
          >
            <LogOut className="h-4 w-4" />
            Leave
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Stage Grid */}
        <main className="flex-1 p-4 md:p-10 pb-32 overflow-y-auto max-w-5xl mx-auto w-full flex flex-col gap-8">
          
          {/* Speakers & Hosts Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Participants ({allList.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {allList.map((speaker, index) => (
                <Card
                  key={speaker.peerId}
                  className="bg-card text-card-foreground p-5 flex flex-col items-center justify-center relative group shadow-sm animate-in fade-in zoom-in-95 duration-300 ease-out"
                  style={{ animationDelay: speaker.isInitial ? `${index * 50}ms` : "0ms", animationFillMode: "both" }}
                >
                  {/* Reaction */}
                  {speaker.reaction && (
                    <div className="absolute top-3 right-3 bg-background/95 backdrop-blur border shadow-sm rounded-full h-9 w-9 flex items-center justify-center text-xl z-10 animate-in fade-in zoom-in-95 duration-200 ease-out">
                      <span className="leading-none select-none">{speaker.reaction}</span>
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="relative mb-3">
                    <Avatar className={`h-20 w-20 border-2 border-primary`}>
                      <AvatarFallback className="bg-muted text-foreground font-bold text-xl">
                        {speaker.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Mute indicator status */}
                    <div
                      className={`absolute bottom-0 right-0 p-1.5 rounded-full border bg-background text-foreground shadow-sm`}
                    >
                      {speaker.isMuted ? <MicOff className="h-3.5 w-3.5 opacity-50" /> : <Mic className="h-3.5 w-3.5 text-primary" />}
                    </div>

                    {/* Deafen indicator status */}
                    {speaker.isDeafened && (
                      <div
                        className={`absolute bottom-0 left-0 p-1.5 rounded-full border bg-background text-foreground shadow-sm`}
                      >
                        <VolumeOffIcon className="h-3.5 w-3.5 text-destructive" />
                      </div>
                    )}
                  </div>

                  {/* Name, Role & Waveform */}
                  <div className="text-center w-full truncate flex flex-col items-center">
                    <p className="font-semibold truncate text-sm">{speaker.name}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      {speaker.peerId === peerId && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          You
                        </Badge>
                      )}
                    </div>
                    
                    {speaker.isMuted ? (
                      <div className="h-6 w-full mt-2 flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Muted</span>
                      </div>
                    ) : (
                      <AudioVisualizer stream={speaker.peerId === peerId ? localStreamState : streams.get(speaker.peerId) || null} />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </main>

        {/* Floating Dock Controls Footer */}
        <motion.div 
          initial={{ x: "-50%" }}
          animate={{ x: "-50%" }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="fixed bottom-4 md:bottom-8 left-1/2 bg-background/90 border p-2 md:p-3 rounded-full shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center gap-2 md:gap-3 z-40"
        >
            {/* Chat Toggle Drawer */}
            <Drawer open={showChat} onOpenChange={setShowChat} showSwipeHandle={true}>
              <DrawerTrigger render={
                <Button
                  variant="outline"
                  className={`relative rounded-full h-10 w-10 md:h-12 md:w-12 p-0 flex items-center justify-center hover:bg-muted active:scale-[0.97] transition-all duration-150 ease-out ${showChat ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground"}`}
                >
                  <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                  {messages.length > 0 && !showChat && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                </Button>
              } />
              <DrawerContent className="h-[80vh] flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <DrawerHeader className="border-b shrink-0 py-4 flex flex-row items-center justify-between">
                  <DrawerTitle className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> Space Chat
                  </DrawerTitle>
                  <Button variant="ghost" size="icon" onClick={() => setShowChat(false)} className="rounded-full text-muted-foreground hover:text-foreground">
                    <ChevronDown className="h-6 w-6" />
                  </Button>
                </DrawerHeader>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto text-sm min-h-0 mx-auto w-full max-w-3xl">
                  {messages.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-10">No messages yet. Say hi!</p>
                  ) : (
                    messages.map((msg) => (
                      <Message key={msg.id} align={msg.senderName === userName ? "end" : "start"} className="mb-4 w-full">
                        <MessageAvatar>
                          <Avatar className="h-8 w-8 border">
                            <AvatarFallback className="text-xs">{msg.senderName.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </MessageAvatar>
                        <MessageContent className="min-w-0">
                          <MessageHeader className="text-xs">{msg.senderName} <span className="text-[10px] text-muted-foreground ml-1 font-mono">{msg.timestamp}</span></MessageHeader>
                          <Bubble>
                            <BubbleContent className="text-sm break-words whitespace-pre-wrap">{msg.text}</BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    ))
                  )}
                </div>

                <div className="p-3 border-t shrink-0 w-full">
                  <form onSubmit={sendChatMessage} className="flex gap-2 mx-auto w-full max-w-3xl">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      className="text-sm h-12 rounded-xl"
                    />
                    <Button type="submit" size="sm" disabled={!chatInput.trim()} className="active:scale-[0.97] transition-all duration-150 ease-out h-12 rounded-xl px-6">
                      Send
                    </Button>
                  </form>
                </div>
              </DrawerContent>
            </Drawer>

            {/* Settings Modal */}
            <Dialog>
              <DialogTrigger render={
                <Button variant="outline" className="rounded-full h-10 w-10 md:h-12 md:w-12 p-0 flex items-center justify-center hover:bg-muted active:scale-[0.97] transition-all duration-150 ease-out">
                  <SettingsIcon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </Button>
              } />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Audio Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Microphone</label>
                    <Select value={selectedMicId} onValueChange={handleDeviceChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a microphone" />
                      </SelectTrigger>
                      <SelectContent>
                        {audioDevices.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId.substring(0, 5)}...`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Speaker</label>
                    <Select value={selectedSpeakerId} onValueChange={handleSpeakerChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a speaker" />
                      </SelectTrigger>
                      <SelectContent>
                        {speakerDevices.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label || `Speaker ${device.deviceId.substring(0, 5)}...`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Popover>
              <PopoverTrigger render={
                <Button variant="outline" className="rounded-full h-10 w-10 md:h-12 md:w-12 p-0 flex items-center justify-center hover:bg-muted active:scale-[0.97] transition-all duration-150 ease-out">
                  <Smile className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                </Button>
              } />
              <PopoverContent className="w-auto p-0 mb-4 border-none shadow-2xl rounded-xl overflow-hidden origin-bottom animate-in fade-in zoom-in-95 duration-200 ease-out" sideOffset={10}>
                <EmojiPicker onEmojiClick={handleSendReaction} theme={Theme.AUTO} lazyLoadEmojis={true} />
              </PopoverContent>
            </Popover>

            {/* Deafen Button */}
            <Button
              onClick={toggleDeafen}
              variant={isDeafened ? "destructive" : "secondary"}
              className="rounded-full h-10 w-[100px] md:h-12 md:w-[120px] p-0 overflow-hidden active:scale-[0.97] transition-colors duration-150 ease-out flex items-center justify-center font-medium gap-1 md:gap-1.5 text-xs md:text-sm"
            >
              {isDeafened ? <VolumeOffIcon className="h-4 w-4 md:h-5 md:w-5" /> : <Headphones className="h-4 w-4 md:h-5 md:w-5" />}
              {isDeafened ? "Undeafen" : "Deafen"}
            </Button>
            
            {/* Mute Button */}
            <Button
              onClick={toggleMute}
              variant={isMuted ? "destructive" : "secondary"}
              className="rounded-full h-10 w-[100px] md:h-12 md:w-[120px] p-0 overflow-hidden active:scale-[0.97] transition-colors duration-150 ease-out flex items-center justify-center font-medium gap-1 md:gap-1.5 text-xs md:text-sm"
            >
              {isMuted ? <MicOff className="h-4 w-4 md:h-5 md:w-5" /> : <Mic className="h-4 w-4 md:h-5 md:w-5" />}
              {isMuted ? "Unmute" : "Mute"}
            </Button>
        </motion.div>
      </div>
    </div>
  );
}
