# List pages — `/recents`, `/projects`, `/artifacts`

Extracted live 2026-07-22 via browser-harness (CDP), authenticated session, viewport
1136×746, DPR 1.25.

## Shared page chrome

`<header data-testid="page-header">` —
`mx-auto flex h-12 w-full max-w-4xl justify-between gap-md px-4 md:px-8 items-end md:h-16`

| Part | Spec |
|---|---|
| `<h1>` | Anthropic Serif, **24px / 32px, weight 500**, `#fff`. Hidden below `md`. |
| Header right cluster | `flex items-center gap-sm` (8px) |
| Ghost dropdown ("Filter by All" / "Sort by Last updated") | h 32px, px 12px, radius 8px, transparent bg, 14px/20px **weight 500**. Label muted, value primary, caret 16px. |
| Primary button ("New chat" / "New project" / "New artifact") | h 32px, px 12px, radius 8px, **white bg / dark text**, 14px weight 500. |

Body column max-width tracks the header (`max-w-4xl`, `px-8`); measured 773.6px at this
viewport.

### Search field (all three pages)

Wrapper `inline-flex w-full h-10 items-center gap-3 rounded-[10px] px-4`,
background `rgba(255,255,255,0.10)`. Input is bare: **15px / 20px**, `#fff`,
placeholder muted. Leading search glyph 16px muted. Placeholders:
`Search chats…`, `Search projects…`, `Search artifacts…`.

---

## `/recents` — "Chats"

Rendered as a real `<table>`; each chat is a `<tr class="group/cdsrow">` with `<td>`s.

| Token | Value |
|---|---|
| Row height | 48.8px (`h-7 box-content` + `py-sm`) |
| Cell padding | `8px 12px` |
| Divider | `border-bottom: 0.8px solid rgba(255,255,255,0.05)`, first row also gets a top border |
| Hover | divider goes transparent, row fills `bg-fill-ghost-hover`, first/last cell round to 8px |
| Title cell | 14px / 20px, `#fff`, `min-w-0 truncate` |
| Time cell | right-aligned, muted (`#c3c2b7`), relative — `1 hour ago`, `yesterday`, `2 days ago` |
| Click target | `<a data-primary href="/chat/<uuid>" class="absolute inset-0 z-[1]">` overlay, `aria-label` = title |

Header right: `Filter by All` ▾ · `Select chats` (ghost) · `New chat` (primary).

## `/projects`

Header right: `Sort by Last updated` ▾ · `New project` (primary).

Card grid, 2 columns at this width, gap ~24px. Card: rounded ~12px, 0.8px border
`rgba(255,255,255,0.08)`, padding ~20px, min-height ~200px, `flex flex-col`.

- Title 16px weight 500 `#fff`, inline with an optional chip badge
  (`Example project`) — 12px muted text, `rgba(255,255,255,0.08)` fill, radius 6px, px 6px.
- Description 14px/20px muted, clamped to 3 lines.
- Footer date pushed to the bottom (`mt-auto`), 13px muted (`Jul 8`, `Mar 29`).

## `/artifacts`

Header right: `Filter by All` ▾ · `New artifact` (primary).

Below the search field, a pill tab row: **All** (active — filled `rgba(255,255,255,0.10)`,
radius 8px, px 12px, h 32px) · Yours · Shared with you (inactive = muted, transparent).

Card grid, 3 columns, gap ~24px. Card = rounded 12px, overflow hidden, subtle fill.

- Top ~150px is a **scaled-down live preview** of the artifact with a folded top-right
  corner (a triangular notch, ~28px).
- A `Chat` badge floats top-left over the preview: 12px, dark translucent fill, radius 6px.
- Body: title 16px/24px `#fff`, up to 3 lines then ellipsis.
- Footer: `Edited 6 hours ago` — 13px muted.
