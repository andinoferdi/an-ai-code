import type { Preferences } from "@/types/chat";
import { resolveModelChain } from "@/lib/pipeline/openrouter";
import { buildSystemPrompt } from "@/lib/pipeline/system-prompt";
import {
  createThinkingSplitter,
  processResponse,
} from "@/lib/pipeline/process-response";
import { extractArtifact } from "@/lib/pipeline/artifacts";

/*
  Chatbot backend. The provider (OpenRouter) is isolated here: the client only
  speaks the SSE contract (meta / reasoning / token / done / error) and never
  sees the API key. Raw model output is not passed through — it is grounded in a
  constructed system context (system-prompt.ts) and, on the way out, split into
  reasoning vs. answer, tag-stripped, and mined for an artifact
  (process-response.ts, artifacts.ts) before the final structured message is
  returned. Model choice is live: the newest free chat model, with a fallback
  chain down the free list if one is unavailable before streaming starts.
*/
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_MESSAGES = 16;
const MAX_TEXT_CHARS = 8000;
const MAX_IMAGES = 4;
const MAX_IMAGE_CHARS = 7_000_000; // ~5MB once base64-encoded
const MAX_TOKENS = 2000;

type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image_url"; image_url: { url: string } };
type Part = TextPart | ImagePart;
type Role = "user" | "assistant";
type WireMessage = { role: Role; content: string | Part[] };

type StreamEvent =
  | { type: "meta"; model: string }
  | { type: "reasoning"; text: string }
  | { type: "token"; text: string }
  | {
      type: "done";
      model: string;
      text: string;
      thoughtSummary: string | null;
      artifact: ReturnType<typeof extractArtifact>["artifact"];
    }
  | { type: "error"; error: string };

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sanitizeContent(content: unknown): string | Part[] | null {
  if (typeof content === "string") {
    const text = content.trim();
    return text ? text.slice(0, MAX_TEXT_CHARS) : null;
  }
  if (!Array.isArray(content)) return null;

  const parts: Part[] = [];
  let imageCount = 0;
  for (const raw of content) {
    if (!raw || typeof raw !== "object") continue;
    const part = raw as Record<string, unknown>;
    if (part.type === "text" && typeof part.text === "string") {
      const text = part.text.trim();
      if (text) parts.push({ type: "text", text: text.slice(0, MAX_TEXT_CHARS) });
    } else if (
      part.type === "image_url" &&
      part.image_url &&
      typeof (part.image_url as { url?: unknown }).url === "string"
    ) {
      if (imageCount >= MAX_IMAGES) continue;
      const url = (part.image_url as { url: string }).url;
      if (!url.startsWith("data:image/") || url.length > MAX_IMAGE_CHARS) continue;
      parts.push({ type: "image_url", image_url: { url } });
      imageCount += 1;
    }
  }
  return parts.length ? parts : null;
}

function sanitizeMessages(input: unknown): WireMessage[] {
  if (!Array.isArray(input)) return [];
  const messages: WireMessage[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const { role, content } = raw as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") continue;
    const clean = sanitizeContent(content);
    if (clean === null) continue;
    messages.push({ role, content: clean });
  }
  return messages.slice(-MAX_MESSAGES);
}

function requestHasImages(messages: WireMessage[]): boolean {
  return messages.some(
    (m) =>
      Array.isArray(m.content) &&
      m.content.some((part) => part.type === "image_url")
  );
}

function sanitizePreferences(input: unknown): Preferences | undefined {
  if (!input || typeof input !== "object") return undefined;
  const p = input as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 1000) : "");
  return {
    nickname: str(p.nickname),
    role: str(p.role),
    style: str(p.style),
    instructions: str(p.instructions),
  };
}

