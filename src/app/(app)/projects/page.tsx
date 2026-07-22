"use client";

/** `/projects` — card grid. Spec: docs/research/components/list-pages.spec.md */

import { useState } from "react";
import {
  BTN_PRIMARY,
  CloseButton,
  DropdownTrigger,
  EmptyState,
  Menu,
  MenuItem,
  MenuLabel,
  Modal,
  PageBody,
  PageHeader,
  SearchField,
  relativeTime,
} from "@/components/app/ui";
import { useChatStore } from "@/lib/chat-store";

type Sort = "updated" | "name";

export default function ProjectsPage() {
  const { projects, chats, createProject, deleteProject, hydrated } = useChatStore();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("updated");
  const [sortOpen, setSortOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const q = query.trim().toLowerCase();
  const list = projects
    .filter((p) => !q || p.name.toLowerCase().includes(q))
    .sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name) : b.updatedAt - a.updatedAt
    );

  return (
    <div className="min-w-0 flex-1 overflow-y-auto">
      <PageHeader title="Projects">
        <div className="relative">
          <DropdownTrigger
            label="Sort by"
            value={sort === "updated" ? "Last updated" : "Name"}
            onClick={() => setSortOpen((o) => !o)}
          />
          {sortOpen && (
            <Menu onClose={() => setSortOpen(false)} className="right-0 top-full mt-1">
              <MenuLabel>Sort by</MenuLabel>
              <MenuItem
                label="Last updated"
                checked={sort === "updated"}
                onClick={() => {
                  setSort("updated");
                  setSortOpen(false);
                }}
              />
              <MenuItem
                label="Name"
                checked={sort === "name"}
                onClick={() => {
                  setSort("name");
                  setSortOpen(false);
                }}
              />
            </Menu>
          )}
        </div>
        <button type="button" className={BTN_PRIMARY} onClick={() => setCreating(true)}>
          New project
        </button>
      </PageHeader>

      <PageBody>
        <div className="pb-6 pt-2">
          <SearchField
            placeholder="Search projects…"
            value={query}
            onChange={setQuery}
          />
        </div>

        {hydrated && list.length === 0 && (
          <EmptyState>No projects yet.</EmptyState>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {list.map((p) => {
            const count = chats.filter((c) => c.projectId === p.id).length;
            return (
              <article
                key={p.id}
                className="group relative flex min-h-[200px] flex-col rounded-xl border-[0.8px] border-white/[0.08] p-5 transition-colors hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-2">
                  <h2 className="min-w-0 truncate text-[16px] font-medium text-white">
                    {p.name}
                  </h2>
                  {p.badge && (
                    <span className="shrink-0 rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[12px] text-text-200">
                      {p.badge}
                    </span>
                  )}
                </div>
                {p.description && (
                  <p className="mt-2 line-clamp-3 text-[14px] leading-5 text-text-200">
                    {p.description}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-[13px] text-text-400">
                    {count > 0 ? `${count} chat${count === 1 ? "" : "s"} · ` : ""}
                    {relativeTime(p.updatedAt)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Delete ${p.name}`}
                    onClick={() => deleteProject(p.id)}
                    className="cursor-pointer text-[13px] text-text-400 opacity-0 transition-opacity hover:text-[rgb(236,126,126)] group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </PageBody>

      {creating && (
        <NewProjectDialog
          onClose={() => setCreating(false)}
          onCreate={(name, desc) => {
            createProject(name, desc);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function NewProjectDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const input =
    "w-full rounded-[10px] bg-white/[0.06] px-3 py-2.5 text-[14px] text-text-100 outline-none ring-1 ring-white/10 transition focus:ring-white/25 placeholder:text-text-400";

  return (
    <Modal onClose={onClose} width={520} labelledBy="new-project-title">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="new-project-title"
            className="text-[22px] font-semibold leading-[26px] text-white"
          >
            New project
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-text-200">Name</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website redesign"
              className={input}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-text-200">
              What are you working on?
            </span>
            <textarea
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe the project so Claude has context in every chat."
              className={`${input} resize-none`}
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => onCreate(name.trim(), desc.trim())}
            className={`${BTN_PRIMARY} disabled:cursor-default disabled:opacity-50`}
          >
            Create project
          </button>
        </div>
      </div>
    </Modal>
  );
}
