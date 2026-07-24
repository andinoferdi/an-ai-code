"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Composer from "@/components/app/Composer";
import ChatThread from "@/components/app/ChatThread";
import ArtifactPanel from "@/components/app/ArtifactPanel";
import ChatMenu from "@/components/app/ChatMenu";
import ShareDialog from "@/components/app/ShareDialog";
import VoiceOverlay from "@/components/app/VoiceOverlay";
import { GhostIcon } from "@/components/app/ui-icons";
import { CaretDownIcon } from "@/components/app/chat-icons";
import { useChatStore, useShell } from "@/lib/chat-store";
import { takePendingPrompt, useDemoRun } from "@/lib/use-demo-run";

export default function ChatPage() {
  // Client component, so `params` comes from the hook rather than the promise
  // prop a server page would receive.
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getChat, hydrated, renameChat } = useChatStore();
  const { incognito, setIncognito } = useShell();
  const { send, stop, generating, artifact, setArtifact } = useDemoRun(id);

  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  // Whether the view is stuck to the bottom. While true we follow new content;
  // once the user scrolls up it flips false and we stop yanking them down.
  const pinnedRef = useRef(true);
  const prevLen = useRef(0);

  const chat = getChat(id);

  // Kick off the run for the prompt typed on /new.
  useEffect(() => {
    if (started.current || !chat) return;
    const prompt = takePendingPrompt(id);
    if (prompt) {
      started.current = true;
      send(prompt.text, prompt.attachments);
    }
  }, [chat, id, send]);

  // A chat id that isn't in the store (deleted, or a stale link) goes back home.
  useEffect(() => {
    if (hydrated && !chat) router.replace("/new");
  }, [hydrated, chat, router]);

  // Follow streaming content only while pinned to the bottom (like claude.ai).
  // A new turn (message count grows) re-pins and snaps down; a response
  // streaming into the same message respects wherever the user scrolled to.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const len = chat?.messages.length ?? 0;
    if (len > prevLen.current) pinnedRef.current = true;
    prevLen.current = len;
    if (pinnedRef.current) el.scrollTop = el.scrollHeight;
  }, [chat?.messages]);

  // Track whether the user is at/near the bottom, so streaming doesn't fight
  // a deliberate scroll up.
  const onThreadScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  if (!chat) return <div className="flex-1" />;

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Conversation header */}
        <header className="relative flex h-14 shrink-0 items-center justify-between px-5">
          {renaming ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                renameChat(chat.id, draft);
                setRenaming(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  renameChat(chat.id, draft);
                  setRenaming(false);
                }
                if (e.key === "Escape") setRenaming(false);
              }}
              className="w-[280px] rounded-lg bg-bg-000 px-2 py-1 text-[15px] font-medium text-text-100 outline-none ring-1 ring-white/20"
            />
          ) : (
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[15px] font-medium text-text-100 transition-colors hover:bg-white/[0.06]"
            >
              <span className="max-w-[280px] truncate">{chat.title}</span>
              <CaretDownIcon className="h-3.5 w-3.5 text-text-400" />
            </button>
          )}

          {menuOpen && (
            <ChatMenu
              chat={chat}
              className="left-4 top-12 z-50"
              onClose={() => setMenuOpen(false)}
              onRename={() => {
                setDraft(chat.title);
                setMenuOpen(false);
                setRenaming(true);
              }}
            />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="cursor-pointer rounded-lg bg-bg-000 px-3.5 py-1.5 text-[14px] font-medium text-text-100 transition-colors hover:bg-white/[0.1]"
            >
              Share
            </button>
            {!incognito && (
              <button
                type="button"
                aria-label="Use incognito"
                onClick={() => {
                  setIncognito(true);
                  router.push("/new");
                }}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-400 transition-colors hover:bg-white/10 hover:text-text-100"
              >
                <GhostIcon />
              </button>
            )}
          </div>
        </header>

        {/* Thread */}
        <div
          ref={scrollRef}
          onScroll={onThreadScroll}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="mx-auto flex w-full max-w-[720px] flex-col items-center px-6 pt-4">
            <ChatThread
              messages={chat.messages}
              activeArtifactId={artifact?.id ?? null}
              onOpenArtifact={setArtifact}
            />
          </div>
        </div>

        {/* Composer dock */}
        <div className="shrink-0 pb-3">
          <div className="mx-auto flex w-full max-w-[720px] flex-col items-center px-6">
            {generating && (
              <button
                type="button"
                className="mb-3 cursor-pointer rounded-lg bg-bg-000 px-3 py-1.5 text-[14px] font-medium text-text-100 shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-colors hover:bg-white/[0.1]"
              >
                Quick answer
              </button>
            )}

            <Composer
              placeholder="Write a message…"
              generating={generating}
              onSend={send}
              onStop={stop}
              onVoice={() => setVoiceOpen(true)}
            />

            <p className="mt-2.5 text-center text-[12px] text-text-400">
              Claude is AI and can make mistakes. Please double-check responses.
            </p>
          </div>
        </div>
      </div>

      {artifact && (
        <ArtifactPanel artifact={artifact} onClose={() => setArtifact(null)} />
      )}
      {shareOpen && <ShareDialog chat={chat} onClose={() => setShareOpen(false)} />}
      {voiceOpen && <VoiceOverlay onClose={() => setVoiceOpen(false)} />}
    </>
  );
}
