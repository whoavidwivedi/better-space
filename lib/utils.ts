import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared nav active-state matcher. Default = exact path (or its trailing-slash form); { exact: false } also matches child paths, but only at a segment boundary, never a bare prefix.
export function isActive(pathname: string | null, href: string, opts?: { exact?: boolean }) {
  if (!pathname) return false
  const exact = !opts || opts.exact !== false
  if (exact) return pathname === href || pathname === href + "/"
  return pathname === href || pathname.startsWith(href + "/")
}
