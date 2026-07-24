"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight01Icon as ArrowRight, SparklesIcon as Sparkles } from "hugeicons-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpaceRoom } from "@/components/space-room";

function SpaceHomeContent() {
  const [inSpace, setInSpace] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleJoinSpace = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!userName.trim()) {
      setError("Please enter your name.");
      return;
    }

    // Check if another tab is already in the room
    const bc = new BroadcastChannel("spacex_room_channel");
    bc.postMessage("check_active");
    
    let isAlreadyActive = false;
    bc.onmessage = (event) => {
      if (event.data === "active") {
        isAlreadyActive = true;
      }
    };

    // Wait a brief moment for any active tab to respond
    setTimeout(() => {
      if (isAlreadyActive) {
        setError("You are already in the room in another tab or window.");
        bc.close();
      } else {
        bc.close();
        setInSpace(true);
      }
    }, 100);
  };

  if (inSpace) {
    return (
      <SpaceRoom
        roomName="General Voice Channel"
        userName={userName}
        userRole="speaker"
        roomId="global-main-room"
        onLeave={() => setInSpace(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight">Space</span>
        </div>
      </header>

      {/* Hero Body */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          <Card className="w-full">
            <div className="p-6 pb-4 space-y-1.5 flex flex-col items-start">
              <h2 className="text-2xl font-semibold leading-none tracking-tight">Join Space</h2>
              <p className="text-sm text-muted-foreground">
                Enter your name to join the general voice channel.
              </p>
            </div>

            <div className="p-6 pt-0">
              <form onSubmit={handleJoinSpace} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Alex"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-9"
                  />
                </div>

                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full active:scale-[0.98] transition-transform duration-150"
                >
                  Join Room
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </div>
          </Card>
        </motion.div>
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

