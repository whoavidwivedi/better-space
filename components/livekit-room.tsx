"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant,
  useIsSpeaking,
  useChat,
  useRoomContext
} from "@livekit/components-react";
import { RoomEvent, Track } from "livekit-client";
import { 
  Mic01Icon as Mic, MicOff01Icon as MicOff, UserGroupIcon as Users, 
  Copy01Icon as Copy, CheckmarkBadge01Icon as Check, 
  Message01Icon as MessageSquare, KeyboardIcon,
  ArrowDown01Icon as ChevronDown
} from "hugeicons-react";
import { Headphones, HeadphoneOff } from "lucide-react";
import { useTheme } from "next-themes";
import { Message, MessageAvatar, MessageContent, MessageHeader, MessageGroup } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { AudioVisualizer } from "@/components/audio-visualizer";
import { EmojiClickData, Theme } from "emoji-picker-react";
import EmojiPicker from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Settings01Icon as SettingsIcon } from "hugeicons-react";
import { SmilePlus } from "lucide-react";

import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

export function SpaceRoomLiveKit({ roomName, userName, token, onLeave }: { roomName: string, userName: string, token: string, onLeave: () => void }) {
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!wsUrl || !token) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Connecting to LiveKit...</div>;
  }

  return (
    <LiveKitRoom
      serverUrl={wsUrl}
      token={token}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={onLeave}
    >
      <RoomAudioRenderer />
      <RoomUI roomName={roomName} userName={userName} onLeave={onLeave} />
    </LiveKitRoom>
  );
}

