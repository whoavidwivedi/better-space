"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ArrowRight01Icon as ArrowRight } from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpaceRoom } from "@/components/space-room";

function SpaceHomeContent() {
  const [inSpace, setInSpace] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const avatarSeeds = ["Felix", "Aneka", "Jude", "Avery", "Zoe", "Leo", "Mia", "Sam"];
  const [currentSeedIndex, setCurrentSeedIndex] = useState(Math.floor(Math.random() * avatarSeeds.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSeedIndex((prev) => (prev + 1) % avatarSeeds.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const seed = avatarSeeds[currentSeedIndex];

  const handleJoinSpace = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!userName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setInSpace(true);
  };

  if (inSpace) {
    return (
      <SpaceRoom
        roomName="General Voice Channel"
        userName={userName}
        roomId="global-main-room"
        onLeave={() => setInSpace(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-primary bg-white shadow-sm flex items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={seed}
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`}
                alt="Avatar logo"
                initial={{ opacity: 0, y: 25, scale: 0.6, rotate: -30 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, y: -25, scale: 0.6, rotate: 30 }}
                transition={{ type: "spring", stiffness: 350, damping: 22, mass: 1 }}
                className="absolute inset-0 h-full w-full object-cover"
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

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Card className="w-full">
            <div className="p-6 pb-4 space-y-1.5 flex flex-col items-start">
              <h2 className="text-2xl font-semibold leading-none tracking-tight">Join Better Space</h2>
              <p className="text-sm text-muted-foreground">
                Enter your name to join the general voice channel.
              </p>
              <div className="pt-2">
                <Badge variant="secondary" className="font-mono text-xs text-muted-foreground">
                  Room: global-main-room
                </Badge>
              </div>
            </div>

            <div className="p-6 pt-0">
              <form onSubmit={handleJoinSpace} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Avi"
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
        </div>
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
