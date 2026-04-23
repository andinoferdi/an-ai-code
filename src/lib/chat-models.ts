export type ChatProviderId = "cerebras" | "openrouter";

export type ChatModelSelection = {
  provider: ChatProviderId;
  model: string;
};

export type ChatModelOption = ChatModelSelection & {
  label: string;
  shortLabel: string;
  description: string;
  badge?: string;
  isDefault?: boolean;
};

export const CHAT_MODEL_OPTIONS: ChatModelOption[] = [
  {
    provider: "cerebras",
    model: "llama3.1-8b",
    label: "Llama 3.1 8B",
    shortLabel: "Llama 3.1",
    description: "Default cepat lewat Cerebras",
    badge: "Fast",
    isDefault: true,
  },
  {
    provider: "openrouter",
    model: "openrouter/free",
    label: "OpenRouter Free",
    shortLabel: "Free",
    description: "Router memilih model gratis",
    badge: "Free",
  },
  {
    provider: "openrouter",
    model: "qwen/qwen3-coder:free",
    label: "Qwen3 Coder",
    shortLabel: "Qwen",
    description: "Model gratis untuk coding",
    badge: "Free",
  },
  {
    provider: "openrouter",
    model: "openai/gpt-oss-20b:free",
    label: "GPT OSS 20B",
    shortLabel: "GPT OSS",
    description: "Open-weight gratis untuk chat cepat",
    badge: "Free",
  },
  {
    provider: "openrouter",
    model: "google/gemma-3-12b-it:free",
    label: "Gemma 3 12B",
    shortLabel: "Gemma",
    description: "Model gratis serbaguna",
    badge: "Free",
  },
];

export const DEFAULT_CHAT_MODEL =
  CHAT_MODEL_OPTIONS.find((model) => model.isDefault) ?? CHAT_MODEL_OPTIONS[0];

export function getChatModelOption(
  selection: ChatModelSelection,
): ChatModelOption | undefined {
  return CHAT_MODEL_OPTIONS.find(
    (option) =>
      option.provider === selection.provider && option.model === selection.model,
  );
}

export function isChatProviderId(value: unknown): value is ChatProviderId {
  return value === "cerebras" || value === "openrouter";
}

export function getModelsByProvider(): Record<ChatProviderId, ChatModelOption[]> {
  return {
    cerebras: CHAT_MODEL_OPTIONS.filter(
      (option) => option.provider === "cerebras",
    ),
    openrouter: CHAT_MODEL_OPTIONS.filter(
      (option) => option.provider === "openrouter",
    ),
  };
}
