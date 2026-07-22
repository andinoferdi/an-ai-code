# SearchDialog Specification

Extracted from live claude.ai on 2026-07-22 via browser-harness (CDP), viewport 1106×746.

## Overview
- **Target file:** `src/components/app/SearchDialog.tsx`
- **Trigger:** Search icon in sidebar header (`aria-label="Search"`). Ctrl+K does NOT open it — it focuses the composer instead.
- **Interaction model:** click-driven modal, keyboard-navigable list

## DOM Structure
```
div.fixed.inset-0                     ← scrim, grid centering
  └ div[role=dialog]                  ← card
      ├ header: search glyph · text input · close X
      └ list: rows (chats then projects)
```

## Computed Styles

### Scrim
- position: fixed; inset: 0
- display: grid; align-items: center; justify-items: center
- background-color: rgba(0, 0, 0, 0.05)  (`hsl(var(--always-black)/0.05)`)
- padding: 16px; md: 40px

### Dialog
- width: 672px; max-width: 672px (`max-w-2xl`)
- background-color: rgb(44, 44, 42)  → `bg-bg-000`
- border-radius: 12px
- border: 0.8px solid rgba(226, 225, 218, 0.3)
- box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25)  (`shadow-2xl`)
- overflow: hidden
- enter animation: `zoom 50ms ease-out forwards`
- measured rect at 1106px viewport: x=217, y=187, w=672, h=338

### Row (list item)
- width: 100%; height: 36px
- padding: 8px 12px
- border-radius: 8px
- display: flex; align-items: center; justify-content: space-between; gap: 12px
- font-size: 14px; font-weight: 400; line-height: 19.6px
- color: rgb(195, 194, 183)  → `text-text-200`
- overflow: truncate
- **Selected row:** class `bg-bg-2*` (darker fill) + trailing hint text `Enter`
- **Unselected rows:** transparent, `hover:bg-*`, trailing text = relative date (`Today`, `Yesterday`) for chats, owner name (`antik`) for projects

## States & Behaviors
- **Open:** scrim + dialog mount, dialog plays `zoom 50ms ease-out`
- **Close:** Escape key, or the X button
- **Selection:** first row is selected on open; trailing label swaps from date → `Enter` on the selected row
- **List scroll:** list area scrolls; 7 rows visible in the captured state with a visible scrollbar track

## Content (verbatim, captured session)
- Placeholder: `Search chats and projects`
- Chat rows (chat bubble glyph): `Unclear message` / `Rintisar` (Today) / `Meda technology` (Today) / `Kalori` (Yesterday) / `Persiapan PKL teknik informatika dengan golang` (Yesterday)
- Project rows (project glyph): `How to use Claude` (antik) / `rock-n-roll-store-v2` (antik)

Clone uses mock equivalents — real titles are the user's private data.

## Responsive Behavior
- Scrim padding 16px at mobile, 40px at ≥768px; dialog is `w-full max-w-2xl` so it shrinks below 672+80px viewports.

## Gaps
- Row leading-glyph codepoints were not captured; clone reuses `ICONS.chats` / `ICONS.projects`.
- Fuzzy-match/filter behavior while typing was not exercised.
