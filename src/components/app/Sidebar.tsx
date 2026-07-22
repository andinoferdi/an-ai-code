"use client";

import { Anticon, ICONS, CaretUpDownIcon } from "./ui-icons";
import { ClaudeLogo } from "@/components/icons";

/* Mock data — real chat titles are the user's private data. */
const STARRED = ["Website redesign plan"];
const RECENTS = [
  "Laptop stand recommendations",
  "Calorie tracker",
  "Internship prep with Golang",
];

/* Row shell: h-32px, px-16 py-6, radius 9px, hover lightens to bg-000. */
const rowCls =
  "group flex h-8 w-full items-center rounded-[9px] px-4 py-1.5 transition-colors hover:bg-bg-000";

function NavRow({
  cp,
  label,
  shortcut,
  circled,
  trailing,
  hoverArrow,
}: {
  cp: string;
  label: string;
  shortcut?: string;
  circled?: boolean;
  trailing?: React.ReactNode;
  hoverArrow?: boolean;
}) {
  return (
    <button type="button" aria-label={label} className={rowCls}>
      <span className="mr-2.5 flex h-6 w-6 shrink-0 items-center justify-center">
        {circled ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[hsl(var(--border-300)/0.3)]">
            <Anticon cp={cp} size={16} weight={700} className="text-text-200 group-hover:text-text-000" />
          </span>
        ) : (
          <Anticon cp={cp} size={20} weight={433} className="text-text-100" />
        )}
      </span>
      <span className="flex-1 truncate text-left text-sm text-text-200 group-hover:text-text-000">
        {label}
      </span>
      {shortcut && (
        <span className="ml-2 hidden text-[10px] text-text-400 group-hover:inline">
          {shortcut}
        </span>
      )}
      {hoverArrow && (
        <Anticon
          cp={ICONS.hoverArrow}
          size={16}
          className="ml-2 -translate-x-1 text-text-400 opacity-0 transition-all duration-100 group-hover:translate-x-0 group-hover:opacity-100"
        />
      )}
      {trailing}
    </button>
  );
}

function ChatRow({ title }: { title: string }) {
  return (
    <div className="group/row relative flex items-center">
      <button type="button" className={`${rowCls} !text-xs`}>
        <span className="truncate text-left text-xs text-text-200 group-hover:text-text-000">
          {title}
        </span>
      </button>
      <button
        type="button"
        aria-label={`More options for ${title}`}
        className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-md text-white opacity-0 transition-opacity hover:bg-white/10 group-hover/row:opacity-100"
      >
        <Anticon cp={ICONS.kebab} size={16} />
      </button>
    </div>
  );
}

function SectionLabel({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="group/nsh mt-1 flex min-w-0 items-center gap-1 pb-2 pl-2 pr-2">
      <h2 className="text-xs font-normal text-text-400">{children}</h2>
      <Anticon
        cp={ICONS.sectionChevron}
        size={12}
        className="shrink-0 text-text-400 opacity-0 transition-[opacity,transform] duration-100 group-hover/nsh:opacity-100"
      />
      <span className="flex-1" />
      {action}
    </div>
  );
}