function RoomUI({ roomName, userName, onLeave }: { roomName: string, userName: string, onLeave: () => void }) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const { chatMessages, send: sendChat } = useChat();
  const { theme, setTheme } = useTheme();

  const [isDeafened, setIsDeafened] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  
  // Audio Devices
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>("default");

  const isMuted = !localParticipant.isMicrophoneEnabled;

  // Reactions State
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const reactionTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const displayReaction = (identity: string, emoji: string) => {
    setReactions(prev => ({ ...prev, [identity]: emoji }));
    if (reactionTimeoutsRef.current[identity]) {
      clearTimeout(reactionTimeoutsRef.current[identity]);
    }
    reactionTimeoutsRef.current[identity] = setTimeout(() => {
      setReactions(prev => {
        const next = { ...prev };
        delete next[identity];
        return next;
      });
    }, 4000);
  };

  useEffect(() => {
    const handleData = (payload: Uint8Array, participant?: any) => {
      try {
        const decoder = new TextDecoder();
        const data = JSON.parse(decoder.decode(payload));
        if (data.type === 'REACTION' && data.emoji) {
          displayReaction(participant?.identity || data.senderIdentity, data.emoji);
        }
      } catch (e) {}
    };
    room.on(RoomEvent.DataReceived, handleData);
    return () => { room.off(RoomEvent.DataReceived, handleData); };
  }, [room]);

  const handleSendReaction = (emojiObject: EmojiClickData) => {
    const emoji = emojiObject.emoji;
    displayReaction(userName, emoji);
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify({ type: 'REACTION', emoji, senderIdentity: userName }));
    localParticipant.publishData(data, { reliable: true });
  };

  const copyInviteLink = () => {
    if (copied) return;
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const toggleMute = async () => {
    try {
      if (isDeafened) {
        toast.error("You cannot unmute while deafened");
        return;
      }
      await localParticipant.setMicrophoneEnabled(isMuted);
    } catch (e: any) {
      if (e.message?.includes('getUserMedia')) {
        toast.error("Cannot access microphone. You must use an HTTPS connection to test audio.");
      } else {
        toast.error("Failed to toggle microphone: " + e.message);
      }
    }
  };

  const toggleDeafen = () => {
    const nextDeafened = !isDeafened;
    setIsDeafened(nextDeafened);
    
    // Mute all remote tracks locally
    room.remoteParticipants.forEach(p => {
      p.audioTrackPublications.forEach(pub => {
        if (pub.track && pub.track.mediaStreamTrack) {
          pub.track.mediaStreamTrack.enabled = !nextDeafened;
        }
      });
    });

    if (nextDeafened && !isMuted) {
      localParticipant.setMicrophoneEnabled(false).catch(() => {});
    }
  };

  useEffect(() => {
    const fetchDevices = async () => {
      if (!navigator.mediaDevices) return;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter(d => d.kind === "audioinput"));
      } catch (e) {}
    };
    fetchDevices();
  }, []);

  const handleDeviceChange = async (deviceId: string | null) => {
    if (!deviceId) return;
    setSelectedMicId(deviceId);
    try {
      await room.switchActiveDevice("audioinput", deviceId);
    } catch (e) {
      toast.error("Could not switch device");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMuted, isDeafened, theme]);

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChat(chatInput.trim());
    setChatInput("");
  };

  const groupedMessages = useMemo(() => {
    const groups: { sender: string, isSelf: boolean, timestamp: number, messages: string[] }[] = [];
    chatMessages.forEach((m) => {
      const isSelf = m.from?.identity === userName;
      const sender = m.from?.identity || "Unknown";
      if (groups.length > 0 && groups[groups.length - 1].sender === sender && (m.timestamp - groups[groups.length - 1].timestamp < 60000)) {
        groups[groups.length - 1].messages.push(m.message);
      } else {
        groups.push({ sender, isSelf, timestamp: m.timestamp, messages: [m.message] });
      }
    });
    return groups;
  }, [chatMessages, userName]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight">Space</span>
            <Badge variant="destructive" className="flex items-center justify-center text-[10px] px-2 h-5 border-0 font-bold tracking-wider rounded-sm shadow-none leading-none">LIVE</Badge>
            <Badge variant="outline" className="hidden sm:flex items-center justify-center text-[10px] px-2 h-5 font-mono text-muted-foreground ml-2 rounded-sm leading-none">{roomName}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:block">
            <HoverCard>
              <HoverCardTrigger>
                <div className="relative border bg-background hover:bg-muted rounded-md h-8 w-8 flex items-center justify-center cursor-help transition-colors text-muted-foreground">
                  <KeyboardIcon className="h-4 w-4" />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 p-4 shadow-2xl rounded-xl z-[100]" sideOffset={10} align="end">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <KeyboardIcon className="h-4 w-4" /> Keyboard Shortcuts
                  </h4>
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Toggle Mute</span><KbdGroup><Kbd>⌘</Kbd><Kbd>D</Kbd></KbdGroup></div>
                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Toggle Deafen</span><KbdGroup><Kbd>⌘</Kbd><Kbd>E</Kbd></KbdGroup></div>
                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Toggle Dark Mode</span><KbdGroup><Kbd>D</Kbd></KbdGroup></div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          <Button
            size="sm"
            onClick={copyInviteLink}
            disabled={copied}
            className={`w-[140px] gap-1.5 rounded-full font-semibold shadow-sm active:scale-[0.97] transition-all duration-200 ease-out border-2 bg-primary text-primary-foreground hover:bg-primary/90 border-primary ${copied ? "disabled:opacity-100" : ""}`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied Link!" : "Invite Friends"}
          </Button>

          <button onClick={onLeave} className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors duration-200 active:scale-[0.97] px-2">Leave</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 p-4 md:p-10 pb-32 overflow-y-auto max-w-5xl mx-auto w-full flex flex-col gap-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Participants ({participants.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {participants.map((speaker, index) => (
                <ParticipantTile key={speaker.sid} participant={speaker} index={index} reaction={reactions[speaker.identity]} />
              ))}
            </div>
          </section>
        </main>

        <motion.div 
          initial={{ x: "-50%" }}
          animate={{ x: "-50%" }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] md:bottom-8 left-1/2 bg-background/90 border border-border p-1.5 sm:p-2 md:p-3 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center gap-1.5 sm:gap-2 md:gap-3 z-40 max-w-[95vw] overflow-x-auto no-scrollbar"
        >
          <Drawer open={showChat} onOpenChange={setShowChat} showSwipeHandle={true}>
            <DrawerTrigger>
              <Button variant="outline" className={`relative shrink-0 rounded-full h-10 w-10 md:h-12 md:w-12 p-0 flex items-center justify-center hover:bg-muted active:scale-[0.97] transition-all duration-200 ease-out border-2 ${showChat ? "bg-primary/20 text-primary border-primary" : "text-muted-foreground border-border"}`}>
                <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                {chatMessages.length > 0 && !showChat && <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary" />}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh] flex flex-col bg-background">
              <DrawerHeader className="border-b shrink-0 py-4 flex flex-row items-center justify-between">
                <DrawerTitle className="text-sm font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Space Chat</DrawerTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowChat(false)} className="rounded-full text-muted-foreground hover:text-foreground active:scale-[0.97] transition-all duration-200 ease-out"><ChevronDown className="h-6 w-6" /></Button>
              </DrawerHeader>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto text-sm min-h-0 mx-auto w-full max-w-3xl">
                {groupedMessages.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-10">No messages yet. Say hi!</p>
                ) : (
                  groupedMessages.map((group, groupIdx) => (
                    <MessageGroup key={groupIdx} className={`mb-4 w-full ${group.isSelf ? 'items-end' : 'items-start'}`}>
                      {!group.isSelf && (
                        <MessageAvatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(group.sender)}&backgroundColor=transparent`} />
                        </MessageAvatar>
                      )}
                      <MessageContent>
                        <MessageHeader className={group.isSelf ? "justify-end text-muted-foreground/60" : ""}>{group.isSelf ? "You" : group.sender}</MessageHeader>
                        <div className={`flex flex-col gap-1.5 ${group.isSelf ? 'items-end' : 'items-start'}`}>
                          {group.messages.map((text, j) => (
                            <Bubble key={j} variant={group.isSelf ? "default" : "muted"}><BubbleContent>{text}</BubbleContent></Bubble>
                          ))}
                        </div>
                      </MessageContent>
                    </MessageGroup>
                  ))
                )}
              </div>

              <div className="p-4 border-t shrink-0 w-full bg-background">
                <form onSubmit={sendChatMessage} className="relative flex items-center mx-auto w-full max-w-3xl">
                  <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." className="text-sm h-14 pl-5 pr-20 rounded-full bg-muted border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all" />
                  <Button type="submit" disabled={!chatInput.trim()} className="absolute right-1.5 h-11 px-5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 ease-out active:scale-95 disabled:opacity-50 disabled:bg-muted-foreground">Send</Button>
                </form>
              </div>
            </DrawerContent>
          </Drawer>

          <Dialog>
            <DialogTrigger>
              <Button variant="outline" className="shrink-0 rounded-full h-10 w-10 md:h-12 md:w-12 p-0 flex items-center justify-center hover:bg-muted active:scale-[0.97] transition-all duration-200 ease-out border-2 border-border"><SettingsIcon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Audio Settings</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Microphone</label>
                  <Select value={selectedMicId} onValueChange={handleDeviceChange}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select a microphone" /></SelectTrigger>
                    <SelectContent>
                      {audioDevices.map((device, i) => (
                        <SelectItem key={device.deviceId || `mic-${i}`} value={device.deviceId || `mic-${i}`}>{device.label || `Microphone ${i + 1}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Popover>
            <PopoverTrigger>
              <Button variant="outline" className="shrink-0 rounded-full h-10 w-10 md:h-12 md:w-12 p-0 flex items-center justify-center hover:bg-muted active:scale-[0.97] transition-all duration-200 ease-out border-2 border-border"><SmilePlus className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 mb-4 border-none shadow-2xl rounded-xl overflow-hidden origin-bottom animate-in fade-in zoom-in-95 duration-200 ease-out" sideOffset={10}>
              <EmojiPicker onEmojiClick={handleSendReaction} theme={Theme.AUTO} lazyLoadEmojis={true} autoFocusSearch={false} />
            </PopoverContent>
          </Popover>

          <Button onClick={toggleDeafen} variant={isDeafened ? "destructive" : "secondary"} className={`shrink-0 rounded-full px-3.5 sm:px-5 md:px-6 h-10 md:h-12 flex items-center justify-center font-medium gap-1.5 text-xs md:text-sm border-2 active:scale-[0.97] transition-all duration-200 ease-out ${isDeafened ? "border-red-500" : "border-border"}`}>
            <div className="flex items-center gap-1.5">{isDeafened ? <HeadphoneOff className="h-4 w-4 md:h-5 md:w-5" /> : <Headphones className="h-4 w-4 md:h-5 md:w-5" />}<span className="hidden sm:inline">Deafen</span></div>
          </Button>
          
          <Button onClick={toggleMute} disabled={isDeafened} variant={isMuted ? "destructive" : "secondary"} className={`shrink-0 rounded-full px-4 sm:px-5 md:px-6 h-10 md:h-12 flex items-center justify-center font-medium gap-1.5 text-xs md:text-sm border-2 active:scale-[0.97] transition-all duration-200 ease-out ${isMuted ? "border-red-500" : "border-border"} ${isDeafened ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-1.5">{isMuted ? <MicOff className="h-4 w-4 md:h-5 md:w-5" /> : <Mic className="h-4 w-4 md:h-5 md:w-5" />}<span className="hidden sm:inline">Mute</span></div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function ParticipantTile({ participant, index, reaction }: { participant: any, index: number, reaction?: string }) {
  const isSpeaking = useIsSpeaking(participant);
  const isAudioMuted = !participant.isMicrophoneEnabled;
  const name = participant.identity || "Unknown";

  const mediaStream = useMemo(() => {
    const pub = participant.getTrackPublication(Track.Source.Microphone);
    if (pub && pub.track && pub.track.mediaStreamTrack) {
      return new MediaStream([pub.track.mediaStreamTrack]);
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participant.audioTrackPublications]);

  return (
    <div className="flex flex-col items-center justify-center relative group animate-in fade-in zoom-in-95 duration-300 ease-out" style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}>
      <div className="relative mb-3">
        <Avatar className={`h-20 w-20 border-2 ${isSpeaking ? 'border-primary ring-4 ring-primary ring-offset-4 ring-offset-background' : 'border-border'} bg-white transition-all`}>
          <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`} alt={name} className="object-contain" />
          <AvatarFallback className="bg-muted text-foreground font-bold text-xl">{name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        {reaction && (
          <div className="absolute -top-3 -right-3 bg-background/95 backdrop-blur border shadow-sm rounded-full h-10 w-10 flex items-center justify-center text-2xl z-10 animate-in fade-in zoom-in-95 duration-200 ease-out">
            <span className="leading-none select-none">{reaction}</span>
          </div>
        )}

        <div className="absolute bottom-0 right-0 p-1.5 rounded-full border bg-background text-foreground shadow-sm">
          {isAudioMuted ? <MicOff className="h-3.5 w-3.5 opacity-50" /> : <Mic className="h-3.5 w-3.5 text-primary" />}
        </div>
      </div>

      <div className="text-center w-full truncate flex flex-col items-center">
        <p className="font-semibold truncate text-sm">{name}</p>
        
        {isAudioMuted ? (
          <div className="h-6 w-full mt-2" />
        ) : (
          <AudioVisualizer stream={mediaStream} />
        )}
      </div>
    </div>
  );
}
