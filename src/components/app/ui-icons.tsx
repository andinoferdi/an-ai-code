import type { CSSProperties, SVGProps } from "react";

/**
 * Anthropicons glyph — renders a codepoint from the real Anthropicons-Variable
 * icon font used by claude.ai (self-hosted at /fonts/anthropicons.woff2).
 * Codepoints extracted from the live DOM.
 */
export function Anticon({
  cp,
  size = 16,
  weight = 400,
  className = "",
  style,
}: {
  cp: string;
  size?: number;
  weight?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={`anticon ${className}`}
      style={{ fontSize: size, fontWeight: weight, ...style }}
    >
      {String.fromCodePoint(parseInt(cp, 16))}
    </span>
  );
}

/** Codepoint map — extracted from claude.ai DOM (span textContent per button). */
export const ICONS = {
  plus: "e001", // New chat / Add files
  send: "e013", // send message arrow-up
  artifacts: "e017",
  designExternal: "e01b", // flask/beta badge on Design row
  caretDown: "e027", // model picker caret
  sectionChevron: "e02a", // section header hover chevron
  chats: "e039",
  code: "e048",
  kebab: "e062", // "More options" on chat rows
  download: "e063", // footer download-apps tray
  groupBy: "e070",
  hoverArrow: "e015", // slide-in arrow on Code/Design hover
  mic: "e0ab",
  design: "e0b8",
  projects: "e0c9",
  search: "e0d3",
  panel: "e0dd", // sidebar open/close
  customize: "e100",
} as const;

/** Incognito ghost — exact SVG extracted from claude.ai (with look-around eyes). */
export function GhostIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="group"
      aria-hidden
      style={{ flexShrink: 0 }}
      {...props}
    >
      <g className="group-hover:animate-[look-around_2.4s_ease-in-out_infinite] group-active:animate-none">
        <path d="M6.99951 8.66672C7.5518 8.66672 7.99951 9.11443 7.99951 9.66672C7.9993 10.2188 7.55166 10.6667 6.99951 10.6667C6.44736 10.6667 5.99973 10.2188 5.99951 9.66672C5.99951 9.11443 6.44723 8.66672 6.99951 8.66672Z" />
        <path d="M12.9995 8.66672C13.5518 8.66672 13.9995 9.11443 13.9995 9.66672C13.9993 10.2188 13.5517 10.6667 12.9995 10.6667C12.4474 10.6667 11.9997 10.2188 11.9995 9.66672C11.9995 9.11443 12.4472 8.66672 12.9995 8.66672Z" />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2C14.326 2.00018 17.9998 5.67403 18 10V17.3123C17.9997 17.5427 17.8411 17.8079 17.6172 17.8623C17.3932 17.9165 17.1614 17.7456 17.0557 17.5408C16.7805 17.007 16.3658 16.5937 16.062 16.2878C15.7793 16.0034 15.4503 15.8338 14.9771 15.8337C14.2092 15.8339 13.4371 16.3862 12.9487 17.53C12.8701 17.7138 12.6887 17.8621 12.4888 17.8623C12.2888 17.8623 12.1076 17.7138 12.0288 17.53C11.5404 16.386 10.7674 15.8339 9.99951 15.8337C9.23161 15.8339 8.45959 16.386 7.97119 17.53C7.89253 17.7138 7.71118 17.8621 7.51123 17.8623C7.31122 17.8623 7.13006 17.7138 7.05127 17.53C6.56296 16.3862 5.78982 15.834 5.02197 15.8337C4.54861 15.8338 4.21974 16.0032 3.93701 16.2878C3.63309 16.5937 3.21952 17.0715 2.94434 17.6055C2.83865 17.8103 2.60589 17.9165 2.38184 17.8623C2.15801 17.8079 2.00033 17.6073 2 17.377V10C2.00018 5.67403 5.67403 2.00018 10 2ZM10 3C6.22631 3.00018 3.00018 6.22631 3 10V15.8633C3.0205 15.8414 3.20696 15.6049 3.22803 15.5837C3.67524 15.1336 4.251 14.8338 5.02197 14.8337C6.03838 14.8341 6.90232 15.4025 7.51025 16.2937C8.11828 15.4018 8.9824 14.8338 9.99951 14.8337C11.0163 14.8338 11.8798 15.4022 12.4878 16.2937C13.0959 15.4018 13.9601 14.8339 14.9771 14.8337C15.7481 14.8338 16.3247 15.1336 16.772 15.5837C16.772 15.5837 16.9796 15.812 17 15.8337V10C16.9998 6.22631 13.7737 3.00018 10 3Z"
      />
    </svg>
  );
}

/** Close / remove X — Phosphor "x" (viewBox 0 0 256 256). */
export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
    </svg>
  );
}

/** Voice mode waveform — exact SVG (6 rounded rects) extracted from claude.ai. */
export function VoiceWaveformIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 21.2 21.2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block overflow-visible"
      aria-hidden
      {...props}
    >
      <rect x="0" y="7.6" height="6" width="1.2" rx="0.6" ry="0.6" fill="currentColor" />
      <rect x="4" y="5.6" height="10" width="1.2" rx="0.6" ry="0.6" fill="currentColor" />
      <rect x="8" y="2.6" height="16" width="1.2" rx="0.6" ry="0.6" fill="currentColor" />
      <rect x="12" y="5.6" height="10" width="1.2" rx="0.6" ry="0.6" fill="currentColor" />
      <rect x="16" y="2.6" height="16" width="1.2" rx="0.6" ry="0.6" fill="currentColor" />
      <rect x="20" y="7.6" height="6" width="1.2" rx="0.6" ry="0.6" fill="currentColor" />
    </svg>
  );
}

/** Account caret-up-down — Phosphor path used by claude.ai footer (viewBox 0 0 256 256). */
export function CaretUpDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z" />
    </svg>
  );
}
