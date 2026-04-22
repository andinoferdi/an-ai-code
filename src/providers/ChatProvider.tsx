'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { Chat, Message } from '@/lib/types';
import { DUMMY_CHATS, DUMMY_RESPONSES } from '@/lib/dummy-data';
import { generateId, truncate } from '@/lib/utils';

// ─────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────

interface ChatContextValue {
  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | null;
  isSending: boolean;
  setActiveChatId: (id: string | null) => void;
  createNewChat: () => void;
  deleteChat: (id: string) => void;
  sendMessage: (content: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats]               = useState<Chat[]>(DUMMY_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(DUMMY_CHATS[0]?.id ?? null);
  const [isSending, setIsSending]       = useState(false);

  // Keep a stable ref for activeChatId inside callbacks
  const activeChatIdRef = useRef(activeChatId);
  activeChatIdRef.current = activeChatId;

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  // ── Create new chat ────────────────────────────

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id:        generateId(),
      title:     'Percakapan Baru',
      messages:  [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }, []);

  // ── Delete chat ────────────────────────────────

  const deleteChat = useCallback((id: string) => {
    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeChatIdRef.current === id) {
        setActiveChatId(filtered[0]?.id ?? null);
      }
      return filtered;
    });
  }, []);

  // ── Send message ───────────────────────────────

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isSending) return;

      setIsSending(true);

      // Determine or create the target chat
      let targetId = activeChatIdRef.current;

      const userMessage: Message = {
        id:        generateId(),
        role:      'user',
        content:   trimmed,
        createdAt: new Date(),
      };

      const typingPlaceholder: Message = {
        id:        generateId() + '-typing',
        role:      'assistant',
        content:   '',
        createdAt: new Date(),
        isTyping:  true,
      };

      if (!targetId) {
        // No active chat → create one on the fly
        const newChat: Chat = {
          id:        generateId(),
          title:     truncate(trimmed, 42),
          messages:  [userMessage, typingPlaceholder],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        activeChatIdRef.current = newChat.id;
        targetId = newChat.id;
      } else {
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id !== targetId) return chat;
            const isFirst = chat.messages.length === 0;
            return {
              ...chat,
              title:     isFirst ? truncate(trimmed, 42) : chat.title,
              messages:  [...chat.messages, userMessage, typingPlaceholder],
              updatedAt: new Date(),
            };
          })
        );
      }

      // Simulate assistant response
      const delay = 1200 + Math.random() * 800;

      setTimeout(() => {
        const responseText =
          DUMMY_RESPONSES[Math.floor(Math.random() * DUMMY_RESPONSES.length)];

        const assistantMessage: Message = {
          id:        generateId(),
          role:      'assistant',
          content:   responseText,
          createdAt: new Date(),
        };

        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id !== targetId) return chat;
            return {
              ...chat,
              messages: [
                ...chat.messages.filter((m) => !m.isTyping),
                assistantMessage,
              ],
              updatedAt: new Date(),
            };
          })
        );

        setIsSending(false);
      }, delay);
    },
    [isSending]
  );

  // ─────────────────────────────────────────────

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        activeChat,
        isSending,
        setActiveChatId,
        createNewChat,
        deleteChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used inside <ChatProvider>');
  }
  return ctx;
}
