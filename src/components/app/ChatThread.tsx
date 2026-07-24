"use client";

import { useState } from "react";
import { StarburstIcon } from "@/components/icons";
import {
  CodeBracketsIcon,
  CopyIcon,
  EditIcon,
  RetryIcon,
  SkillIcon,
  SpeakerIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "./chat-icons";
import AttachmentCard from "./AttachmentCard";
import Markdown from "./Markdown";
import type {
  ActivityStep,
  Artifact,
  AssistantMessage,
  Message,
  UserMessage,
} from "@/types/chat";

export default function ChatThread({
  messages,
  activeArtifactId,
  onOpenArtifact,
}: {
  messages: Message[];
  activeArtifactId: string | null;
  onOpenArtifact: (a: Artifact) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-6 pb-4">
      {messages.map((m) =>
        m.role === "user" ? (
          <UserBubble key={m.id} message={m} />
        ) : (
          <AssistantTurn
            key={m.id}
            message={m}
            activeArtifactId={activeArtifactId}
            onOpenArtifact={onOpenArtifact}
          />
        )
      )}
    </div>
  );
}

/* ------------------------------- user turn ------------------------------- */

function UserBubble({ message }: { message: UserMessage }) {
  const attachments = message.attachments ?? [];
  return (
    <div className="group flex flex-col items-end gap-1">
      {/* Attachments sit above the bubble, right-aligned — and wrap here, unlike
          the composer row, which scrolls sideways. */}
      {attachments.length > 0 && (
        <div className="mx-0.5 mb-3 flex flex-wrap justify-end gap-2">
          {attachments.map((a) => (
            <AttachmentCard key={a.id} attachment={a} />
          ))}
        </div>
      )}
      {message.text && (
        <div className="max-w-[75%] whitespace-pre-wrap break-words rounded-xl bg-bg-000 px-4 py-2.5 text-base leading-[1.5] text-text-100">
          {message.text}
        </div>
      )}
      <div className="flex items-center gap-1 pr-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <ActionButton label="Retry">
          <RetryIcon className="h-[15px] w-[15px]" />
        </ActionButton>
        <ActionButton label="Edit">
          <EditIcon className="h-[15px] w-[15px]" />
        </ActionButton>
        <ActionButton label="Copy">
          <CopyIcon className="h-[15px] w-[15px]" />
        </ActionButton>
      </div>
    </div>
  );
}

/* ---------------------------- assistant turn ----------------------------- */

function AssistantTurn({
  message,
  activeArtifactId,
  onOpenArtifact,
}: {
  message: AssistantMessage;
  activeArtifactId: string | null;
  onOpenArtifact: (a: Artifact) => void;
}) {
  const { steps, thoughtSummary, text, artifact, streaming } = message;

  return (
    <div className="flex flex-col items-start gap-3">
      {/* Live activity rows — only visible while the turn is streaming */}
      {streaming && steps.length > 0 && (
        <div className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <ActivityRow
              key={i}
              step={step}
              spinning={i === steps.length - 1}
            />
          ))}
        </div>
      )}

      {/* Collapsed reasoning summary */}
      {thoughtSummary && (
        <button
          type="button"
          className="cursor-pointer text-left text-[14px] leading-[1.5] text-text-400 transition-colors hover:text-text-200"
        >
          {thoughtSummary}
        </button>
      )}

      {/* Answer */}
      {text && <Markdown>{text}</Markdown>}

      {artifact && (
        <ArtifactCard
          artifact={artifact}
          active={artifact.id === activeArtifactId}
          onOpen={() => onOpenArtifact(artifact)}
        />
      )}

      {/* Response actions — only once the turn has settled */}
      {!streaming && text && (
        <div className="-ml-1.5 flex items-center gap-0.5">
          <ActionButton label="Copy">
            <CopyIcon className="h-4 w-4" />
          </ActionButton>
          <ActionButton label="Read aloud">
            <SpeakerIcon className="h-4 w-4" />
          </ActionButton>
          <ActionButton label="Good response">
            <ThumbsUpIcon className="h-4 w-4" />
          </ActionButton>
          <ActionButton label="Bad response">
            <ThumbsDownIcon className="h-4 w-4" />
          </ActionButton>
          <ActionButton label="Retry">
            <RetryIcon className="h-4 w-4" />
          </ActionButton>
        </div>
      )}
    </div>
  );
}

function ActivityRow({
  step,
  spinning,
}: {
  step: ActivityStep;
  spinning: boolean;
}) {
  if (step.kind === "thinking") {
    return (
      <div className="flex items-center gap-3">
        <StarburstIcon
          className={`h-[18px] w-[18px] shrink-0 text-clay ${
            spinning ? "animate-[starburst-spin_2.4s_linear_infinite]" : ""
          }`}
        />
        <span className="text-[14px] leading-[1.5] text-text-400">
          {step.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <SkillIcon className="h-[18px] w-[18px] shrink-0 text-text-400" />
      <span className="text-[14px] leading-[1.5] text-text-400">
        {step.label}{" "}
        <span className="underline decoration-text-400/40 underline-offset-2">
          {step.name}
        </span>
      </span>
    </div>
  );
}

/* ----------------------------- artifact card ----------------------------- */

function ArtifactCard({
  artifact,
  active,
  onOpen,
}: {
  artifact: Artifact;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`flex w-full max-w-[440px] cursor-pointer items-center gap-3 rounded-xl border-[0.8px] bg-bg-000 p-3 transition-colors ${
        active
          ? "border-[hsl(var(--border-300)/0.3)]"
          : "border-[hsl(var(--border-300)/0.12)] hover:border-[hsl(var(--border-300)/0.28)]"
      }`}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-[0.8px] border-[hsl(var(--border-300)/0.12)] bg-bg-200 text-text-400">
        <CodeBracketsIcon className="h-6 w-6" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium leading-tight text-text-100">
          {artifact.title}
        </p>
        <p className="mt-1 text-[13px] leading-tight text-text-400">
          Code · {artifact.language}
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          downloadArtifact(artifact);
        }}
        className="shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-[15px] font-medium text-text-100 transition-colors hover:bg-white/[0.06]"
      >
        Download
      </button>
    </div>
  );
}

function downloadArtifact(artifact: Artifact) {
  const blob = new Blob([artifact.code], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${artifact.title.replace(/\s+/g, "-").toLowerCase()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/* -------------------------------- shared --------------------------------- */

function ActionButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        setDone(true);
        setTimeout(() => setDone(false), 900);
      }}
      className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-white/[0.06] ${
        done ? "text-text-100" : "text-text-400 hover:text-text-100"
      }`}
    >
      {children}
    </button>
  );
}