export default function Sidebar({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <nav
      className={`fixed left-0 top-0 z-20 flex h-screen flex-col border-r-[0.8px] border-[hsl(var(--border-300)/0.15)] bg-bg-100 bg-gradient-to-t from-[hsl(var(--bg-200)/0.05)] to-[hsl(var(--bg-200)/0.3)] transition-[width] duration-200 ${
        open ? "w-72" : "w-12"
      }`}
    >
      {open ? (
        <>
          {/* Header */}
          <div className="flex h-[4.5rem] shrink-0 items-center justify-between pl-4 pr-3">
            <a href="#" aria-label="Home" className="flex items-center">
              <ClaudeLogo
                viewBox="30 0 82 24"
                className="h-5 w-auto text-text-100"
              />
            </a>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Search"
                className="flex h-6 w-6 items-center justify-center rounded-md text-text-200 hover:bg-white/10"
              >
                <Anticon cp={ICONS.search} size={16} />
              </button>
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={onToggle}
                className="flex h-6 w-6 items-center justify-center rounded-md text-text-200 hover:bg-white/10"
              >
                <Anticon cp={ICONS.panel} size={16} />
              </button>
            </div>
          </div>

          {/* Primary nav */}
          <div className="flex flex-col px-2">
            <NavRow cp={ICONS.plus} label="New chat" shortcut="Ctrl+⇧+O" circled />
            <NavRow cp={ICONS.chats} label="Chats" />
            <NavRow cp={ICONS.projects} label="Projects" />
            <NavRow cp={ICONS.artifacts} label="Artifacts" />
            <NavRow cp={ICONS.customize} label="Customize" />
          </div>

          {/* Products */}
          <div className="mt-5 px-2">
            <SectionLabel>Products</SectionLabel>
            <NavRow cp={ICONS.code} label="Code" hoverArrow />
            <NavRow
              cp={ICONS.design}
              label="Design"
              hoverArrow
              trailing={
                <Anticon
                  cp={ICONS.designExternal}
                  size={16}
                  className="ml-2 text-text-200/60"
                />
              }
            />
          </div>

          {/* Starred */}
          <div className="mt-5 px-2">
            <SectionLabel>Starred</SectionLabel>
            {STARRED.map((t) => (
              <ChatRow key={t} title={t} />
            ))}
          </div>

          {/* Recents */}
          <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-2">
            <SectionLabel
              action={
                <button
                  type="button"
                  aria-label="Group by"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-text-400 hover:bg-white/10"
                >
                  <Anticon cp={ICONS.groupBy} size={16} />
                </button>
              }
            >
              Recents
            </SectionLabel>
            {RECENTS.map((t) => (
              <ChatRow key={t} title={t} />
            ))}
          </div>

          {/* Footer */}
          <div className="border-t-[0.8px] border-[hsl(var(--border-300)/0.15)] px-3 py-4">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="user, Settings"
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-text-200 text-base font-semibold text-bg-100">
                  U
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-text-100">
                    user
                  </span>
                  <span className="block text-xs text-text-400">Pro plan</span>
                </span>
              </button>
              <button
                type="button"
                aria-label="Download apps"
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-200 hover:bg-white/10"
              >
                <Anticon cp={ICONS.download} size={20} />
              </button>
              <button
                type="button"
                aria-label="Account menu"
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-200 hover:bg-white/10"
              >
                <CaretUpDownIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Collapsed rail */}
          <div className="flex flex-col items-center pt-3">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-200 hover:bg-white/10"
            >
              <Anticon cp={ICONS.panel} size={16} />
            </button>
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                type="button"
                aria-label="New chat"
                className="flex h-8 w-8 items-center justify-center rounded-md text-text-200 hover:bg-white/10"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[hsl(var(--border-300)/0.3)]">
                  <Anticon cp={ICONS.plus} size={16} weight={700} />
                </span>
              </button>
              {[
                { cp: ICONS.chats, label: "Chats" },
                { cp: ICONS.projects, label: "Projects" },
                { cp: ICONS.artifacts, label: "Artifacts" },
                { cp: ICONS.customize, label: "Customize" },
              ].map((it) => (
                <button
                  key={it.label}
                  type="button"
                  aria-label={it.label}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-text-200 hover:bg-white/10"
                >
                  <Anticon cp={it.cp} size={20} weight={433} />
                </button>
              ))}
            </div>
            <div className="mt-10 flex flex-col items-center gap-3">
              <button
                type="button"
                aria-label="Code"
                className="flex h-8 w-8 items-center justify-center rounded-md text-text-200 hover:bg-white/10"
              >
                <Anticon cp={ICONS.code} size={20} weight={433} />
              </button>
              <button
                type="button"
                aria-label="Design"
                className="flex h-8 w-8 items-center justify-center rounded-md text-text-200 hover:bg-white/10"
              >
                <Anticon cp={ICONS.design} size={20} weight={433} />
              </button>
            </div>
          </div>
          <div className="mt-auto flex flex-col items-center gap-3 pb-4">
            <button
              type="button"
              aria-label="Download apps"
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-200 hover:bg-white/10"
            >
              <Anticon cp={ICONS.download} size={20} />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-text-200 text-sm font-semibold text-bg-100">
              U
            </span>
          </div>
        </>
      )}
    </nav>
  );
}
