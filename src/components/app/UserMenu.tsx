"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Account dropdown anchored above the sidebar footer.
 *
 * Item glyphs are inline SVGs rather than Anthropicons codepoints: the live
 * menu would not re-open under synthetic pointer events, so the real
 * codepoints could not be read off the DOM. See docs/research/components/user-menu.spec.md
 */

function Row({
  icon,
  label,
  shortcut,
  submenu,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  submenu?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[14px] leading-5 text-white transition-colors hover:bg-white/[0.07]"
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-text-200">
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {shortcut && (
        <span className="shrink-0 text-[12px] text-text-400">{shortcut}</span>
      )}
      {submenu && <Chevron />}
    </button>
  );
}

const Divider = () => <div className="my-1 h-px bg-white/10" />;

export default function UserMenu({
  email,
  onClose,
  onOpenSettings,
}: {
  email: string;
  onClose: () => void;
  onOpenSettings: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey);
    // Deferred so the click that opened the menu doesn't immediately close it.
    const t = setTimeout(() => window.addEventListener("mousedown", onDown), 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Account"
      className="absolute bottom-full left-[15px] z-40 mb-2 w-[272px] rounded-xl bg-[rgb(56,56,53)] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_0_rgba(0,0,0,0.32),0_2px_6px_0_rgba(0,0,0,0.2)]"
    >
      <p className="truncate px-2.5 py-2 text-[14px] leading-5 text-text-400">
        {email}
      </p>

      <Row
        icon={<GearIcon />}
        label="Settings"
        shortcut="Ctrl+⇧+,"
        onClick={() => {
          onClose();
          onOpenSettings();
        }}
      />
      <Row icon={<GlobeIcon />} label="Language" submenu />
      <Row icon={<HelpIcon />} label="Get help" />

      <Divider />

      <Row icon={<UpgradeIcon />} label="Upgrade plan" />
      <Row icon={<DownloadIcon />} label="Get apps and extensions" />
      <Row icon={<GiftIcon />} label="Gift Claude" />
      <Row icon={<InfoIcon />} label="Learn more" submenu />

      <Divider />

      <Row icon={<LogoutIcon />} label="Log out" />
    </div>
  );
}

/* ---- Glyphs (16px, 1.5px stroke to match the menu's optical weight) ---- */

const s = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Chevron = () => (
  <svg {...s} width={12} height={12} className="shrink-0 text-text-400">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const GearIcon = () => (
  <svg {...s}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);

const GlobeIcon = () => (
  <svg {...s}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
  </svg>
);

const HelpIcon = () => (
  <svg {...s}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
  </svg>
);

const UpgradeIcon = () => (
  <svg {...s}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16V8M8.5 11.5 12 8l3.5 3.5" />
  </svg>
);

const DownloadIcon = () => (
  <svg {...s}>
    <path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 20h16" />
  </svg>
);

const GiftIcon = () => (
  <svg {...s}>
    <path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7ZM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z" />
  </svg>
);

const InfoIcon = () => (
  <svg {...s}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

const LogoutIcon = () => (
  <svg {...s}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);
