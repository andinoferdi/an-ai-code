"use client";

/**
 * "Share chat" — 520px panel with a two-row visibility picker.
 * Spec: docs/research/components/menus-and-dialogs.spec.md
 */

import { useState } from "react";
import { BTN_PRIMARY, CloseButton, Modal } from "./ui";
import { GlobeIcon, LockIcon } from "./menu-icons";
import { useChatStore } from "@/lib/chat-store";
import type { Chat } from "@/types/chat";

function Option({
  icon,
  title,
  subtitle,
  selected,
  first,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  selected: boolean;
  first?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] ${
        first
          ? "rounded-t-xl"
          : "rounded-b-xl border-t-[0.8px] border-[rgba(226,225,218,0.15)]"
      }`}
    >
      <span className="shrink-0 text-text-200">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] leading-5 text-text-000">{title}</span>
        <span className="block text-[14px] leading-5 text-text-200">{subtitle}</span>
      </span>
      {selected && <span className="text-[15px] text-[#4a9eff]">✓</span>}
    </button>
  );
}

export default function ShareDialog({
  chat,
  onClose,
}: {
  chat: Chat;
  onClose: () => void;
}) {
  const { setChatShared } = useChatStore();
  const [pub, setPub] = useState(Boolean(chat.shared));
  const [link, setLink] = useState<string | null>(
    chat.shared ? `https://claude.ai/share/${chat.id}` : null
  );

  return (
    <Modal onClose={onClose} width={520} labelledBy="share-title">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="share-title"
              className="text-[22px] font-semibold leading-[26px] text-white"
            >
              Share chat
            </h2>
            <p className="mt-1 text-[14px] leading-5 text-text-200">
              Only messages up to this point will be shared.
            </p>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        <div className="mt-5 rounded-xl border-[0.8px] border-[rgba(226,225,218,0.15)]">
          <Option
            first
            icon={<LockIcon className="h-5 w-5" />}
            title="Keep private"
            subtitle="Only you have access"
            selected={!pub}
            onClick={() => setPub(false)}
          />
          <Option
            icon={<GlobeIcon className="h-5 w-5" />}
            title="Create public link"
            subtitle="Anyone with the link can view"
            selected={pub}
            onClick={() => setPub(true)}
          />
        </div>

        {link && (
          <p className="mt-4 truncate rounded-lg bg-white/[0.06] px-3 py-2 font-mono text-[13px] text-text-200">
            {link}
          </p>
        )}

        <p className="mt-4 text-[13px] leading-5 text-text-400">
          Don&rsquo;t share personal information or third-party content without
          permission, and see our{" "}
          <a href="#" className="underline underline-offset-2">
            Usage Policy
          </a>
          .
        </p>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            className={BTN_PRIMARY}
            onClick={() => {
              setChatShared(chat.id, pub);
              if (pub) {
                setLink(`https://claude.ai/share/${chat.id}`);
                navigator.clipboard?.writeText(`https://claude.ai/share/${chat.id}`);
              } else {
                setLink(null);
                onClose();
              }
            }}
          >
            {link && pub ? "Copy link" : "Create share link"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
