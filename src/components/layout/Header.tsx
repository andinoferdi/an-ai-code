"use client";

import { ChevronDown, Menu, MoreHorizontal, Share2 } from "lucide-react";
import { useChatContext } from "@/providers/ChatProvider";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { activeChat } = useChatContext();

  return (
    <header className="flex h-12 w-full flex-none items-center bg-[var(--app-bg)]">
      <div className="app-rail flex w-full items-center justify-between gap-3 px-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon-md"
            aria-label="Buka sidebar"
            onClick={onMenuClick}
            className="lg:hidden flex-none -ml-1"
          >
            <Menu size={16} strokeWidth={2} />
          </Button>

          <div className="min-w-0 flex-1">
            {activeChat?.title ? (
              <div className="flex min-w-0 items-center">
                <button
                  type="button"
                  title={activeChat.title}
                  className="flex h-7 min-w-0 items-center rounded-l-lg rounded-r-none px-2
                             text-sm font-medium text-[var(--text-secondary)]
                             transition-colors duration-150 hover:bg-[var(--surface-hover)]
                             hover:text-[var(--text-primary)] active:bg-[var(--border)]
                             focus-visible:outline-none max-w-[min(100%,calc(var(--chat-hero-column)+1rem))]"
                >
                  <span className="truncate">{activeChat.title}</span>
                </button>
                <div className="h-4 w-px flex-none bg-[var(--border)]" />
                <button
                  type="button"
                  aria-label="Opsi percakapan"
                  className="flex h-7 w-7 flex-none items-center justify-center rounded-r-lg rounded-l-none
                             text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--surface-hover)]
                             hover:text-[var(--text-primary)] active:bg-[var(--border)] focus-visible:outline-none"
                >
                  <ChevronDown size={13} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <span className="pl-1 text-[13.5px] font-semibold tracking-tight text-[var(--text-primary)]">
                Folio AI
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-none items-center gap-0.5">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Button
            variant="ghost"
            size="icon-md"
            aria-label="Bagikan percakapan"
            disabled={!activeChat}
            title="Bagikan"
          >
            <Share2 size={14} strokeWidth={2} />
          </Button>
          <Button
            variant="ghost"
            size="icon-md"
            aria-label="Opsi lainnya"
            disabled={!activeChat}
            title="Lainnya"
          >
            <MoreHorizontal size={15} />
          </Button>
        </div>
      </div>
    </header>
  );
}
