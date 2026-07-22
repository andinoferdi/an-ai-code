"use client";

import { useRouter } from "next/navigation";
import Composer from "@/components/app/Composer";
import { StarburstIcon } from "@/components/icons";
import { GhostIcon } from "@/components/app/ui-icons";
import { useChatStore, useShell } from "@/lib/chat-store";
import { setPendingPrompt } from "@/lib/use-demo-run";
import type { Attachment } from "@/types/chat";

/** New-chat screen: greeting + composer, deliberately free of conversation chrome. */
export default function NewChatPage() {
  const { createChat } = useChatStore();
  const { incognito, setIncognito } = useShell();
  const router = useRouter();

  function send(text: string, attachments: Attachment[]) {
    const id = createChat({ incognito });
    setPendingPrompt(id, { text, attachments });
    router.push(`/chat/${id}`);
  }

  return (
    <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto">
      {!incognito && (
        <button
          type="button"
          aria-label="Use incognito"
          onClick={() => setIncognito(true)}
          className="group absolute right-5 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-400 transition-colors hover:bg-white/10 hover:text-text-100"
        >
          <GhostIcon />
        </button>
      )}

      <main className="flex flex-1 flex-col items-center pt-[calc(10vh+4.5rem)] md:pt-[calc(20vh+4.5rem)]">
        <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-8 px-6 max-md:pt-4">
          <div className="flex w-full items-center justify-center gap-3">
            <StarburstIcon className="inline-block h-8 w-8 shrink-0 select-none text-clay" />
            <span className="select-none whitespace-nowrap font-serif text-[40px] font-light leading-tight text-text-200">
              {incognito ? "You’re incognito" : "Burning the midnight tokens"}
            </span>
          </div>

          <Composer onSend={send} />

          {incognito && (
            <p className="-mt-2 px-2 text-center text-[14px] leading-[21px] text-text-400">
              <span className="block">
                Incognito chats aren’t saved to history or used to train models.
              </span>
              <span className="block">
                <a href="#" className="underline underline-offset-2">
                  Learn more
                </a>{" "}
                about how your data is used.
              </span>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
