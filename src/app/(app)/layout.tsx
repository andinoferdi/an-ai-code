import AppShell from "@/components/app/AppShell";
import { ChatStoreProvider, ShellProvider } from "@/lib/chat-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatStoreProvider>
      <ShellProvider>
        <AppShell>{children}</AppShell>
      </ShellProvider>
    </ChatStoreProvider>
  );
}
