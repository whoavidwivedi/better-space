import React from "react"
import { LucideIcon } from "lucide-react"

interface HugeiconsIconProps extends Omit<
  React.ComponentPropsWithoutRef<"svg">,
  "value"
> {
  icon: LucideIcon
  size?: number | string
}

export function HugeiconsIcon({
  icon: Icon,
  size = 16,
  className,
  ...props
}: HugeiconsIconProps) {
  if (!Icon) return null
  return <Icon className={className} size={size} {...props} />
}
