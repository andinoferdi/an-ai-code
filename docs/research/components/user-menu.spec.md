# UserMenu Specification

Extracted from live claude.ai on 2026-07-22 via browser-harness (CDP), viewport 1106×746.

## Overview
- **Target file:** `src/components/app/UserMenu.tsx`
- **Trigger:** sidebar footer account button (`data-testid="user-menu-button"`)
- **Interaction model:** click-driven dropdown (Radix-style; opens on **pointerdown**, not `click()`)

## Computed Styles

### Menu surface
- width: 272px; min-width: 128px; max-width: 320px
- background-color: rgb(56, 56, 53)  (`surface-3`, one step lighter than `bg-000` #2c2c2a)
- border-radius: 12px
- padding: 0 (items are inset 4px — item x=19 vs menu x=15)
- box-shadow (three layers, in order):
  - `inset 0 0 0 1px rgba(255, 255, 255, 0.1)`
  - `0 8px 24px 0 rgba(0, 0, 0, 0.32)`
  - `0 2px 6px 0 rgba(0, 0, 0, 0.2)`
- font-size: 14px; line-height: 20px; color: rgb(255, 255, 255)
- measured rect: x=15, y=370, w=272, h=307 — anchored **above** the trigger, left-aligned to sidebar

### Menu item
- width: 264px; height: 32px
- padding: 6px 10px
- border-radius: 8px
- display: flex; align-items: center; gap: 8px
- font-size: 14px; line-height: 20px; color: rgb(255, 255, 255)

## Structure & Content (verbatim)
```
antikyuhu14@gmail.com        ← muted email header, not a menuitem
─────────────────────────
Settings              Ctrl+⇧+,
Language                     ›   ← submenu
Get help
─────────────────────────
Upgrade plan
Get apps and extensions
Gift Claude
Learn more                   ›   ← submenu
─────────────────────────
Log out
```
Two divider rules: after `Get help`, and after `Learn more`.

## States & Behaviors
- **Open:** pointerdown on trigger. A plain `element.click()` does NOT open it.
- **Close:** Escape, outside click, or re-pointerdown on trigger.
- **Submenus:** `Language` and `Learn more` carry a trailing chevron — contents not captured.

## Responsive Behavior
- Menu is fixed-width (272px) and anchored to the sidebar, which itself is hidden below the mobile breakpoint. Not exercised at 390px.

## Gaps
- Anthropicons codepoints for the 8 item glyphs were not captured — the menu would not re-open via synthetic CDP pointer events after the first capture. Clone uses inline SVGs matching each glyph's visual function.
- Submenu contents for `Language` / `Learn more` not captured.
- Hover/active row fill colour not measured (only the resting state).
