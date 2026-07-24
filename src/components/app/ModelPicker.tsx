"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  getSelectedModel,
  getServerSelectedModel,
  setSelectedModel,
  subscribeSelectedModel,
  type ModelChoice,
} from "@/lib/selected-model";
import { Anticon, ICONS } from "./ui-icons";

type FreeModel = { id: string; label: string; vision: boolean; created: number };

const AUTO_ID = "auto";

export default function ModelPicker() {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<FreeModel[]>([]);
  const [loaded, setLoaded] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = useSyncExternalStore(
    subscribeSelectedModel,
    getSelectedModel,
    getServerSelectedModel
  );
  const selectedId = selected.id;

  // Fetch the live free-model list the first time the menu opens. All state
  // updates happen in async callbacks, never synchronously in the effect body.
  useEffect(() => {
    if (!open || loaded) return;
    let cancelled = false;
    fetch("/api/chat/models")
      .then((r) => r.json())
      .then((data: { models?: FreeModel[] }) => {
        if (!cancelled) setModels(data.models ?? []);
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, loaded]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const choose = (choice: ModelChoice) => {
    setSelectedModel(choice);
    setOpen(false);
  };

  // Label comes straight from the stored choice — no dependency on the fetched
  // list, so the trigger shows the right name even before the menu is opened.
  const selectedLabel = selected.label;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label={`Model: ${selectedLabel}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1 rounded-lg px-1.5 transition-colors hover:bg-white/[0.06]"
      >
        <span className="max-w-[220px] truncate text-sm font-medium text-text-000">
          {selectedLabel}
        </span>
        <span className="text-sm text-text-200">free</span>
        <Anticon cp={ICONS.caretDown} size={12} className="text-text-200" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-50 mb-2 max-h-[360px] w-[288px] overflow-y-auto rounded-xl bg-[rgb(56,56,53)] p-1.5 text-sm text-text-100 shadow-[0_0_0_1px_inset_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.32),0_2px_6px_rgba(0,0,0,0.2)]"
        >
          <Item
            name="Auto"
            hint="Newest free OpenRouter model"
            selected={selectedId === AUTO_ID}
            onSelect={() => choose({ id: AUTO_ID, label: "Auto" })}
          />

          <div className="my-1 h-px bg-white/[0.08]" />

          {!loaded && (
            <div className="px-2.5 py-1.5 text-[13px] text-text-400">
              Loading free models…
            </div>
          )}
          {loaded && models.length === 0 && (
            <div className="px-2.5 py-1.5 text-[13px] text-text-400">
              No free models available right now — Auto will be used.
            </div>
          )}
          {models.map((m) => (
            <Item
              key={m.id}
              name={m.label}
              hint={m.id}
              tag={m.vision ? "vision" : undefined}
              selected={m.id === selectedId}
              onSelect={() => choose({ id: m.id, label: m.label })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Item({
  name,
  hint,
  tag,
  selected,
  onSelect,
}: {
  name: string;
  hint?: string;
  tag?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onSelect}
      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-white/[0.06]"
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-medium text-text-000">{name}</span>
          {tag && (
            <span className="shrink-0 rounded bg-white/[0.08] px-1 text-[10px] uppercase tracking-wide text-text-300">
              {tag}
            </span>
          )}
        </span>
        {hint && (
          <span className="mt-0.5 block truncate text-[13px] text-text-400">{hint}</span>
        )}
      </span>
      {selected && (
        <span className="shrink-0 text-[#4f8ff7]">
          <CheckIcon />
        </span>
      )}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" width="16" height="16" aria-hidden>
      <path d="M232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183 215.51 63.51a12 12 0 0 1 17 17z" />
    </svg>
  );
}
