// ─────────────────────────────────────────────
// Core domain types
// ─────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
  /** Present only for the in-flight assistant typing indicator */
  isTyping?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
// UI helper types
// ─────────────────────────────────────────────

export interface ChatGroup {
  label: string;
  chats: Chat[];
}

export type SidebarState = 'open' | 'closed';
