"use client";

/**
 * Client-side store backing every route in the app shell.
 *
 * claude.ai keeps conversations on the server; this clone keeps them in React
 * state mirrored to localStorage, which is enough to make the sidebar, /recents,
 * /artifacts and /chat/<id> all agree with each other across a refresh.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Artifact,
  AssistantMessage,
  Chat,
  Message,
  Preferences,
  Project,
} from "@/types/chat";

const STORAGE_KEY = "claude-clone:v1";

const DEFAULT_PREFS: Preferences = {
  nickname: "",
  role: "",
  style: "normal",
  instructions: "",
};

/** Seed projects so /projects isn't empty on a first visit, like claude.ai. */
const SEED_PROJECTS: Project[] = [
  {
    id: "how-to-use-claude",
    name: "How to use Claude",
    description:
      "An example project that also doubles as a how-to guide for using Claude. Chat with it to learn more about how to get the most out of chatting with Claude.",
    updatedAt: Date.UTC(2026, 6, 8),
    badge: "Example project",
  },
];

type Persisted = {
  chats: Chat[];
  projects: Project[];
  prefs: Preferences;
};

type Store = {
  /** Persisted conversations, newest first. Incognito chats are excluded. */
  chats: Chat[];
  /** Every conversation including the live incognito one — used by /chat/<id>. */
  allChats: Chat[];
  starred: Chat[];
  projects: Project[];
  prefs: Preferences;
  /** Every artifact ever produced, newest first, with its originating chat. */
  artifacts: { artifact: Artifact; chat: Chat }[];
  /** False until localStorage has been read, so the first paint can stay blank. */
  hydrated: boolean;

  getChat: (id: string) => Chat | undefined;
  createChat: (opts?: { incognito?: boolean }) => string;
  appendMessages: (id: string, messages: Message[]) => void;
  patchLastAssistant: (id: string, patch: Partial<AssistantMessage>) => void;
  renameChat: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  toggleStar: (id: string) => void;
  setChatProject: (id: string, projectId: string | null) => void;
  setChatShared: (id: string, shared: boolean) => void;
  createProject: (name: string, description: string) => string;
  deleteProject: (id: string) => void;
  setPrefs: (patch: Partial<Preferences>) => void;
};

const StoreContext = createContext<Store | null>(null);

export function useChatStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useChatStore must be used inside ChatStoreProvider");
  return ctx;
}

function readPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    if (!Array.isArray(parsed.chats)) return null;
    return {
      chats: parsed.chats,
      projects: Array.isArray(parsed.projects) ? parsed.projects : SEED_PROJECTS,
      prefs: { ...DEFAULT_PREFS, ...(parsed.prefs ?? {}) },
    };
  } catch {
    return null;
  }
}

/**
 * `blob:` URLs die with the page, so writing one to localStorage just stores a
 * link that will 404 on the next visit. Blanking it lets the attachment card
 * fall back to the inlined `dataUrl` — or, for a PDF, to the document card.
 */
function stripDeadBlobUrls(chat: Chat): Chat {
  if (!chat.messages.some((m) => m.role === "user" && m.attachments?.length))
    return chat;
  return {
    ...chat,
    messages: chat.messages.map((m) =>
      m.role === "user" && m.attachments
        ? {
            ...m,
            attachments: m.attachments.map((a) =>
              a.kind === "image" || a.kind === "file" ? { ...a, url: "" } : a
            ),
          }
        : m
    ),
  };
}

