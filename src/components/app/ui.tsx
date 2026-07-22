"use client";

/**
 * Primitives shared by the list pages, menus and dialogs.
 *
 * Values come from `docs/research/components/list-pages.spec.md` and
 * `menus-and-dialogs.spec.md`, both extracted from the live claude.ai DOM.
 */

import { useEffect, useRef } from "react";
import { Anticon, ICONS, XIcon } from "./ui-icons";
import { CaretDownIcon } from "./chat-icons";

/** The floating-surface shell every menu and dialog on claude.ai shares. */
export const SURFACE =
  "rounded-xl bg-[rgb(56,56,53)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10),0_8px_24px_rgba(0,0,0,0.32),0_2px_6px_rgba(0,0,0,0.20)]";

export const BTN_GHOST =
  "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 text-[14px] font-medium text-text-100 transition-colors hover:bg-white/[0.08]";

export const BTN_PRIMARY =
  "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[var(--btn-primary-bg)] px-3 text-[14px] font-medium text-[var(--btn-primary-text)] transition-opacity hover:opacity-90";

/** Closes on outside pointerdown and on Escape. */
export function useDismiss(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // Deferred so the click that opened the surface doesn't immediately close it.
    const id = setTimeout(() => document.addEventListener("pointerdown", onDown));
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(id);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return ref;
}

/* ---------------------------------- menus --------------------------------- */

export function Menu({
  onClose,
  className = "",
  children,
}: {
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useDismiss(onClose);
  return (
    <div
      ref={ref}
      role="menu"
      className={`absolute z-50 min-w-32 animate-[zoom_50ms_ease-out_forwards] p-1 ${SURFACE} ${className}`}
    >
      {children}
    </div>
  );
}

export function MenuItem({
  icon,
  label,
  shortcut,
  danger,
  checked,
  submenu,
  onClick,
}: {
  icon?: React.ReactNode;
  label: string;
  shortcut?: string;
  danger?: boolean;
  checked?: boolean;
  submenu?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 text-left text-[14px] transition-colors hover:bg-white/[0.08] ${
        danger ? "text-[rgb(236,126,126)]" : "text-text-100"
      }`}
    >
      {icon && <span className="flex w-4 shrink-0 justify-center">{icon}</span>}
      <span className="flex-1 truncate">{label}</span>
      {shortcut && <span className="text-[12px] text-text-400">{shortcut}</span>}
      {submenu && <span className="text-[12px] text-text-400">›</span>}
      {checked && <span className="text-[13px] text-[#4a9eff]">✓</span>}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="mx-2.5 my-1 h-px bg-white/10" />;
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2.5 pb-1 pt-1.5 text-[12px] text-text-400">{children}</div>
  );
}

/* --------------------------------- dialogs -------------------------------- */

export function Modal({
  onClose,
  width = 520,
  labelledBy,
  className = "",
  children,
}: {
  onClose: () => void;
  width?: number;
  labelledBy?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useDismiss(onClose);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        style={{ width }}
        className={`max-h-[calc(100dvh-2rem)] animate-[zoom_50ms_ease-out_forwards] overflow-hidden rounded-xl bg-[rgb(56,56,53)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10),0_4px_8px_rgba(11,11,11,0.08),0_12px_28px_-2px_rgba(0,0,0,0.24)] ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClick}
      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-200 transition-colors hover:bg-white/10 hover:text-text-100"
    >
      <XIcon className="h-4 w-4" />
    </button>
  );
}

/* ------------------------------- page chrome ------------------------------ */

/** `header[data-testid=page-header]` — serif 24/32 title with a right cluster. */
export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mx-auto flex h-12 w-full max-w-4xl items-end justify-between gap-2 px-4 md:h-16 md:px-8">
      <h1 className="font-serif text-2xl font-medium leading-8 text-white max-md:hidden">
        {title}
      </h1>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}

/** Ghost dropdown trigger: muted label, primary value, caret. */
export function DropdownTrigger({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={BTN_GHOST}>
      <span className="text-text-400">{label}</span>
      <span>{value}</span>
      <CaretDownIcon className="h-3.5 w-3.5 text-text-400" />
    </button>
  );
}

export function SearchField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="inline-flex h-10 w-full cursor-text items-center gap-3 rounded-[10px] bg-white/10 px-4">
      <Anticon cp={ICONS.search} size={16} className="shrink-0 text-text-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[15px] leading-5 text-white outline-none placeholder:text-text-400"
      />
    </label>
  );
}

/** Body column for the list pages — matches the header's max-width and gutters. */
export function PageBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-6 md:px-8">{children}</div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-16 text-center text-[14px] text-text-400">{children}</p>
  );
}

/** "3 hours ago" / "yesterday" / "Jul 8" — the relative format claude.ai uses. */
export function relativeTime(ts: number, now = Date.now()) {
  const diff = Math.max(0, now - ts);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "yesterday";
  if (day < 30) return `${day} days ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
