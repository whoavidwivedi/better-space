<div align="center">
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=SpaceX&size=120&backgroundColor=transparent" alt="SpaceX Logo" width="120" height="120" />
  
  # Space Room

  **A beautifully designed, real-time spatial audio experience.** <br />
  Built with Next.js, WebRTC, and Tailwind CSS.
</div>

<br/>

## ✨ Features

- 🎧 **Real-time Voice Chat:** Crystal clear, low-latency WebRTC audio powered by PeerJS.
- 🎨 **Dynamic Avatars:** Beautiful Notion-style avatars for every participant, uniquely generated via Dicebear.
- 📊 **Audio Visualization:** Live, pulsating audio wave visualizers that react to users' voices in real-time.
- 😊 **Live Reactions:** Send emojis that organically float up the screen using Framer Motion.
- 💬 **Integrated Text Chat:** A seamless slide-out drawer for text messaging alongside the audio experience.
- 📱 **Mobile Optimized:** A sleek, floating bottom control dock tailored perfectly for iOS and Android web browsers.
- 🔒 **Secure & Scalable:** Presence and signaling handled instantly via Supabase Realtime.

## 🚀 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Turbopack)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Realtime Signaling:** [Supabase](https://supabase.com/)
- **WebRTC (P2P Audio):** [PeerJS](https://peerjs.com/)
- **Avatars:** [DiceBear](https://www.dicebear.com/) (Notionists style)
- **Icons:** Lucide React & Hugeicons

## 🛠️ Getting Started

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
   Navigate to [http://localhost:3000](http://localhost:3000) to join the room!

<br />

## 🖼️ Meet the Avatars

<div align="center">
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alice" width="80" />
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Bob" width="80" />
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Charlie" width="80" />
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Dave" width="80" />
  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Eve" width="80" />
</div>
<p align="center"><em>Join the space and claim your unique avatar today!</em></p>
