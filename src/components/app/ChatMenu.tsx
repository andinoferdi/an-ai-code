"use client";

/**
 * The menu behind both the conversation-title caret and the `⋮` on a hovered
 * chat row — claude.ai opens the same one from either trigger.
 * Spec: docs/research/components/menus-and-dialogs.spec.md
 */

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "./ui";
import {
  EyeOffIcon,
  PencilIcon,
  ProjectIcon,
  StarIcon,
  TrashIcon,
} from "./menu-icons";
import { useChatStore } from "@/lib/chat-store";
import type { Chat } from "@/types/chat";

export default function ChatMenu({
  chat,
  onClose,
  onRename,
  className = "left-0 top-full mt-1",
}: {
  chat: Chat;
  onClose: () => void;
  /** Called instead of closing, so the caller can swap in an inline input. */
  onRename: () => void;
  className?: string;
}) {
  const { projects, toggleStar, deleteChat, setChatProject } = useChatStore();
  const [projectsOpen, setProjectsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Menu onClose={onClose} className={className}>
      {projectsOpen ? (
        <>
          <MenuLabel>Add to project</MenuLabel>
          {projects.length === 0 && <MenuLabel>No projects yet</MenuLabel>}
          {projects.map((p) => (
            <MenuItem
              key={p.id}
              icon={<ProjectIcon className="h-4 w-4" />}
              label={p.name}
              checked={chat.projectId === p.id}
              onClick={() => {
                setChatProject(chat.id, chat.projectId === p.id ? null : p.id);
                onClose();
              }}
            />
          ))}
          <MenuSeparator />
          <MenuItem label="Back" onClick={() => setProjectsOpen(false)} />
        </>
      ) : (
        <>
          <MenuItem
            icon={<StarIcon className="h-4 w-4" />}
            label={chat.starred ? "Unstar" : "Star"}
            shortcut="P"
            onClick={() => {
              toggleStar(chat.id);
              onClose();
            }}
          />
          <MenuItem
            icon={<EyeOffIcon className="h-4 w-4" />}
            label="Mark as unread"
            shortcut="U"
            onClick={onClose}
          />
          <MenuItem
            icon={<PencilIcon className="h-4 w-4" />}
            label="Rename"
            shortcut="R"
            onClick={onRename}
          />
          <MenuItem
            icon={<ProjectIcon className="h-4 w-4" />}
            label="Add to project"
            submenu
            onClick={() => setProjectsOpen(true)}
          />
          <MenuSeparator />
          <MenuItem
            icon={<TrashIcon className="h-4 w-4" />}
            label="Delete"
            shortcut="D"
            danger
            onClick={() => {
              const viewing = pathname === `/chat/${chat.id}`;
              deleteChat(chat.id);
              onClose();
              // Only leave the page if the chat you deleted is the one you're in.
              if (viewing) router.push("/new");
            }}
          />
        </>
      )}
    </Menu>
  );
}
