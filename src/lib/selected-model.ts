/*
  The user's chosen OpenRouter model, shared between the model picker (writer)
  and the chat run hook (reader) via localStorage so neither has to know about
  the other. "auto" means: let the server pick the newest free model.

  Stores BOTH the id and its label so the picker's trigger can show the chosen
  model's name immediately, without needing the (lazily fetched) model list to
  resolve id → label. Exposed as an external store read with useSyncExternalStore;
  the snapshot is cached (stable reference) so React doesn't loop.
*/
const KEY = "claude-clone:model";

export type ModelChoice = { id: string; label: string };

const DEFAULT: ModelChoice = { id: "auto", label: "Auto" };

let cache: ModelChoice | null = null;
const listeners = new Set<() => void>();

function load(): ModelChoice {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<ModelChoice>;
      if (p && typeof p.id === "string" && typeof p.label === "string") {
        return { id: p.id, label: p.label };
      }
    }
  } catch {
    /* fall through to default */
  }
  return DEFAULT;
}

export function getSelectedModel(): ModelChoice {
  if (cache === null) cache = load();
  return cache;
}

export function getSelectedModelId(): string {
  return getSelectedModel().id;
}

export function getServerSelectedModel(): ModelChoice {
  return DEFAULT;
}

export function setSelectedModel(choice: ModelChoice): void {
  cache = choice;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(choice));
  }
  listeners.forEach((l) => l());
}

export function subscribeSelectedModel(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = load();
      cb();
    }
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}
