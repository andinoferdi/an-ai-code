"use client";

import {
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
} from "react";
import { Anticon, ICONS, VoiceWaveformIcon, XIcon } from "./ui-icons";
import { FileTextIcon } from "./menu-icons";
import PlusMenu from "./PlusMenu";
import ModelPicker from "./ModelPicker";
import { PastedContentModal, ImageLightbox } from "./AttachmentViewer";

const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-lg text-text-000 transition-colors hover:bg-white/[0.06]";

const PASTE_TO_FILE_THRESHOLD = 2500;

const TEXT_EXTS = new Set([
  "md", "markdown", "txt", "csv", "json", "log", "yml", "yaml", "xml", "html",
  "css", "js", "ts", "tsx", "jsx", "py", "java", "c", "cpp", "go", "rs", "sh",
  "sql", "rb", "php",
]);

type Attachment =
  | { id: number; kind: "pasted"; text: string }
  | { id: number; kind: "text"; name: string; text: string; ext: string; size: number }
  | { id: number; kind: "image"; name: string; url: string; size: number }
  | { id: number; kind: "file"; name: string; url: string; size: number; ext: string };

type Viewer =
  | { kind: "text"; title: string; text: string }
  | { kind: "image"; src: string; name: string }
  | null;

function fmtSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}
function extOf(name: string) {
  return (name.split(".").pop() || "file").toLowerCase();
}

