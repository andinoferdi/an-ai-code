/*
  Output-side processing, adapted from the Claude Code reference
  (src/utils/messages.ts). Raw model output is never shown as-is: prompt-scaffold
  XML tags are stripped, the model's reasoning is separated from its answer, and
  a short reasoning summary is derived for the collapsed "thought" UI.

  Two reasoning sources are supported:
    1. Native reasoning — OpenRouter streams `delta.reasoning` separately from
       `delta.content`, so the content is already the clean answer.
    2. Prompted <thinking> — models without native reasoning are asked (see
       system-prompt.ts) to emit a leading <thinking>...</thinking> block inside
       the content. The streaming splitter below routes that block to the
       reasoning channel so it never appears in the answer.
*/

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Nesting-aware tag content extractor. Ported from reference `extractTag`.
 * Returns the content of the first top-level <tagName>...</tagName>, or null.
 */
export function extractTag(html: string, tagName: string): string | null {
  if (!html.trim() || !tagName.trim()) return null;
  const escapedTag = escapeRegExp(tagName);
  const pattern = new RegExp(
    `<${escapedTag}(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`,
    "gi"
  );
  const openingTag = new RegExp(`<${escapedTag}(?:\\s+[^>]*?)?>`, "gi");
  const closingTag = new RegExp(`<\\/${escapedTag}>`, "gi");

  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = pattern.exec(html)) !== null) {
    const content = match[1];
    const beforeMatch = html.slice(lastIndex, match.index);
    let depth = 0;
    openingTag.lastIndex = 0;
    while (openingTag.exec(beforeMatch) !== null) depth++;
    closingTag.lastIndex = 0;
    while (closingTag.exec(beforeMatch) !== null) depth--;
    if (depth === 0 && content) return content;
    lastIndex = match.index + match[0].length;
  }
  return null;
}

/** Strip prompt-scaffold tags a model may echo. Ported from reference. */
const STRIPPED_TAGS_RE =
  /<(commit_analysis|context|function_analysis|pr_analysis)>[\s\S]*?<\/\1>\n?/g;

export function stripPromptXMLTags(content: string): string {
  return content.replace(STRIPPED_TAGS_RE, "").trim();
}

/** Remove any complete <thinking> blocks from a finished answer string. */
function stripThinkingBlocks(content: string): string {
  return content.replace(/<thinking(?:\s+[^>]*)?>[\s\S]*?<\/thinking>/gi, "");
}

/** Condense reasoning into a one-line summary for the collapsed thought UI. */
export function summarizeReasoning(reasoning: string | null | undefined): string | null {
  if (!reasoning) return null;
  const flat = reasoning.replace(/\s+/g, " ").trim();
  if (!flat) return null;
  const firstSentence = flat.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  const base = firstSentence && firstSentence.length >= 20 ? firstSentence : flat;
  return base.length > 140 ? base.slice(0, 139).trimEnd() + "…" : base;
}

const OPEN_THINKING_RE = /<thinking(?:\s+[^>]*)?>/i;
const CLOSE_THINKING = "</thinking>";
const OPEN_PREFIX = "<thinking>";

/**
 * Incremental splitter for the prompted-<thinking> case. Fed the full
 * accumulated `content` each time, it returns the newly-available reasoning and
 * answer text so the route can emit them on separate SSE channels without ever
 * leaking a partial `<thinking>` tag into the answer.
 */
export function createThinkingSplitter() {
  let emittedReasoning = 0;
  let emittedAnswer = 0;

  function split(content: string): { reasoningDelta: string; answerDelta: string } {
    const open = content.match(OPEN_THINKING_RE);

    let reasoning = "";
    let answer = "";

    if (!open) {
      // No opening tag yet. If what we have could still be the start of one,
      // hold back rather than emit a partial "<thi…" as answer.
      const leftTrimmed = content.replace(/^\s+/, "");
      const maybeTag =
        leftTrimmed.length < OPEN_PREFIX.length &&
        OPEN_PREFIX.startsWith(leftTrimmed.toLowerCase());
      answer = maybeTag ? "" : content;
    } else {
      const openEnd = open.index! + open[0].length;
      const before = content.slice(0, open.index!);
      const closeIdx = content.indexOf(CLOSE_THINKING, openEnd);
      if (closeIdx === -1) {
        // Still inside the thinking block.
        reasoning = content.slice(openEnd);
        answer = before;
      } else {
        reasoning = content.slice(openEnd, closeIdx);
        answer = before + content.slice(closeIdx + CLOSE_THINKING.length);
      }
    }

    // Left-trim the answer only before anything has been emitted, so the visible
    // reply doesn't start with the blank line that followed </thinking>.
    if (emittedAnswer === 0) answer = answer.replace(/^\s+/, "");

    const reasoningDelta = reasoning.slice(emittedReasoning);
    const answerDelta = answer.slice(emittedAnswer);
    emittedReasoning = reasoning.length;
    emittedAnswer = answer.length;
    return { reasoningDelta, answerDelta };
  }

  return { split };
}

/**
 * Final processing pass run when the stream ends. Produces the clean answer
 * text and the collapsed reasoning summary for the stored assistant message.
 */
export function processResponse(
  rawContent: string,
  nativeReasoning: string | null
): { text: string; thoughtSummary: string | null } {
  const withoutThinking = stripThinkingBlocks(rawContent);
  const text = stripPromptXMLTags(withoutThinking);
  const inBandThinking = nativeReasoning ? null : extractTag(rawContent, "thinking");
  const thoughtSummary = summarizeReasoning(nativeReasoning ?? inBandThinking);
  return { text, thoughtSummary };
}
