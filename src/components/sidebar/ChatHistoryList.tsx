"use client";

import { groupChatsByDate } from "@/lib/utils";
import { Chat } from "@/lib/types";
import { ChatHistoryItem } from "./ChatHistoryItem";

interface ChatHistoryListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ChatHistoryList({
  chats,
  activeChatId,
  onSelect,
  onDelete,
}: ChatHistoryListProps) {
  const groups = groupChatsByDate(chats);

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <p className="text-[13px] text-[var(--text-muted)]">
          Belum ada percakapan.
        </p>
        <p className="mt-1 text-[11.5px] text-[var(--text-muted)]">
          Mulai percakapan baru di atas.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section key={group.label}>
          {/* Group label */}
          <p className="mb-1 px-3 text-label-xs text-[var(--text-muted)]">
            {group.label}
          </p>

          {/* Chat items */}
          <div className="flex flex-col gap-px">
            {group.chats.map((chat) => (
              <ChatHistoryItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
