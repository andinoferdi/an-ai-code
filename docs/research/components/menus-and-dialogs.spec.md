# Menus & dialogs — chat menu, Group by, Share, Settings

Extracted live 2026-07-22 via browser-harness (CDP), authenticated session, viewport
1136×746, DPR 1.25.

## Shared surface tokens

Every floating surface (menu **and** dialog) uses the same shell:

```
background: rgb(56, 56, 53)          /* one step lighter than bg-200 */
border-radius: 12px
box-shadow:
  inset 0 0 0 1px rgba(255,255,255,0.10),
  0 8px 24px rgba(0,0,0,0.32),
  0 2px 6px  rgba(0,0,0,0.20);
```

Dialogs swap the outer shadow for `0 4px 8px rgba(11,11,11,0.08), 0 12px 28px -2px rgba(0,0,0,0.24)`.

Separator: `h-px bg-[rgba(255,255,255,0.10)]`, `margin: 4px 10px`.

## Chat menu — title caret **and** sidebar row kebab

Both triggers open the same menu. Trigger is the caret next to the conversation title
(`[data-testid="chat-title-split"]`) or the `⋮` that appears on a hovered sidebar row.

- Container: `min-width: 128px` (measured 191px), padding 4px, radius 12px.
- Item: h 32px, padding `6px 10px`, radius 8px, gap 8px, **14px** `#fff`.
- Leading glyph 16px; trailing shortcut letter right-aligned, muted.

| Item | Shortcut | Note |
|---|---|---|
| Star | `P` | |
| Mark as unread | `U` | |
| Rename | `R` | |
| Add to project | `›` | opens a submenu |
| — separator — | | |
| Delete | `D` | text `rgb(236, 126, 126)` |

## Group by menu (sidebar Recents section)

Trigger: the slider glyph on the "Recents" section label. Same shell, `min-width: 128px`.

- Muted 12px group label `Group by`.
- Items: **None** (default, blue ✓ on the right), **Date**, **Project**.
- Selected item is `#fff` weight 500; unselected are muted.

## Share dialog

Trigger: `Share` button in the conversation header.

- Panel **520px × auto** (measured 332.4px), radius 12px, centered.
- `<h2>` "Share chat" — sans, **22px / 26px, weight 600**, `#fff`.
- Subtitle "Only messages up to this point will be shared." — 14px muted.
- Close `×` 32px button top-right.
- Option group: one bordered block, radius 12px, containing two rows separated by a
  `0.8px rgba(226,225,218,0.15)` line. Each row is **472px × 64px**, padding `12px 16px`,
  gap 12px:
  - lock glyph · **Keep private** (14px `#f8f8f6`) / *Only you have access* (14px muted)
    · blue ✓ when selected
  - globe glyph · **Create public link** / *Anyone with the link can view*
- Footnote 13px muted: "Don't share personal information or third-party content without
  permission, and see our [Usage Policy](#)." — link underlined.
- Footer right: **Create share link** — h 32px, px 12px, radius 8px, white fill / dark text.

## Settings dialog — this is also what `/customize` opens

Clicking **Customize** in the sidebar opens the Settings modal; there is no separate
`/customize` page.

- Panel `max-width: 960px; max-height: 720px`, radius 12px, background `rgb(44,44,42)`,
  `0.8px solid rgba(255,255,255,0.05)` + inset white/10 ring. Centered with a 16px inset.
- Left nav **192px** wide, background `rgb(26,26,25)`, `gap: 12px`, contains a search
  input at the top (`Search`) then two labelled groups.
- Nav item: `flex h-8 w-full items-center gap-sm rounded px-sm text-left` — 14px,
  colour `#c3c2b7`, hover `bg-fill-ghost-hover` + `#fff`. Active = filled + `#fff`.
- Close `×` top-right of the content pane.

| Group | Items |
|---|---|
| **Settings** | General, Account, Privacy, Billing, Usage, Capabilities, Claude Code, Claude in Chrome |
| **Customize** | Skills *(default selection)*, Connectors, Plugins, Memory |

## Voice mode — **not captured**

The mic and waveform buttons sit at the right of the composer. Triggering either prompts
for microphone permission, so the overlay was deliberately not opened. Implement from the
button affordances only (`Use voice mode`, `Press and hold to record`).