export default function Composer() {
  const [empty, setEmpty] = useState(true);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [viewer, setViewer] = useState<Viewer>(null);
  const [dragging, setDragging] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const dragDepth = useRef(0);

  const hasContent = !empty || attachments.length > 0;

  function addFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      const id = nextId.current++;
      const ext = extOf(file.name);
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setAttachments((prev) => [
          ...prev,
          { id, kind: "image", name: file.name, url, size: file.size },
        ]);
      } else if (file.type.startsWith("text/") || TEXT_EXTS.has(ext)) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id,
              kind: "text",
              name: file.name,
              text: String(reader.result ?? ""),
              ext: ext.toUpperCase(),
              size: file.size,
            },
          ]);
        };
        reader.readAsText(file);
      } else {
        const url = URL.createObjectURL(file);
        setAttachments((prev) => [
          ...prev,
          { id, kind: "file", name: file.name, url, size: file.size, ext: ext.toUpperCase() },
        ]);
      }
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    if (e.clipboardData.files.length > 0) {
      e.preventDefault();
      addFiles(e.clipboardData.files);
      return;
    }
    const text = e.clipboardData.getData("text/plain");
    e.preventDefault();
    if (text.length > PASTE_TO_FILE_THRESHOLD) {
      setAttachments((prev) => [...prev, { id: nextId.current++, kind: "pasted", text }]);
      return;
    }
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    sel.deleteFromDocument();
    sel.getRangeAt(0).insertNode(document.createTextNode(text));
    sel.collapseToEnd();
    setEmpty(!editorRef.current?.textContent?.trim());
  }

  function removeAttachment(id: number) {
    setAttachments((prev) => {
      const found = prev.find((a) => a.id === id);
      if (found && (found.kind === "image" || found.kind === "file"))
        URL.revokeObjectURL(found.url);
      return prev.filter((a) => a.id !== id);
    });
  }

  function openAttachment(a: Attachment) {
    if (a.kind === "pasted") setViewer({ kind: "text", title: "Pasted content", text: a.text });
    else if (a.kind === "text") setViewer({ kind: "text", title: a.name, text: a.text });
    else if (a.kind === "image") setViewer({ kind: "image", src: a.url, name: a.name });
    else window.open(a.url, "_blank", "noopener,noreferrer");
  }

  function onDragEnter(e: DragEvent<HTMLDivElement>) {
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    dragDepth.current += 1;
    setDragging(true);
  }
  function onDragLeave() {
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragging(false);
    }
  }
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  return (
    <div className="relative w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.md,.markdown,.csv,.json,.doc,.docx,.log,.yml,.yaml,.xml,.html,.css,.js,.ts,.tsx,.py"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        onDragEnter={onDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative box-content flex w-full flex-col items-stretch rounded-[20px] border-[0.8px] bg-bg-000 shadow-[0_2px_16px_rgba(0,0,0,0.12)] transition-colors ${
          dragging
            ? "border-clay"
            : "border-transparent focus-within:border-[hsl(var(--border-300)/0.15)]"
        }`}
      >
        {/* Drag-and-drop overlay */}
        {dragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-[20px] bg-bg-000/90">
            <FileDropIcon />
            <p className="text-base font-medium text-text-100">
              Drop files here to add to chat
            </p>
          </div>
        )}

        <div className="m-3.5 flex flex-col gap-3">
          {/* Attachments row */}
          {attachments.length > 0 && (
            <div className="flex flex-row flex-wrap gap-2">
              {attachments.map((a) => (
                <AttachmentCard
                  key={a.id}
                  attachment={a}
                  onOpen={() => openAttachment(a)}
                  onRemove={() => removeAttachment(a.id)}
                />
              ))}
            </div>
          )}

          {/* Editor */}
          <div className="relative">
            {empty && (
              <p
                aria-hidden
                className="pointer-events-none absolute left-1.5 top-1.5 text-base leading-[1.4] text-text-400"
              >
                How can I help you today?
              </p>
            )}
            <div
              ref={editorRef}
              role="textbox"
              aria-multiline="true"
              aria-label="Write your prompt to Claude"
              contentEditable
              suppressContentEditableWarning
              onInput={() => setEmpty(!editorRef.current?.textContent?.trim())}
              onPaste={handlePaste}
              className="max-h-96 min-h-[22px] w-full overflow-y-auto whitespace-pre-wrap break-words pl-1.5 pt-1.5 text-base leading-[1.4] text-text-000 outline-none"
            />
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between">
            <PlusMenu onAddFiles={() => fileInputRef.current?.click()} />

            <div className="flex items-center gap-1.5">
              <ModelPicker />
              <button
                type="button"
                aria-label="Press and hold to record"
                className={iconBtn}
              >
                <Anticon cp={ICONS.mic} size={20} />
              </button>
              {hasContent ? (
                <button
                  type="button"
                  aria-label="Send message"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-clay text-white transition-colors hover:bg-[hsl(var(--accent-brand)/0.85)]"
                >
                  <Anticon cp={ICONS.send} size={16} weight={700} />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label="Use voice mode"
                  className={iconBtn}
                >
                  <VoiceWaveformIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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

function AttachmentCard({
  attachment,
  onOpen,
  onRemove,
}: {
  attachment: Attachment;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const cardFrame =
    "flex h-[120px] w-[120px] min-w-[120px] cursor-pointer flex-col justify-between gap-2 overflow-hidden rounded-lg border-[0.8px] border-white/20 bg-[rgb(44,44,42)] p-2.5 text-left font-sans shadow-[0_1px_2px_rgba(11,11,11,0.06),0_2px_8px_rgba(0,0,0,0.24)]";
  const badge =
    "flex w-fit items-center justify-center rounded-[4px] border-[0.8px] border-white/20 bg-[rgba(30,30,29,0.7)] px-1 shadow-[0_1px_2px_rgba(11,11,11,0.06),0_2px_8px_rgba(0,0,0,0.24)]";

  return (
    <div className="group relative">
      {attachment.kind === "pasted" ? (
        <button type="button" onClick={onOpen} className={cardFrame}>
          <p className="line-clamp-5 min-w-0 flex-1 overflow-hidden whitespace-pre-wrap break-words text-[8px] leading-[12px] text-text-500/80">
            {attachment.text}
          </p>
          <div className={badge}>
            <span className="text-[11px] font-medium uppercase leading-[18px] text-text-200">
              pasted
            </span>
          </div>
        </button>
      ) : attachment.kind === "text" ? (
        <button type="button" onClick={onOpen} className={cardFrame}>
          <div className="min-h-0 flex-1">
            <p className="line-clamp-2 break-words text-[13px] font-semibold leading-[17px] text-text-100">
              {attachment.name}
            </p>
            <p className="mt-1 text-[11px] text-text-400">
              {attachment.text.split("\n").length} lines
            </p>
          </div>
          <div className={badge}>
            <span className="text-[11px] font-medium uppercase leading-[18px] text-text-200">
              {attachment.ext}
            </span>
          </div>
        </button>
      ) : attachment.kind === "image" ? (
        <button
          type="button"
          onClick={onOpen}
          className="relative flex h-[120px] w-[120px] min-w-[120px] cursor-pointer overflow-hidden rounded-lg border-[0.8px] border-white/20 shadow-[0_1px_2px_rgba(11,11,11,0.06),0_2px_8px_rgba(0,0,0,0.24)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={attachment.url} alt={attachment.name} className="h-full w-full object-cover" />
        </button>
      ) : (
        <button type="button" onClick={onOpen} className={cardFrame}>
          <div className="flex flex-1 items-center justify-center text-text-200">
            <FileTextIcon width={32} height={32} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-text-100">{attachment.name}</p>
            <p className="text-[10px] text-text-400">
              {attachment.ext} · {fmtSize(attachment.size)}
            </p>
          </div>
        </button>
      )}

      <button
        type="button"
        aria-label="Remove"
        onClick={onRemove}
        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-[0.8px] border-white/20 bg-[rgb(44,44,42)] text-text-100 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
      >
        <XIcon className="h-3 w-3" />
      </button>
    </div>
  );
}

/** Big document-plus icon shown in the drag-drop overlay. */
function FileDropIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" width="44" height="44" aria-hidden className="text-text-200">
      <path
        d="M208 88v120a8 8 0 0 1-8 8H56a8 8 0 0 1-8-8V48a8 8 0 0 1 8-8h88Zm-64-48v48h48"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M128 116v56M100 144h56" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
    </svg>
  );
}
