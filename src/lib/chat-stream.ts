import "server-only";

import type { ChatModelSelection } from "@/lib/chat-models";

const REQUEST_TIMEOUT_MS = 30_000;
const CEREBRAS_CHAT_COMPLETIONS_URL =
  "https://api.cerebras.ai/v1/chat/completions";
const OPENROUTER_CHAT_COMPLETIONS_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = [
  "You are a helpful assistant inside a web chat UI.",
  "Respond using simple plain Markdown only.",
  "Headings, lists, bold text, and code fences are allowed.",
  "Do not output HTML.",
  "Do not wrap the response in JSON, XML, or metadata unless the user explicitly asks for that format.",
  "Use the same language as the user when possible.",
].join(" ");

export type ChatRequestMessage = {
  role: "user" | "assistant";
  content: string;
};

type WireMessage = ChatRequestMessage | {
  role: "system";
  content: string;
};

type StreamTarget = ChatModelSelection & {
  apiKey: string;
  url: string;
  headers?: Record<string, string>;
};

type OpenStreamResult = {
  response: Response;
  abort: () => void;
  clearTimeout: () => void;
};

export class ChatProviderConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatProviderConfigError";
  }
}

export class ChatProviderUpstreamError extends Error {
  readonly status?: number;
  readonly retryable: boolean;

  constructor(message: string, options: { status?: number; retryable: boolean }) {
    super(message);
    this.name = "ChatProviderUpstreamError";
    this.status = options.status;
    this.retryable = options.retryable;
  }
}

export async function createChatCompletionStream(
  selection: ChatModelSelection,
  messages: ChatRequestMessage[],
): Promise<ReadableStream<Uint8Array>> {
  const targets = getStreamTargets(selection);
  let lastError: unknown;

  for (const target of targets) {
    let streamResult: OpenStreamResult | null = null;
    let contentIterator: AsyncIterator<string> | null = null;

    try {
      streamResult = await openProviderStream(target, messages);
      contentIterator = readProviderContentChunks(
        streamResult.response.body,
      )[Symbol.asyncIterator]();

      const firstChunk = await contentIterator.next();
      streamResult.clearTimeout();

      if (firstChunk.done) {
        throw new ChatProviderUpstreamError(
          "Provider completed without text content.",
          { retryable: true },
        );
      }

      return createPlainTextStream(
        firstChunk.value,
        contentIterator,
        streamResult.abort,
      );
    } catch (error) {
      streamResult?.clearTimeout();
      streamResult?.abort();
      await contentIterator?.return?.();
      lastError = error;

      if (!canFallback(error)) {
        throw error;
      }
    }
  }

  throw toChatProviderError(lastError);
}

export function getChatProviderErrorResponse(error: unknown): {
  error: string;
  status: number;
} {
  if (error instanceof ChatProviderConfigError) {
    return {
      error: error.message,
      status: 500,
    };
  }

  if (error instanceof ChatProviderUpstreamError) {
    return {
      error:
        error.status === 401 || error.status === 403
          ? "Provider AI menolak request. Periksa konfigurasi server."
          : "Provider AI belum bisa mengirim jawaban saat ini. Coba lagi sebentar.",
      status: 502,
    };
  }

  return {
    error: "Layanan chat belum bisa digunakan saat ini. Coba lagi sebentar.",
    status: 500,
  };
}

function getStreamTargets(selection: ChatModelSelection): StreamTarget[] {
  if (selection.provider === "cerebras") {
    return getCerebrasTargets(selection.model);
  }

  return [getOpenRouterTarget(selection.model)];
}

function getCerebrasTargets(selectedModel: string): StreamTarget[] {
  const apiKey = process.env.CEREBRAS_API_KEY?.trim();

  if (!apiKey) {
    throw new ChatProviderConfigError("Konfigurasi Cerebras belum lengkap.");
  }

  const primaryModel = process.env.CEREBRAS_MODEL?.trim();
  const fallbackModels =
    primaryModel && selectedModel === primaryModel
      ? process.env.CEREBRAS_MODEL_FALLBACKS?.split(",")
          .map((model) => model.trim())
          .filter(Boolean) ?? []
      : [];

  return Array.from(new Set([selectedModel, ...fallbackModels])).map((model) => ({
    provider: "cerebras",
    model,
    apiKey,
    url: CEREBRAS_CHAT_COMPLETIONS_URL,
  }));
}

