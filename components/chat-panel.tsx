"use client"

import * as React from "react"
import { useChat, useLocalParticipant } from "@livekit/components-react"
import { Message, MessageAvatar, MessageContent, MessageGroup, MessageHeader, MessageFooter } from "@/components/ui/message"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send as SendIcon } from "lucide-react"
import { userpicUrl } from "@/lib/userpics"

export function ChatPanel() {
  const { chatMessages, send, isSending } = useChat()
  const { localParticipant } = useLocalParticipant()
  const [inputValue, setInputValue] = React.useState("")
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isSending) return
    send(inputValue)
    setInputValue("")
  }

  const groupedMessages = React.useMemo(() => {
    const groups: { sender: string; messages: typeof chatMessages }[] = []
    chatMessages.forEach((msg) => {
      const lastGroup = groups[groups.length - 1]
      const senderIdentity = msg.from?.identity || "Unknown"
      if (lastGroup && lastGroup.sender === senderIdentity) {
        lastGroup.messages.push(msg)
      } else {
        groups.push({ sender: senderIdentity, messages: [msg] })
      }
    })
    return groups
  }, [chatMessages])

  return (
    <div className="flex h-full flex-col bg-card/95 backdrop-blur-md border-l border-border">
      <div className="border-b border-border p-4 sm:p-5">
        <h2 className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-foreground">Room Chat</h2>
      </div>
      <ScrollArea className="flex-1 p-3 sm:p-4">
        <div className="flex flex-col gap-4">
          {groupedMessages.length === 0 && (
            <div className="flex h-full items-center justify-center pt-10">
              <span className="text-xs text-muted-foreground font-mono">No messages yet.</span>
            </div>
          )}
          {groupedMessages.map((group, groupIdx) => {
            const isMe = group.sender === localParticipant.identity
            const avatarSeed = group.sender
            return (
              <MessageGroup key={groupIdx} className="flex flex-col gap-1">
                {group.messages.map((msg, msgIdx) => {
                  const isLast = msgIdx === group.messages.length - 1
                  const isFirst = msgIdx === 0
                  return (
                    <Message key={msg.id || msgIdx} align={isMe ? "end" : "start"} className="w-full">
                      <MessageAvatar>
                        {isLast ? (
                          <Avatar className="size-7 sm:size-8">
                            <AvatarImage src={userpicUrl(avatarSeed)} alt={group.sender} className="object-cover" />
                            <AvatarFallback className="text-xs font-bold">{group.sender.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        ) : null}
                      </MessageAvatar>
                      <MessageContent>
                        {isFirst && !isMe && (
                          <MessageHeader>
                            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">{group.sender}</span>
                          </MessageHeader>
                        )}
                        <Bubble variant={isMe ? "default" : "muted"}>
                          <BubbleContent className="text-xs sm:text-sm">{msg.message}</BubbleContent>
                        </Bubble>
                        {isLast && (
                          <MessageFooter>
                            <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </MessageFooter>
                        )}
                      </MessageContent>
                    </Message>
                  )
                })}
              </MessageGroup>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3 sm:p-4 bg-background/50">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl bg-muted/50 border-border/50 text-xs sm:text-sm"
          disabled={isSending}
        />
        <Button type="submit" size="icon" disabled={!inputValue.trim() || isSending} className="rounded-xl size-9 sm:size-10 shrink-0">
          <SendIcon className="size-4" />
        </Button>
      </form>
    </div>
  )
}
