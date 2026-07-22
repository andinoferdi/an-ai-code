"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Anticon, ICONS } from "./ui-icons";
import {
  PaperclipIcon,
  CameraIcon,
  ProjectIcon,
  SkillsIcon,
  ConnectorsIcon,
  PluginsIcon,
  ResearchIcon,
  GlobeIcon,
} from "./menu-icons";

type Item = {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  submenu?: boolean;
  checked?: boolean;
  onClick?: () => void;
};

export default function PlusMenu({ onAddFiles }: { onAddFiles: () => void }) {
  const [open, setOpen] = useState(false);
  const [webSearch, setWebSearch] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const groups: Item[][] = [
    [
      {
        icon: <PaperclipIcon />,
        label: "Add files or photos",
        shortcut: "Ctrl+U",
        onClick: () => {
          setOpen(false);
          onAddFiles();
        },
      },
      { icon: <CameraIcon />, label: "Take a screenshot" },
      { icon: <ProjectIcon />, label: "Add to project", submenu: true },
    ],
    [
      { icon: <SkillsIcon />, label: "Skills", submenu: true },
      { icon: <ConnectorsIcon />, label: "Connectors", submenu: true },
      { icon: <PluginsIcon />, label: "Add plugins..." },
    ],
    [
      { icon: <ResearchIcon />, label: "Research" },
      {
        icon: <GlobeIcon />,
        label: "Web search",
        checked: webSearch,
        onClick: () => setWebSearch((v) => !v),
      },
    ],
  ];

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label="Add files, connectors, and more"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-000 transition-colors hover:bg-white/[0.06]"
      >
        <Anticon cp={ICONS.plus} size={20} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-50 mb-2 w-[245px] rounded-xl bg-[rgb(56,56,53)] p-1.5 text-sm text-text-100 shadow-[0_0_0_1px_inset_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.32),0_2px_6px_rgba(0,0,0,0.2)]"
        >
          {groups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div className="my-1 h-px bg-white/[0.08]" />}
              {group.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={item.onClick}
                  className="flex h-8 w-full items-center gap-2.5 rounded-lg px-2 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-text-200">
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate text-text-100">
                    {item.label}
                  </span>
                  {item.shortcut && (
                    <span className="text-xs text-text-400">
                      {item.shortcut}
                    </span>
                  )}
                  {item.submenu && (
                    <Anticon
                      cp={ICONS.sectionChevron}
                      size={12}
                      className="text-text-400"
                    />
                  )}
                  {item.checked && (
                    <span className="text-[#4f8ff7]">
                      <CheckIcon />
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      width="16"
      height="16"
      aria-hidden
    >
      <path d="M232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183 215.51 63.51a12 12 0 0 1 17 17z" />
    </svg>
  );
}
