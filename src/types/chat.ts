/** Shapes for a rendered conversation turn in the chat thread. */

export type Artifact = {
  id: string;
  title: string;
  /** Shown as the card subtitle and next to the panel title, e.g. "HTML". */
  language: string;
  code: string;
};

/** One line in the assistant's live activity log (spinner / tool / skill rows). */
export type ActivityStep =
  | { kind: "thinking"; label: string }
  | { kind: "skill"; label: string; name: string };

/**
 * A file (or a long pasted block) hanging off a prompt.
 *
 * `url` is a `blob:` object URL, which dies with the page — `dataUrl` is what
 * survives into localStorage so a reloaded conversation still shows its
 * attachments.
 */
export type Attachment =
  | { id: number; kind: "pasted"; text: string }
  | {
      id: number;
      kind: "text";
      name: string;
      text: string;
      ext: string;
      size: number;
    }
  | {
      id: number;
      kind: "image";
      name: string;
      url: string;
      dataUrl?: string;
      size: number;
    }
  | {
      id: number;
      kind: "file";
      name: string;
      url: string;
      dataUrl?: string;
      size: number;
      ext: string;
    };

export type UserMessage = {
  id: string;
  role: "user";
  text: string;
  attachments?: Attachment[];
};

export type AssistantMessage = {
  id: string;
  role: "assistant";
  /** Rows rendered while streaming; the last one keeps its spinner. */
  steps: ActivityStep[];
  /** Collapsed reasoning summary, e.g. "Thought for 1s". Null while thinking. */
  thoughtSummary: string | null;
  /** Final prose. Empty while still streaming. */
  text: string;
  artifact: Artifact | null;
  streaming: boolean;
};

export type Message = UserMessage | AssistantMessage;

/** A saved conversation. Incognito chats carry the flag and are never persisted. */
export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  /** Epoch ms. */
  createdAt: number;
  updatedAt: number;
  starred: boolean;
  projectId: string | null;
  incognito?: boolean;
  /** Set once the user creates a public link from the Share dialog. */
  shared?: boolean;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  updatedAt: number;
  /** Optional chip rendered next to the name, e.g. "Example project". */
  badge?: string;
};

/** Everything the /customize surface writes. */
export type Preferences = {
  nickname: string;
  role: string;
  /** One of the response-style presets, or "custom". */
  style: string;
  instructions: string;
};

/** How the Recents list is bucketed. Mirrors claude.ai's "Group by" menu. */
export type GroupBy = "none" | "date" | "project";
