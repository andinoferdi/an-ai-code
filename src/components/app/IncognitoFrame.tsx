"use client";

import type { SVGProps } from "react";
import { XIcon } from "@/components/app/ui-icons";

/**
 * Filled ghost used in the incognito title bar. Unlike the outline GhostIcon in
 * the normal header, this one double-blinks on hover: a second eyeless copy of
 * the body is stacked on top and faded in twice per cycle.
 */
export function GhostFilledIcon(props: SVGProps<SVGSVGElement>) {
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2C14.4183 2 18 5.58172 18 10V17.333C18 17.6404 17.7899 17.9087 17.4912 17.9814C17.1925 18.0539 16.8824 17.9125 16.7412 17.6396C16.4654 17.1046 16.2278 16.6907 15.9443 16.4053C15.6891 16.1486 15.4011 16.0001 14.9775 16C14.3 16.0002 13.5743 16.4876 13.1016 17.5947C12.9967 17.8403 12.7553 18 12.4883 18C12.2214 17.9998 11.9798 17.8402 11.875 17.5947C11.4021 16.4874 10.6776 16 10 16C9.32238 16 8.59794 16.4874 8.125 17.5947C8.02021 17.8402 7.77857 17.9998 7.51172 18C7.24472 18 7.0033 17.8403 6.89844 17.5947C6.42567 16.4876 5.70001 16.0002 5.02246 16C4.59894 16.0001 4.31088 16.1486 4.05566 16.4053C3.7722 16.6907 3.53456 17.1046 3.25879 17.6396C3.11763 17.9125 2.80745 18.0539 2.50879 17.9814C2.21014 17.9087 2 17.6404 2 17.333V10C2 5.58172 5.58172 2 10 2ZM7 8.66699C6.44772 8.66699 6 9.11471 6 9.66699C6.00021 10.2191 6.44785 10.667 7 10.667C7.55215 10.667 7.99979 10.2191 8 9.66699C8 9.11471 7.55228 8.66699 7 8.66699ZM13 8.66699C12.4477 8.66699 12 9.11471 12 9.66699C12.0002 10.2191 12.4478 10.667 13 10.667C13.5522 10.667 13.9998 10.2191 14 9.66699C14 9.11471 13.5523 8.66699 13 8.66699Z"
      />
      <path
        className="opacity-0 group-hover:animate-[blink_4s_ease-in-out_infinite]"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2C14.4183 2 18 5.58172 18 10V17.333C18 17.6404 17.7899 17.9087 17.4912 17.9814C17.1925 18.0539 16.8824 17.9125 16.7412 17.6396C16.4654 17.1046 16.2278 16.6907 15.9443 16.4053C15.6891 16.1486 15.4011 16.0001 14.9775 16C14.3 16.0002 13.5743 16.4876 13.1016 17.5947C12.9967 17.8403 12.7553 18 12.4883 18C12.2214 17.9998 11.9798 17.8402 11.875 17.5947C11.4021 16.4874 10.6776 16 10 16C9.32238 16 8.59794 16.4874 8.125 17.5947C8.02021 17.8402 7.77857 17.9998 7.51172 18C7.24472 18 7.0033 17.8403 6.89844 17.5947C6.42567 16.4876 5.70001 16.0002 5.02246 16C4.59894 16.0001 4.31088 16.1486 4.05566 16.4053C3.7722 16.6907 3.53456 17.1046 3.25879 17.6396C3.11763 17.9125 2.80745 18.0539 2.50879 17.9814C2.21014 17.9087 2 17.6404 2 17.333V10C2 5.58172 5.58172 2 10 2Z"
      />
    </svg>
  );
}

/**
 * Chrome that wraps the app while incognito is active.
 *
 * The light border isn't a scrim or a modal — it's a single fixed div inset
 * 50px/8px/8px/8px with a 100px shadow *spread* in the light surface colour.
 * The div paints nothing itself; the spread floods everything outside its
 * rounded rect, which is what carves the dark app out as a rounded window.
 */
export default function IncognitoFrame({ onExit }: { onExit: () => void }) {
  return (
    <>
      {/* Sits above the frame: the frame's 100px shadow spread would cover it. */}
      <div className="draggable fixed left-0 right-0 top-[10px] z-30 flex h-8 items-center gap-2 py-1.5 pl-5 pr-2 text-bg-000">
        <GhostFilledIcon />
        <span className="select-none text-[14px] leading-5">Incognito chat</span>

        <button
          type="button"
          aria-label="Exit incognito"
          onClick={onExit}
          className="ml-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-black/10"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="pointer-events-none fixed inset-[50px_8px_8px_8px] z-20 rounded-2xl shadow-[0_0_0_100px_hsl(var(--text-000))]" />
    </>
  );
}
