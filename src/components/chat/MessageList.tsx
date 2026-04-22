"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div
      aria-live="polite"
      aria-label="Percakapan"
      className="w-full px-[calc(var(--chat-shell-gutter)*0.92)]"
    >
      <div
        className="chat-column flex w-full flex-col gap-7"
        style={{
          paddingTop: "var(--chat-scroll-top-space)",
          paddingBottom: "var(--chat-scroll-bottom-space)",
        }}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} className="h-1 shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
}
