"use client"

import Link from "next/link"
import React from "react"
import {
  RiArrowRightLine,
  RiMicOffLine,
  RiUserStarLine,
  RiTeamLine,
  RiUserVoiceLine,
  RiHistoryLine,
} from "@remixicon/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { EndedSpace } from "@/lib/ended-spaces"
import { userpicUrl } from "@/lib/userpics"

function Person({ identity }: { identity: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2">
      <Avatar className="size-10 shrink-0 border border-border bg-muted">
        <AvatarImage
          src={userpicUrl(identity)}
          alt={identity}
          className="object-cover"
        />
        <AvatarFallback />
      </Avatar>
      <span className="truncate font-sans text-sm font-medium text-foreground">
        {identity}
      </span>
    </div>
  )
}

function Section({
  icon,
  label,
  people,
}: {
  icon: React.ReactNode
  label: string
  people: string[]
}) {
  return (
    <div>
      <h2 className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        {icon}
        {label}
      </h2>
      <div className="flex flex-wrap gap-2">
        {people.map((p) => (
          <Person key={p} identity={p} />
        ))}
      </div>
    </div>
  )
}

export function SpaceEnded({ space }: { space: EndedSpace }) {
  const host = space.host || "Unknown"
  const speakers = (space.speakers ?? [])
    .filter(
      (s) =>
        "identity" in s &&
        s.identity !== space.host &&
        !space.cohosts.includes(s.identity)
    )
    .map((s) => s.identity)

  const humanTime = (() => {
    if (!space.endedAt) return ""
    try {
      return new Date(space.endedAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    } catch {
      return ""
    }
  })()

  const roomLabel = space.name.startsWith("/") ? space.name : `/${space.name}`

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted">
            <RiMicOffLine size={20} className="text-muted-foreground" />
          </div>
          <div className="text-left">
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
              This space has ended
            </h1>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              /space{roomLabel}
            </p>
          </div>
        </div>

        {humanTime ? (
          <p className="-mt-3 mb-4 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <RiHistoryLine size={12} />
            Ended {humanTime}
          </p>
        ) : null}

        <p className="mb-6 font-sans text-sm leading-relaxed text-muted-foreground">
          The host wrapped things up and this space has been archived. It
          can&apos;t be revived — but you&apos;re welcome to start your own.
        </p>

        <div className="space-y-4">
          <Section
            icon={<RiUserStarLine size={12} />}
            label="Host"
            people={[host]}
          />
          {space.cohosts.length > 0 && (
            <Section
              icon={<RiTeamLine size={12} />}
              label="Cohosts"
              people={space.cohosts}
            />
          )}
          {speakers.length > 0 ? (
            <Section
              icon={<RiUserVoiceLine size={12} />}
              label="Speakers"
              people={speakers}
            />
          ) : (
            <p className="font-mono text-[11px] text-muted-foreground">
              No other speakers were present.
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button
            className="h-11 flex-1 gap-1.5 rounded-xl bg-foreground font-mono text-xs font-bold tracking-wider text-background uppercase hover:bg-foreground/90"
            render={<Link href="/lobby" />}
          >
            Browse live spaces
            <RiArrowRightLine size={14} />
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-xl border-border font-mono text-xs font-bold tracking-wider uppercase hover:bg-muted"
            render={<Link href="/" />}
          >
            Start a new space
          </Button>
        </div>
      </div>
    </div>
  )
}
