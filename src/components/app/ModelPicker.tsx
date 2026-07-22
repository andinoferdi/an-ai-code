"use client";

import { useEffect, useRef, useState } from "react";
import { Anticon, ICONS } from "./ui-icons";

type Model = { name: string; hint: string; note?: string };

const MODELS: Model[] = [
  { name: "Fable 5", hint: "", note: "Requires usage credits" },
  { name: "Opus 4.8", hint: "For complex tasks" },
  { name: "Sonnet 5", hint: "Most efficient for everyday tasks" },
  { name: "Haiku 4.5", hint: "Fastest for quick answers" },
];

export default function ModelPicker() {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState("Sonnet 5");
  const [effort] = useState("Medium");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label={`Model: ${model} ${effort}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1 rounded-lg px-1.5 transition-colors hover:bg-white/[0.06]"
      >
        <span className="text-sm font-medium text-text-000">{model}</span>
        <span className="text-sm text-text-200">{effort}</span>
        <Anticon cp={ICONS.caretDown} size={12} className="text-text-200" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-50 mb-2 w-[262px] rounded-xl bg-[rgb(56,56,53)] p-1.5 text-sm text-text-100 shadow-[0_0_0_1px_inset_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.32),0_2px_6px_rgba(0,0,0,0.2)]"
        >
          {MODELS.map((m) => {
            const selected = m.name === model;
            return (
              <button
                key={m.name}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setModel(m.name);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-white/[0.06]"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="font-medium text-text-000">{m.name}</span>
                    {m.note && (
                      <span className="flex items-center gap-1 text-xs text-text-400">
                        <InfoIcon />
                        {m.note}
                      </span>
                    )}
                  </span>
                  {m.hint && (
                    <span className="mt-0.5 block text-[13px] text-text-400">
                      {m.hint}
                    </span>
                  )}
                </span>
                {selected && (
                  <span className="shrink-0 text-[#4f8ff7]">
                    <CheckIcon />
                  </span>
                )}
              </button>
            );
          })}

          <div className="my-1 h-px bg-white/[0.08]" />

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-white/[0.06]"
          >
            <span className="flex-1 font-medium text-text-000">Effort</span>
            <span className="text-text-400">{effort}</span>
            <Anticon cp={ICONS.sectionChevron} size={12} className="text-text-400" />
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-white/[0.06]"
          >
            <span className="flex-1 font-medium text-text-000">More models</span>
            <Anticon cp={ICONS.sectionChevron} size={12} className="text-text-400" />
          </button>
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" width="16" height="16" aria-hidden>
      <path d="M232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183 215.51 63.51a12 12 0 0 1 17 17z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" width="13" height="13" aria-hidden>
      <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88 88.1 88.1 0 0 1-88 88m16-40a8 8 0 0 1-8 8 16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16 16 16 0 0 1 16 16v40a8 8 0 0 1 8 8m-32-92a12 12 0 1 1 12 12 12 12 0 0 1-12-12" />
    </svg>
  );
}
