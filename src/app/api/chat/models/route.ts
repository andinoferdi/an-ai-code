import { getFreeModels, pickAutoModel } from "@/lib/pipeline/openrouter";

/*
  Exposes the live free-model list to the UI model picker. Read-only and public
  (no key needed for OpenRouter's model catalog). Degrades gracefully to an empty
  list so the picker can still offer "Auto" when the catalog can't be fetched.
*/
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const models = await getFreeModels();
    const auto = pickAutoModel(models);
    return Response.json({
      auto: auto ? { id: auto.id, label: auto.label } : null,
      models,
    });
  } catch {
    return Response.json({ auto: null, models: [] });
  }
}
