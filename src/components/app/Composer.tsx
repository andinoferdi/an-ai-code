"use client";

import {
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { Anticon, ICONS, VoiceWaveformIcon } from "./ui-icons";
import { StopIcon } from "./chat-icons";
import PlusMenu from "./PlusMenu";
import ModelPicker from "./ModelPicker";
import AttachmentCard from "./AttachmentCard";
import type { Attachment } from "@/types/chat";

const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-lg text-text-000 transition-colors hover:bg-white/[0.06]";

const PASTE_TO_FILE_THRESHOLD = 2500;

const TEXT_EXTS = new Set([
  "md", "markdown", "txt", "csv", "json", "log", "yml", "yaml", "xml", "html",
  "css", "js", "ts", "tsx", "jsx", "py", "java", "c", "cpp", "go", "rs", "sh",
  "sql", "rb", "php",
]);

function extOf(name: string) {
  return (name.split(".").pop() || "file").toLowerCase();
}

export default function Composer({
  placeholder = "How can I help you today?",
  generating = false,
  onSend,
  onStop,
  onVoice,
}: {
  placeholder?: string;
  /** Streaming in progress — swaps the send button for a stop square. */
  generating?: boolean;
  onSend?: (text: string, attachments: Attachment[]) => void;
  onStop?: () => void;
  /** Opens the voice-mode overlay from either the mic or waveform button. */
  onVoice?: () => void;
} = {}) {
  const [empty, setEmpty] = useState(true);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const dragDepth = useRef(0);

  const hasContent = !empty || attachments.length > 0;

  /**
   * Object URLs paint instantly but die with the page, so a copy is also read
   * as a data URL and stored alongside — that's what survives into
   * localStorage. Skipped above ~1.5MB, where base64 would blow the quota for
   * every other conversation.
   */
  function inlineForPersistence(id: number, file: File) {
    if (file.size > 1_500_000) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === id && (a.kind === "image" || a.kind === "file")
            ? { ...a, dataUrl }
            : a
        )
      );
    };
    reader.readAsDataURL(file);
  }

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
        inlineForPersistence(id, file);
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
              ext,
              size: file.size,
            },
          ]);
        };
        reader.readAsText(file);
      } else {
        const url = URL.createObjectURL(file);
        setAttachments((prev) => [
          ...prev,
          { id, kind: "file", name: file.name, url, size: file.size, ext },
        ]);
        inlineForPersistence(id, file);
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

  function send() {
    const text = editorRef.current?.textContent?.trim() ?? "";
    if (!text && attachments.length === 0) return;
    onSend?.(text, attachments);
    if (editorRef.current) editorRef.current.textContent = "";
    setEmpty(true);
    setAttachments([]);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!generating) send();
    }
  }

  function removeAttachment(id: number) {
    setAttachments((prev) => {
      const found = prev.find((a) => a.id === id);
      if (found && (found.kind === "image" || found.kind === "file"))
        URL.revokeObjectURL(found.url);
      return prev.filter((a) => a.id !== id);
    });
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
        <div
          aria-hidden={!dragging}
          className={`pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-[20px] bg-bg-000/90 transition-opacity duration-150 ${
            dragging ? "opacity-100" : "opacity-0"
          }`}
        >
          <FileDropIcon />
          <p className="text-base font-medium text-text-100">
            Drop files here to add to chat
          </p>
        </div>

        <div className="m-3.5 flex flex-col gap-3">
          {/* Attachments row — scrolls sideways; the p-2/-m-2 pair keeps the
              remove buttons and card shadows from being clipped. */}
          {attachments.length > 0 && (
            <div className="-m-2 flex flex-row gap-3 overflow-x-auto p-2">
              {/* Sorted by id: text files land asynchronously via FileReader,
                  so append order isn't the order they were picked in. */}
              {[...attachments]
                .sort((x, y) => x.id - y.id)
                .map((a) => (
                  <AttachmentCard
                    key={a.id}
                    attachment={a}
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
                {placeholder}
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
              onKeyDown={handleKeyDown}
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
                onClick={onVoice}
                className={iconBtn}
              >
                <Anticon cp={ICONS.mic} size={20} />
              </button>
              {generating && (
                <button
                  type="button"
                  aria-label="Stop response"
                  onClick={onStop}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-[0.8px] border-[hsl(var(--border-300)/0.2)] text-text-100 transition-colors hover:bg-white/[0.06]"
                >
                  <StopIcon className="h-[18px] w-[18px]" />
                </button>
              )}
              {hasContent ? (
                <button
                  type="button"
                  aria-label="Send message"
                  onClick={send}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-clay text-white transition-colors hover:bg-[hsl(var(--accent-brand)/0.85)]"
                >
                  <Anticon cp={ICONS.send} size={16} weight={700} />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label="Use voice mode"
                  onClick={onVoice}
                  className={iconBtn}
                >
                  <VoiceWaveformIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
