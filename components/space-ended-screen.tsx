"use client"

import * as React from "react"
import Link from "next/link"
import { MicOff, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { userpicUrl } from "@/lib/userpics"
import { getDisplayRoomTitle } from "@/lib/presets"
import { cn } from "@/lib/utils"

export type SpaceEndedScreenProps = {
  roomName: string
  host?: string
  speakers?: Array<{ identity: string; avatar?: string }>
  onReturn?: () => void
  isModal?: boolean
}

export function SpaceEndedScreen({
  roomName,
  host,
  speakers = [],
  onReturn,
  isModal = false,
}: SpaceEndedScreenProps) {
  const title = getDisplayRoomTitle(roomName)
  const uniqueSpeakers = React.useMemo(() => {
    const list = [...speakers]
    if (host && !list.some((s) => s.identity === host)) {
      list.unshift({ identity: host, avatar: host })
    }
    return list.slice(0, 8)
  }, [host, speakers])

  const content = (
    <div className="w-full max-w-md animate-in duration-300 zoom-in-95 fade-in">
      <div
        className={cn(
          "rounded-3xl p-6 text-center sm:p-8",
          isModal
            ? "border-0 bg-transparent p-2 shadow-none sm:p-4"
            : "border border-border bg-card shadow-lg"
        )}
      >
        {/* Status icon badge */}
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shadow-xs">
          <MicOff className="size-6" aria-hidden="true" />
        </div>

        {/* Room tag */}
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-1 font-mono text-[11px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-destructive" />
          <span className="max-w-xs truncate">/space/{roomName}</span>
        </div>

        {/* Headline */}
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          This space has ended
        </h2>

        {/* Room title & description */}
        <p className="mt-2 text-sm font-medium text-foreground/90">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          The host has concluded this live voice room. It is no longer accepting
          new participants.
        </p>

        {/* Speakers who took part */}
        {uniqueSpeakers.length > 0 && (
          <div className="mt-6 border-t border-border/60 pt-4">
            <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Speakers in this space
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {uniqueSpeakers.map((s) => (
                <div
                  key={s.identity}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userpicUrl(s.avatar || s.identity)}
                    alt=""
                    className="size-5 rounded-full object-cover"
                  />
                  <span className="max-w-24 truncate font-medium text-foreground">
                    {s.identity}
                  </span>
                  {s.identity === host && (
                    <span className="rounded bg-muted px-1 font-mono text-[9px] text-muted-foreground uppercase">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="mt-8 flex flex-col gap-2.5">
          {onReturn ? (
            <Button
              type="button"
              onClick={onReturn}
              className="w-full gap-2 rounded-xl font-medium"
            >
              Browse live spaces
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              render={<Link href="/lobby" />}
              className="w-full gap-2 rounded-xl font-medium"
            >
              Browse live spaces
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  if (isModal) {
    return content
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-4 sm:p-6">
      {content}
    </div>
  )
}
