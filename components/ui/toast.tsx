"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import {
  RiCloseLine,
  RiCheckboxCircleLine,
  RiInformationLine,
  RiErrorWarningLine,
  RiCloseCircleLine,
  RiLoaderLine,
  RiUserVoiceLine,
} from "@remixicon/react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const toast = ToastPrimitive.createToastManager()

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-28 z-50",
        className,
      )}
      {...props}
    />
  )
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto absolute left-1/2 bottom-0 w-max -translate-x-1/2 origin-bottom",
        "inline-flex items-center justify-center overflow-hidden rounded-full border border-border/5",
        "bg-foreground text-background shadow-xl px-5 py-2.5 text-sm font-medium tracking-tight",
        "[--offset-y:calc(var(--toast-index)*-3.5rem)]",
        "data-expanded:[transform:translateY(var(--offset-y))]",
        "data-starting-style:scale-95 data-starting-style:opacity-0 data-starting-style:translate-y-4",
        "data-ending-style:scale-95 data-ending-style:opacity-0 data-ending-style:translate-y-4",
        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
        className,
      )}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn("flex items-center gap-2.5", className)}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children ?? <RiCloseLine aria-hidden="true" />}
    </ToastPrimitive.Close>
  )
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null

  if (type === "success") {
    icon = <RiCheckboxCircleLine aria-hidden="true" />
  }

  if (type === "info") {
    icon = <RiInformationLine aria-hidden="true" />
  }

  if (type === "warning") {
    icon = <RiErrorWarningLine aria-hidden="true" />
  }

  if (type === "error") {
    icon = <RiCloseCircleLine className="text-destructive" aria-hidden="true" />
  }

  if (type === "loading") {
    icon = <RiLoaderLine className="animate-spin" aria-hidden="true" />
  }

  if (type === "mic-request") {
    icon = <RiUserVoiceLine aria-hidden="true" />
  }

  if (icon === null) {
    return null
  }

  return (
    <span
      data-slot="toast-icon"
      className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
    >
      {icon}
    </span>
  )
}

function ToastCountdownRing() {
  return (
    <svg
      className="size-4 shrink-0 -rotate-90 group-hover/toast:[&_circle:last-child]:[animation-play-state:paused]"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="opacity-20"
      />
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="37.7"
        strokeDashoffset="0"
        className="animate-[toast-progress_2s_linear_forwards]"
      />
    </svg>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => {
    const isMicRequest = toastItem.type === "mic-request"
    return (
      <Toast 
        key={toastItem.id} 
        toast={toastItem}
        className={
          isMicRequest 
            ? "!data-ending-style:scale-[0.1] !data-ending-style:translate-y-[5rem] !data-ending-style:-translate-x-[60%] !data-ending-style:blur-[4px] !data-ending-style:opacity-0" 
            : undefined
        }
      >
        <ToastContent>
          <ToastIcon type={toastItem.type} />
          <span className="truncate flex-1">{toastItem.title}</span>
          <ToastCountdownRing />
        </ToastContent>
      </Toast>
    )
  })
}

function Toaster({ children, toastManager = toast, timeout = 2000, ...props }: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} timeout={timeout} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
}
