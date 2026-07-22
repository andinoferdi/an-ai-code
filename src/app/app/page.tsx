"use client";

import { useState } from "react";
import Sidebar from "@/components/app/Sidebar";
import Composer from "@/components/app/Composer";
import { StarburstIcon } from "@/components/icons";
import { GhostIcon } from "@/components/app/ui-icons";

export default function AppShellPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-bg-100 text-text-100">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />

      {/* Top-right incognito button */}
      <button
        type="button"
        aria-label="Use incognito"
        className="group fixed right-5 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-md text-text-400 transition-colors hover:bg-white/10 hover:text-text-100"
      >
        <GhostIcon />
      </button>

      {/* Main */}
      {/* Real layout: content starts at 20vh from top (pt-[10vh] md:pt-[20vh]), not vertically centered */}
      <main
        className={`flex min-h-screen flex-col items-center pt-[calc(10vh+4.5rem)] md:pt-[calc(20vh+4.5rem)] transition-[padding] duration-200 ${
          sidebarOpen ? "pl-72" : "pl-12"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-8 px-6 max-md:pt-4">
          {/* Greeting */}
          <div className="flex w-full items-center justify-center gap-3">
            <StarburstIcon className="inline-block h-8 w-8 shrink-0 select-none text-clay" />
            <span className="whitespace-nowrap select-none font-serif text-[40px] font-light leading-tight text-text-200">
              Burning the midnight tokens
            </span>
          </div>

          {/* Composer */}
          <Composer />
        </div>
      </main>
    </div>
  );
}
