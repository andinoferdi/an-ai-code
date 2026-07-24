"use client";

/**
 * The chat run hook. Drives the chat store from a real streaming backend
 * (POST /api/chat → OpenRouter, via the processing pipeline in
 * src/lib/pipeline/*). The module's exports and this hook's return shape are
 * unchanged from the original scripted version, so no page/composer/store code
 * has to change — only the body of `send` now talks to the server instead of a
 * timer cascade.
 */

import { useCallback, useRef, useState } from "react";
import { useChatStore } from "@/lib/chat-store";
import { getSelectedModelId } from "@/lib/selected-model";
import { THINKING_LABELS } from "@/components/app/demo-response";
import type { Artifact, Attachment, Message } from "@/types/chat";

/**
 * Short conversation title derived from the first prompt, like claude.ai.
 * A file-only prompt falls back to the attachment's name.
 */
export function deriveTitle(text: string, attachments: Attachment[] = []) {
  const words = text.trim().split(/\s+/).slice(0, 4).join(" ");
  if (words) return words.charAt(0).toUpperCase() + words.slice(1);
  const named = attachments.find((a) => a.kind !== "pasted");
  return named ? named.name : "Untitled";
}

/**
 * Hand-off between `/new` and `/chat/<id>`: the new-chat screen creates the
 * conversation and parks the first prompt here, then navigates; the chat page
 * picks it up on mount and starts the run. Module-level because it must not
 * survive a reload — a refreshed chat should not re-answer itself.
 */
type Pending = { text: string; attachments: Attachment[] };

const pending = new Map<string, Pending>();

export function setPendingPrompt(chatId: string, prompt: Pending) {
  pending.set(chatId, prompt);
}

export function takePendingPrompt(chatId: string) {
  const prompt = pending.get(chatId);
  pending.delete(chatId);
  return prompt;
}

/* ---- wire helpers (OpenAI-style messages for /api/chat) ---- */

type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image_url"; image_url: { url: string } };
type WireMessage = { role: "user" | "assistant"; content: string | (TextPart | ImagePart)[] };

/** Inline text attachments into the prompt; pass images as vision parts. */
function userContent(text: string, attachments: Attachment[]): string | (TextPart | ImagePart)[] {
  const textPieces: string[] = [];
  const images: ImagePart[] = [];

  for (const a of attachments) {
    if (a.kind === "pasted") textPieces.push(a.text);
    else if (a.kind === "text") textPieces.push(`[Attached file: ${a.name}]\n${a.text}`);
    else if (a.kind === "image" && a.dataUrl) images.push({ type: "image_url", image_url: { url: a.dataUrl } });
  }

  const combined = [text, ...textPieces].filter(Boolean).join("\n\n");
  if (images.length === 0) return combined;
  return [{ type: "text", text: combined || "(see image)" }, ...images];
}

/** Build the API history from stored messages, dropping the streaming placeholder. */
function toWireMessages(messages: Message[]): WireMessage[] {
  const wire: WireMessage[] = [];
  for (const m of messages) {
    if (m.role === "user") {
      wire.push({ role: "user", content: userContent(m.text, m.attachments ?? []) });
    } else if (!m.streaming && m.text.trim()) {
      wire.push({ role: "assistant", content: m.text });
    }
  }
  return wire;
}

type ServerEvent =
  | { type: "meta"; model: string }
  | { type: "reasoning"; text: string }
  | { type: "token"; text: string }
  | { type: "done"; model: string; text: string; thoughtSummary: string | null; artifact: Artifact | null }
  | { type: "error"; error: string };

