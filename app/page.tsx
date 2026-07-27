/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const avatarSeeds = ["Felix", "Aneka", "Jude", "Avery", "Zoe", "Leo", "Mia", "Sam"];

function SpaceHomeContent() {
  const [currentSeedIndex, setCurrentSeedIndex] = useState(0);
  const [showPioneers, setShowPioneers] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSeedIndex((prev) => (prev + 1) % avatarSeeds.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const seed = avatarSeeds[currentSeedIndex];

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-background text-foreground flex flex-col font-sans">
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

      <main className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-hidden">
        <div className="w-full max-w-sm">
            <div className="p-6 pb-4 space-y-1.5 flex flex-col items-start">
              <h2 className="text-2xl font-semibold leading-none tracking-tight">Upgrading Space</h2>
              <p className="text-sm text-muted-foreground">
                We are currently rebuilding our spatial audio experience.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs text-muted-foreground">
                  Status: Maintenance
                </Badge>
                <div className="flex gap-1 items-center">
                  <motion.div className="w-1 h-1 rounded-full bg-primary/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-1 h-1 rounded-full bg-primary/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-1 h-1 rounded-full bg-primary/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }} />
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium text-sm leading-none">Next Generation Infrastructure</h3>
                <p className="text-sm text-muted-foreground">
                  We are shifting to an enterprise-grade architecture. Get ready for massive room capacities, crystal clear audio, and ultra-low latency.
                </p>
              </div>

            </div>
        </div>
      </main>

      <footer className="w-full pb-6 md:pb-10 pt-4 md:pt-6 px-4 md:px-6 flex flex-col items-center justify-center gap-4 md:gap-6 shrink-0">
        <p className="text-sm text-muted-foreground leading-relaxed text-center max-w-lg">
          Thank you to <button 
            type="button" 
            onClick={() => setShowPioneers(!showPioneers)}
            onMouseEnter={() => setShowPioneers(true)}
            onMouseLeave={() => setShowPioneers(false)}
            onBlur={() => setShowPioneers(false)}
            className="relative inline-block group cursor-pointer underline decoration-primary underline-offset-4 transition-all text-foreground font-medium outline-none"
          >
            everyone
            <span className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max origin-bottom transition-all pointer-events-none z-50 flex flex-col items-start gap-1.5 font-normal",
              showPioneers ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}>
              {[
                { name: "Dhirender Choudhary", seed: "Felix" },
                { name: "Scalar Skeleton", seed: "Aneka" },
                { name: "Simran Agarwal", seed: "Zoe" },
                { name: "Yash Raj", seed: "Leo" }
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <Avatar size="sm" className="bg-transparent shrink-0">
                    <AvatarImage 
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.seed}&backgroundColor=transparent`} 
                      alt={p.name}
                      className="object-contain" 
                    />
                    <AvatarFallback className="text-[10px]">{p.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium whitespace-nowrap text-xs">{p.name}</span>
                </div>
              ))}
            </span>
          </button> who made our v1 journey so special. We can&apos;t wait to share what&apos;s next with you.
        </p>

        <div className="w-full max-w-2xl overflow-hidden flex py-1 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <motion.div
            className="flex gap-4 pr-4 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          >
            {[...avatarSeeds, ...avatarSeeds, ...avatarSeeds, ...avatarSeeds].map((seed, i) => (
              <img 
                key={`${seed}-${i}`}
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=transparent`} 
                alt="Avatar" 
                className="w-12 h-12 shrink-0 object-contain opacity-70 hover:opacity-100 transition-opacity"
              />
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
