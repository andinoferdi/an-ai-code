/*
  Server-only OpenRouter model helpers. The free-model list is fetched live from
  OpenRouter and cached for an hour, so new free models appear automatically
  without any code change. Filtering and the auto-pick both run here so the model
  chain the route builds is always drawn from currently-free models.

  Adapted from the andinoferdi-portfolio reference implementation.
*/
const MODELS_URL = "https://openrouter.ai/api/v1/models";
const CACHE_SECONDS = 3600;

/* Models whose job is not general chat (moderation / safety / guardrails).
   Kept out of the "Auto" pick so newest-good stays a usable assistant. */
const NON_CHAT = /(content-safety|guardrail|moderation|\bguard\b|\bsafety\b)/i;

const DEFAULT_MODEL =
  process.env.OPENROUTER_MODEL?.trim() || "meta-llama/llama-3.3-70b-instruct:free";
const MAX_CHAIN = 4;

export type FreeModel = {
  id: string;
  label: string;
  vision: boolean;
  created: number;
};

type RawModel = {
  id?: unknown;
  name?: unknown;
  created?: unknown;
  pricing?: { prompt?: unknown; completion?: unknown };
  architecture?: { input_modalities?: unknown };
};

function isFree(model: RawModel): boolean {
  if (typeof model.id === "string" && model.id.endsWith(":free")) return true;
  const p = model.pricing;
  return Boolean(p && p.prompt === "0" && p.completion === "0");
}

function normalize(model: RawModel): FreeModel | null {
  if (typeof model.id !== "string") return null;
  const modalities = model.architecture?.input_modalities;
  const vision = Array.isArray(modalities) && modalities.includes("image");
  const rawLabel = typeof model.name === "string" ? model.name : model.id;
  return {
    id: model.id,
    label: rawLabel.replace(/\s*\(free\)\s*$/i, "").trim(),
    vision,
    created: Number(model.created) || 0,
  };
}

/* Live list of free models, newest first. Throws if the fetch fails so
   callers can fall back to a pinned default. */
export async function getFreeModels(): Promise<FreeModel[]> {
  const res = await fetch(MODELS_URL, {
    headers: { Accept: "application/json" },
    next: { revalidate: CACHE_SECONDS },
  });
  if (!res.ok) throw new Error(`OpenRouter models fetch failed: ${res.status}`);

  const json = (await res.json()) as { data?: RawModel[] };
  const list = Array.isArray(json.data) ? json.data : [];
  return list
    .filter(isFree)
    .map(normalize)
    .filter((m): m is FreeModel => m !== null)
    .sort((a, b) => b.created - a.created);
}

/* Newest free model that is a general chat model, optionally vision-capable. */
export function pickAutoModel(
  models: FreeModel[],
  opts: { vision?: boolean } = {}
): FreeModel | null {
  const chat = models.filter((m) => !NON_CHAT.test(m.id) && !NON_CHAT.test(m.label));
  const pool = opts.vision ? chat.filter((m) => m.vision) : chat;
  return pool[0] ?? chat[0] ?? models[0] ?? null;
}

/* Fallback chain used only when the live model list can't be fetched. */
function envModelChain(): string[] {
  const fallbacks = (process.env.OPENROUTER_MODEL_FALLBACKS ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return [...new Set([DEFAULT_MODEL, ...fallbacks])];
}

/*
  Resolve the ordered model chain from the live free list. A `requested` model
  is honored only if it is actually in the live free list, so a crafted request
  can never invoke a paid model. When the request carries an image, every model
  in the chain is vision-capable. Falls back to env slugs if the list is
  unavailable. The requested/auto pick leads; the rest of the free list follows
  so a single model being down never kills the request.
*/
export async function resolveModelChain(
  opts: { vision?: boolean; requested?: string } = {}
): Promise<string[]> {
  const needsVision = Boolean(opts.vision);
  let free: FreeModel[];
  try {
    free = await getFreeModels();
  } catch {
    return envModelChain();
  }
  if (free.length === 0) return envModelChain();

  const usable = needsVision ? free.filter((m) => m.vision) : free;
  const chain: string[] = [];

  // Honor an explicit choice only when it is genuinely a free (and, if needed,
  // vision-capable) model. "auto"/unknown falls through to the auto pick.
  const requested = opts.requested?.trim();
  if (
    requested &&
    requested.toLowerCase() !== "auto" &&
    usable.some((m) => m.id === requested)
  ) {
    chain.push(requested);
  }

  const auto = pickAutoModel(free, { vision: needsVision });
  if (auto) chain.push(auto.id);

  for (const model of usable) chain.push(model.id);

  const deduped = [...new Set(chain)].slice(0, MAX_CHAIN);
  return deduped.length ? deduped : envModelChain();
}
