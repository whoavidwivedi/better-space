"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@/components/ui/hugeicons-icon"
import { Moon as MoonIcon, Sun as SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// One click flips between light and dark. Until someone clicks, the theme
// follows the system (the provider's default).
export function ModeToggle({
  className,
  variant = "outline",
}: {
  className?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const label = isDark ? "Switch to light theme" : "Switch to dark theme"

  return (
    <Button
      size="sm"
      variant={variant}
      className={cn("size-8 [&_svg]:size-4!", className)}
      aria-label={label}
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <HugeiconsIcon icon={isDark ? SunIcon : MoonIcon} />
    </Button>
  )
}
