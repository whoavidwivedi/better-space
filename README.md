<div align="center">
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=BetterSpace&size=120&backgroundColor=transparent" alt="Better Space Logo" width="120" height="120" />
  
  # Better Space

  A real-time spatial audio room built with Next.js, WebRTC, and Tailwind CSS.
</div>

<br/>

## Features

- **Real-time Voice Chat:** Low-latency WebRTC audio powered by PeerJS.
- **Dynamic Avatars:** Procedurally generated participant avatars using Dicebear.
- **Audio Visualization:** Real-time audio waveform visualizers based on microphone input.
- **Live Reactions:** Send temporary floating reactions to the room using Framer Motion.
- **Integrated Text Chat:** Synchronized text messaging alongside the audio stream.
- **Mobile Support:** Responsive UI with a floating control dock optimized for mobile browsers.
- **Signaling:** Room state, presence, and connection signaling handled via Supabase Realtime.

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Turbopack)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Realtime Signaling:** [Supabase](https://supabase.com/)
- **WebRTC:** [PeerJS](https://peerjs.com/)
- **Avatars:** [DiceBear](https://www.dicebear.com/)
- **Icons:** Lucide React & Hugeicons

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/whoavidwivedi/spacex.git
   cd spacex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to join the room.

<br />

## Avatar Preview

<div align="center">
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alice" width="80" />
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Bob" width="80" />
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Charlie" width="80" />
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Dave" width="80" />
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Eve" width="80" />
</div>
