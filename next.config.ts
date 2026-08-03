import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.29.119"],
  output: process.env.BUILD_MODE === "export" ? "export" : undefined,
}

export default nextConfig
