"use client";

import { useEffect } from "react";
import { XIcon } from "./ui-icons";

function useEscClose(onClose: () => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
}

const closeBtn =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[0.8px] border-[hsl(var(--border-300)/0.15)] text-text-200 transition-colors hover:bg-white/[0.06]";

/** "Pasted content" / text-file viewer — exact metrics from claude.ai
 *  (768px, mono body). Title is the filename for uploaded text/markdown. */
export function PastedContentModal({
  text,
  title = "Pasted content",
  onClose,
}: {
  text: string;
  title?: string;
  onClose: () => void;
}) {
  useEscClose(onClose);
  const kb = (new Blob([text]).size / 1024).toFixed(2);
  const lines = text.split("\n").length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-[768px] flex-col rounded-2xl border-[0.8px] border-[hsl(var(--border-300)/0.15)] bg-bg-100 p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-text-000">
              {title}
            </h2>
            <p className="mt-1 text-sm text-text-200">
              {kb} KB&nbsp; •&nbsp; {lines} lines&nbsp; • &nbsp;Formatting may be
              inconsistent from source
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className={closeBtn}
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-auto rounded-xl border-[0.8px] border-[hsl(var(--border-300)/0.15)] p-4">
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-4 text-text-000">
            {text}
          </pre>
        </div>
      </div>
    </div>
  );
}

/** Image lightbox — centered full-size preview with a close control. */
export function ImageLightbox({
  src,
  name,
  onClose,
}: {
  src: string;
  name?: string;
  onClose: () => void;
}) {
  useEscClose(onClose);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg border-[0.8px] border-white/20 text-white transition-colors hover:bg-white/[0.1]"
      >
        <XIcon className="h-4 w-4" />
      </button>
      <div
        className="flex max-h-full max-w-full flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name || "attachment"}
          className="min-h-0 max-w-full rounded-lg object-contain"
        />
        {name && <p className="text-sm text-white/90">{name}</p>}
      </div>
    </div>
  );
}
