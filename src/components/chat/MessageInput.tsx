"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { ArrowUp, Check, ChevronDown, Paperclip, Mic } from "lucide-react";
import { useChatContext } from "@/providers/ChatProvider";
import {
  DEFAULT_CHAT_MODEL,
  getChatModelOption,
  getModelsByProvider,
  type ChatModelOption,
} from "@/lib/chat-models";
import { cn } from "@/lib/utils";

const MAX_ROWS = 8;
const LINE_HEIGHT = 24;

interface MessageInputProps {
  hasMessages: boolean;
  layout?: "docked" | "centered";
  className?: string;
  placeholder?: string;
  showHint?: boolean;
}

export function MessageInput({
  hasMessages,
  layout = "docked",
  className,
  placeholder,
  showHint = true,
}: MessageInputProps) {
  const { sendMessage, isSending, selectedModel, setSelectedModel } =
    useChatContext();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  const modelsByProvider = getModelsByProvider();
  const selectedOption = getChatModelOption(selectedModel) ?? DEFAULT_CHAT_MODEL;

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = MAX_ROWS * LINE_HEIGHT;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!modelMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        modelSelectorRef.current?.contains(target)
      ) {
        return;
      }

      setModelMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [modelMenuOpen]);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;
    void sendMessage(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleModelSelect(option: ChatModelOption) {
    setSelectedModel({
      provider: option.provider,
      model: option.model,
    });
    setModelMenuOpen(false);
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function stopComposerFocus(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  const canSend = value.trim().length > 0 && !isSending;
  const isCentered = layout === "centered";
  const widthClass = isCentered ? "chat-column--hero" : "chat-column";
  const resolvedPlaceholder =
    placeholder ??
    (hasMessages ? "Reply..." : "Let's start by answering your question.");

  return (
    <div
      className={cn(
        "w-full",
        isCentered
          ? "px-[calc(var(--chat-shell-gutter)*0.92)] py-0"
          : "px-[calc(var(--chat-shell-gutter)*0.92)] pb-[var(--chat-composer-pad-bottom)] pt-[var(--chat-composer-pad-top)]",
        className,
      )}
      style={{ background: isCentered ? "var(--app-bg)" : "var(--chat-bg)" }}
    >
      <div className={cn(widthClass)}>
        <div
          className={cn(
            "flex cursor-text flex-col bg-[var(--input-bg)] transition-all duration-200",
            isCentered ? "rounded-[1.8rem]" : "rounded-[1.6rem]",
            focused
              ? "border border-[var(--input-border-focus)] shadow-[var(--input-shadow-focus)]"
              : "border border-[var(--input-border)] shadow-[var(--input-shadow)]",
          )}
          onClick={() => textareaRef.current?.focus()}
        >
          <div
            className={cn(isCentered ? "px-5 pt-4 pb-1.5" : "px-5 pt-4 pb-1.5")}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={resolvedPlaceholder}
              rows={1}
              aria-label="Input pesan"
              disabled={isSending}
              className={cn(
                "w-full resize-none bg-transparent leading-6",
                "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                "focus:outline-none disabled:opacity-50",
                "tracking-[-0.005em]",
                isCentered
                  ? "min-h-[56px] max-h-[176px] text-[0.95rem]"
                  : "min-h-[34px] max-h-[208px] text-[15px] leading-7",
              )}
            />
          </div>

          <div
            className={cn(
              "flex items-center justify-between",
              isCentered ? "px-4 pb-3 pt-1" : "px-4 pb-3.5 pt-1.5",
            )}
          >
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                aria-label="Lampirkan file"
                className="flex h-9 w-9 flex-none items-center justify-center rounded-xl
                           text-[var(--text-muted)] transition-all
                           hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)]
                           focus-visible:outline-none"
              >
                <Paperclip size={17} strokeWidth={2} />
              </button>

              <div
                ref={modelSelectorRef}
                className="relative"
                onClick={stopComposerFocus}
                onMouseDown={stopComposerFocus}
              >
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={modelMenuOpen}
                  aria-label={`Model: ${selectedOption.label}`}
                  data-testid="model-selector"
                  disabled={isSending}
                  onClick={(event) => {
                    event.stopPropagation();
                    setModelMenuOpen((open) => !open);
                  }}
                  className={cn(
                    "flex h-9 max-w-[13rem] items-center gap-1.5 rounded-xl px-2.5 text-[12px]",
                    "text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-hover)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1",
                    isSending && "cursor-not-allowed opacity-60",
                  )}
                >
                  <span className="truncate">{selectedOption.label}</span>
                  <span className="hidden text-[var(--text-muted)] sm:inline">
                    {selectedOption.provider}
                  </span>
                  <ChevronDown
                    size={13}
                    strokeWidth={2.4}
                    className={cn(
                      "flex-none text-[var(--text-muted)] transition-transform",
                      modelMenuOpen && "rotate-180",
                    )}
                  />
                </button>

                {modelMenuOpen && (
                  <div
                    role="listbox"
                    aria-label="Pilih model AI"
                    data-testid="model-selector-menu"
                    className="absolute bottom-full left-0 z-50 mb-2 w-[min(20rem,calc(100vw-2rem))]
                               overflow-hidden rounded-2xl border border-[var(--border)]
                               bg-[var(--surface)] p-1.5 shadow-[var(--input-shadow-focus)]"
                  >
                    <ModelProviderGroup
                      label="Cerebras"
                      models={modelsByProvider.cerebras}
                      selectedOption={selectedOption}
                      onSelect={handleModelSelect}
                    />
                    <div className="my-1 h-px bg-[var(--border)]" />
                    <ModelProviderGroup
                      label="OpenRouter"
                      models={modelsByProvider.openrouter}
                      selectedOption={selectedOption}
                      onSelect={handleModelSelect}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Input suara"
                className="flex h-9 w-9 items-center justify-center rounded-xl
                           text-[var(--text-muted)] transition-all
                           hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)]
                           focus-visible:outline-none"
              >
                <Mic size={17} strokeWidth={2} />
              </button>

              <button
                type="button"
                aria-label="Kirim pesan"
                onClick={handleSend}
                disabled={!canSend}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1",
                  canSend
                    ? "bg-[var(--accent)] text-[var(--accent-text)] shadow-sm hover:opacity-90 active:scale-90"
                    : "cursor-not-allowed bg-[var(--surface-hover)] text-[var(--text-muted)]",
                )}
              >
                {isSending ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
                ) : (
                  <ArrowUp size={16} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        {showHint && (
          <p className="mt-2.5 select-none text-center text-[10px] text-[var(--text-muted)]">
            Tekan{" "}
            <kbd
              className="rounded border px-1.5 py-0.5 font-mono text-[9px]"
              style={{
                background: "var(--surface-hover)",
                borderColor: "var(--border)",
                color: "var(--text-muted)",
              }}
            >
              Enter
            </kbd>{" "}
            untuk kirim,{" "}
            <kbd
              className="rounded border px-1.5 py-0.5 font-mono text-[9px]"
              style={{
                background: "var(--surface-hover)",
                borderColor: "var(--border)",
                color: "var(--text-muted)",
              }}
            >
              Shift+Enter
            </kbd>{" "}
            untuk baris baru.
          </p>
        )}
      </div>
    </div>
  );
}

