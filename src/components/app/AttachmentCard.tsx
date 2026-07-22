"use client";

/**
 * The 120×120 attachment tile, used both inside the composer and inside a sent
 * user turn. Metrics from docs/research/components/attachments.spec.md.
 *
 * The card owns its own viewer state so the two call sites don't each have to
 * repeat the lightbox/pasted-content plumbing.
 *
 * One deliberate gap: claude.ai previews a PDF's first page (its server renders
 * a thumbnail). Doing that client-side needs a PDF rasteriser — Chrome's built-in
 * viewer refuses to paint inside a blob-URL iframe, its <embed> stalls on
 * about:blank — so PDFs get the document card instead, which is also what
 * claude.ai falls back to for files it can't preview.
 */

import { useState } from "react";
import { XIcon } from "./ui-icons";
import { FileTextIcon } from "./menu-icons";
import { ImageLightbox, PastedContentModal } from "./AttachmentViewer";
import type { Attachment } from "@/types/chat";

/** Shared shell: 8px radius, hairline border, two-layer shadow, 150ms ease. */
const FRAME =
  "h-[120px] w-[120px] min-w-[120px] cursor-pointer overflow-hidden rounded-lg border-[0.8px] border-white/20 bg-[rgb(44,44,42)] shadow-[0_1px_2px_rgba(11,11,11,0.06),0_2px_8px_rgba(0,0,0,0.24)] transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-white/30 hover:shadow-[0_1px_2px_rgba(11,11,11,0.1),0_2px_8px_rgba(0,0,0,0.32)]";

const DOC_FRAME = `${FRAME} flex flex-col justify-between gap-2.5 px-2.5 py-2 text-left font-sans`;

export function fmtSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

/** Extension pill: 18px tall, translucent, blurred over whatever sits behind it. */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[18px] w-fit min-w-0 items-center justify-center gap-0.5 rounded-[4px] border-[0.8px] border-white/20 bg-[rgb(44,44,42)]/70 px-1 font-medium shadow-[0_1px_2px_rgba(11,11,11,0.06)] backdrop-blur-sm">
      <p className="truncate text-[11px] uppercase leading-[13px] text-text-300">
        {children}
      </p>
    </div>
  );
}

type Viewer =
  | { kind: "text"; title: string; text: string }
  | { kind: "image"; src: string; name: string }
  | null;

export default function AttachmentCard({
  attachment: a,
  onRemove,
}: {
  attachment: Attachment;
  /** Omitted in a sent message — only the composer can remove an attachment. */
  onRemove?: () => void;
}) {
  const [viewer, setViewer] = useState<Viewer>(null);
  const [ready, setReady] = useState(false);

  // Live blob first, inlined copy second — the blob dies with the page.
  const src = a.kind === "image" || a.kind === "file" ? a.url || a.dataUrl || "" : "";

  function open() {
    if (a.kind === "pasted")
      setViewer({ kind: "text", title: "Pasted content", text: a.text });
    else if (a.kind === "text")
      setViewer({ kind: "text", title: a.name, text: a.text });
    else if (a.kind === "image")
      setViewer({ kind: "image", src, name: a.name });
    else window.open(src, "_blank", "noopener,noreferrer");
  }

  /** Preview fades in over 400ms once the bytes have actually painted. */
  const fade = `transition-opacity duration-[400ms] ${ready ? "opacity-100" : "opacity-0"}`;

  return (
    <div className="group/thumbnail relative">
      {a.kind === "image" ? (
        <button type="button" onClick={open} aria-label={a.name} className={`${FRAME} relative block`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={a.name}
            onLoad={() => setReady(true)}
            className={`h-full w-full object-cover ${fade}`}
          />
        </button>
      ) : a.kind === "pasted" ? (
        <button type="button" onClick={open} aria-label="Pasted content" className={DOC_FRAME}>
          <p className="line-clamp-5 min-w-0 flex-1 overflow-hidden whitespace-pre-wrap break-words text-[8px] leading-[12px] text-text-400/80">
            {a.text}
          </p>
          <Chip>pasted</Chip>
        </button>
      ) : a.kind === "text" ? (
        <button
          type="button"
          onClick={open}
          aria-label={`${a.name}, ${a.ext}, ${a.text.split("\n").length} lines`}
          className={DOC_FRAME}
        >
          <div className="flex min-h-0 flex-col gap-1">
            <h3 className="line-clamp-3 break-words text-[12px] leading-[18px] text-text-100">
              {a.name}
            </h3>
            <p className="line-clamp-1 break-words text-[10px] text-text-400">
              {a.text.split("\n").length} lines
            </p>
          </div>
          <Chip>{a.ext}</Chip>
        </button>
      ) : (
        <button
          type="button"
          onClick={open}
          aria-label={`${a.name}, ${a.ext}`}
          className={DOC_FRAME}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-1">
            <h3 className="line-clamp-2 break-words text-[12px] leading-[18px] text-text-100">
              {a.name}
            </h3>
            <p className="line-clamp-1 text-[10px] text-text-400">{fmtSize(a.size)}</p>
          </div>
          <div className="flex items-end justify-between gap-1">
            <Chip>{a.ext}</Chip>
            <FileTextIcon width={18} height={18} className="shrink-0 text-text-400" />
          </div>
        </button>
      )}

      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${a.kind === "pasted" ? "pasted content" : a.name}`}
          onClick={onRemove}
          className="absolute -left-2 -top-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-[0.8px] border-white/20 bg-[rgb(44,44,42)]/90 text-text-400 opacity-0 backdrop-blur-sm transition-all hover:bg-[rgb(44,44,42)]/50 hover:text-text-200 group-focus-within/thumbnail:opacity-100 group-hover/thumbnail:opacity-100"
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}

      {viewer?.kind === "text" && (
        <PastedContentModal
          text={viewer.text}
          title={viewer.title}
          onClose={() => setViewer(null)}
        />
      )}
      {viewer?.kind === "image" && (
        <ImageLightbox
          src={viewer.src}
          name={viewer.name}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}
