"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@/components/ui/hugeicons-icon"
import {
  Monitor as ComputerIcon,
  Moon as MoonIcon,
  Sun as SunIcon,
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const THEMES = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: ComputerIcon },
] as const

export function ModeToggle({
  className,
  variant = "outline",
}: {
  className?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        size="sm"
        variant={variant}
        className={cn("size-8 [&_svg]:size-4!", className)}
        aria-label="Choose theme"
        disabled
      >
        <HugeiconsIcon icon={ComputerIcon} />
      </Button>
    )
  }

  const current = THEMES.find((t) => t.value === theme) ?? THEMES[2]

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  size="sm"
                  variant={variant}
                  className={cn("size-8 [&_svg]:size-4!", className)}
                  aria-label="Choose theme: light, dark, or system"
                >
                  <HugeiconsIcon icon={current.icon} />
                </Button>
              }
            />
          }
        />
        <TooltipContent side="bottom">Theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" sideOffset={6} className="w-40">
        <DropdownMenuRadioGroup value={current.value} onValueChange={setTheme}>
          {THEMES.map((t) => (
            <DropdownMenuRadioItem key={t.value} value={t.value}>
              <HugeiconsIcon icon={t.icon} strokeWidth={2} />
              {t.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