interface ModelProviderGroupProps {
  label: string;
  models: ChatModelOption[];
  selectedOption: ChatModelOption;
  onSelect: (option: ChatModelOption) => void;
}

function ModelProviderGroup({
  label,
  models,
  selectedOption,
  onSelect,
}: ModelProviderGroupProps) {
  return (
    <div>
      <div className="px-2 pb-1 pt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
        {label}
      </div>
      <div className="flex flex-col gap-0.5">
        {models.map((option) => {
          const isSelected =
            option.provider === selectedOption.provider &&
            option.model === selectedOption.model;

          return (
            <button
              key={`${option.provider}:${option.model}`}
              type="button"
              role="option"
              aria-selected={isSelected}
              data-testid={`model-option-${option.provider}-${option.model}`}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(option);
              }}
              className={cn(
                "grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2.5 py-2 text-left",
                "text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                isSelected && "bg-[var(--surface-hover)] text-[var(--text-primary)]",
              )}
            >
              <span className="min-w-0">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-[13px] font-medium">
                    {option.label}
                  </span>
                  {option.badge && (
                    <span className="rounded-full border border-[var(--border)] px-1.5 py-0.5 text-[9px] text-[var(--text-muted)]">
                      {option.badge}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-[var(--text-muted)]">
                  {option.description}
                </span>
              </span>
              {isSelected && (
                <Check
                  size={15}
                  strokeWidth={2.5}
                  className="text-[var(--accent)]"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
