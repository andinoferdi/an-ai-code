"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/app/Sidebar";
import IncognitoFrame from "@/components/app/IncognitoFrame";
import SettingsDialog from "@/components/app/SettingsDialog";
import { useShell } from "@/lib/chat-store";

/**
 * Persistent chrome for every route under `(app)`: the sidebar (or the incognito
 * frame that replaces it), the content column's reserved gutter, and the
 * Settings dialog, which claude.ai floats above whatever page you were on.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, incognito, setIncognito, settingsOpen, closeSettings } =
    useShell();
  const router = useRouter();

  // Leaving incognito drops you back on a fresh chat — the incognito thread is
  // never persisted, so there is nothing to return to.
  function exitIncognito() {
    setIncognito(false);
    router.push("/new");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-100 text-text-100">
      {incognito ? <IncognitoFrame onExit={exitIncognito} /> : <Sidebar />}

      <div
        className={`flex min-w-0 flex-1 transition-[padding] duration-200 ${
          incognito ? "pl-0 pb-2 pt-[50px]" : sidebarOpen ? "pl-72" : "pl-12"
        }`}
      >
        {children}
      </div>

      {settingsOpen && <SettingsDialog onClose={closeSettings} />}
    </div>
  );
}
