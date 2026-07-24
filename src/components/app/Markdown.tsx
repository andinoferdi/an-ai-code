"use client";

/*
  Renders assistant message text as Markdown, styled to match claude.ai:
  serif prose, real headings/lists/tables, inline code pills, and fenced code
  blocks with a header bar (language + copy) and syntax highlighting. Replaces
  the old raw `whitespace-pre-wrap` rendering that showed markdown syntax
  literally (# , **, ``` ).
*/

import { useState, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

type HastNode = { type?: string; value?: string; children?: HastNode[] };

function nodeText(node: HastNode | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(nodeText).join("");
}

function CodeBlock({
  lang,
  raw,
  codeClass,
  children,
}: {
  lang: string;
  raw: string;
  codeClass?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-[hsl(var(--border-300)/0.15)] bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border-300)/0.15)] px-3 py-1.5 font-sans text-[12px] text-text-400">
        <span className="lowercase">{lang || "text"}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(raw);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
          className="cursor-pointer rounded px-1.5 py-0.5 transition-colors hover:bg-white/[0.06] hover:text-text-100"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 text-[13px] leading-[1.55]">
        <code className={`${codeClass ?? ""} font-mono`}>{children}</code>
      </pre>
    </div>
  );
}

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown max-w-full font-serif text-[16px] leading-[1.7] text-text-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: (p) => <h1 className="mb-3 mt-6 text-[22px] font-semibold first:mt-0" {...p} />,
          h2: (p) => <h2 className="mb-2.5 mt-6 text-[19px] font-semibold first:mt-0" {...p} />,
          h3: (p) => <h3 className="mb-2 mt-5 text-[16px] font-semibold first:mt-0" {...p} />,
          p: (p) => <p className="my-3 first:mt-0 last:mb-0" {...p} />,
          ul: (p) => <ul className="my-3 list-disc space-y-1 pl-6" {...p} />,
          ol: (p) => <ol className="my-3 list-decimal space-y-1 pl-6" {...p} />,
          li: (p) => <li className="leading-[1.6] [&>ul]:my-1 [&>ol]:my-1" {...p} />,
          a: (p) => (
            <a className="text-[#4f8ff7] underline underline-offset-2 hover:text-[#7ba9f9]" target="_blank" rel="noreferrer" {...p} />
          ),
          strong: (p) => <strong className="font-semibold" {...p} />,
          em: (p) => <em className="italic" {...p} />,
          hr: () => <hr className="my-6 border-t border-[hsl(var(--border-300)/0.2)]" />,
          blockquote: (p) => (
            <blockquote className="my-3 border-l-2 border-[hsl(var(--border-300)/0.3)] pl-4 text-text-300" {...p} />
          ),
          table: (p) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-[14px]" {...p} />
            </div>
          ),
          th: (p) => (
            <th className="border border-[hsl(var(--border-300)/0.2)] bg-white/[0.03] px-3 py-1.5 text-left font-semibold" {...p} />
          ),
          td: (p) => <td className="border border-[hsl(var(--border-300)/0.15)] px-3 py-1.5" {...p} />,
          code: ({ className, children, node, ...rest }: ComponentPropsWithoutRef<"code"> & { node?: HastNode }) => {
            const raw = nodeText(node);
            const isBlock = /language-/.test(className ?? "") || raw.includes("\n");
            if (!isBlock) {
              return (
                <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.85em] text-text-100" {...rest}>
                  {children}
                </code>
              );
            }
            const lang = /language-(\w+)/.exec(className ?? "")?.[1] ?? "";
            return (
              <CodeBlock lang={lang} raw={raw} codeClass={className}>
                {children}
              </CodeBlock>
            );
          },
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
