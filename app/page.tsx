/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SpaceRoomLiveKit } from "@/components/livekit-room";

const avatarSeeds = ["Felix", "Aneka", "Jude", "Avery", "Zoe", "Leo", "Mia", "Sam"];

function SpaceHomeContent() {
  const [randomSeeds, setRandomSeeds] = useState<string[]>(avatarSeeds);
  const [currentSeedIndex, setCurrentSeedIndex] = useState(0);
  const [showPioneers, setShowPioneers] = useState(false);
  const [userName, setUserName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [token, setToken] = useState("");

  const handleJoin = async () => {
    if (!userName.trim()) return;
    setIsJoining(true);
    try {
      const res = await fetch(`/api/livekit?room=better-space&username=${encodeURIComponent(userName)}`);
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setHasJoined(true);
      } else {
        toast.error("Failed to connect: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      toast.error("Failed to connect to LiveKit server");
    } finally {
      setIsJoining(false);
    }
  };

  useEffect(() => {
    setRandomSeeds(Array.from({ length: 15 }, () => Math.random().toString(36).substring(2, 9)));
    const interval = setInterval(() => {
      setCurrentSeedIndex((prev) => (prev + 1) % 15);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const seed = randomSeeds[currentSeedIndex];

  if (hasJoined && token) {
    return <SpaceRoomLiveKit roomName="better-space" userName={userName} token={token} onLeave={() => setHasJoined(false)} />;
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-primary bg-white shadow-sm flex items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={seed}
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=transparent`}
                alt="Avatar logo"
                initial={{ opacity: 0, y: 25, scale: 0.6, rotate: -30 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, y: -25, scale: 0.6, rotate: 30 }}
                transition={{ type: "spring", stiffness: 350, damping: 22, mass: 1 }}
                className="absolute inset-0 h-full w-full object-cover bg-black opacity-90 invert dark:invert-0"
              />
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <span className="font-bold text-xl tracking-tight text-foreground">Better Space</span>
            <div className="flex items-center gap-[2px] h-4 ml-0.5">
              <motion.div
                className="w-[3px] bg-primary rounded-full"
                animate={{ height: ["30%", "60%", "30%", "100%", "40%", "80%", "20%", "50%", "30%", "70%", "30%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="w-[3px] bg-primary rounded-full"
                animate={{ height: ["40%", "100%", "50%", "80%", "30%", "90%", "40%", "100%", "60%", "40%", "40%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="w-[3px] bg-primary rounded-full"
                animate={{ height: ["20%", "50%", "20%", "70%", "100%", "40%", "80%", "30%", "60%", "30%", "20%"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="w-[3px] bg-primary rounded-full"
                animate={{ height: ["30%", "80%", "40%", "100%", "30%", "70%", "20%", "60%", "80%", "40%", "30%"] }}
                transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-hidden">
        <div className="w-full max-w-sm">
            <div className="p-6 pb-4 space-y-1.5 flex flex-col items-start">
              <h2 className="text-2xl font-semibold leading-none tracking-tight">Space v2 is Live</h2>
            </div>

            <div className="p-6 pt-0 space-y-6">
              <div className="space-y-3">
                <Input 
                  placeholder="Enter your name..." 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)} 
                  maxLength={15}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
                <Button className="w-full" onClick={handleJoin} disabled={!userName.trim() || isJoining}>
                  {isJoining ? "Connecting..." : "Join Space"}
                </Button>
              </div>
            </div>
        </div>
      </main>

      <footer className="w-full pb-6 md:pb-10 pt-4 md:pt-6 px-4 md:px-6 flex flex-col items-center justify-center gap-4 md:gap-6 shrink-0">
        <p className="text-sm text-muted-foreground leading-relaxed text-center max-w-lg">
          Welcome to Space v2.
        </p>

        <div className="w-full max-w-2xl overflow-hidden flex py-1 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <motion.div
            className="flex gap-4 pr-4 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          >
            {[...randomSeeds, ...randomSeeds, ...randomSeeds, ...randomSeeds].map((seed, i) => (
              <div 
                key={`${seed}-${i}`}
                className="w-12 h-12 shrink-0 rounded-full bg-black flex items-center justify-center overflow-hidden opacity-70 hover:opacity-100 transition-opacity"
              >
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=transparent`} alt="Avatar" className="w-full h-full object-cover opacity-90 invert dark:invert-0" />
              </div>
            ))}
          </motion.div>
        </div>
      </footer>
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
