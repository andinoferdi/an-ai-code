# claude.ai Feature Inventory

Enumerated live via browser-harness (CDP) against an authenticated session.
First sweep 2026-07-22 at 1106×746; second sweep the same day at 1136×746 covering
the list pages, the chat menu, Share and Settings.

## Routes
| claude.ai | In clone? |
|---|---|
| `/new` | ✅ `/new` (`/app` now redirects here) |
| `/recents` (Chats) | ✅ built |
| `/projects` | ✅ built |
| `/artifacts` | ✅ built |
| `/customize` | ✅ — **it isn't a page.** Clicking Customize opens the Settings modal. |
| `/chat/<uuid>` | ✅ real routing, chats persist in `localStorage` |
| `/code`, `/design?via=web_sidebar_products` | ➖ separate products; sidebar links out |

## Interactive surfaces
| Surface | Handle | Status |
|---|---|---|
| Sidebar nav + collapse rail | `pin-sidebar-toggle` | ✅ |
| Composer + attachments | `chat-input`, `file-upload` | ✅ cards, 400ms fade-in, drag/paste, and attachments carried into the sent message — spec: `components/attachments.spec.md`. PDF page previews are the one gap. |
| Model picker | `model-selector-dropdown` | ✅ |
| Plus / "Add files, connectors, and more" | — | ✅ |
| Chat thread, thinking rows, message actions | — | ✅ |
| Artifact panel | — | ✅ |
| Incognito mode | `Use incognito` | ✅ — never written to localStorage |
| Search chats and projects | `Search` | ✅ searches real chats + projects, navigates on Enter |
| Account menu | `user-menu-button` | ✅ — Settings item wired |
| Chat menu (title caret **and** row kebab) | `More options for <title>` | ✅ Star / Mark as unread / Rename / Add to project / Delete |
| Recents "Group by" | `Group by` | ✅ None / Date / Project, in the sidebar and on `/recents` |
| Share dialog | `Share` | ✅ private ↔ public link, copy to clipboard |
| Settings | `Ctrl+⇧+,` | ✅ 960×720 modal, 12 rail items, General/Account/Privacy panels live |
| Voice mode | `Use voice mode` | ⚠️ overlay built, but **not** extracted from the real site — see below |
| `/recents` "Select chats" | — | ⚠️ toggles checkboxes; no bulk actions behind them |

Component specs: `components/list-pages.spec.md`, `components/menus-and-dialogs.spec.md`,
`components/search-dialog.spec.md`, `components/user-menu.spec.md`.

## Clone architecture

- `src/lib/chat-store.tsx` — `ChatStoreProvider` (chats/projects/preferences,
  mirrored to `localStorage["claude-clone:v1"]`) and `ShellProvider` (sidebar
  collapse, incognito, Settings, the `Ctrl+Shift+,` listener).
- `src/app/(app)/layout.tsx` → `AppShell` renders the sidebar, the content
  gutter and the Settings modal for every route in the group.
- `src/lib/use-demo-run.ts` — the scripted assistant, plus the `/new` →
  `/chat/<id>` prompt hand-off.
- `src/components/app/ui.tsx` — the shared surface tokens (`SURFACE`, `Menu`,
  `Modal`, `PageHeader`, `SearchField`, `relativeTime`).

## Extraction gotchas (durable)

- **Ctrl+K does not open search** on claude.ai — it focuses the composer. The
  only trigger found is the sidebar search icon.
- **Radix-style menus open on `pointerdown`, not `click`.** `element.click()`
  and coordinate clicks both failed on the *first* sweep; on the second sweep a
  plain `click_at_xy` on the title caret and on the Share button worked fine.
  Try coordinates first, and capture everything you need on the first open.
- **`browser-harness`'s `js()` shares one global scope across calls**, so a bare
  `const x = …` throws on the second call. Wrap extraction snippets in an IIFE.
  Regex literals inside those snippets also break the shell quoting — use
  `String.fromCharCode(10)` instead of `\n`, and avoid `/…/` where possible.
- **Screenshots are at DPR 1.25 on this machine.** Divide screenshot pixel
  coordinates by 1.25 before passing them to `click_at_xy`, which takes CSS px.
- **`goto_url` to `/artifacts` reliably timed out** while the page hydrated;
  clicking the sidebar row instead worked every time.
- `/recents` is a real `<table>`; `/projects` and `/artifacts` are card grids.
  The click target on a Recents row is an absolutely-positioned `<a data-primary>`
  overlay, not the row itself.
- The **Settings modal is reachable from two places** — the sidebar's Customize
  row and the account menu — and defaults to the *Skills* panel, not General.

## Not attempted

- **Voice mode overlay**: opening it prompts for microphone access, so it was
  deliberately left uncaptured. The clone's `VoiceOverlay` is built from the
  button affordances only and never touches the mic.
- **PDF first-page previews**: claude.ai renders these server-side. Chrome's PDF
  plugin refuses to paint inside a blob-URL iframe, so there is no zero-dependency
  client-side equivalent — see `components/attachments.spec.md`. Would need
  `pdfjs-dist`.
- Responsive sweep (768px / 390px) and an asset-download script. The clone is
  desktop-only so far.