/*
  Parse OpenRouter's OpenAI-style SSE. Content deltas are routed through the
  thinking splitter so a prompted <thinking> block streams on the reasoning
  channel, not the answer; native `delta.reasoning` streams straight through.
  Returns the full raw content and the accumulated native reasoning.
*/
async function pipeOpenRouterStream(
  body: ReadableStream<Uint8Array>,
  emit: (event: StreamEvent) => void
): Promise<{ content: string; reasoning: string }> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const splitter = createThinkingSplitter();
  let buffer = "";
  let content = "";
  let reasoning = "";

  const handle = (line: string) => {
    if (!line.startsWith("data:")) return;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") return;
    try {
      const chunk = JSON.parse(payload) as {
        choices?: { delta?: { content?: string; reasoning?: string } }[];
      };
      const delta = chunk.choices?.[0]?.delta;
      if (!delta) return;

      if (typeof delta.reasoning === "string" && delta.reasoning) {
        reasoning += delta.reasoning;
        emit({ type: "reasoning", text: delta.reasoning });
      }
      if (typeof delta.content === "string" && delta.content) {
        content += delta.content;
        const { reasoningDelta, answerDelta } = splitter.split(content);
        if (reasoningDelta) emit({ type: "reasoning", text: reasoningDelta });
        if (answerDelta) emit({ type: "token", text: answerDelta });
      }
    } catch {
      // Ignore keep-alive comments and partial frames.
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        handle(buffer.slice(0, newline).trim());
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf("\n");
      }
    }
    if (buffer.trim()) handle(buffer.trim());
  } finally {
    reader.releaseLock();
  }

  return { content, reasoning };
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return jsonError("Assistant not configured.", 503);

  let payload: { messages?: unknown; preferences?: unknown; model?: unknown };
  try {
    payload = await req.json();
  } catch {
    return jsonError("Invalid request.", 400);
  }

  const messages = sanitizeMessages(payload.messages);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return jsonError("No question given.", 400);
  }
  const preferences = sanitizePreferences(payload.preferences);
  const requestedModel =
    typeof payload.model === "string" && payload.model.trim()
      ? payload.model.trim()
      : undefined;

  const needsVision = requestHasImages(messages);
  const modelChain = await resolveModelChain({
    vision: needsVision,
    requested: requestedModel,
  });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (event: StreamEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        let streamed = false;

        for (let i = 0; i < modelChain.length; i += 1) {
          const model = modelChain[i];
          const system = buildSystemPrompt(preferences, { model });

          let res: Response;
          try {
            res = await fetch(OPENROUTER_URL, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer":
                  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "Claude Copy",
              },
              body: JSON.stringify({
                model,
                stream: true,
                temperature: 0.4,
                max_tokens: MAX_TOKENS,
                reasoning: { effort: "low" },
                messages: [{ role: "system", content: system }, ...messages],
              }),
              signal: req.signal,
            });
          } catch (error) {
            if (req.signal.aborted) return;
            console.error("[chat] request failed", { model, error });
            continue; // try next model
          }

          // Retriable provider states: model missing / unauthorized / rate-limited.
          if (!res.ok || !res.body) {
            console.error("[chat] provider error", { model, status: res.status });
            const retriable = [401, 402, 403, 404, 429].includes(res.status);
            if (retriable && i < modelChain.length - 1) continue;
            emit({ type: "error", error: "Assistant temporarily unavailable." });
            streamed = true;
            break;
          }

          emit({ type: "meta", model });
          const { content, reasoning } = await pipeOpenRouterStream(res.body, emit);

          if (!content.trim()) {
            emit({ type: "error", error: "Assistant returned an empty response." });
            streamed = true;
            break;
          }

          // Output-side processing: reasoning/answer split, tag strip, artifact.
          const { text: cleanText, thoughtSummary } = processResponse(
            content,
            reasoning.trim() ? reasoning : null
          );
          const { text, artifact } = extractArtifact(cleanText);

          emit({ type: "done", model, text, thoughtSummary, artifact });
          streamed = true;
          break;
        }

        if (!streamed) {
          emit({ type: "error", error: "Assistant temporarily unavailable." });
        }
      } catch (error) {
        if (!req.signal.aborted) {
          console.error("[chat] stream aborted", error);
          emit({ type: "error", error: "Assistant temporarily unavailable." });
        }
      } finally {
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
