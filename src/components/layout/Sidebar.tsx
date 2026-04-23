"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  Blocks,
  Briefcase,
  Code2,
  Pencil,
  MessageCircle,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useChatContext } from "@/providers/ChatProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  desktopOpen: boolean;
  onClose: () => void;
  onDesktopClose: () => void;
}

function IconDots() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4.5 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m5.5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m5.5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3" />
    </svg>
  );
}

function NavButton({
  icon,
  label,
  shortcut,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-8 w-full items-center gap-2.5 rounded-lg px-3
                 text-sm text-[var(--text-secondary)]
                 transition-colors duration-100
                 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]
                 active:bg-[var(--border)] focus-visible:outline-none"
    >
      <span className="flex h-4 w-4 flex-none items-center justify-center">
        {icon}
      </span>
      <span className="flex-1 truncate text-left">{label}</span>
      {shortcut && (
        <span className="flex-none text-[10.5px] text-[var(--text-muted)] opacity-0 transition-opacity duration-100 group-hover:opacity-100">
          {shortcut}
        </span>
      )}
    </button>
  );
}

function RailButton({
  icon,
  label,
  onClick,
  active = false,
  muted = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150 focus-visible:outline-none",
        active
          ? "bg-[var(--surface)] text-[var(--text-primary)]"
          : muted
            ? "text-[var(--text-muted)] opacity-55"
            : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
      )}
    >
      {icon}
    </button>
  );
}

