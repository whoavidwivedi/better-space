"use client"

import * as React from "react"
import { NotificationStore, NotificationItem } from "@/lib/notification-store"

/**
 * Replaces the transient `@base-ui/react/toast` manager with our persistent NotificationStore.
 * We maintain the same interface so that we don't have to refactor the entire app.
 */
export const toast = {
  add: (notification: Omit<NotificationItem, "id" | "timestamp" | "read">) => {
    NotificationStore.add(notification)
  },
}

// Keep these exports so that other files importing from toast.tsx don't break immediately,
// though they won't render anything if used since we moved away from the Base UI toast system.
export function Toaster({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

// Dummy components to prevent import errors in other files
export function Toast({ children }: any) { return <>{children}</> }
export function ToastAction({ children, onClick, ...props }: any) { 
  return (
    <button onClick={onClick} className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...props}>
      {children}
    </button>
  )
}
export function ToastClose({ children }: any) { return <>{children}</> }
export function ToastContent({ children }: any) { return <>{children}</> }
export function ToastDescription({ children }: any) { return <>{children}</> }
export function ToastPortal({ children }: any) { return <>{children}</> }
export function ToastProvider({ children }: any) { return <>{children}</> }
export function ToastTitle({ children }: any) { return <>{children}</> }
export function ToastViewport({ children }: any) { return <>{children}</> }
export const createToastManager = () => toast;
export const useToastManager = () => ({ toasts: [] });