export function ChatStoreProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [prefs, setPrefsState] = useState<Preferences>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  // Read once on mount. This has to be an effect rather than a lazy useState
  // initialiser: localStorage doesn't exist during SSR, so seeding state from it
  // during render would desync the server and client HTML.
  useEffect(() => {
    const saved = readPersisted();
    /* eslint-disable react-hooks/set-state-in-effect */
    if (saved) {
      setChats(saved.chats);
      setProjects(saved.projects);
      setPrefsState(saved.prefs);
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Mirror back, minus anything the user marked incognito.
  useEffect(() => {
    if (!hydrated) return;
    const payload: Persisted = {
      chats: chats.filter((c) => !c.incognito).map(stripDeadBlobUrls),
      projects,
      prefs,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Quota or private-mode failure: the session still works in memory.
    }
  }, [chats, projects, prefs, hydrated]);

  const patchChat = useCallback(
    (id: string, fn: (chat: Chat) => Chat) => {
      setChats((prev) =>
        prev.map((c) => (c.id === id ? { ...fn(c), updatedAt: Date.now() } : c))
      );
    },
    []
  );

  const store = useMemo<Store>(() => {
    const visible = chats.filter((c) => !c.incognito);
    const byRecent = [...visible].sort((a, b) => b.updatedAt - a.updatedAt);

    const artifacts: { artifact: Artifact; chat: Chat }[] = [];
    for (const chat of byRecent) {
      for (const m of chat.messages) {
        if (m.role === "assistant" && m.artifact) {
          artifacts.push({ artifact: m.artifact, chat });
        }
      }
    }

    return {
      chats: byRecent,
      allChats: chats,
      starred: byRecent.filter((c) => c.starred),
      projects,
      prefs,
      artifacts,
      hydrated,

      getChat: (id) => chats.find((c) => c.id === id),

      createChat: (opts) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        setChats((prev) => [
          {
            id,
            // claude.ai shows "Untitled" until a title has been generated.
            title: "Untitled",
            messages: [],
            createdAt: now,
            updatedAt: now,
            starred: false,
            projectId: null,
            incognito: opts?.incognito ?? false,
          },
          ...prev,
        ]);
        return id;
      },

      appendMessages: (id, messages) =>
        patchChat(id, (c) => ({ ...c, messages: [...c.messages, ...messages] })),

      patchLastAssistant: (id, patch) =>
        patchChat(id, (c) => {
          const next = [...c.messages];
          for (let i = next.length - 1; i >= 0; i--) {
            const m = next[i];
            if (m.role === "assistant") {
              next[i] = { ...m, ...patch };
              break;
            }
          }
          return { ...c, messages: next };
        }),

      renameChat: (id, title) =>
        patchChat(id, (c) => ({ ...c, title: title.trim() || c.title })),

      deleteChat: (id) => setChats((prev) => prev.filter((c) => c.id !== id)),

      toggleStar: (id) => patchChat(id, (c) => ({ ...c, starred: !c.starred })),

      setChatProject: (id, projectId) => patchChat(id, (c) => ({ ...c, projectId })),

      setChatShared: (id, shared) => patchChat(id, (c) => ({ ...c, shared })),

      createProject: (name, description) => {
        const id = crypto.randomUUID();
        setProjects((prev) => [
          { id, name, description, updatedAt: Date.now() },
          ...prev,
        ]);
        return id;
      },

      deleteProject: (id) => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setChats((prev) =>
          prev.map((c) => (c.projectId === id ? { ...c, projectId: null } : c))
        );
      },

      setPrefs: (patch) => setPrefsState((prev) => ({ ...prev, ...patch })),
    };
  }, [chats, projects, prefs, hydrated, patchChat]);

  return <StoreContext value={store}>{children}</StoreContext>;
}

/**
 * Shell-wide UI state that isn't part of the persisted data: sidebar collapse,
 * incognito mode, and whether the Settings dialog is open.
 */
type Shell = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  incognito: boolean;
  setIncognito: (on: boolean) => void;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
};

const ShellContext = createContext<Shell | null>(null);

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside ShellProvider");
  return ctx;
}

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [incognito, setIncognito] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Ctrl+Shift+, opens Settings, same as claude.ai.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === ",") {
        e.preventDefault();
        setSettingsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<Shell>(
    () => ({
      sidebarOpen,
      toggleSidebar: () => setSidebarOpen((o) => !o),
      incognito,
      setIncognito,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
    }),
    [sidebarOpen, incognito, settingsOpen]
  );

  return <ShellContext value={value}>{children}</ShellContext>;
}

/**
 * Scheduler for the scripted response.
 *
 * Deliberately *not* cleared on unmount: the timers write to the store, which
 * lives in the layout and outlives any page, so a run keeps going when you
 * navigate away — as it does on claude.ai. Clearing on unmount also broke under
 * Strict Mode, where the dev-only remount cancelled the run before it started.
 */
export function useTimers() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
  return { after, clear };
}
