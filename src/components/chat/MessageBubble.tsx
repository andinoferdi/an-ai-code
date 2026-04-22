"use client";

import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-[5px] px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-[7px] w-[7px] rounded-full bg-[var(--text-muted)]"
          style={{
            animation: "bounceDot 1.2s ease infinite",
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="flex flex-col gap-2 text-[15px] leading-[1.78] sm:text-base">
      {lines.map((line, i) => {
        if (line.trim() === "") return <div key={i} className="h-1" />;

        if (line.match(/^#{1,3}\s/)) {
          const text = line.replace(/^#{1,3}\s+/, "");
          return (
            <p key={i} className="mt-1 font-semibold tracking-[-0.01em]">
              {renderInline(text)}
            </p>
          );
        }

        const numberedBoldMatch = line.match(/^(\d+)\.\s+\*\*(.+)\*\*(.*)$/);
        if (numberedBoldMatch) {
          return (
            <p key={i} className="mt-1">
              <span className="font-semibold">
                {numberedBoldMatch[1]}. {numberedBoldMatch[2]}
              </span>
              {numberedBoldMatch[3] && renderInline(numberedBoldMatch[3])}
            </p>
          );
        }

        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={j}
              className="rounded-md border border-[var(--code-border)] bg-[var(--code-bg)] px-[5px] py-[2px] font-mono text-[0.82em] tracking-tight text-[var(--code-text)]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={j}>{part}</span>;
      })}
    </>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isTyping = message.isTyping;

  return (
    <div
      className={cn(
        "flex w-full gap-4",
        "animate-[slideUp_0.2s_ease_both]",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div
          className="mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-xl
                     bg-[var(--accent-subtle)] text-[var(--accent)] flex-shrink-0"
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59 14.5 8 11.59 1.5 8 1.5Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}

      <div
        className={cn(
          "max-w-[84%] rounded-[1.45rem] xl:max-w-[86%]",
          isUser
            ? [
                "rounded-tr-sm",
                "bg-[var(--user-bubble)] text-[var(--user-text)]",
              ]
            : [
                "rounded-tl-sm",
                "bg-[var(--assistant-bubble)] text-[var(--assistant-text)]",
              ],
        )}
      >
        {isTyping ? (
          <div className="px-5 py-4">
            <TypingIndicator />
          </div>
        ) : (
          <div className="px-5 py-4">
            <MessageContent content={message.content} />
          </div>
        )}
      </div>

      {isUser && (
        <div
          className="mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-xl
                     bg-[var(--surface-hover)] text-[var(--text-muted)] text-[11px] font-semibold flex-shrink-0"
          aria-hidden="true"
        >
          Sy
        </div>
      )}
    </div>
  );
}
