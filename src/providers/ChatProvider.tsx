"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { DUMMY_CHATS } from "@/lib/dummy-data";
import {
  DEFAULT_CHAT_MODEL,
  type ChatModelSelection,
} from "@/lib/chat-models";
import type { Chat, Message } from "@/lib/types";
import { generateId, truncate } from "@/lib/utils";

type ChatApiMessage = {
  role: "user" | "assistant";
  content: string;
};

interface ChatContextValue {
  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | null;
  isSending: boolean;
  selectedModel: ChatModelSelection;
  setSelectedModel: (model: ChatModelSelection) => void;
  setActiveChatId: (id: string | null) => void;
  createNewChat: () => void;
  renameChat: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>(DUMMY_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    DUMMY_CHATS[0]?.id ?? null,
  );
  const [isSending, setIsSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ChatModelSelection>({
    provider: DEFAULT_CHAT_MODEL.provider,
    model: DEFAULT_CHAT_MODEL.model,
  });

  const chatsRef = useRef(chats);
  const activeChatIdRef = useRef(activeChatId);
  const inFlightRef = useRef(false);

  chatsRef.current = chats;
  activeChatIdRef.current = activeChatId;

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: generateId(),
      title: "Percakapan Baru",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }, []);

  const renameChat = useCallback((id: string, title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id
          ? {
              ...chat,
              title: truncate(trimmedTitle, 64),
              updatedAt: new Date(),
            }
          : chat,
      ),
    );
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats((prev) => {
      const filtered = prev.filter((chat) => chat.id !== id);

      if (activeChatIdRef.current === id) {
        setActiveChatId(filtered[0]?.id ?? null);
      }

      return filtered;
    });
  }, []);

  const updateAssistantMessage = useCallback(
    (chatId: string, messageId: string, content: string) => {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== chatId) return chat;

          return {
            ...chat,
            messages: chat.messages.map((message) =>
              message.id === messageId
                ? {
                    ...message,
                    content,
                    isTyping: false,
                  }
                : message,
            ),
            updatedAt: new Date(),
          };
        }),
      );
    },
    [],
  );

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || inFlightRef.current) return;

    inFlightRef.current = true;
    setIsSending(true);

    const now = new Date();
    const currentChatId = activeChatIdRef.current;
    const currentChat = currentChatId
      ? chatsRef.current.find((chat) => chat.id === currentChatId) ?? null
      : null;
    const targetChatId = currentChat?.id ?? generateId();
    const assistantPlaceholderId = `${generateId()}-assistant`;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: trimmed,
      createdAt: now,
    };

    const assistantPlaceholder: Message = {
      id: assistantPlaceholderId,
      role: "assistant",
      content: "",
      createdAt: new Date(),
      isTyping: true,
    };

    const requestMessages = buildRequestMessages(
      currentChat?.messages ?? [],
      trimmed,
    );

    if (currentChat) {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== currentChat.id) return chat;

          const isFirstMessage = chat.messages.length === 0;

          return {
            ...chat,
            title: isFirstMessage ? truncate(trimmed, 42) : chat.title,
            messages: [...chat.messages, userMessage, assistantPlaceholder],
            updatedAt: new Date(),
          };
        }),
      );
    } else {
      const newChat: Chat = {
        id: targetChatId,
        title: truncate(trimmed, 42),
        messages: [userMessage, assistantPlaceholder],
        createdAt: now,
        updatedAt: now,
      };

      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      activeChatIdRef.current = newChat.id;
    }

    let assistantContent = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: requestMessages,
          provider: selectedModel.provider,
          model: selectedModel.model,
        }),
      });

      if (!response.ok) {
        throw new ChatUserFacingError(await readChatError(response));
      }

      if (!response.body) {
        throw new ChatUserFacingError(
          "Layanan chat belum bisa membuka stream jawaban saat ini.",
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        const chunk = value ? decoder.decode(value, { stream: !done }) : "";

        if (chunk) {
          assistantContent += normalizeLineEndings(chunk);
          updateAssistantMessage(
            targetChatId,
            assistantPlaceholderId,
            assistantContent,
          );
        }

        if (done) {
          const finalChunk = decoder.decode();
          if (finalChunk) {
            assistantContent += normalizeLineEndings(finalChunk);
            updateAssistantMessage(
              targetChatId,
              assistantPlaceholderId,
              assistantContent,
            );
          }

          break;
        }
      }

      if (!assistantContent.trim()) {
        updateAssistantMessage(
          targetChatId,
          assistantPlaceholderId,
          "Maaf, model tidak mengirimkan jawaban. Coba kirim ulang pesan Anda.",
        );
      }
    } catch (error) {
      if (!assistantContent.trim()) {
        updateAssistantMessage(
          targetChatId,
          assistantPlaceholderId,
          getUserFacingErrorMessage(error),
        );
      }
    } finally {
      inFlightRef.current = false;
      setIsSending(false);
    }
  }, [selectedModel, updateAssistantMessage]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        activeChat,
        isSending,
        selectedModel,
        setSelectedModel,
        setActiveChatId,
        createNewChat,
        renameChat,
        deleteChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);

  if (!ctx) {
    throw new Error("useChatContext must be used inside <ChatProvider>");
  }

  return ctx;
}

function buildRequestMessages(
  existingMessages: Message[],
  nextUserContent: string,
): ChatApiMessage[] {
  const previousMessages = existingMessages
    .filter((message) => !message.isTyping && message.content.trim())
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

  return [
    ...previousMessages,
    {
      role: "user",
      content: nextUserContent,
    },
  ];
}

async function readChatError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as unknown;

    if (
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
    ) {
      return payload.error;
    }
  } catch {
    return "Layanan chat belum bisa mengirim jawaban saat ini.";
  }

  return "Layanan chat belum bisa mengirim jawaban saat ini.";
}

function getUserFacingErrorMessage(error: unknown): string {
  if (error instanceof ChatUserFacingError && error.message.trim()) {
    return error.message;
  }

  return "Maaf, saya belum bisa menghubungi layanan AI saat ini. Coba lagi sebentar.";
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

class ChatUserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatUserFacingError";
  }
}
