"use client";

import React, { useEffect, useRef, useState } from "react";
import Peer, { MediaConnection, DataConnection } from "peerjs";
import { 
  Mic, MicOff, Hand, Radio, Users, Copy, Check, LogOut, 
  Volume2, MessageSquare, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { AudioVisualizer } from "@/components/audio-visualizer";

interface Participant {
  peerId: string;
  name: string;
  role: "host" | "speaker" | "listener";
  isMuted: boolean;
  isHandRaised: boolean;
  isSpeaking?: boolean;
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
  const [peerId, setPeerId] = useState<string>("");
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [isMuted, setIsMuted] = useState<boolean>(userRole === "listener");
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [myRole, setMyRole] = useState<"host" | "speaker" | "listener">(userRole);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [showChat, setShowChat] = useState<boolean>(false);
  const [streams, setStreams] = useState<Map<string, MediaStream>>(new Map());

  // References
  const peerRef = useRef<Peer | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const rawStreamRef = useRef<MediaStream | null>(null);
  const callsRef = useRef<Map<string, MediaConnection>>(new Map());
  const dataConnsRef = useRef<Map<string, DataConnection>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Mutable Refs for stale closures in PeerJS callbacks
  const participantsRef = useRef(participants);
  useEffect(() => { participantsRef.current = participants; }, [participants]);
  
  const peerIdRef = useRef(peerId);
  useEffect(() => { peerIdRef.current = peerId; }, [peerId]);

  const myRoleRef = useRef(myRole);
  useEffect(() => { myRoleRef.current = myRole; }, [myRole]);

  const getLocalAudioStream = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
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

    const initPeer = async () => {
      // Create Peer instance with clean room-scoped or generated ID
      const generatedId = `${roomId}-${Math.random().toString(36).substr(2, 6)}`;
      peerInstance = new Peer(myRole === "host" ? roomId : generatedId, {
        debug: 1,
      });

      peerRef.current = peerInstance;

      peerInstance.on("open", async (id) => {
        setPeerId(id);
        
        // Add self to participants list
        const me: Participant = {
          peerId: id,
          name: userName,
          role: myRole,
          isMuted: myRole === "listener" ? true : isMuted,
          isHandRaised: false,
        };
        setParticipants((prev) => new Map(prev).set(id, me));

        // Get audio stream ready
        await getLocalAudioStream();

        // If not host, connect to Host's room peer
        if (myRole !== "host") {
          connectToPeer(roomId, me);
        }
      });

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

      peerInstance.on("error", (err) => {
        console.error("PeerJS Error:", err);
        if (err.type === "peer-unavailable" && myRole !== "host") {
          alert("The host has ended this space.");
          onLeave();
        }
      });
    };

    initPeer();

    return () => {
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
            users.forEach((u) => next.set(u.peerId, u));
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
          const { peerId: targetId, isMuted, isHandRaised, role } = data.payload;
          setParticipants((prev) => {
            const next = new Map(prev);
            const p = next.get(targetId);
            if (p) {
              next.set(targetId, {
                ...p,
                ...(isMuted !== undefined && { isMuted }),
                ...(isHandRaised !== undefined && { isHandRaised }),
                ...(role !== undefined && { role }),
              });
            }
            return next;
          });

          // Sync local state if the update was about us (e.g. host rejected our hand raise)
          if (peerIdRef.current === targetId) {
            if (isHandRaised !== undefined) setIsHandRaised(isHandRaised);
            if (isMuted !== undefined) setIsMuted(isMuted);
          }
          break;
        }

        case "CHANGE_ROLE": {
          const { targetPeerId, newRole } = data.payload;
          if (peerIdRef.current === targetPeerId) {
            setMyRole(newRole);
            if (newRole === "listener") {
              setIsMuted(true);
              if (localStreamRef.current) {
                localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
              }
            }
          }
          break;
        }

        case "END_SPACE": {
          onLeave();
          break;
        }

        case "CHAT_MSG": {
          setMessages((prev) => [...prev, data.payload]);
          break;
        }
      }
    });

    conn.on("close", () => {
      dataConnsRef.current.delete(conn.peer);
      setParticipants((prev) => {
        const next = new Map(prev);
        next.delete(conn.peer);
        return next;
      });
    });
  };

  // Toggle Mute / Unmute
  const toggleMute = () => {
    if (myRole === "listener") return;
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

  // Toggle Hand Raise
  const toggleHandRaise = () => {
    const nextHand = !isHandRaised;
    setIsHandRaised(nextHand);

    const payload = { peerId, isHandRaised: nextHand };
    broadcastData({ type: "UPDATE_STATUS", payload });
    setParticipants((prev) => {
      const next = new Map(prev);
      const me = next.get(peerId);
      if (me) next.set(peerId, { ...me, isHandRaised: nextHand });
      return next;
    });
  };

  // Host Privilege: Change Participant Role (Speaker/Listener)
  const promoteOrDemote = (targetPeerId: string, newRole: "speaker" | "listener") => {
    if (myRole !== "host") return;
    
    // Broadcast role change command
    broadcastData({ type: "CHANGE_ROLE", payload: { targetPeerId, newRole } });

    // Update local state
    setParticipants((prev) => {
      const next = new Map(prev);
      const target = next.get(targetPeerId);
      if (target) {
        next.set(targetPeerId, {
          ...target,
          role: newRole,
          isHandRaised: false,
          isMuted: newRole === "listener" ? true : target.isMuted,
        });
      }
      return next;
    });
  };

  // Host Privilege: Reject Mic Request
  const rejectMicRequest = (targetPeerId: string) => {
    if (myRole !== "host") return;
    const payload = { peerId: targetPeerId, isHandRaised: false };
    
    broadcastData({ type: "UPDATE_STATUS", payload });
    
    setParticipants((prev) => {
      const next = new Map(prev);
      const target = next.get(targetPeerId);
      if (target) {
        next.set(targetPeerId, { ...target, isHandRaised: false });
      }
      return next;
    });
  };

  // Host Privilege: End Space
  const handleEndSpace = () => {
    if (myRole === "host") {
      broadcastData({ type: "END_SPACE", payload: null });
    }
    onLeave();
  };

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
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group participants by role
  const allList = Array.from(participants.values());
  const hostsAndSpeakers = allList.filter((p) => p.role === "host" || p.role === "speaker");
  const listeners = allList.filter((p) => p.role === "listener");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Bar Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg leading-tight">{roomName}</h1>
              <Badge variant="outline" className="text-xs px-2 py-0.5 text-primary border-primary/50">
                ● LIVE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">Room ID: {roomId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={copyInviteLink}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied Link!" : "Invite Friends"}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className={`relative border ${showChat ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground"}`}
          >
            <MessageSquare className="h-5 w-5" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary" />
            )}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={myRole === "host" ? handleEndSpace : onLeave}
            className="gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            {myRole === "host" ? "End Space" : "Leave"}
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Stage Grid */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-5xl mx-auto w-full flex flex-col justify-between gap-8">
          
          {/* Speakers & Hosts Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                Speakers ({hostsAndSpeakers.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {hostsAndSpeakers.map((speaker) => (
                <Card
                  key={speaker.peerId}
                  className="bg-card text-card-foreground p-5 flex flex-col items-center justify-center relative group transition-all shadow-sm"
                >
                  {/* Avatar */}
                  <div className="relative mb-3">
                    <Avatar className={`h-20 w-20 border-2 ${speaker.role === "host" ? "border-primary" : "border-border"}`}>
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
                  </div>

                  {/* Name, Role & Waveform */}
                  <div className="text-center w-full truncate flex flex-col items-center">
                    <p className="font-semibold truncate text-sm">{speaker.name}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      {speaker.role === "host" && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          Host
                        </Badge>
                      )}
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

                  {/* Host Action Options */}
                  {myRole === "host" && speaker.peerId !== peerId && (
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => promoteOrDemote(speaker.peerId, "listener")}
                        className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2"
                      >
                        Move to Listener
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </section>

          {/* Listeners Section */}
          <section className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Listeners ({listeners.length})
            </h2>

            {listeners.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-xl bg-muted/50 text-muted-foreground text-sm">
                No listeners in the room yet. Share the room link to invite friends!
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {listeners.map((listener) => (
                  <Card
                    key={listener.peerId}
                    className="bg-card text-card-foreground p-3 flex flex-col items-center justify-center relative group transition-all shadow-sm"
                  >
                    <div className="relative mb-2">
                      <Avatar className="h-12 w-12 border">
                        <AvatarFallback className="bg-muted text-foreground font-medium text-sm">
                          {listener.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {listener.isHandRaised && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground p-1 rounded-full shadow-sm">
                          <Hand className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium truncate w-full text-center">{listener.name}</p>

                    {/* Host action to promote */}
                    {myRole === "host" && (
                      <div className="flex gap-1 mt-2">
                        {listener.isHandRaised ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => promoteOrDemote(listener.peerId, "speaker")}
                              className="text-[10px] text-emerald-500 hover:bg-emerald-500/10 h-7 px-2 flex items-center gap-1 bg-emerald-500/5 font-semibold"
                            >
                              <Check className="h-3 w-3" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => rejectMicRequest(listener.peerId)}
                              className="text-[10px] text-destructive hover:bg-destructive/10 h-7 px-2 flex items-center gap-1 bg-destructive/5 font-semibold"
                            >
                              <X className="h-3 w-3" /> Reject
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => promoteOrDemote(listener.peerId, "speaker")}
                            className="text-[10px] text-primary hover:bg-primary/10 h-6 px-1.5"
                          >
                            Make Speaker
                          </Button>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Dock Controls Footer */}
          <div className="sticky bottom-6 mt-auto self-center bg-background/90 border p-3 rounded-full shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center gap-3 max-w-md w-full justify-center z-10">
            {/* Mute Button (Only for speakers/host) */}
            {myRole !== "listener" ? (
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "default"}
                className="rounded-full h-12 px-6 font-medium gap-2 transition-all"
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                {isMuted ? "Unmute" : "Mute"}
              </Button>
            ) : (
              <Button
                onClick={toggleHandRaise}
                variant="outline"
                className={`rounded-full h-12 px-6 gap-2 transition-all ${
                  isHandRaised ? "border-primary text-primary" : "text-muted-foreground"
                }`}
              >
                <Hand className={`h-5 w-5`} />
                {isHandRaised ? "Hand Raised" : "Request to Speak"}
              </Button>
            )}
          </div>
        </main>

        {/* Sidebar Chat */}
        {showChat && (
          <aside className="w-80 border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col h-[calc(100vh-73px)] sticky top-[73px]">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Space Chat
              </h3>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto text-sm">
              {messages.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-10">No messages yet. Say hi!</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="bg-muted rounded-lg p-2.5 border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span className="font-semibold text-foreground">{msg.senderName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-foreground break-words">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendChatMessage} className="p-3 border-t flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="text-sm"
              />
              <Button type="submit" size="sm">
                Send
              </Button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}
