import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Chat, ChatGroup } from './types';

// ─────────────────────────────────────────────
// Class utilities
// ─────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────
// ID generation
// ─────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────

export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
}

export function isWithinDays(date: Date, days: number): boolean {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  return date >= threshold;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeDate(date: Date): string {
  if (isToday(date)) return 'Hari ini';
  if (isYesterday(date)) return 'Kemarin';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

// ─────────────────────────────────────────────
// Chat grouping
// ─────────────────────────────────────────────

export function groupChatsByDate(chats: Chat[]): ChatGroup[] {
  const today: Chat[] = [];
  const yesterday: Chat[] = [];
  const lastWeek: Chat[] = [];
  const older: Chat[] = [];

  for (const chat of chats) {
    if (isToday(chat.updatedAt)) {
      today.push(chat);
    } else if (isYesterday(chat.updatedAt)) {
      yesterday.push(chat);
    } else if (isWithinDays(chat.updatedAt, 7)) {
      lastWeek.push(chat);
    } else {
      older.push(chat);
    }
  }

  const groups: ChatGroup[] = [];
  if (today.length > 0)     groups.push({ label: 'Hari Ini',   chats: today });
  if (yesterday.length > 0) groups.push({ label: 'Kemarin',    chats: yesterday });
  if (lastWeek.length > 0)  groups.push({ label: '7 Hari Lalu', chats: lastWeek });
  if (older.length > 0)     groups.push({ label: 'Lebih Lama', chats: older });

  return groups;
}

// ─────────────────────────────────────────────
// Text helpers
// ─────────────────────────────────────────────

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

/** Returns the last message preview for sidebar display */
export function getLastMessagePreview(messages: { content: string; role: string }[]): string {
  if (messages.length === 0) return 'Belum ada pesan';
  const last = messages[messages.length - 1];
  return truncate(last.content, 60);
}
