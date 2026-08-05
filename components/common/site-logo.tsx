/* eslint-disable @next/next/no-img-element */
"use client"

import { Avatar } from "@/components/ui/avatar"
import { userpicUrl } from "@/lib/userpics"
import { cn } from "@/lib/utils"

export function SiteLogo({ className }: { className?: string }) {
  return (
    <Avatar
      className={cn("border-border bg-muted size-8 border", className)}
      aria-hidden="true"
    >
      <img
        src={userpicUrl("01")}
        alt=""
        className="size-full rounded-full object-cover"
      />
    </Avatar>
  )
}
