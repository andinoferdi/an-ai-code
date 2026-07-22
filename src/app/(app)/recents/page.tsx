"use client";

/** `/recents` — the "Chats" table. Spec: docs/research/components/list-pages.spec.md */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChatMenu from "@/components/app/ChatMenu";
import GroupByMenu from "@/components/app/GroupByMenu";
import { groupRecents } from "@/components/app/Sidebar";
import {
  BTN_GHOST,
  BTN_PRIMARY,
  DropdownTrigger,
  EmptyState,
  PageBody,
  PageHeader,
  SearchField,
  relativeTime,
} from "@/components/app/ui";
import { Anticon, ICONS } from "@/components/app/ui-icons";
import { useChatStore } from "@/lib/chat-store";
import type { Chat, GroupBy } from "@/types/chat";

export default function RecentsPage() {
  const { chats, hydrated, renameChat } = useChatStore();
  const [query, setQuery] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [groupOpen, setGroupOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const router = useRouter();

  const q = query.trim().toLowerCase();
  const filtered = q
    ? chats.filter((c) => c.title.toLowerCase().includes(q))
    : chats;
  const groups = groupRecents(filtered, groupBy);

  return (
    <div className="min-w-0 flex-1 overflow-y-auto">
      <PageHeader title="Chats">
        <div className="relative">
          <DropdownTrigger
            label="Group by"
            value={groupBy === "none" ? "None" : groupBy === "date" ? "Date" : "Project"}
            onClick={() => setGroupOpen((o) => !o)}
          />
          {groupOpen && (
            <GroupByMenu
              value={groupBy}
              onChange={setGroupBy}
              onClose={() => setGroupOpen(false)}
              className="right-0 top-full mt-1"
            />
          )}
        </div>
        <button
          type="button"
          className={BTN_GHOST}
          aria-pressed={selecting}
          onClick={() => setSelecting((s) => !s)}
        >
          {selecting ? "Done" : "Select chats"}
        </button>
        <button
          type="button"
          className={BTN_PRIMARY}
          onClick={() => router.push("/new")}
        >
          New chat
        </button>
      </PageHeader>

      <PageBody>
        <div className="pb-4 pt-2">
          <SearchField
            placeholder="Search chats…"
            value={query}
            onChange={setQuery}
          />
        </div>

        {hydrated && filtered.length === 0 && (
          <EmptyState>
            {chats.length === 0
              ? "No chats yet — start one from the composer."
              : `No chats match “${query}”.`}
          </EmptyState>
        )}

        {groups.map((g) => (
          <div key={g.label || "all"}>
            {g.label && (
              <h2 className="px-3 pb-1 pt-5 text-[12px] text-text-400">{g.label}</h2>
            )}
            <ul>
              {g.chats.map((c) => (
                <Row
                  key={c.id}
                  chat={c}
                  selecting={selecting}
                  onRename={(title) => renameChat(c.id, title)}
                />
              ))}
            </ul>
          </div>
        ))}
      </PageBody>
    </div>
  );
}

/**
 * A table row on claude.ai; a list item here. Same 48.8px height, 8/12 padding
 * and hairline divider that disappears under the hover fill.
 */
function Row({
  chat,
  selecting,
  onRename,
}: {
  chat: Chat;
  selecting: boolean;
  onRename: (title: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(chat.title);
  const [picked, setPicked] = useState(false);

  return (
    <li className="group relative border-b-[0.8px] border-white/5 transition-colors first:border-t-[0.8px] hover:rounded-lg hover:border-transparent hover:bg-white/[0.06]">
      <div className="flex min-h-8 items-center justify-between gap-4 px-3 py-2">
        {selecting && (
          <input
            type="checkbox"
            checked={picked}
            onChange={(e) => setPicked(e.target.checked)}
            aria-label={`Select ${chat.title}`}
            className="z-[2] h-4 w-4 shrink-0 accent-white"
          />
        )}

        {renaming ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              onRename(draft);
              setRenaming(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onRename(draft);
                setRenaming(false);
              }
              if (e.key === "Escape") setRenaming(false);
            }}
            className="z-[2] min-w-0 flex-1 rounded bg-bg-000 px-2 py-1 text-[14px] text-text-100 outline-none ring-1 ring-white/20"
          />
        ) : (
          <>
            <Link
              href={`/chat/${chat.id}`}
              aria-label={chat.title}
              className="absolute inset-0 z-[1] rounded outline-none"
            />
            <span className="min-w-0 flex-1 truncate text-[14px] leading-5 text-white">
              {chat.title}
            </span>
          </>
        )}

        <span className="z-[2] shrink-0 text-[14px] leading-5 text-text-200 group-hover:hidden">
          {relativeTime(chat.updatedAt)}
        </span>
        <button
          type="button"
          aria-label={`More options for ${chat.title}`}
          onClick={() => setMenuOpen((o) => !o)}
          className={`z-[2] hidden h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-white hover:bg-white/10 group-hover:flex ${
            menuOpen ? "!flex" : ""
          }`}
        >
          <Anticon cp={ICONS.kebab} size={16} />
        </button>
      </div>

      {menuOpen && (
        <ChatMenu
          chat={chat}
          className="right-2 top-full z-50"
          onClose={() => setMenuOpen(false)}
          onRename={() => {
            setDraft(chat.title);
            setMenuOpen(false);
            setRenaming(true);
          }}
        />
      )}
    </li>
  );
}