function getOpenRouterTarget(model: string): StreamTarget {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (!apiKey) {
    throw new ChatProviderConfigError("Konfigurasi OpenRouter belum lengkap.");
  }

  return {
    provider: "openrouter",
    model,
    apiKey,
    url: OPENROUTER_CHAT_COMPLETIONS_URL,
    headers: {
      "X-Title": "Folio AI",
    },
  };
}

async function openProviderStream(
  target: StreamTarget,
  messages: ChatRequestMessage[],
): Promise<OpenStreamResult> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(
    () => abortController.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(target.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${target.apiKey}`,
        "Content-Type": "application/json",
        ...target.headers,
      },
      body: JSON.stringify({
        model: target.model,
        messages: buildWireMessages(messages),
        stream: true,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      clearTimeout(timeoutId);
      throw new ChatProviderUpstreamError(
        `${target.provider} returned an error response.`,
        {
          status: response.status,
          retryable: isRetryableStatus(response.status),
        },
      );
    }

    if (!response.body) {
      clearTimeout(timeoutId);
      throw new ChatProviderUpstreamError(
        `${target.provider} returned an empty response body.`,
        { retryable: true },
      );
    }

    return {
      response,
      abort: () => abortController.abort(),
      clearTimeout: () => clearTimeout(timeoutId),
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ChatProviderUpstreamError) {
      throw error;
    }

    throw new ChatProviderUpstreamError(`${target.provider} request failed.`, {
      retryable: true,
    });
  }
}

function buildWireMessages(messages: ChatRequestMessage[]): WireMessage[] {
  return [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];
}

async function* readProviderContentChunks(
  body: ReadableStream<Uint8Array> | null,
): AsyncGenerator<string> {
  if (!body) {
    return;
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (value) {
        buffer += decoder.decode(value, { stream: !done });
        buffer = normalizeLineEndings(buffer);
      }

      let eventBoundary = buffer.indexOf("\n\n");
      while (eventBoundary !== -1) {
        const event = buffer.slice(0, eventBoundary);
        buffer = buffer.slice(eventBoundary + 2);

        const chunk = parseSseContentChunk(event);
        if (chunk === "[DONE]") {
          return;
        }

        if (chunk) {
          yield normalizeLineEndings(chunk);
        }

        eventBoundary = buffer.indexOf("\n\n");
      }

      if (done) {
        break;
      }
    }

    const remainingChunk = parseSseContentChunk(buffer);
    if (remainingChunk && remainingChunk !== "[DONE]") {
      yield normalizeLineEndings(remainingChunk);
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // The stream may already be closed by the upstream provider.
    } finally {
      reader.releaseLock();
    }
  }
}

function parseSseContentChunk(event: string): string | null {
  const data = event
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n")
    .trim();

  if (!data) {
    return null;
  }

  if (data === "[DONE]") {
    return data;
  }

  try {
    const payload = JSON.parse(data) as unknown;
    return getDeltaContent(payload);
  } catch {
    return null;
  }
}

function getDeltaContent(payload: unknown): string | null {
  if (!isRecord(payload) || !Array.isArray(payload.choices)) {
    return null;
  }

  const firstChoice = payload.choices[0];
  if (!isRecord(firstChoice) || !isRecord(firstChoice.delta)) {
    return null;
  }

  return typeof firstChoice.delta.content === "string"
    ? firstChoice.delta.content
    : null;
}

function createPlainTextStream(
  firstChunk: string,
  contentIterator: AsyncIterator<string>,
  abortUpstream: () => void,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(firstChunk));

      try {
        while (true) {
          const nextChunk = await contentIterator.next();
          if (nextChunk.done) break;
          controller.enqueue(encoder.encode(nextChunk.value));
        }
      } catch {
        // The UI keeps partial text if upstream disconnects after streaming starts.
      } finally {
        controller.close();
      }
    },
    async cancel() {
      abortUpstream();
      await contentIterator.return?.();
    },
  });
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function canFallback(error: unknown): boolean {
  return error instanceof ChatProviderUpstreamError && error.retryable;
}

function toChatProviderError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new ChatProviderUpstreamError("Provider request failed.", {
    retryable: false,
  });
}

function isRetryableStatus(status: number): boolean {
  return status === 400 || status === 404 || status === 408 || status === 409 ||
    status === 429 || status >= 500;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
