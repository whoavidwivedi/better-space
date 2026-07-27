"use client";

import { useEffect } from "react";

const avatarSeeds = ["Felix", "Aneka", "Jude", "Avery", "Zoe"];

export function AnimatedFavicon() {
  useEffect(() => {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/svg+xml';
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    let avatarIndex = 0;

    // Swap avatars every 2 seconds. No waveforms.
    const interval = setInterval(() => {
      if (!link) return;
      avatarIndex = (avatarIndex + 1) % avatarSeeds.length;
      const seed = avatarSeeds[avatarIndex];
      link.href = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=transparent`;
    }, 2000); 

    return () => clearInterval(interval);
  }, []);

  return null;
}