function ChatItem({
  id,
  title,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: {
  id: string;
  title: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const menuRef = useRef<HTMLLIElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Node && menuRef.current?.contains(target)) {
        return;
      }

      setMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    setDraftTitle(title);
  }, [title]);

  useEffect(() => {
    if (!isRenaming) return;

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isRenaming]);

  function stopItemSelect(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  function commitRename() {
    const trimmedTitle = draftTitle.trim();

    if (trimmedTitle && trimmedTitle !== title) {
      onRename(id, trimmedTitle);
    } else {
      setDraftTitle(title);
    }

    setIsRenaming(false);
  }

  function cancelRename() {
    setDraftTitle(title);
    setIsRenaming(false);
  }

  function handleRenameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitRename();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelRename();
    }
  }

  return (
    <li ref={menuRef} className="group relative">
      <button
        type="button"
        onClick={() => onSelect(id)}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex h-8 w-full items-center rounded-lg px-3 text-left text-[13px] transition-colors duration-100 focus-visible:outline-none",
          isActive
            ? "bg-[var(--surface-hover)] text-[var(--text-primary)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
        )}
      >
        {!isRenaming && (
          <span
            className={cn(
              "block w-full truncate",
              "group-hover:[mask-image:linear-gradient(to_right,black_78%,transparent_95%)]",
              isActive &&
                "[mask-image:linear-gradient(to_right,black_78%,transparent_95%)]",
            )}
          >
            {title}
          </span>
        )}
      </button>

      {isRenaming && (
        <input
          ref={inputRef}
          value={draftTitle}
          aria-label={`Rename ${title}`}
          data-testid="rename-chat-input"
          onClick={stopItemSelect}
          onMouseDown={stopItemSelect}
          onChange={(event) => setDraftTitle(event.target.value)}
          onBlur={commitRename}
          onKeyDown={handleRenameKeyDown}
          className="absolute inset-y-0 left-2 right-9 my-1 rounded-md border border-[var(--input-border-focus)]
                     bg-[var(--input-bg)] px-2 text-[13px] text-[var(--text-primary)]
                     shadow-[var(--input-shadow-focus)] focus:outline-none"
        />
      )}

      <div
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2 transition-opacity duration-150",
          isActive || menuOpen || isRenaming
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100",
        )}
      >
        <button
          type="button"
          aria-label={`Opsi untuk ${title}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          data-testid="chat-item-menu-trigger"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((open) => !open);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md
                     text-[var(--text-muted)] transition-colors
                     hover:bg-[var(--border)] hover:text-[var(--text-primary)]
                     focus-visible:outline-none"
        >
          <IconDots />
        </button>
      </div>

      {menuOpen && (
        <div
          role="menu"
          aria-label={`Menu ${title}`}
          data-testid="chat-item-menu"
          onClick={stopItemSelect}
          onMouseDown={stopItemSelect}
          className="absolute right-1 top-[calc(100%-0.25rem)] z-50 min-w-[10rem] rounded-xl border border-[var(--border)]
                     bg-[var(--surface-raised)] p-1.5 text-[var(--text-secondary)]
                     shadow-[var(--input-shadow-focus)]"
        >
          <button
            type="button"
            role="menuitem"
            data-testid="rename-chat-trigger"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen(false);
              setIsRenaming(true);
            }}
            className="flex min-h-8 w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px]
                       transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]
                       focus-visible:outline-none"
          >
            <Pencil size={15} strokeWidth={1.9} />
            <span className="flex-1 truncate">Rename</span>
          </button>

          <div className="my-1.5 h-px bg-[var(--border)]" />

          <button
            type="button"
            role="menuitem"
            data-testid="delete-chat-trigger"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen(false);
              onDelete(id);
            }}
            className="flex min-h-8 w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px]
                       text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300
                       focus-visible:outline-none"
          >
            <Trash2 size={15} strokeWidth={1.9} />
            <span className="flex-1 truncate">Delete chat</span>
          </button>
        </div>
      )}
    </li>
  );
}

export function Sidebar({
  isOpen,
  desktopOpen,
  onClose,
  onDesktopClose,
}: SidebarProps) {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    createNewChat,
    renameChat,
    deleteChat,
  } = useChatContext();

  const userInitial = "AF";
  const userName = "Andino Ferdiansah";
  const userPlan = "Free plan";

  function handleSelectChat(id: string) {
    setActiveChatId(id);
    onClose();
  }

  const mobileVisible = isOpen ? "translate-x-0 shadow-xl lg:shadow-none" : "-translate-x-full";

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-20 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[288px] flex-none border-r border-[var(--border)] bg-[var(--sidebar-bg)] transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "lg:relative lg:inset-auto lg:z-auto lg:translate-x-0",
          desktopOpen ? "lg:w-[288px]" : "lg:w-[88px]",
          mobileVisible,
        )}
      >
        <div
          className={cn(
            "flex min-h-0 w-full flex-col",
            desktopOpen ? "lg:flex" : "lg:hidden",
          )}
        >
            <div className="flex h-12 flex-none items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-[var(--accent)] text-xs font-bold text-[var(--accent-text)] select-none">
                  F
                </span>
                <span className="text-[13.5px] font-semibold tracking-tight text-[var(--text-primary)]">
                  Folio AI
                </span>
              </div>

              <button
                type="button"
                aria-label="Tutup sidebar"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg
                           text-[var(--text-muted)] transition-colors
                           hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]
                           focus-visible:outline-none lg:hidden"
              >
                <PanelLeft size={15} strokeWidth={2} />
              </button>

              <button
                type="button"
                aria-label="Minimize sidebar"
                onClick={onDesktopClose}
                className="hidden h-8 w-8 items-center justify-center rounded-lg
                           text-[var(--text-muted)] transition-colors
                           hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]
                           focus-visible:outline-none lg:flex"
              >
                <PanelLeft size={15} strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-col gap-px px-2 pt-2 pb-1">
              <NavButton
                icon={<Plus size={15} strokeWidth={2} />}
                label="Percakapan Baru"
                shortcut="Ctrl+Shift+O"
                onClick={createNewChat}
              />
              <NavButton
                icon={<Search size={15} strokeWidth={2} />}
                label="Cari percakapan"
                shortcut="Ctrl+K"
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div
                className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1"
                tabIndex={-1}
              >
                {chats.length > 0 ? (
                  <div>
                    <div className="mb-1 px-2 pt-2 pb-1">
                      <span className="select-none text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                        Terbaru
                      </span>
                    </div>
                    <ul className="flex flex-col gap-px">
                      {chats.map((chat) => (
                        <ChatItem
                          key={chat.id}
                          id={chat.id}
                          title={chat.title || "Percakapan baru"}
                          isActive={chat.id === activeChatId}
                          onSelect={handleSelectChat}
                          onRename={renameChat}
                          onDelete={deleteChat}
                        />
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="px-3 py-4 text-center text-[12px] text-[var(--text-muted)]">
                    Belum ada percakapan
                  </p>
                )}
              </div>
            </div>

            <div className="flex-none border-t border-[var(--border)]">
              <button
                type="button"
                className="group flex w-full items-center gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-[var(--surface-hover)] focus-visible:outline-none"
              >
                <div
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full
                             bg-[var(--border-strong)] text-sm font-semibold text-[var(--text-primary)] select-none"
                >
                  F
                </div>
                <div className="flex min-w-0 flex-1 flex-col items-start">
                  <span className="w-full truncate text-left text-[13px] font-medium text-[var(--text-primary)]">
                    Folio User
                  </span>
                  <span className="w-full truncate text-left text-[11px] text-[var(--text-muted)]">
                    Free plan
                  </span>
                </div>
                <div className="flex flex-none items-center gap-1">
                  <ThemeToggle size="sm" />
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg
                               text-[var(--text-muted)] transition-colors
                               hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
                  >
                    <MoreHorizontal size={14} />
                  </span>
                </div>
              </button>
            </div>
          </div>

        {!desktopOpen && (
          <div className="hidden h-full w-full lg:flex lg:flex-col lg:items-center lg:py-2">
            <div className="flex h-12 w-full items-center justify-center border-b border-[var(--border)]">
              <RailButton
                label="Expand sidebar"
                onClick={() => onDesktopClose()}
                icon={<PanelLeft size={16} strokeWidth={2} />}
                active
              />
            </div>

            <div className="flex flex-1 flex-col items-center gap-2 px-2 pt-4">
              <RailButton
                label="Percakapan baru"
                onClick={createNewChat}
                icon={<Plus size={18} strokeWidth={2} />}
              />
              <RailButton
                label="Cari percakapan"
                icon={<Search size={18} strokeWidth={2} />}
              />
              <RailButton
                label="Chats"
                icon={<MessageCircle size={18} strokeWidth={2} />}
                active
              />
              <RailButton
                label="Projects"
                icon={<Briefcase size={18} strokeWidth={2} />}
              />
              <RailButton
                label="Artifacts"
                icon={<Blocks size={18} strokeWidth={2} />}
              />
              <RailButton
                label="Code"
                icon={<Code2 size={18} strokeWidth={2} />}
                muted
              />
              <RailButton
                label="Customize"
                icon={<SlidersHorizontal size={18} strokeWidth={2} />}
              />
            </div>

            <div className="mt-auto flex w-full flex-col items-center gap-3 border-t border-[var(--border)] px-2 pt-3 pb-2">
              <RailButton
                label={`Akun ${userName}`}
                icon={
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--border-strong)] text-[1rem] font-semibold text-[var(--text-primary)]"
                  >
                    {userInitial}
                  </span>
                }
              />
              <span className="text-[10px] text-[var(--text-muted)]">
                {userPlan}
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
