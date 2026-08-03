<div align="center">
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=BetterSpace&size=120&backgroundColor=transparent" alt="Better Space Logo" width="120" height="120" />
  
  # Better Space

  High-fidelity, zero-account real-time audio spaces built with Next.js 16, LiveKit, and Base UI.
</div>

<br/>

## Features

- **Zero Accounts:** Instant entry with custom character identity and per-space locking.
- **Studio-Grade Voice:** Real-time WebRTC audio via LiveKit SFU, featuring Krisp AI noise suppression and echo cancellation.
- **Audio Controls and Device Switching:** Real-time microphone and speaker device selection with live input level metering and test sound playback.
- **Host and Moderation Tools:** Host and co-host permissions, stage capacity limits (8 speakers maximum), mic request queue, remote mute, and user removal.
- **Live Reactions:** Floating reaction overlays with real-time room synchronization.
- **Real-Time Audio Visualizer:** Dynamic waveform animation reacting to voice volume.
- **Progressive Web App (PWA):** Installable standalone application with offline support and custom app manifests.
- **Mobile-First Responsive UI:** Floating glassmorphic dock with safe-area adaptation and compact, non-scrollable modals.

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
git clone https://github.com/whoavidwivedi/better-space.git
cd better-space
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

- `bun run dev` - Start the local development server
- `bun run build` - Create an optimized production build
- `bun run lint` - Run ESLint checks
- `bun run typecheck` - Run TypeScript type checks
- `bun run format` - Format code with Prettier
