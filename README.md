<div align="center">
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=BetterSpace&size=120&backgroundColor=transparent" alt="Better Space Logo" width="120" height="120" />
  
  # Better Space

  High-fidelity, zero-account real-time audio spaces built with Next.js 16, LiveKit, and Base UI.
</div>

<br/>

## Features

- **Zero Accounts:** Pick a name and jump in. No password, no signup friction.
- **Studio-Grade Voice:** Real-time WebRTC audio with LiveKit, featuring Krisp AI noise suppression and echo cancellation.
- **Audio Controls & Device Switching:** Switch microphone and output speaker devices in real time with a live input level meter and built-in speaker test.
- **Host & Moderation Tools:** Host-controlled permissions (grant/revoke mic, mute participants, kick users, co-host controls).
- **Live Reactions:** Emoji reactions with real-time room sync.
- **Real-Time Audio Visualizer:** Dynamic 60fps waveform animation reacting to voice volume.
- **Mobile-First Responsive UI:** Floating glassmorphic dock with safe-area support.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack) & React 19
- **Realtime Audio:** [LiveKit](https://livekit.io/) & `@livekit/krisp-noise-filter`
- **UI & Primitives:** [Base UI](https://base-ui.com/) & [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons:** [Remix Icon](https://remixicon.com/)
- **Avatars:** [DiceBear](https://www.dicebear.com/)
- **Package Manager:** [Bun](https://bun.sh/)

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/whoavidwivedi/spacex.git
cd spacex
```

### 2. Install dependencies
```bash
bun install
```

### 3. Set up Environment Variables
Create a `.env.local` file with your LiveKit credentials:
```env
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `bun run dev`   Start the local development server
- `bun run build`   Create an optimized production build
- `bun run lint`   Run ESLint checks
- `bun run typecheck`   Run TypeScript type checks
