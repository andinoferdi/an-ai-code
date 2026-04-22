"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ChatContainer } from "@/components/chat/ChatContainer";

export function AppShell() {
  // Mobile: overlay behavior (starts closed)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Desktop: in-flow panel (starts open)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--app-bg)]">
      {/* ── Sidebar ──────────────────────────────── */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        desktopOpen={desktopSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onDesktopClose={() => setDesktopSidebarOpen((v) => !v)}
      />

      {/* ── Main area ─────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        <Header
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <ChatContainer />
      </div>
    </div>
  );
}
