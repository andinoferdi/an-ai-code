"use client";

/**
 * The scripted assistant. Same timings and copy as the original single-page
 * shell — this just drives the chat store instead of local component state.
 */

import { useCallback, useState } from "react";
import { useChatStore, useTimers } from "@/lib/chat-store";
import { ORBIT_ARTIFACT, THINKING_LABELS } from "@/components/app/demo-response";
import type { Artifact, Attachment } from "@/types/chat";

/** Reply the demo assistant gives for prompts that don't ask for code. */
const PLAIN_REPLY =
  "Hey! Looks like that might've been a typo — what can I help you with?";

const CODE_REPLY =
  'Made you a little generative art toy — a random "orbit generator" with wobbling planets on elliptical paths. Click Reroll for a new random system, or click the canvas to pause/resume.';

const wantsCode = (text: string) =>
  /\b(html|code|app|kode|buat|generate|component|css|js)\b/i.test(text);

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

export function useDemoRun(chatId: string) {
  const { appendMessages, patchLastAssistant, renameChat, getChat } = useChatStore();
  const { after, clear } = useTimers();
  const [generating, setGenerating] = useState(false);
  const [artifact, setArtifact] = useState<Artifact | null>(null);

  const stop = useCallback(() => {
    clear();
    setGenerating(false);
    patchLastAssistant(chatId, { streaming: false });
  }, [chatId, clear, patchLastAssistant]);

  const send = useCallback(
    (text: string, attachments: Attachment[] = []) => {
      clear();
      const turnId = String(Date.now());
      const code = wantsCode(text);
      const patch = (p: Parameters<typeof patchLastAssistant>[1]) =>
        patchLastAssistant(chatId, p);

      const chat = getChat(chatId);
      if (!chat || chat.messages.length === 0)
        renameChat(chatId, deriveTitle(text, attachments));

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

      // 1. Spinner caption swaps while Claude works.
      after(1100, () =>
        patch({
          steps: [
            { kind: "thinking", label: code ? THINKING_LABELS[1] : THINKING_LABELS[0] },
          ],
        })
      );

      // 2. Skill-loaded row appears under the spinner (code prompts only).
      if (code) {
        after(1700, () =>
          patch({
            steps: [
              { kind: "thinking", label: THINKING_LABELS[1] },
              { kind: "skill", label: "Loaded frontend-design", name: "skill" },
            ],
          })
        );
      }

      // 3. Activity rows collapse into a reasoning summary, then prose streams.
      const replyAt = code ? 2900 : 1900;
      const reply = code ? CODE_REPLY : PLAIN_REPLY;
      const summary = code
        ? "Devised interactive generative art with randomized shapes and gradients"
        : "Thought for 1s";

      after(replyAt, () => {
        patch({ streaming: false, thoughtSummary: summary });

        const words = reply.split(" ");
        words.forEach((_, i) => {
          after(replyAt + 22 * i, () => patch({ text: words.slice(0, i + 1).join(" ") }));
        });

        const done = replyAt + 22 * words.length + 200;
        if (code) {
          after(done, () => {
            patch({ artifact: ORBIT_ARTIFACT });
            setArtifact(ORBIT_ARTIFACT);
          });
        }
        after(done + 60, () => setGenerating(false));
      });
    },
    [chatId, after, clear, appendMessages, patchLastAssistant, renameChat, getChat]
  );

  return { send, stop, generating, artifact, setArtifact };
}
