import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.browser.ts",
  timeout: 60_000,
  expect: { timeout: 12_000 },
  use: {
    channel: "chromium",
    baseURL: "http://localhost:3188",
    permissions: ["microphone"],
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
      args: [
        "--use-fake-device-for-media-stream",
        "--use-fake-ui-for-media-stream",
      ],
    },
  },
  webServer: {
    command: "bun run dev --hostname localhost --port 3188",
    url: "http://localhost:3188/lobby",
    env: {
      LIVEKIT_API_KEY: "devkey",
      LIVEKIT_API_SECRET: "secret",
      NEXT_PUBLIC_LIVEKIT_URL: "ws://127.0.0.1:7880",
    },
  },
})
