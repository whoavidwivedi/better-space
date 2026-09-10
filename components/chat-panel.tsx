"use client"

import * as React from "react"
import {
  useChat,
  useLocalParticipant,
  useParticipants,
  useDataChannel,
  useRoomContext,
} from "@livekit/components-react"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageGroup,
  MessageHeader,
  MessageFooter,
} from "@/components/ui/message"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { RiSendPlane2Fill, RiCloseLine } from "@remixicon/react"
import { userpicUrl } from "@/lib/userpics"
import { cn } from "@/lib/utils"

export function ChatPanel({
  className,
  isHost,
}: {
  className?: string
  isHost?: boolean
}) {
  const room = useRoomContext()
  const roomName = room?.name
  const { chatMessages, send, isSending } = useChat()
  const { localParticipant } = useLocalParticipant()
  const participants = useParticipants()
  const [inputValue, setInputValue] = React.useState("")
  const [history, setHistory] = React.useState<any[]>([])
  const [typingUsers, setTypingUsers] = React.useState<
    Record<string, NodeJS.Timeout>
  >({})
  const lastTypingTime = React.useRef(0)
  const [isCollapsed, setIsCollapsed] = React.useState(true)

  const historyRef = React.useRef(history)
  React.useEffect(() => {
    historyRef.current = history
  }, [history])

  const { send: sendSyncData } = useDataChannel("chat_sync", (msg) => {
    if (!msg.from?.identity) return
    try {
      const payload = JSON.parse(new TextDecoder().decode(msg.payload))
      if (payload.type === "request_history" && isHost) {
        sendSyncData(
          new TextEncoder().encode(
            JSON.stringify({
              type: "history_payload",
              history: historyRef.current,
            })
          ),
          { destinationIdentities: [msg.from.identity], reliable: true }
        ).catch(() => {})
      } else if (payload.type === "history_payload" && !isHost) {
        setHistory(payload.history)
        if (roomName) {
          localStorage.setItem(
            `space_chat_${roomName}`,
            JSON.stringify(payload.history)
          )
        }
      }
    } catch {}
  })

  React.useEffect(() => {
    if (!isHost && roomName && typeof sendSyncData === "function") {
      const t = setTimeout(() => {
        sendSyncData(
          new TextEncoder().encode(JSON.stringify({ type: "request_history" })),
          { reliable: true }
        ).catch(() => {})
      }, 1000)
      return () => clearTimeout(t)
    }
  }, [isHost, roomName, sendSyncData])

  const { send: sendTypingData } = useDataChannel("typing", (msg) => {
    if (msg.from?.identity) {
      const identity = msg.from.identity
      const payload = new TextDecoder().decode(msg.payload)
      try {
        const data = JSON.parse(payload)
        if (data.isTyping) {
          setTypingUsers((prev) => {
            if (prev[identity]) clearTimeout(prev[identity])
            return {
              ...prev,
              [identity]: setTimeout(() => {
                setTypingUsers((curr) => {
                  const next = { ...curr }
                  delete next[identity]
                  return next
                })
              }, 3000),
            }
          })
        }
      } catch {}
    }
  })

  React.useEffect(() => {
    if (!roomName) return
    const stored = localStorage.getItem(`space_chat_${roomName}`)
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch {}
    }
  }, [roomName])

  React.useEffect(() => {
    if (!roomName || chatMessages.length === 0) return

    setHistory((prev) => {
      const newMessages = [...prev]
      let changed = false
      chatMessages.forEach((msg) => {
        if (!newMessages.some((m) => m.id === msg.id)) {
          let storedAvatarSeed = msg.from?.identity || "Unknown"
          try {
            if (msg.from?.metadata) {
              const meta = JSON.parse(msg.from.metadata)
              if (meta.avatar) storedAvatarSeed = meta.avatar
            }
          } catch {}

          newMessages.push({
            id: msg.id,
            timestamp: msg.timestamp,
            message: msg.message,
            sender: msg.from?.identity || "Unknown",
            avatarSeed: storedAvatarSeed,
          })
          changed = true
        }
      })
      if (changed) {
        newMessages.sort((a, b) => a.timestamp - b.timestamp)
        localStorage.setItem(
          `space_chat_${roomName}`,
          JSON.stringify(newMessages)
        )
        return newMessages
      }
      return prev
    })
  }, [chatMessages, roomName])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isSending) return
    send(inputValue)
    setInputValue("")
  }

  const groupedMessages = React.useMemo(() => {
    const groups: { sender: string; messages: any[] }[] = []
    history.forEach((msg) => {
      const lastGroup = groups[groups.length - 1]
      const senderIdentity = msg.sender
      if (lastGroup && lastGroup.sender === senderIdentity) {
        lastGroup.messages.push(msg)
      } else {
        groups.push({ sender: senderIdentity, messages: [msg] })
      }
    })
    return groups
  }, [history])

  const lastMessageObj = history[history.length - 1]
  const lastMessageText = lastMessageObj
    ? lastMessageObj.message
    : "No new message"

  const activeTypingIdentities = Object.keys(typingUsers).filter(
    (id) => id !== localParticipant.identity
  )
  const isSomeoneTyping = activeTypingIdentities.length > 0
  let badgeText = lastMessageText
  if (isSomeoneTyping) {
    const identity = activeTypingIdentities[0]
    const participant = participants.find((p) => p.identity === identity)
    let senderName = identity
    try {
      if (participant?.metadata) {
        const meta = JSON.parse(participant.metadata)
        if (participant.name) senderName = participant.name
      }
    } catch {}
    if (participant?.name && senderName === identity) {
      senderName = participant.name
    }
    badgeText = `${senderName} is typing...`
  }

  return (
    <>
      <div
        className={cn(
          "relative origin-bottom overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] sm:origin-bottom-right",
          isCollapsed
            ? "h-[40px] w-[220px] sm:h-[280px] sm:w-[280px] md:h-[320px] md:w-[320px] xl:h-[380px] xl:w-[380px]"
            : "h-[260px] w-[260px] sm:h-[280px] sm:w-[280px] md:h-[320px] md:w-[320px] xl:h-[380px] xl:w-[380px]",
          className
        )}
      >
        {/* Mobile Badge Overlay */}
        <div
          onClick={() => setIsCollapsed(false)}
          className={cn(
            "absolute inset-0 flex cursor-pointer items-center gap-2 px-4 py-2 transition-opacity duration-200 sm:hidden",
            isCollapsed
              ? "z-20 opacity-100 delay-100"
              : "pointer-events-none z-0 opacity-0"
          )}
        >
          {isSomeoneTyping ? (
            <div className="flex w-full items-center gap-1.5">
              <span className="flex shrink-0 items-center gap-0.5">
                <span
                  className="size-1 animate-bounce rounded-full bg-muted-foreground/70"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="size-1 animate-bounce rounded-full bg-muted-foreground/70"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="size-1 animate-bounce rounded-full bg-muted-foreground/70"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
              <span className="truncate text-xs font-medium text-muted-foreground">
                {badgeText}
              </span>
            </div>
          ) : (
            <>
              <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-xs font-medium text-muted-foreground">
                {badgeText}
              </span>
            </>
          )}
        </div>

        {/* Full Chat Content */}
        <div
          className={cn(
            "relative flex size-full flex-col transition-opacity duration-200",
            isCollapsed
              ? "pointer-events-none opacity-0 sm:pointer-events-auto sm:opacity-100"
              : "opacity-100 delay-100"
          )}
        >
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="absolute top-2 right-2 z-30 flex size-6 items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
          >
            <RiCloseLine className="size-4" />
          </button>

          <MessageScrollerProvider autoScroll defaultScrollPosition="end">
            <div className="relative flex-1 overflow-hidden">
              {/* Progressive blur top */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 [mask-image:linear-gradient(to_bottom,black,transparent)] backdrop-blur-[2px]" />
              {/* Progressive blur bottom */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 [mask-image:linear-gradient(to_top,black,transparent)] backdrop-blur-[2px]" />

              <MessageScroller className="size-full overflow-hidden">
                <MessageScrollerViewport className="relative p-3 sm:p-4">
                  <MessageScrollerContent className="flex flex-col gap-4">
                    {groupedMessages.length === 0 && (
                      <div className="flex h-full items-center justify-center pt-10">
                        <span className="font-mono text-xs text-muted-foreground">
                          No messages yet.
                        </span>
                      </div>
                    )}
                    {groupedMessages.map((group, groupIdx) => {
                      const isMe = group.sender === localParticipant.identity
                      const participant = participants.find(
                        (p) => p.identity === group.sender
                      )
                      let avatarSeed =
                        group.messages[0]?.avatarSeed || group.sender
                      let senderName = group.sender
                      try {
                        if (participant?.metadata) {
                          const meta = JSON.parse(participant.metadata)
                          if (meta.avatar) avatarSeed = meta.avatar
                          if (participant.name) senderName = participant.name
                        }
                      } catch {}
                      if (participant?.name && senderName === group.sender) {
                        senderName = participant.name
                      }

                      return (
                        <MessageGroup
                          key={groupIdx}
                          className="flex flex-col gap-1"
                        >
                          {group.messages.map((msg, msgIdx) => {
                            const isLast = msgIdx === group.messages.length - 1
                            const isFirst = msgIdx === 0
                            return (
                              <MessageScrollerItem
                                key={msg.id || msgIdx}
                                messageId={msg.id || msgIdx.toString()}
                                scrollAnchor={isMe && isLast}
                              >
                                <Message
                                  align={isMe ? "end" : "start"}
                                  className="w-full"
                                >
                                  <MessageAvatar>
                                    {isLast ? (
                                      <Avatar className="size-7 sm:size-8">
                                        <AvatarImage
                                          src={userpicUrl(avatarSeed)}
                                          alt={group.sender}
                                          className="object-cover"
                                        />
                                        <AvatarFallback className="text-xs font-bold">
                                          {group.sender.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    ) : null}
                                  </MessageAvatar>
                                  <MessageContent>
                                    {isFirst && (
                                      <MessageHeader>
                                        <span className="text-[10px] font-bold text-muted-foreground sm:text-xs">
                                          {isMe ? "You" : senderName}
                                        </span>
                                      </MessageHeader>
                                    )}
                                    <Bubble
                                      variant={isMe ? "default" : "muted"}
                                    >
                                      <BubbleContent
                                        className="text-xs sm:text-sm"
                                        style={{
                                          fontFamily:
                                            '"Google Sans Flex", "Google Sans", sans-serif',
                                        }}
                                      >
                                        {msg.message}
                                      </BubbleContent>
                                    </Bubble>
                                    {isLast && (
                                      <MessageFooter>
                                        <span className="text-[9px] text-muted-foreground sm:text-[10px]">
                                          {new Date(
                                            msg.timestamp
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </MessageFooter>
                                    )}
                                  </MessageContent>
                                </Message>
                              </MessageScrollerItem>
                            )
                          })}
                        </MessageGroup>
                      )
                    })}
                    {Object.keys(typingUsers).filter(
                      (id) => id !== localParticipant.identity
                    ).length > 0 && (
                      <div className="flex flex-col gap-1">
                        {Object.keys(typingUsers)
                          .filter((id) => id !== localParticipant.identity)
                          .map((identity) => {
                            const participant = participants.find(
                              (p) => p.identity === identity
                            )
                            let avatarSeed = identity
                            let senderName = identity
                            try {
                              if (participant?.metadata) {
                                const meta = JSON.parse(participant.metadata)
                                if (meta.avatar) avatarSeed = meta.avatar
                                if (participant.name)
                                  senderName = participant.name
                              }
                            } catch {}
                            if (participant?.name && senderName === identity) {
                              senderName = participant.name
                            }

                            return (
                              <MessageScrollerItem
                                key={`typing-${identity}`}
                                messageId={`typing-${identity}`}
                              >
                                <div className="flex animate-in items-center gap-1.5 px-2 py-1 text-[10px] text-muted-foreground fade-in slide-in-from-bottom-2 sm:text-xs">
                                  <span className="font-medium">
                                    {senderName} is typing
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <span
                                      className="size-1 animate-bounce rounded-full bg-muted-foreground/60"
                                      style={{ animationDelay: "0ms" }}
                                    />
                                    <span
                                      className="size-1 animate-bounce rounded-full bg-muted-foreground/60"
                                      style={{ animationDelay: "150ms" }}
                                    />
                                    <span
                                      className="size-1 animate-bounce rounded-full bg-muted-foreground/60"
                                      style={{ animationDelay: "300ms" }}
                                    />
                                  </span>
                                </div>
                              </MessageScrollerItem>
                            )
                          })}
                      </div>
                    )}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </div>
          </MessageScrollerProvider>
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-border p-3 sm:p-4"
          >
            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                const now = Date.now()
                if (now - lastTypingTime.current > 1500) {
                  if (typeof sendTypingData === "function") {
                    sendTypingData(
                      new TextEncoder().encode(
                        JSON.stringify({ isTyping: true })
                      ),
                      { reliable: false }
                    ).catch(() => {})
                  }
                  lastTypingTime.current = now
                }
              }}
              placeholder="Type a message..."
              className="h-10 flex-1 rounded-xl border-border bg-muted/50 px-4 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-primary/50 sm:text-sm"
              disabled={isSending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isSending}
              className="size-10 shrink-0 rounded-xl shadow-none"
            >
              <RiSendPlane2Fill className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
