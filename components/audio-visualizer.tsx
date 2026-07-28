"use client";

import React, { useEffect, useState } from "react";

export function AudioVisualizer({ volume = 0 }: { volume?: number }) {
  const [volumes, setVolumes] = useState<number[]>([15, 15, 15, 15, 15]);

  useEffect(() => {
    // If volume is extremely low (silence or noise gate), flatten the bars
    if (volume < 0.01) {
      setVolumes([15, 15, 15, 15, 15]);
      return;
    }
    
    // Scale LiveKit's 0-1 volume to a base 0-100 percentage.
    // We boost it slightly so normal speaking looks dynamic.
    const base = Math.min(100, volume * 300);
    
    // Simulate a 5-band equalizer by adding randomized frequency jitter to the overall volume scalar
    setVolumes([
      Math.max(15, Math.min(100, base + (Math.random() * 30 - 15))),
      Math.max(15, Math.min(100, base + (Math.random() * 40 - 20))),
      Math.max(15, Math.min(100, base + (Math.random() * 50 - 25))),
      Math.max(15, Math.min(100, base + (Math.random() * 40 - 20))),
      Math.max(15, Math.min(100, base + (Math.random() * 30 - 15))),
    ]);
  }, [volume]);

  return (
    <div className="flex items-center justify-center gap-[2px] h-6 w-full mt-2">
      {volumes.map((vol, i) => (
        <div 
          key={i} 
          className="w-1 bg-primary rounded-full transition-all duration-75 ease-out"
          style={{ height: `${vol}%` }}
        />
      ))}
    </div>
  );
}
