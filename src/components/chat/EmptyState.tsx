"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  getMsUntilNextGreetingBoundary,
  getTimeGreeting,
} from "@/lib/greeting";
import { MessageInput } from "./MessageInput";

export function EmptyState() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setNow(new Date());
    }, getMsUntilNextGreetingBoundary(now));

    return () => window.clearTimeout(timeoutId);
  }, [now]);

  const greeting = getTimeGreeting(now);

  return (
    <div
      className="flex min-h-full w-full flex-col justify-center px-[calc(var(--chat-shell-gutter)*0.92)] py-8"
      style={{ animation: "fadeIn 0.3s ease both" }}
    >
      <div className="app-rail flex w-full justify-center">
        <div className="chat-column--hero flex w-full flex-col items-center gap-5 py-6 sm:gap-6">
          <div className="chat-column flex w-full flex-col items-center gap-3">
            <div className="flex w-full items-center justify-center gap-2.5">
              <Sparkles
                size={24}
                strokeWidth={1.9}
                className="text-[var(--accent)]"
              />
              <h2
                suppressHydrationWarning
                className="text-center text-[clamp(2rem,4vw,3.1rem)] font-medium tracking-[-0.05em] text-[var(--text-primary)]"
              >
                {greeting}, Ferdi
              </h2>
            </div>
            <p className="max-w-[36rem] text-center text-[15px] leading-8 text-[var(--text-secondary)] sm:text-base">
              Tanya apa saja dan mulai percakapan dari kolom yang sama dengan
              area chat aktif agar transisinya terasa lebih tenang dan presisi.
            </p>
          </div>

          <div className="w-full">
            <MessageInput
              hasMessages={false}
              layout="centered"
              placeholder="Let's start by answering your question."
              showHint={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
