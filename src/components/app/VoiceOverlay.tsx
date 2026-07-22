"use client";

/**
 * Voice mode. The live overlay was deliberately not captured — opening it on
 * claude.ai prompts for microphone access — so this is built from the composer
 * button affordances only ("Use voice mode", "Press and hold to record").
 * See the "not captured" note in docs/research/components/menus-and-dialogs.spec.md.
 */

import { useEffect, useState } from "react";
import { CloseButton } from "./ui";
import { MicIcon } from "./menu-icons";

const BARS = 28;

export default function VoiceOverlay({ onClose }: { onClose: () => void }) {
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-10 bg-bg-100/95 backdrop-blur-sm">
      <div className="absolute right-5 top-4">
        <CloseButton onClick={onClose} />
      </div>

      <p className="font-serif text-[28px] font-light text-text-200">
        {holding ? "Listening…" : "Press and hold to record"}
      </p>

      {/* Idle bars settle flat; while held they wobble. */}
      <div className="flex h-16 items-center gap-1.5" aria-hidden>
        {Array.from({ length: BARS }, (_, i) => (
          <span
            key={i}
            className="w-1 rounded-full bg-clay/80"
            style={{
              height: holding ? undefined : 4,
              animation: holding
                ? `voice-bar 900ms ease-in-out ${i * 45}ms infinite`
                : undefined,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="Press and hold to record"
        onPointerDown={() => setHolding(true)}
        onPointerUp={() => setHolding(false)}
        onPointerLeave={() => setHolding(false)}
        className={`flex h-16 w-16 cursor-pointer items-center justify-center rounded-full transition-transform ${
          holding ? "scale-110 bg-clay text-white" : "bg-bg-000 text-text-100"
        }`}
      >
        <MicIcon className="h-7 w-7" />
      </button>

      <p className="text-[13px] text-text-400">
        Voice mode is UI-only in this clone — no microphone is accessed.
      </p>
    </div>
  );
}
