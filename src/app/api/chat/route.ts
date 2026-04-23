import {
  createChatCompletionStream,
  getChatProviderErrorResponse,
  type ChatRequestMessage,
} from "@/lib/chat-stream";
import {
  getChatModelOption,
  isChatProviderId,
  type ChatModelSelection,
} from "@/lib/chat-models";

export const runtime = "nodejs";

type ChatRequestBody = {
  messages?: unknown;
  provider?: unknown;
  model?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await parseRequestBody(request);
    const messages = parseChatMessages(body.messages);
    const selection = parseChatModelSelection(body);

    if (messages.length === 0) {
      return Response.json(
        { error: "Minimal satu pesan diperlukan." },
        { status: 400 },
      );
    }

    const stream = await createChatCompletionStream(selection, messages);

    return new Response(stream, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    const safeError = getChatProviderErrorResponse(error);

    return Response.json(
      { error: safeError.error },
      { status: safeError.status },
    );
  }
}

function parseChatModelSelection(body: ChatRequestBody): ChatModelSelection {
  const { provider, model } = body;

  if (!isChatProviderId(provider) || typeof model !== "string") {
    throw new RequestValidationError("Pilihan model tidak valid.");
  }

  const selection = {
    provider,
    model,
  };

  if (!getChatModelOption(selection)) {
    throw new RequestValidationError("Model tidak tersedia.");
  }

  return selection;
}

async function parseRequestBody(request: Request): Promise<ChatRequestBody> {
  try {
    return (await request.json()) as ChatRequestBody;
  } catch {
    throw new RequestValidationError("Body JSON tidak valid.");
  }
}

function parseChatMessages(messages: unknown): ChatRequestMessage[] {
  if (!Array.isArray(messages)) {
    throw new RequestValidationError("Format pesan tidak valid.");
  }

  return messages
    .map((message) => {
      if (!isRecord(message)) {
        throw new RequestValidationError("Format pesan tidak valid.");
      }

      const { role, content } = message;

      if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
        throw new RequestValidationError("Format pesan tidak valid.");
      }

      const trimmedContent = content.trim();
      if (!trimmedContent) {
        return null;
      }

      return {
        role,
        content: trimmedContent,
      };
    })
    .filter((message): message is ChatRequestMessage => message !== null);
}

class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
