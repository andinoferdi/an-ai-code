"use client";

/** `/artifacts` — preview-card grid. Spec: docs/research/components/list-pages.spec.md */

import { useState } from "react";
import Link from "next/link";
import ArtifactPanel from "@/components/app/ArtifactPanel";
import {
  BTN_PRIMARY,
  DropdownTrigger,
  EmptyState,
  Menu,
  MenuItem,
  PageBody,
  PageHeader,
  SearchField,
  relativeTime,
} from "@/components/app/ui";
import { useChatStore } from "@/lib/chat-store";
import type { Artifact } from "@/types/chat";

const TABS = ["All", "Yours", "Shared with you"] as const;

export default function ArtifactsPage() {
  const { artifacts, hydrated } = useChatStore();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [filter, setFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [open, setOpen] = useState<Artifact | null>(null);

  const q = query.trim().toLowerCase();
  const list = artifacts
    .filter(({ artifact }) => !q || artifact.title.toLowerCase().includes(q))
    .filter(({ artifact }) => filter === "All" || artifact.language === filter)
    // Nothing in the clone is shared with you, so that tab is always empty.
    .filter(() => tab !== "Shared with you");

  const languages = ["All", ...new Set(artifacts.map((a) => a.artifact.language))];

  return (
    <>
      <div className="min-w-0 flex-1 overflow-y-auto">
        <PageHeader title="Artifacts">
          <div className="relative">
            <DropdownTrigger
              label="Filter by"
              value={filter}
              onClick={() => setFilterOpen((o) => !o)}
            />
            {filterOpen && (
              <Menu
                onClose={() => setFilterOpen(false)}
                className="right-0 top-full mt-1"
              >
                {languages.map((l) => (
                  <MenuItem
                    key={l}
                    label={l}
                    checked={filter === l}
                    onClick={() => {
                      setFilter(l);
                      setFilterOpen(false);
                    }}
                  />
                ))}
              </Menu>
            )}
          </div>
          <Link href="/new" className={BTN_PRIMARY}>
            New artifact
          </Link>
        </PageHeader>

        <PageBody>
          <div className="pt-2">
            <SearchField
              placeholder="Search artifacts…"
              value={query}
              onChange={setQuery}
            />
          </div>

          <div className="flex items-center gap-1 py-5">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`h-8 cursor-pointer rounded-lg px-3 text-[14px] font-medium transition-colors ${
                  tab === t
                    ? "bg-white/10 text-text-100"
                    : "text-text-400 hover:bg-white/[0.05] hover:text-text-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {hydrated && list.length === 0 && (
            <EmptyState>
              {tab === "Shared with you"
                ? "Nothing has been shared with you."
                : "No artifacts yet — ask Claude for some code."}
            </EmptyState>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map(({ artifact, chat }) => (
              <button
                key={`${chat.id}-${artifact.id}`}
                type="button"
                onClick={() => setOpen(artifact)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border-[0.8px] border-white/[0.08] text-left transition-colors hover:bg-white/[0.03]"
              >
                {/* Preview with the folded top-right corner claude.ai draws. */}
                <div className="relative h-[150px] overflow-hidden bg-white">
                  <iframe
                    title={artifact.title}
                    srcDoc={artifact.code}
                    sandbox=""
                    aria-hidden
                    tabIndex={-1}
                    className="pointer-events-none h-[600px] w-[400%] origin-top-left scale-[0.25] border-0"
                  />
                  <span
                    aria-hidden
                    className="absolute right-0 top-0 border-b-[28px] border-l-[28px] border-b-transparent border-l-bg-100"
                  />
                  <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[12px] text-white">
                    Chat
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="line-clamp-3 text-[16px] leading-6 text-white">
                    {artifact.title}
                  </h2>
                  <p className="mt-auto pt-4 text-[13px] text-text-400">
                    Edited {relativeTime(chat.updatedAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </PageBody>
      </div>

      {open && <ArtifactPanel artifact={open} onClose={() => setOpen(null)} />}
    </>
  );
}
