"use client";

/**
 * Settings — 960×720 modal with a 192px left rail.
 *
 * On claude.ai this is the same surface the sidebar's "Customize" row opens,
 * which is why the rail carries both a Settings and a Customize group and why
 * "Skills" is the default selection.
 *
 * Spec: docs/research/components/menus-and-dialogs.spec.md
 */

import { useState } from "react";
import { Anticon, ICONS, XIcon } from "./ui-icons";
import { SearchField, useDismiss } from "./ui";
import {
  ConnectorsIcon,
  GlobeIcon,
  PluginsIcon,
  ProjectIcon,
  SkillsIcon,
} from "./menu-icons";
import { useChatStore } from "@/lib/chat-store";

type Item = { id: string; label: string; icon: React.ReactNode };

const glyph = (cp: string) => <Anticon cp={cp} size={16} />;

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Settings",
    items: [
      { id: "general", label: "General", icon: glyph(ICONS.customize) },
      { id: "account", label: "Account", icon: glyph(ICONS.chats) },
      { id: "privacy", label: "Privacy", icon: <GlobeIcon className="h-4 w-4" /> },
      { id: "billing", label: "Billing", icon: glyph(ICONS.download) },
      { id: "usage", label: "Usage", icon: glyph(ICONS.artifacts) },
      { id: "capabilities", label: "Capabilities", icon: <ProjectIcon className="h-4 w-4" /> },
      { id: "claude-code", label: "Claude Code", icon: glyph(ICONS.code) },
      { id: "claude-chrome", label: "Claude in Chrome", icon: glyph(ICONS.design) },
    ],
  },
  {
    label: "Customize",
    items: [
      { id: "skills", label: "Skills", icon: <SkillsIcon className="h-4 w-4" /> },
      { id: "connectors", label: "Connectors", icon: <ConnectorsIcon className="h-4 w-4" /> },
      { id: "plugins", label: "Plugins", icon: <PluginsIcon className="h-4 w-4" /> },
      { id: "memory", label: "Memory", icon: glyph(ICONS.groupBy) },
    ],
  },
];

const STYLES = [
  { id: "normal", label: "Normal", desc: "Default responses from Claude" },
  { id: "concise", label: "Concise", desc: "Shorter responses and fewer tool calls" },
  { id: "explanatory", label: "Explanatory", desc: "Educational responses for learning" },
  { id: "formal", label: "Formal", desc: "Clear and well-structured responses" },
];

export default function SettingsDialog({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState("skills");
  const [query, setQuery] = useState("");
  const ref = useDismiss(onClose);

  const groups = GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) =>
      i.label.toLowerCase().includes(query.trim().toLowerCase())
    ),
  })).filter((g) => g.items.length > 0);

  const current =
    GROUPS.flatMap((g) => g.items).find((i) => i.id === active)?.label ?? "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className="flex h-[calc(100dvh-2rem)] max-h-[720px] w-full max-w-[960px] animate-[zoom_50ms_ease-out_forwards] overflow-hidden rounded-xl border-[0.8px] border-white/5 bg-[rgb(44,44,42)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10),0_12px_28px_-2px_rgba(0,0,0,0.24)]"
      >
        {/* Rail */}
        <nav className="flex w-48 shrink-0 flex-col gap-3 overflow-y-auto bg-[rgb(26,26,25)] p-3">
          <SearchField placeholder="Search" value={query} onChange={setQuery} />
          {groups.map((g) => (
            <div key={g.label} className="flex flex-col gap-0.5">
              <h3 className="px-2 pb-1 text-[12px] text-text-400">{g.label}</h3>
              {g.items.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setActive(i.id)}
                  className={`flex h-8 w-full cursor-pointer items-center gap-3 rounded-lg px-2 text-left text-[14px] transition-colors ${
                    active === i.id
                      ? "bg-white/[0.08] text-text-100"
                      : "text-text-200 hover:bg-white/[0.06] hover:text-text-100"
                  }`}
                >
                  <span className="shrink-0">{i.icon}</span>
                  <span className="truncate">{i.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Pane */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between px-6">
            <h2 className="text-[16px] font-medium text-text-100">{current}</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-200 transition-colors hover:bg-white/10 hover:text-text-100"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            <Pane id={active} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Pane({ id }: { id: string }) {
  const { prefs, setPrefs, chats, artifacts } = useChatStore();

  if (id === "general") {
    return (
      <Section
        title="Personalization"
        desc="Claude uses these to tailor how it talks to you."
      >
        <Field label="What should Claude call you?">
          <input
            value={prefs.nickname}
            onChange={(e) => setPrefs({ nickname: e.target.value })}
            placeholder="Your preferred name"
            className={INPUT}
          />
        </Field>
        <Field label="What best describes your work?">
          <input
            value={prefs.role}
            onChange={(e) => setPrefs({ role: e.target.value })}
            placeholder="e.g. Frontend engineer"
            className={INPUT}
          />
        </Field>
        <Field label="Response style">
          <div className="flex flex-col gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setPrefs({ style: s.id })}
                className={`flex cursor-pointer items-center justify-between rounded-xl border-[0.8px] px-4 py-3 text-left transition-colors ${
                  prefs.style === s.id
                    ? "border-white/25 bg-white/[0.06]"
                    : "border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                <span>
                  <span className="block text-[14px] text-text-000">{s.label}</span>
                  <span className="block text-[13px] text-text-400">{s.desc}</span>
                </span>
                {prefs.style === s.id && (
                  <span className="text-[15px] text-[#4a9eff]">✓</span>
                )}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Personal preferences">
          <textarea
            value={prefs.instructions}
            onChange={(e) => setPrefs({ instructions: e.target.value })}
            rows={5}
            placeholder="Tell Claude anything it should keep in mind across every conversation."
            className={`${INPUT} resize-none`}
          />
        </Field>
      </Section>
    );
  }

  if (id === "account") {
    return (
      <Section title="Account" desc="This clone runs entirely in your browser.">
        <Row label="Email" value="user@example.com" />
        <Row label="Plan" value="Pro" />
        <Row label="Conversations stored" value={String(chats.length)} />
        <Row label="Artifacts" value={String(artifacts.length)} />
      </Section>
    );
  }

  if (id === "privacy") {
    return (
      <Section
        title="Privacy"
        desc="Everything lives in localStorage under `claude-clone:v1`. Nothing is sent anywhere."
      >
        <Row label="Incognito chats" value="Never persisted" />
        <Row label="Training on your data" value="Off" />
      </Section>
    );
  }

  return (
    <Section title="Coming soon" desc="This panel is chrome only in the clone." >
      <p className="text-[14px] text-text-400">
        The layout, rail and dimensions match claude.ai; the contents of this
        particular panel weren&rsquo;t part of the cloned scope.
      </p>
    </Section>
  );
}

const INPUT =
  "w-full rounded-[10px] bg-white/[0.06] px-3 py-2.5 text-[14px] text-text-100 outline-none ring-1 ring-white/10 transition focus:ring-white/25 placeholder:text-text-400";

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 pb-4">
      <div>
        <h3 className="text-[15px] font-medium text-text-100">{title}</h3>
        <p className="mt-1 text-[13px] text-text-400">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[14px] text-text-200">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b-[0.8px] border-white/5 py-3 text-[14px] last:border-b-0">
      <span className="text-text-200">{label}</span>
      <span className="text-text-100">{value}</span>
    </div>
  );
}
