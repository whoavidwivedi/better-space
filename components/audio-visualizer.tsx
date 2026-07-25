"use client";

import React, { useEffect, useRef, useState } from "react";

export function AudioVisualizer({ stream }: { stream: MediaStream | null }) {
  const [volumes, setVolumes] = useState<number[]>([15, 15, 15, 15, 15]);
  const reqRef = useRef<number>(0);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) {
      setTimeout(() => setVolumes([15, 15, 15, 15, 15]), 0);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume context if suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;

    let source: MediaStreamAudioSourceNode;
    try {
      source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
    } catch (e) {
      console.warn("Could not create media stream source", e);
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      
      const getVol = (index: number) => {
        const val = dataArray[index];
        // Visual noise gate: flatten if there's very little sound
        if (val < 15) return 15;
        // Boost slightly but keep realistic to realtime sound
        return Math.min(100, (val / 160) * 100);
      };
      
      setVolumes([
        getVol(1),
        getVol(2),
        getVol(3),
        getVol(4),
        getVol(5)
      ]);
      reqRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(reqRef.current);
      source.disconnect();
      audioCtx.close().catch(() => {});
    };
  }, [stream]);

  return (
    <div className="flex items-center justify-center gap-[2px] h-6 w-full mt-2">
      {volumes.map((vol, i) => (
        <div 
          key={i} 
          className="w-1 bg-primary rounded-full transition-all duration-75"
          style={{ height: `${vol}%` }}
        />
      ))}
    </div>
  );
}
