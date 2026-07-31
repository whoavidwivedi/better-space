"use client"

import * as React from "react"
import { RiNotification3Line, RiCheckDoubleLine, RiDeleteBinLine } from "@remixicon/react"
import { Popover } from "@base-ui/react/popover"

import { NotificationStore, NotificationItem } from "@/lib/notification-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function NotificationIcon({ type }: { type: NotificationItem["type"] }) {
  if (type === "success") return <span className="text-success text-xs">✓</span>
  if (type === "error") return <span className="text-destructive text-xs">✕</span>
  if (type === "warning") return <span className="text-warning text-xs">!</span>
  if (type === "info") return <span className="text-primary text-xs">i</span>
  return null;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  
  React.useEffect(() => {
    return NotificationStore.subscribe(setNotifications)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Popover.Root>
      <Popover.Trigger
        className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Notifications"
      >
        <RiNotification3Line className="size-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Positioner
          className="z-50 outline-none"
          align="end"
          side="top"
          sideOffset={8}
        >
          <Popover.Popup className="w-80 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl outline-none origin-[var(--transform-origin)] transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  onClick={() => NotificationStore.markAllAsRead()}
                  title="Mark all as read"
                  className="h-6 w-6"
                >
                  <RiCheckDoubleLine className="size-4 text-muted-foreground" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  onClick={() => NotificationStore.clearAll()}
                  title="Clear all"
                  className="h-6 w-6"
                >
                  <RiDeleteBinLine className="size-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={cn(
                        "group flex flex-col gap-1 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/50 cursor-pointer",
                        !notif.read && "bg-muted/30 font-medium"
                      )}
                      onClick={() => NotificationStore.markAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 shrink-0">
                          <NotificationIcon type={notif.type} />
                        </div>
                        <div className="flex-1 space-y-1 overflow-hidden">
                          <p className="break-words leading-tight">{notif.title}</p>
                          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                            <span>
                              {new Intl.DateTimeFormat(undefined, {
                                hour: 'numeric',
                                minute: 'numeric',
                                second: 'numeric'
                              }).format(new Date(notif.timestamp))}
                            </span>
                          </div>
                        </div>
                      </div>
                      {notif.action && (
                        <div className="mt-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
                          {notif.action}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
