# Claude.ai Logged-in App Shell Specification

Route: /app (clone of authenticated claude.ai/new)
Screenshots: docs/design-references/app-new-chat-desktop.png (collapsed rail), app-sidebar-open.png (expanded)
Interaction model: click-driven sidebar expand/collapse (rail 48.8px ↔ panel 288px); static composer; hover states on all rows/buttons.

## Layout
- Page bg rgb(31,31,30); text rgb(255,255,255) main / rgb(195,194,183) secondary / rgb(151,149,140) muted.
- nav: fixed left, h-screen, collapsed width 48.8px (icon rail), expanded 288px, border-right 0.8px rgba(226,225,218,0.15), bg rgb(31,31,30) w/ subtle bg gradient (lg:bg-gradient-to-t from-bg-200/5 to-bg-200/30).
- Main content: centered column, max-w-2xl, flex-col items-center gap-7.

## Sidebar (expanded, 288px)
- Header row: "Claude" serif wordmark (svg viewBox 30 0 82 24, h 20px, color #F8F8F6) left; right: search icon btn + close-sidebar icon btn (24px, radius 6px, color rgb(195,194,183)).
- Nav rows (a/button): height 32px, padding 6px 16px, radius 9px, font 12px/400, color rgb(195,194,183), icon 20px + label; hover bg subtle white overlay. Rows: New chat (circled + icon, shortcut "Ctrl+⇧+O" on hover), Chats, Projects, Artifacts, Customize.
- Section labels (h2): 12px/400 rgb(151,149,140), padding-left 8px, mt-1 pb-2. Sections: Products (Code, Design+flask), Starred, Recents ("Group by" icon btn right of Recents).
- Chat rows: same 32px/6px-16px/9px/12px style, truncated single line, "More options" kebab appears on hover.
- Footer (bottom): avatar circle 32px bg clay-dark w/ initial, username 14px white + "Pro plan" 12px muted, right: download icon btn + chevron up/down btn.

## Collapsed rail (48.8px)
Top: panel-toggle icon. Below: circled +, chat bubble, projects, artifacts, customize icons stacked (32px btns). Middle-lower: Code `</>`, Design palette icons. Bottom: download icon, avatar.

## Main area — new chat
- Greeting row: starburst svg 32px color rgb(217,119,87) (path captured in icons) + span "Burning the midnight tokens": Anthropic Serif 40px/300, color rgb(195,194,183), whitespace-nowrap. (Greeting text rotates per session — keep one.)
- Composer card: max-w-2xl (672px), bg rgb(44,44,42), radius 20px, border 0.8px transparent, shadow subtle, inner margin 14px gap 12px (m-3.5 gap-3).
  - Editor: contenteditable (ProseMirror), 16px/22.4px, color white; placeholder "How can I help you today?" color muted.
  - Bottom row: left — plus btn 32x32 radius 8px transparent, hover bg white/5. Right — model picker btn h32 radius 8px: "Sonnet 5" 14px/500 white + "Medium" 14px rgb(195,194,183) + caret; mic btn 32x32 ("Press and hold to record"); voice-mode btn 32x32 ("Use voice mode"), waveform icon.
- Top-right of viewport: ghost/incognito icon btn, color muted.

## Behaviors
- Sidebar toggle: click panel icon ↔ expand/collapse; content margin-left shifts (48.8px ↔ 288px) with transition.
- Row hover: bg rgba(255,255,255,~0.06); kebab fades in on chat rows.
- Composer focus: border stays; card slightly elevated (subtle).
- Model picker: opens dropdown (not cloned in v1 beyond the button).

## Mock data (replaces private user data)
- Username "antik" → keep generic "user"; chat titles → generic placeholders.
