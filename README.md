<div align="center">
  <img src="public/Userpics/SVG/Circle/dynamic-logo.svg" alt="Better Space Logo" width="120" height="120" />

# Better Space

Real-time voice. Zero accounts.

Drop into live voice rooms right in your browser. Claim the mic and talk with crisp, low-latency audio. Now on iPhone Duo.

<a href="https://space.whoavidwivedi.work"><img src="https://img.shields.io/badge/Go_live-3f80ff?style=for-the-badge" alt="Go live" /></a>
<a href="https://space.whoavidwivedi.work/lobby"><img src="https://img.shields.io/badge/Browse_live_rooms-2c2c30?style=for-the-badge" alt="Browse live rooms" /></a>
<a href="https://space.whoavidwivedi.work/changelog"><img src="https://img.shields.io/badge/Changelog-2c2c30?style=for-the-badge" alt="Changelog" /></a>
<a href="https://github.com/whoavidwivedi/better-space/releases/latest"><img src="https://img.shields.io/github/v/release/whoavidwivedi/better-space?style=for-the-badge&label=Release&color=2c2c30" alt="Latest release" /></a>

</div>

<br/>

## Features

- **Zero accounts:** Pick a name and jump in. No password, no signup friction.
- **Studio-grade voice:** Real-time WebRTC audio with LiveKit, featuring Krisp AI noise suppression and echo cancellation.
- **Live chat:** Messages beside the stage, with typing indicators and history synced from the host to anyone who joins later.
- **Audio controls and device switching:** Switch microphone and speaker in real time, with a live input level meter and a built-in speaker test.
- **Host and moderation tools:** Grant or revoke the mic, mute participants, remove users, and hand out co-host controls.
- **Live reactions:** Emoji reactions synced across the room.
- **Real-time audio visualizer:** A 60fps waveform that reacts to each speaker's voice.
- **Made for every screen:** From phones to desktops to iPhone Duo, with safe-area support throughout.

## iPhone Duo

Better Space now supports iPhone Duo, on both of its screens.

- **Closed:** The cover screen keeps the whole room in reach, with the controls in a column of round buttons by your thumb.
- **Unfolded:** The room splits at the hinge, the space on the left and chat on the right, with the controls docked beside them.

The landing page shows it for yourself: a Duo in Apple's frame that you can drag, tap or slide to fold and unfold, its screens blurring as the cover turns.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack) and React 19
- **Realtime audio:** [LiveKit](https://livekit.io/) and `@livekit/krisp-noise-filter`
- **UI and primitives:** [Base UI](https://base-ui.com/) and [Tailwind CSS 4](https://tailwindcss.com/)
- **Motion:** [Motion](https://motion.dev/) (`framer-motion`)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Avatars:** 96 local handcrafted SVG personas
- **Package manager:** [Bun](https://bun.sh/)

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

### 3. Set up environment variables

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

- `bun run dev` Start the local development server
- `bun run build` Create an optimized production build
- `bun run lint` Run ESLint checks
- `bun run typecheck` Run TypeScript type checks
- `bun run format` Format code files with Prettier
- `bun test` Run the test suite

## Deployment

Production is deployed through the Vercel Git integration from `main`. GitHub
Actions runs CI checks on pull requests and pushes; there is no Render deploy
step. Configure the LiveKit variables in the Vercel project environment before
enabling production traffic.

### Vercel preview smoke test

- Create a space as the host and join it from a second browser session.
- Promote the second session to co-host, then verify it can end or leave the space.
- Revoke co-host access and verify the old session can no longer moderate or end it.
- Refresh during a temporary network interruption and verify the connection status changes visibly.
- Confirm toasts remain above the bottom audio-control dock on narrow screens.
- Confirm the browser has no `space_host_secret_*` or `space_cohost_secret_*` local-storage entries.
- On a short landscape or iPhone Duo-sized window, confirm the controls dock at the bottom right and, unfolded, the room splits with chat on the right.

## Credits

- Device frames: [Apple Design Resources](https://developer.apple.com/design/resources/), used under Apple's license.
- iPhone Duo fold: based on [Foldable](https://chanhdai.com) by Chánh Đại (`@ncdai/foldable`).
