"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { cn, formatRelativeDate, getLastMessagePreview } from "@/lib/utils";
import { Chat } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface ChatHistoryItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ChatHistoryItem({
  chat,
  isActive,
  onSelect,
  onDelete,
}: ChatHistoryItemProps) {
  const preview = getLastMessagePreview(chat.messages);
  const date = formatRelativeDate(chat.updatedAt);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(chat.id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(chat.id)}
      className={cn(
        "group relative flex flex-col gap-0.5 cursor-pointer select-none",
        "rounded-lg px-3 py-2 transition-all duration-100",
        // Active: clean white/surface + left accent bar
        // Hover: subtle bg shift
        isActive
          ? "bg-[var(--surface)] text-[var(--text-primary)]"
          : "hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]",
      )}
    >
      {/* Active indicator — left accent bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2.5px] rounded-r-full bg-[var(--accent)]" />
      )}

      {/* Title row */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span
          className={cn(
            "truncate text-[13px] font-medium leading-snug",
            isActive
              ? "text-[var(--text-primary)]"
              : "text-[var(--text-secondary)]",
          )}
        >
          {chat.title}
        </span>

        {/* Delete — appears on hover */}
        <Button
          variant="ghost-danger"
          size="icon-sm"
          aria-label="Hapus percakapan"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chat.id);
          }}
          className={cn(
            "flex-none opacity-0 group-hover:opacity-100 transition-opacity duration-100",
            "h-6 w-6 -mr-1 rounded-md",
          )}
        >
          <Trash2 size={12} strokeWidth={2} />
        </Button>
      </div>

      {/* Preview row */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="truncate text-[11.5px] text-[var(--text-muted)] leading-snug">
          {preview}
        </span>
        <span className="flex-none text-[10px] text-[var(--text-muted)] whitespace-nowrap">
          {date}
        </span>
      </div>
    </div>
  );
}
