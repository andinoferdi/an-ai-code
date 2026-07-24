/*
  Artifact extraction, claude.ai-style. When an answer contains a substantial,
  self-contained code block, it is lifted out of the message text and into the
  Artifact side-panel (matching the existing UI's `AssistantMessage.artifact`);
  small snippets are left inline as ordinary Markdown code. Only the single
  largest qualifying block is promoted, mirroring how claude.ai surfaces one
  primary artifact per turn.
*/
import type { Artifact } from "@/types/chat";

type Block = { lang: string; code: string; raw: string };

const FENCE_RE = /```([^\n`]*)\n([\s\S]*?)```/g;
const MIN_LINES = 15;

/** Fence language token → display label used for the artifact card. */
const LANG_LABELS: Record<string, string> = {
  html: "HTML",
  svg: "SVG",
  xml: "XML",
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TypeScript",
  css: "CSS",
  python: "Python",
  py: "Python",
};

function looksStandalone(code: string): boolean {
  return /<!doctype html>|<html[\s>]|<svg[\s>]/i.test(code);
}

function labelFor(lang: string): string {
  const key = lang.trim().toLowerCase();
  return LANG_LABELS[key] ?? (key ? key.toUpperCase() : "Code");
}

function titleFor(code: string, label: string): string {
  const htmlTitle = code.match(/<title>\s*([^<]+?)\s*<\/title>/i)?.[1];
  if (htmlTitle) return htmlTitle.trim();
  const h1 = code.match(/<h1[^>]*>\s*([^<]+?)\s*<\/h1>/i)?.[1];
  if (h1) return h1.trim();
  return `${label} document`;
}

/**
 * Pull the primary artifact out of an answer, if any. Returns the possibly
 * shortened text and the extracted artifact (or null when nothing qualifies).
 */
export function extractArtifact(text: string): { text: string; artifact: Artifact | null } {
  const blocks: Block[] = [];
  let m: RegExpExecArray | null;
  FENCE_RE.lastIndex = 0;
  while ((m = FENCE_RE.exec(text)) !== null) {
    blocks.push({ lang: m[1].trim(), code: m[2].replace(/\s+$/, ""), raw: m[0] });
  }
  if (blocks.length === 0) return { text, artifact: null };

  const qualifying = blocks.filter(
    (b) => b.code.split("\n").length >= MIN_LINES || looksStandalone(b.code)
  );
  if (qualifying.length === 0) return { text, artifact: null };

  // Largest by line count becomes the artifact.
  const chosen = qualifying.reduce((a, b) =>
    b.code.split("\n").length > a.code.split("\n").length ? b : a
  );

  const label = labelFor(chosen.lang);
  const artifact: Artifact = {
    id: `artifact-${Date.now()}`,
    title: titleFor(chosen.code, label),
    language: label,
    code: chosen.code,
  };

  // Replace the promoted block with a short inline note so the bubble isn't empty.
  const note = `I've put the ${label} in the artifact panel on the right.`;
  const newText = text.replace(chosen.raw, note).replace(/\n{3,}/g, "\n\n").trim();

  return { text: newText || note, artifact };
}
