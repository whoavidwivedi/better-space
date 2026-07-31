import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

import "@/lib/utils"
import { NODE_ENV } from "@/lib/constants"
import { polyfillServer } from "@/lib/polyfill"

export const env = createEnv({
  server: {
    NODE_ENV,
    AGENT_SIGNIN_ENABLED: z.stringbool().default(false),
    HONO_APP_URL: z.url(),
    HONO_PORT: z.coerce.number().default(4000),
    HONO_RATE_LIMIT: z.coerce.number().default(60),
    HONO_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
    HONO_TRUSTED_ORIGINS: z
      .string()
      .transform((s) => s.split(",").map((v) => v.trim().replace(/\/$/, "")))
      .pipe(z.array(z.url())),
    LIVEKIT_API_KEY: z.string().optional(),
    LIVEKIT_API_SECRET: z.string().optional(),
    NEXT_PUBLIC_LIVEKIT_URL: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    AGENT_SIGNIN_ENABLED: process.env.AGENT_SIGNIN_ENABLED,
    HONO_APP_URL: polyfillServer(process.env.HONO_APP_URL, "https://polyfill.url"),
    HONO_PORT: process.env.HONO_PORT,
    HONO_RATE_LIMIT: process.env.HONO_RATE_LIMIT,
    HONO_RATE_LIMIT_WINDOW_MS: process.env.HONO_RATE_LIMIT_WINDOW_MS,
    HONO_TRUSTED_ORIGINS: polyfillServer(process.env.HONO_TRUSTED_ORIGINS, "https://polyfill.url"),
    LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
    NEXT_PUBLIC_LIVEKIT_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL,
  },
  emptyStringAsUndefined: true,
})
