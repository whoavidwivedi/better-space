import { Geist, Geist_Mono } from "next/font/google"

// One family for everything people read: headlines and body.
export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

// Labels, codes and numbers.
export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})
