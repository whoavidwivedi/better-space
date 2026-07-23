"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Radio, Users, Sparkles, Mic, Plus, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpaceRoom } from "@/components/space-room";

function SpaceHomeContent() {
  const searchParams = useSearchParams();
  const roomQuery = searchParams.get("room");

  const [inSpace, setInSpace] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [userRole, setUserRole] = useState<"host" | "speaker" | "listener">("host");

  useEffect(() => {
    if (roomQuery) {
      setRoomId(roomQuery);
      setRoomName(`Space #${roomQuery.slice(-4)}`);
      setUserRole("listener");
    }
  }, [roomQuery]);

  const handleStartSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const generatedId = roomId.trim() || `spacex-${Math.random().toString(36).substr(2, 6)}`;
    setRoomId(generatedId);
    setRoomName(roomName.trim() || `${userName}'s Space`);
    setInSpace(true);
  };

  if (inSpace) {
    return (
      <SpaceRoom
        roomName={roomName}
        userName={userName}
        userRole={userRole}
        roomId={roomId}
        onLeave={() => setInSpace(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-10">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl tracking-tight">SpaceX</span>
        </div>
      </header>

      {/* Hero Body */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <Card className="max-w-md w-full p-8 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight pt-2">
              {roomQuery ? "Join Audio Space" : "Start an Audio Space"}
            </h1>
          </div>

          <form onSubmit={handleStartSpace} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Name</label>
              <Input
                required
                placeholder="e.g. Alex"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            {!roomQuery && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Space Topic / Title</label>
                <Input
                  placeholder="e.g. Late Night Tech & Chill"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
            )}

            {roomQuery && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joining Room ID</label>
                <Input
                  disabled
                  value={roomId}
                  className="font-mono text-xs"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full font-medium py-6 rounded-xl text-base gap-2"
            >
              {roomQuery ? "Join Space Now" : "Start Live Space"}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

        </Card>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background text-muted-foreground flex items-center justify-center">Loading SpaceX...</div>}>
      <SpaceHomeContent />
    </Suspense>
  );
}

