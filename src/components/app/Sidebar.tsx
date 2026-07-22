"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Anticon, ICONS, CaretUpDownIcon } from "./ui-icons";
import { ClaudeLogo } from "@/components/icons";
import SearchDialog from "./SearchDialog";
import UserMenu from "./UserMenu";
import ChatMenu from "./ChatMenu";
import GroupByMenu from "./GroupByMenu";
import { useChatStore, useShell } from "@/lib/chat-store";
import type { Chat, GroupBy } from "@/types/chat";

/* Row shell: h-32px, px-16 py-6, radius 9px, hover lightens to bg-000. */
const rowCls =
  "group flex h-8 w-full items-center rounded-[9px] px-4 py-1.5 transition-colors hover:bg-bg-000";

function NavRow({
  cp,
  label,
  href,
  onClick,
  shortcut,
  circled,
  trailing,
  hoverArrow,
  active,
}: {
  cp: string;
  label: string;
  href?: string;
  onClick?: () => void;
  shortcut?: string;
  circled?: boolean;
  trailing?: React.ReactNode;
  hoverArrow?: boolean;
  active?: boolean;
}) {
  const inner = (
    <>
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
    </>
  );

  const cls = `${rowCls} ${active ? "bg-bg-000" : ""}`;

  if (href) {
    // Code and Design are separate Anthropic products, so they leave the app.
    const external = href.startsWith("http");
    return (
      <Link
        href={href}
        aria-label={label}
        className={cls}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={`${cls} cursor-pointer`}>
      {inner}
    </button>
  );
}

/** Sidebar conversation row: link + hover kebab + inline rename. */
function ChatRow({ chat }: { chat: Chat }) {
  const { renameChat } = useChatStore();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(chat.title);
  const active = pathname === `/chat/${chat.id}`;

  function commit() {
    renameChat(chat.id, draft);
    setRenaming(false);
  }

  if (renaming) {
    return (
      <div className={`${rowCls} hover:bg-transparent`}>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setRenaming(false);
          }}
          className="w-full rounded bg-bg-000 px-1 text-sm text-text-000 outline-none ring-1 ring-white/20"
        />
      </div>
    );
  }

  return (
    <div className="group/row relative flex items-center">
      <Link
        href={`/chat/${chat.id}`}
        className={`${rowCls} ${active ? "bg-bg-000" : ""}`}
      >
        <span
          className={`truncate text-left text-sm group-hover:text-text-000 ${
            active ? "text-text-000" : "text-text-200"
          }`}
        >
          {chat.title}
        </span>
      </Link>
      <button
        type="button"
        aria-label={`More options for ${chat.title}`}
        onClick={() => setMenuOpen((o) => !o)}
        className={`absolute right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-white transition-opacity hover:bg-white/10 group-hover/row:opacity-100 ${
          menuOpen || active ? "opacity-100" : "opacity-0"
        }`}
      >
        <Anticon cp={ICONS.kebab} size={16} />
      </button>
      {menuOpen && (
        <ChatMenu
          chat={chat}
          className="left-2 top-full z-50 mt-1"
          onClose={() => setMenuOpen(false)}
          onRename={() => {
            setDraft(chat.title);
            setMenuOpen(false);
            setRenaming(true);
          }}
        />
      )}
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

export default function Sidebar() {
  const { sidebarOpen: open, toggleSidebar: onToggle, openSettings } = useShell();
  const { chats, starred, hydrated } = useChatStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const pathname = usePathname();
  const router = useRouter();

  // Recents mirrors the /recents grouping choice, minus the starred pins.
  const recents = chats.filter((c) => !c.starred);
  const groups = groupRecents(recents, groupBy);

  return (
    <>
      <nav
        className={`fixed left-0 top-0 z-20 flex h-screen flex-col border-r-[0.8px] border-[hsl(var(--border-300)/0.15)] bg-bg-100 bg-gradient-to-t from-[hsl(var(--bg-200)/0.05)] to-[hsl(var(--bg-200)/0.3)] transition-[width] duration-200 ${
          open ? "w-72" : "w-12"
        }`}
      >
        {open ? (
          <>
            {/* Header */}
            <div className="flex h-[4.5rem] shrink-0 items-center justify-between pl-4 pr-3">
              <Link href="/new" aria-label="Home" className="flex items-center">
                <ClaudeLogo
                  viewBox="30 0 82 24"
                  className="h-5 w-auto text-text-100"
                />
              </Link>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => setSearchOpen(true)}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-text-200 hover:bg-white/10"
                >
                  <Anticon cp={ICONS.search} size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Close sidebar"
                  onClick={onToggle}
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-text-200 hover:bg-white/10"
                >
                  <Anticon cp={ICONS.panel} size={16} />
                </button>
              </div>
            </div>

            {/* Primary nav */}
            <div className="flex flex-col px-2">
              <NavRow
                cp={ICONS.plus}
                label="New chat"
                href="/new"
                shortcut="Ctrl+⇧+O"
                circled
              />
              <NavRow
                cp={ICONS.chats}
                label="Chats"
                href="/recents"
                active={pathname === "/recents"}
              />
              <NavRow
                cp={ICONS.projects}
                label="Projects"
                href="/projects"
                active={pathname.startsWith("/projects")}
              />
              <NavRow
                cp={ICONS.artifacts}
                label="Artifacts"
                href="/artifacts"
                active={pathname === "/artifacts"}
              />
              {/* On claude.ai "Customize" opens the Settings modal, not a page. */}
              <NavRow cp={ICONS.customize} label="Customize" onClick={openSettings} />
            </div>

            {/* Products */}
            <div className="mt-5 px-2">
              <SectionLabel>Products</SectionLabel>
              <NavRow cp={ICONS.code} label="Code" href="https://claude.com/product/claude-code" hoverArrow />
              <NavRow
                cp={ICONS.design}
                label="Design"
                href="https://claude.ai/design"
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
            {starred.length > 0 && (
              <div className="mt-5 px-2">
                <SectionLabel>Starred</SectionLabel>
                {starred.map((c) => (
                  <ChatRow key={c.id} chat={c} />
                ))}
              </div>
            )}

            {/* Recents */}
            <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-2">
              <div className="relative">
                <SectionLabel
                  action={
                    <button
                      type="button"
                      aria-label="Group by"
                      onClick={() => setGroupOpen((o) => !o)}
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-text-400 hover:bg-white/10"
                    >
                      <Anticon cp={ICONS.groupBy} size={16} />
                    </button>
                  }
                >
                  Recents
                </SectionLabel>
                {groupOpen && (
                  <GroupByMenu
                    value={groupBy}
                    onChange={setGroupBy}
                    onClose={() => setGroupOpen(false)}
                    className="right-0 top-full z-50"
                  />
                )}
              </div>

              {hydrated && recents.length === 0 && (
                <p className="px-4 py-2 text-xs text-text-400">No chats yet</p>
              )}
              {groups.map((g) => (
                <div key={g.label}>
                  {g.label && (
                    <p className="px-4 pb-1 pt-3 text-[11px] text-text-400">
                      {g.label}
                    </p>
                  )}
                  {g.chats.map((c) => (
                    <ChatRow key={c.id} chat={c} />
                  ))}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="relative border-t-[0.8px] border-[hsl(var(--border-300)/0.15)] px-3 py-4">
              {menuOpen && (
                <UserMenu
                  email="user@example.com"
                  onClose={() => setMenuOpen(false)}
                  onOpenSettings={openSettings}
                />
              )}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label="user, Settings"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-lg text-left"
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
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-text-200 hover:bg-white/10"
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
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-200 hover:bg-white/10"
              >
                <Anticon cp={ICONS.panel} size={16} />
              </button>
              <div className="mt-8 flex flex-col items-center gap-3">
                <button
                  type="button"
                  aria-label="New chat"
                  onClick={() => router.push("/new")}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-200 hover:bg-white/10"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[hsl(var(--border-300)/0.3)]">
                    <Anticon cp={ICONS.plus} size={16} weight={700} />
                  </span>
                </button>
                {[
                  { cp: ICONS.chats, label: "Chats", href: "/recents" },
                  { cp: ICONS.projects, label: "Projects", href: "/projects" },
                  { cp: ICONS.artifacts, label: "Artifacts", href: "/artifacts" },
                ].map((it) => (
                  <Link
                    key={it.label}
                    href={it.href}
                    aria-label={it.label}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-200 hover:bg-white/10"
                  >
                    <Anticon cp={it.cp} size={20} weight={433} />
                  </Link>
                ))}
                <button
                  type="button"
                  aria-label="Customize"
                  onClick={openSettings}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-200 hover:bg-white/10"
                >
                  <Anticon cp={ICONS.customize} size={20} weight={433} />
                </button>
              </div>
              <div className="mt-10 flex flex-col items-center gap-3">
                <Link
                  href="https://claude.com/product/claude-code"
                  aria-label="Code"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-text-200 hover:bg-white/10"
                >
                  <Anticon cp={ICONS.code} size={20} weight={433} />
                </Link>
                <Link
                  href="https://claude.ai/design"
                  aria-label="Design"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-text-200 hover:bg-white/10"
                >
                  <Anticon cp={ICONS.design} size={20} weight={433} />
                </Link>
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

      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </>
  );
}

/** Buckets used by both the sidebar Recents list and the /recents page. */
export function groupRecents(chats: Chat[], by: GroupBy) {
  if (by === "none") return [{ label: "", chats }];

  const buckets = new Map<string, Chat[]>();
  for (const c of chats) {
    const key = by === "date" ? dateBucket(c.updatedAt) : c.projectId ?? "No project";
    const list = buckets.get(key) ?? [];
    list.push(c);
    buckets.set(key, list);
  }
  return [...buckets].map(([label, list]) => ({ label, chats: list }));
}

function dateBucket(ts: number) {
  const days = Math.floor((Date.now() - ts) / 86_400_000);
  if (days < 1) return "Today";
  if (days < 2) return "Yesterday";
  if (days < 7) return "Previous 7 days";
  if (days < 30) return "Previous 30 days";
  return "Older";
}
