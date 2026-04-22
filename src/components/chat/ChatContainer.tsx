"use client";

import { useEffect, useRef } from "react";
import { useChatContext } from "@/providers/ChatProvider";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { EmptyState } from "./EmptyState";

export function ChatContainer() {
  const { activeChat } = useChatContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasMessages = activeChat !== null && activeChat.messages.length > 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !hasMessages) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [activeChat?.messages?.length, hasMessages]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--chat-bg)]">
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]"
        aria-live="polite"
        aria-label="Percakapan"
      >
        {hasMessages ? (
          <div className="app-rail flex min-h-full flex-col">
            <MessageList messages={activeChat.messages} />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {hasMessages && (
        <div className="relative flex-none bg-[var(--chat-bg)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -translate-y-full"
            style={{
              height: "var(--chat-composer-fade)",
              background:
                "linear-gradient(to bottom, transparent, var(--chat-bg))",
            }}
          />
          <div className="app-rail">
            <MessageInput hasMessages={true} />
          </div>
        </div>
      )}
    </div>
  );
}
