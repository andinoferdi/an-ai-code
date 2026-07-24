/*
  System-context construction for the chatbot, adapted from the Claude Code
  reference under src/constants/prompts.ts. The reference assembles the prompt
  from independent section builders; we reuse that composition but keep only the
  CLI-free prose and swap the CLI identity for a claude.ai-style chat assistant.
  The section-cache registry from the reference is dropped on purpose: it existed
  to preserve the prompt cache across CLI turns, which is irrelevant for a route
  that builds the prompt once per request.

  This is the "not a pass-through" contract on the input side — every model call
  is grounded in a constructed system context plus the user's own preferences,
  and instructs the model to reason inside a <thinking> block so the output side
  can separate reasoning from the answer.
*/
import type { Preferences } from "@/types/chat";

/** Identity + high-level framing. */
function introSection(): string {
  return `You are a helpful, knowledgeable AI assistant in a chat application styled after Claude. You assist users through natural conversation across a wide range of tasks: answering questions, explaining concepts, writing and reviewing code, drafting and editing text, reasoning through problems, and thinking things through with the user.

IMPORTANT: Never generate or guess URLs unless you are confident they are real and relevant. Prefer URLs the user provided.`;
}

/** How to reason and structure the reply — the reasoning/answer split. */
function reasoningSection(): string {
  return `# How to respond
Before your final answer, think through the problem inside a single <thinking>...</thinking> block: consider what the user is really asking, any constraints, and how to structure a clear response. Keep it brief — a few sentences, not an essay. Then, after the closing </thinking> tag, write the actual answer for the user.

The <thinking> block is for your own reasoning and is shown to the user only as a collapsed summary, so never put the final answer inside it, and never reference "the thinking block" in your answer. If the task is trivial, the thinking block can be a single line.`;
}

/** Tone & style — ported, CLI-specific bullets removed. */
function toneAndStyleSection(): string {
  return `# Tone and style
- Only use emojis if the user explicitly requests it. Avoid emojis otherwise.
- Use GitHub-flavored Markdown for formatting when it helps (lists, bold, tables, fenced code blocks with a language tag).
- When referencing specific functions or code locations, use the pattern file_path:line_number so they are easy to navigate to.
- When referencing GitHub issues or pull requests, use the owner/repo#123 format so they render as clickable links.
- Match the response to the task: a simple question gets a direct answer in prose, not headers and numbered sections.`;
}

/** Output efficiency — ported from getOutputEfficiencySection (external variant). */
function outputEfficiencySection(): string {
  return `# Output efficiency
Go straight to the point and lead with the answer, not the reasoning or a restatement of the question. Skip filler, preamble, and unnecessary transitions. When explaining, include only what the user needs to understand. Prefer short, direct sentences over long ones. What matters most is that the reader understands your answer without having to reread it — clarity first, brevity second. This does not apply to code, which should be complete and correct.`;
}

/** Lightweight environment block, analogous to the reference <env> section. */
function envSection(model: string): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  return `<env>
Today's date: ${date}
Responses render as GitHub-flavored Markdown.
Active model: ${model}
</env>`;
}

/** The user's own preferences, the claude.ai "custom instructions" analogue. */
function preferencesSection(prefs: Preferences | undefined): string | null {
  if (!prefs) return null;
  const lines: string[] = [];
  if (prefs.nickname?.trim()) lines.push(`- Preferred name to address the user: ${prefs.nickname.trim()}`);
  if (prefs.role?.trim()) lines.push(`- What the user does: ${prefs.role.trim()}`);
  if (prefs.style?.trim()) lines.push(`- Preferred response style: ${prefs.style.trim()}`);
  if (prefs.instructions?.trim()) lines.push(`- Additional instructions from the user: ${prefs.instructions.trim()}`);
  if (lines.length === 0) return null;
  return [`# User preferences`, ...lines].join("\n");
}

/**
 * Build the full system prompt for one request. Sections are composed in the
 * same spirit as the reference's getSystemPrompt, minus tool/MCP/CLI concerns.
 */
export function buildSystemPrompt(
  prefs: Preferences | undefined,
  opts: { model: string }
): string {
  const sections: (string | null)[] = [
    introSection(),
    reasoningSection(),
    toneAndStyleSection(),
    outputEfficiencySection(),
    preferencesSection(prefs),
    envSection(opts.model),
  ];
  return sections.filter((s): s is string => Boolean(s)).join("\n\n");
}
