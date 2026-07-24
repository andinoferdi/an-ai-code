"use client";

import { useState } from "react";
import { XIcon } from "./ui-icons";
import {
  CaretDownIcon,
  CodeBracketsIcon,
  ExpandIcon,
  EyeIcon,
} from "./chat-icons";
import type { Artifact } from "@/types/chat";

export default function ArtifactPanel({
  artifact,
  onClose,
}: {
  artifact: Artifact;
  onClose: () => void;
}) {
  // Only HTML-ish artifacts can be meaningfully previewed in the iframe; for
  // code (PHP, JS, …) the iframe just dumps the source, so default to Code.
  const previewable = /<!doctype html>|<html[\s>]|<svg[\s>]/i.test(artifact.code);
  const [tab, setTab] = useState<"preview" | "code">(
    previewable ? "preview" : "code"
  );
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const lines = artifact.code.split("\n");

  return (
    <aside
      className={`flex flex-col overflow-hidden border-l border-[hsl(var(--border-300)/0.12)] bg-bg-200 ${
        expanded ? "fixed inset-0 z-30 border-l-0" : "h-screen w-1/2 min-w-[420px]"
      }`}
    >
      {/* Header */}
      <header className="flex h-[52px] shrink-0 items-center gap-2 px-3">
        <div className="flex items-center gap-0.5 rounded-lg bg-bg-000 p-0.5">
          <TabButton
            active={tab === "preview"}
            label="Preview"
            onClick={() => setTab("preview")}
          >
            <EyeIcon className="h-[18px] w-[18px]" />
          </TabButton>
          <TabButton
            active={tab === "code"}
            label="Code"
            onClick={() => setTab("code")}
          >
            <CodeBracketsIcon className="h-[18px] w-[18px]" />
          </TabButton>
        </div>

        <div className="ml-1 flex min-w-0 items-baseline gap-1.5">
          <span className="truncate text-[15px] font-medium text-text-100">
            {artifact.title}
          </span>
          <span className="shrink-0 text-[15px] text-text-400">
            · {artifact.language}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <div className="flex items-center overflow-hidden rounded-lg border-[0.8px] border-[hsl(var(--border-300)/0.15)]">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(artifact.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
              className="cursor-pointer px-3 py-1.5 text-[14px] font-medium text-text-100 transition-colors hover:bg-white/[0.06]"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <span className="h-5 w-px bg-[hsl(var(--border-300)/0.15)]" />
            <button
              type="button"
              aria-label="Copy options"
              className="flex h-8 w-7 cursor-pointer items-center justify-center text-text-400 transition-colors hover:bg-white/[0.06] hover:text-text-100"
            >
              <CaretDownIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <IconButton
            label={expanded ? "Collapse" : "Expand"}
            onClick={() => setExpanded((v) => !v)}
          >
            <ExpandIcon className="h-[18px] w-[18px]" />
          </IconButton>
          <IconButton label="Close" onClick={onClose}>
            <XIcon className="h-[18px] w-[18px]" />
          </IconButton>
        </div>
      </header>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "preview" ? (
          <iframe
            title={artifact.title}
            srcDoc={artifact.code}
            sandbox="allow-scripts"
            className="h-full w-full border-0 bg-white"
          />
        ) : (
          <div className="h-full overflow-auto font-mono text-[13px] leading-[1.55]">
            <table className="w-full border-separate border-spacing-0">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="group">
                    <td className="w-12 select-none whitespace-nowrap px-3 text-right align-top text-text-400/60 group-hover:bg-white/[0.03]">
                      {i + 1}
                    </td>
                    <td className="whitespace-pre pr-6 align-top text-text-200 group-hover:bg-white/[0.03]">
                      {line || " "}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </aside>
  );
}

function TabButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-7 w-8 cursor-pointer items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-white/[0.08] text-text-100"
          : "text-text-400 hover:text-text-100"
      }`}
    >
      {children}
    </button>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-400 transition-colors hover:bg-white/[0.06] hover:text-text-100"
    >
      {children}
    </button>
  );
}
