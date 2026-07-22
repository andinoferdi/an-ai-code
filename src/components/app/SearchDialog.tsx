"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Anticon, ICONS, XIcon } from "./ui-icons";
import { relativeTime } from "./ui";
import { useChatStore } from "@/lib/chat-store";

export type SearchEntry = {
  title: string;
  /** Trailing label: a relative date for chats, an owner name for projects. */
  meta: string;
  kind: "chat" | "project";
  href: string;
};

export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const { chats, projects } = useChatStore();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();

  const entries: SearchEntry[] = [
    ...chats.map((c) => ({
      title: c.title,
      meta: relativeTime(c.updatedAt),
      kind: "chat" as const,
      href: `/chat/${c.id}`,
    })),
    ...projects.map((p) => ({
      title: p.name,
      meta: "user",
      kind: "project" as const,
      href: "/projects",
    })),
  ];

  const results = entries.filter((e) =>
    e.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  function go(entry: SearchEntry | undefined) {
    onClose();
    if (entry) router.push(entry.href);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") go(results[active]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div
      className="fixed inset-0 z-50 grid items-center justify-items-center overflow-y-auto bg-black/5 p-4 md:p-10"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal
        aria-label="Search chats and projects"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-2xl animate-[zoom_50ms_ease-out_forwards] overflow-hidden rounded-xl border-[0.8px] border-[rgba(226,225,218,0.3)] bg-bg-000 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Anticon cp={ICONS.search} size={18} className="text-text-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search chats and projects"
            className="min-w-0 flex-1 bg-transparent text-[16px] text-text-100 outline-none placeholder:text-text-400"
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-text-400 transition-colors hover:bg-white/10 hover:text-text-100"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[336px] overflow-y-auto px-3 pb-3">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-text-400">
              No results
            </p>
          ) : (
            results.map((entry, i) => (
              <button
                key={entry.kind + entry.href + entry.title}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(entry)}
                className={`flex h-9 w-full cursor-pointer items-center justify-between gap-3 truncate rounded-lg px-3 py-2 text-left text-[14px] leading-[19.6px] text-text-200 ${
                  i === active ? "bg-bg-200" : "hover:bg-white/[0.04]"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Anticon
                    cp={entry.kind === "chat" ? ICONS.chats : ICONS.projects}
                    size={16}
                    className="shrink-0 text-text-400"
                  />
                  <span className="truncate">{entry.title}</span>
                </span>
                <span className="shrink-0 text-text-400">
                  {i === active ? "Enter" : entry.meta}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
