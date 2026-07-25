"use client";

import React, { useEffect, useRef, useState } from "react";
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
  peerId: string;
  name: string;
  role: "host" | "speaker" | "listener";
  isMuted: boolean;
  isDeafened?: boolean;
  isHandRaised: boolean;
  isSpeaking?: boolean;
  reaction?: string;
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
  userRole: "host" | "speaker" | "listener";
  roomId: string;
  onLeave: () => void;
}

export function SpaceRoom({ roomName, userName, userRole, roomId, onLeave }: SpaceRoomProps) {
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
  const [myRole, setMyRole] = useState<"speaker">("speaker");
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [showChat, setShowChat] = useState<boolean>(false);
  const [streams, setStreams] = useState<Map<string, MediaStream>>(new Map());
  
  // Audio Settings
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>("default");

  // Track showChat for async callbacks
  const showChatRef = useRef(showChat);
  useEffect(() => { showChatRef.current = showChat; }, [showChat]);

  // References
  const peerRef = useRef<Peer | null>(null);
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



  const isDeafenedRef = useRef(isDeafened);
  useEffect(() => { isDeafenedRef.current = isDeafened; }, [isDeafened]);

  const myRoleRef = useRef(myRole);
  useEffect(() => { myRoleRef.current = myRole; }, [myRole]);

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
          // @ts-ignore
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googEchoCancellation: true,
        },
        video: false,
      };

      const rawStream = await navigator.mediaDevices.getUserMedia(constraints);
      rawStreamRef.current = rawStream;

      // Create an inline AudioWorklet for an Aggressive Noise Gate
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const workletCode = `
        class NoiseGate extends AudioWorkletProcessor {
          constructor() {
            super();
            this.threshold = 0.025; // Strict threshold to filter air/fans
            this.gain = 0;
            this.attack = 0.1; // Fast open
            this.release = 0.002; // Smooth fade out
          }
          process(inputs, outputs) {
            const input = inputs[0];
            const output = outputs[0];
            if (!input || !input.length || !input[0]) return true;

            let sum = 0;
            for (let i = 0; i < input[0].length; i++) {
              sum += input[0][i] * input[0][i];
            }
            const rms = Math.sqrt(sum / input[0].length);

            // Determine if we should open the gate
            const targetGain = rms > this.threshold ? 1.0 : 0.0;
            
            // Smooth the transition to prevent popping/clicking
            if (targetGain > this.gain) {
              this.gain += this.attack;
              if (this.gain > 1) this.gain = 1;
            } else {
              this.gain -= this.release;
              if (this.gain < 0) this.gain = 0;
            }

            for (let c = 0; c < input.length; c++) {
              for (let i = 0; i < input[c].length; i++) {
                output[c][i] = input[c][i] * this.gain;
              }
            }
            return true;
          }
        }
        registerProcessor('noise-gate', NoiseGate);
      `;
      
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);
      await audioCtx.audioWorklet.addModule(workletUrl);

      const source = audioCtx.createMediaStreamSource(rawStream);
      const noiseGateNode = new AudioWorkletNode(audioCtx, 'noise-gate');
      const destination = audioCtx.createMediaStreamDestination();
      
      source.connect(noiseGateNode);
      noiseGateNode.connect(destination);

      const processedStream = destination.stream;
      localStreamRef.current = processedStream;

      // Disable raw tracks if muted or listener initially to ensure privacy
      rawStream.getAudioTracks().forEach((track) => {
        track.enabled = userRole !== "listener" && !isMuted;
      });
      processedStream.getAudioTracks().forEach((track) => {
        track.enabled = userRole !== "listener" && !isMuted;
      });
      
      return processedStream;
    } catch (err) {
      console.warn("Microphone access denied or not available:", err);
      return null;
    }
  };

  const displayReaction = (targetPeerId: string, emoji: string) => {
    setParticipants((prev) => {
      const next = new Map(prev);
      const p = next.get(targetPeerId);
      if (p) next.set(targetPeerId, { ...p, reaction: emoji });
      return next;
    });

    if (reactionTimeoutsRef.current.has(targetPeerId)) {
      clearTimeout(reactionTimeoutsRef.current.get(targetPeerId)!);
    }

    const timeout = setTimeout(() => {
      setParticipants((prev) => {
        const next = new Map(prev);
        const p = next.get(targetPeerId);
        if (p) next.set(targetPeerId, { ...p, reaction: undefined });
        return next;
      });
      reactionTimeoutsRef.current.delete(targetPeerId);
    }, 4000);

    reactionTimeoutsRef.current.set(targetPeerId, timeout);
  };

  const handleSendReaction = (emojiObject: any) => {
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

    // Replace track on all existing connections
    const newAudioTrack = newStream.getAudioTracks()[0];
    if (!newAudioTrack) return;

    Array.from(callsRef.current.values()).forEach((call) => {
      const sender = call.peerConnection.getSenders().find(s => s.track?.kind === "audio");
      if (sender) {
        sender.replaceTrack(newAudioTrack);
      }
    });
  };

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter(d => d.kind === "audioinput");
        setAudioDevices(mics);
        if (mics.length > 0 && selectedMicId === "default") {
          const def = mics.find(m => m.deviceId === "default") || mics[0];
          setSelectedMicId(def.deviceId);
        }
      } catch (e) {
        console.error("Could not fetch audio devices", e);
      }
    };
    fetchDevices();
  }, [selectedMicId]);

  // Broadcast data payload to all connected peers
  const broadcastData = (data: any) => {
    dataConnsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(data);
      }
    });
  };

  // Initialize PeerJS Connection
  useEffect(() => {
    let peerInstance: Peer;
    let isMounted = true;

    // Listen for tab duplicate checks
    const bc = new BroadcastChannel("spacex_room_channel");
    bc.onmessage = (event) => {
      if (event.data === "check_active") {
        bc.postMessage("active");
      }
    };

    const initPeer = async () => {
      const maxSlots = 20; // Support up to 20 users without needing a "host"

      // Find an available slot in the room
      const trySlot = (index: number): Promise<Peer> => {
        return new Promise((resolve, reject) => {
          if (index >= maxSlots) {
            reject(new Error("Room is full"));
            return;
          }
          const id = `${roomId}-slot-${index}`;
          const p = new Peer(id, { debug: 0 });
          p.on("open", () => resolve(p));
          p.on("error", (err: any) => {
            if (err.type === "unavailable-id") {
              resolve(trySlot(index + 1));
            } else if (err.type !== "peer-unavailable") {
              console.warn("PeerJS Warning during init:", err);
            }
          });
        });
      };

      try {
        peerInstance = await trySlot(0);
      } catch (err) {
        toast.error("Room is full or unavailable.");
        return;
      }
      
      if (!isMounted) {
        peerInstance.destroy();
        return;
      }

      peerRef.current = peerInstance;

      const handlePeerOpen = async (id: string) => {
        setPeerId(id);
        
        // Add self to participants list
        const me: Participant = {
          peerId: id,
          name: userName,
          role: "speaker",
          isMuted: isMuted,
          isDeafened: isDeafened,
          isHandRaised: false,
        };
        setParticipants((prev) => new Map(prev).set(id, me));

        // Get audio stream ready
        await getLocalAudioStream();

        // Connect to ALL OTHER SLOTS in the room to form the mesh
        for (let i = 0; i < maxSlots; i++) {
          const targetId = `${roomId}-slot-${i}`;
          if (targetId !== id) {
            connectToPeer(targetId, me);
          }
        }
      };

      // Since the 'open' event already fired, we call this manually
      handlePeerOpen(peerInstance.id);

      // Handle Incoming Data Connections (State syncing / Chat / Signal)
      peerInstance.on("connection", (dataConn) => {
        handleDataConnection(dataConn);
      });

      // Handle Incoming Audio Calls
      peerInstance.on("call", async (call) => {
        const stream = localStreamRef.current || (await getLocalAudioStream());
        call.answer(stream || undefined);
        
        call.on("stream", (remoteStream) => {
          attachRemoteStream(call.peer, remoteStream);
        });

        call.on("close", () => {
          removeRemoteStream(call.peer);
        });

        callsRef.current.set(call.peer, call);
      });

      peerInstance.on("error", (err: any) => {
        if (err.type !== "peer-unavailable" && err.type !== "unavailable-id") {
          console.warn("PeerJS Warning:", err);
        }
      });
    };

    initPeer();

    // Periodically attempt to connect to any missing slots
    // This allows discovery of new users in a completely hostless environment
    const meshCheckInterval = setInterval(() => {
      const me = participantsRef.current.get(peerIdRef.current);
      if (me && peerRef.current) {
        for (let i = 0; i < 20; i++) {
          const targetId = `${roomId}-slot-${i}`;
          if (targetId !== peerIdRef.current) {
            const conn = dataConnsRef.current.get(targetId);
            if (!conn || !conn.open) {
              if (conn) {
                conn.close();
                dataConnsRef.current.delete(targetId);
              }
              connectToPeer(targetId, me);
            }
          }
        }
      }
    }, 8000);

    return () => {
      clearInterval(meshCheckInterval);
      isMounted = false;
      bc.close();
      // Cleanup connections
      callsRef.current.forEach((call) => call.close());
      dataConnsRef.current.forEach((conn) => conn.close());
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      rawStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioElementsRef.current.forEach((audio) => audio.remove());
      peerInstance?.destroy();
    };
  }, []);

  // Connect to a remote peer
  const connectToPeer = (targetPeerId: string, myParticipantInfo: Participant) => {
    if (!peerRef.current || targetPeerId === peerRef.current.id) return;
    if (dataConnsRef.current.has(targetPeerId)) return;

    // Data connection
    const dataConn = peerRef.current.connect(targetPeerId);
    handleDataConnection(dataConn);

    // Call connection if we have audio stream capability
    if (localStreamRef.current) {
      const call = peerRef.current.call(targetPeerId, localStreamRef.current);
      call.on("stream", (remoteStream) => {
        attachRemoteStream(targetPeerId, remoteStream);
      });
      call.on("close", () => {
        removeRemoteStream(targetPeerId);
      });
      callsRef.current.set(targetPeerId, call);
    }
  };

  // Attach audio element for remote stream
  const attachRemoteStream = (peerId: string, stream: MediaStream) => {
    if (audioElementsRef.current.has(peerId)) return;
    const audio = document.createElement("audio");
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.muted = isDeafenedRef.current;
    audioElementsRef.current.set(peerId, audio);
    document.body.appendChild(audio);

    setStreams((prev) => {
      const next = new Map(prev);
      next.set(peerId, stream);
      return next;
    });
  };

  const removeRemoteStream = (peerId: string) => {
    const audio = audioElementsRef.current.get(peerId);
    if (audio) {
      audio.remove();
      audioElementsRef.current.delete(peerId);
    }
    setStreams((prev) => {
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
  };

  // Data connection handlers (Sync state across mesh)
  const handleDataConnection = (conn: DataConnection) => {
    dataConnsRef.current.set(conn.peer, conn);

    conn.on("open", () => {
      // Send self state AND all known participants upon handshake to establish a full mesh
      const allUsers = Array.from(participantsRef.current.values());
      conn.send({ type: "SYNC_ALL_USERS", payload: allUsers });
    });

    conn.on("data", (data: any) => {
      if (!data || !data.type) return;

      switch (data.type) {
        case "SYNC_ALL_USERS": {
          const users: Participant[] = data.payload;
          
          setParticipants((prev) => {
            const next = new Map(prev);
            users.forEach((u) => {
              if (!prev.has(u.peerId) && u.peerId !== peerIdRef.current) {
                toast.success(`${u.name} joined the room`);
              }
              next.set(u.peerId, u);
            });
            return next;
          });

          // Establish mesh connections: Connect to any new peers we don't have connections to yet
          const me = participantsRef.current.get(peerIdRef.current);
          if (me) {
            users.forEach((u) => {
              if (u.peerId !== peerIdRef.current && !dataConnsRef.current.has(u.peerId)) {
                // We use setTimeout to avoid blocking the current execution frame with multiple connects
                setTimeout(() => connectToPeer(u.peerId, me), Math.random() * 500);
              }
            });
          }
          break;
        }

        case "UPDATE_STATUS": {
          const { peerId: targetId, isMuted, isDeafened, isHandRaised, role } = data.payload;
          setParticipants((prev) => {
            const next = new Map(prev);
            const p = next.get(targetId);
            if (p) {
              next.set(targetId, {
                ...p,
                ...(isMuted !== undefined && { isMuted }),
                ...(isDeafened !== undefined && { isDeafened }),
                ...(isHandRaised !== undefined && { isHandRaised }),
                ...(role !== undefined && { role }),
              });
            }
            return next;
          });

          // Sync local state if the update was about us
          if (peerIdRef.current === targetId) {
            if (isMuted !== undefined) setIsMuted(isMuted);
            if (isDeafened !== undefined) setIsDeafened(isDeafened);
          }
          break;
        }

        case "REACTION": {
          const { peerId: targetId, emoji } = data.payload;
          displayReaction(targetId, emoji);
          break;
        }

        case "CHAT_MSG": {
          setMessages((prev) => [...prev, data.payload]);
          if (!showChatRef.current && data.payload.senderName !== userName) {
            toast.message(`Message from ${data.payload.senderName}`, { description: data.payload.text });
          }
          break;
        }
      }
    });

    conn.on("close", () => {
      dataConnsRef.current.delete(conn.peer);
      setParticipants((prev) => {
        const next = new Map(prev);
        const leavingUser = next.get(conn.peer);
        if (leavingUser && leavingUser.peerId !== peerIdRef.current) {
          toast.info(`${leavingUser.name} left the room`);
        }
        next.delete(conn.peer);
        return next;
      });
    });
  };

  // Toggle Mute / Unmute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
    }
    if (rawStreamRef.current) {
      rawStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
    }

    const payload = { peerId, isMuted: nextMuted };
    broadcastData({ type: "UPDATE_STATUS", payload });
    setParticipants((prev) => {
      const next = new Map(prev);
      const me = next.get(peerId);
      if (me) next.set(peerId, { ...me, isMuted: nextMuted });
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
      const me = next.get(peerId);
      if (me) next.set(peerId, { ...me, isDeafened: nextDeafened });
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

      try { navigator.mediaSession.setActionHandler('togglemicrophone', handleToggle); } catch (e) {}
      try { navigator.mediaSession.setActionHandler('play', handlePlay); } catch (e) {}
      try { navigator.mediaSession.setActionHandler('pause', handlePause); } catch (e) {}
      
      try {
        // @ts-ignore
        if (navigator.mediaSession.setMicrophoneActive) {
          // @ts-ignore
          navigator.mediaSession.setMicrophoneActive(!isMuted);
        }
      } catch (e) {}
    }
    
    return () => {
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.setActionHandler('togglemicrophone', null);
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
        } catch (e) {}
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
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
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
                      <AudioVisualizer stream={speaker.peerId === peerId ? localStreamRef.current : streams.get(speaker.peerId) || null} />
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