export function useDemoRun(chatId: string) {
  const { appendMessages, patchLastAssistant, renameChat, getChat, prefs } = useChatStore();
  const [generating, setGenerating] = useState(false);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setGenerating(false);
    patchLastAssistant(chatId, { streaming: false });
  }, [chatId, patchLastAssistant]);

  const send = useCallback(
    async (text: string, attachments: Attachment[] = []) => {
      abortRef.current?.abort();
      const patch = (p: Parameters<typeof patchLastAssistant>[1]) =>
        patchLastAssistant(chatId, p);

      const chat = getChat(chatId);
      const priorMessages = chat?.messages ?? [];
      if (!chat || priorMessages.length === 0)
        renameChat(chatId, deriveTitle(text, attachments));

      const turnId = String(Date.now());
      appendMessages(chatId, [
        {
          id: turnId + "-u",
          role: "user",
          text,
          ...(attachments.length > 0 && { attachments }),
        },
        {
          id: turnId + "-a",
          role: "assistant",
          steps: [{ kind: "thinking", label: THINKING_LABELS[0] }],
          thoughtSummary: null,
          text: "",
          artifact: null,
          streaming: true,
        },
      ]);
      setGenerating(true);

      // Build history from the settled prior messages plus this turn's user
      // message. We can't re-read getChat() here: the store is React state, so
      // the messages just appended aren't visible synchronously in this closure.
      const history: WireMessage[] = [
        ...toWireMessages(priorMessages),
        { role: "user", content: userContent(text, attachments) },
      ];

      const controller = new AbortController();
      abortRef.current = controller;
      const startedAt = Date.now();

      let answer = "";
      let reasoning = "";
      let collapsed = false;

      // Collapse the thinking step into a summary line once the answer begins,
      // mirroring the original UI's thinking → summary → prose flow.
      const collapseThinking = () => {
        if (collapsed) return;
        collapsed = true;
        const summary = reasoning.replace(/\s+/g, " ").trim();
        patch({
          thoughtSummary: summary
            ? summary.slice(0, 120) + (summary.length > 120 ? "…" : "")
            : `Thought for ${Math.max(1, Math.round((Date.now() - startedAt) / 1000))}s`,
        });
      };

      const handle = (event: ServerEvent) => {
        if (event.type === "reasoning") {
          reasoning += event.text;
          const i = Math.min(
            THINKING_LABELS.length - 1,
            Math.floor(reasoning.length / 80)
          );
          patch({ steps: [{ kind: "thinking", label: THINKING_LABELS[i] }] });
        } else if (event.type === "token") {
          collapseThinking();
          answer += event.text;
          patch({ text: answer });
        } else if (event.type === "done") {
          const finalSummary =
            event.thoughtSummary ??
            `Thought for ${Math.max(1, Math.round((Date.now() - startedAt) / 1000))}s`;
          patch({
            text: event.text,
            thoughtSummary: finalSummary,
            streaming: false,
            artifact: event.artifact,
          });
          if (event.artifact) setArtifact(event.artifact);
        } else if (event.type === "error") {
          collapseThinking();
          patch({
            text: answer || `Sorry — ${event.error}`,
            streaming: false,
          });
        }
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            preferences: prefs,
            model: getSelectedModelId(),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          patch({ text: "Sorry — the assistant is unavailable right now.", streaming: false });
          setGenerating(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let boundary = buffer.indexOf("\n\n");
          while (boundary !== -1) {
            const record = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const data = record
              .split("\n")
              .filter((l) => l.startsWith("data:"))
              .map((l) => l.slice(5).trim())
              .join("");
            if (data) {
              try {
                handle(JSON.parse(data) as ServerEvent);
              } catch {
                // ignore malformed frame
              }
            }
            boundary = buffer.indexOf("\n\n");
          }
        }
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          patch({
            text: answer || "Sorry — something went wrong reaching the assistant.",
            streaming: false,
          });
        }
      } finally {
        // Ensure the message is never left stuck in the streaming state.
        patch({ streaming: false });
        if (abortRef.current === controller) abortRef.current = null;
        setGenerating(false);
      }
    },
    [chatId, appendMessages, patchLastAssistant, renameChat, getChat, prefs]
  );

  return { send, stop, generating, artifact, setArtifact };
}
