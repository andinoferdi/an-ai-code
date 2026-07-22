# Claude.ai Sign-in Page Specification

Target URL: https://claude.ai/new (redirects to sign-in when logged out)
Screenshot: n/a (browser pane not compositable) — built from getComputedStyle extraction.
Interaction model: mostly static; hero is an autoplaying looping muted video with a fade-up entrance animation.

## Design Tokens (exact, from getComputedStyle)
- Page bg:        rgb(31,31,30)   #1F1F1E
- Foreground:     rgb(248,248,246) #F8F8F6
- Card bg:        rgb(18,18,18)   #121212
- Hero card bg:   rgb(23,23,22)   #171716
- Muted text:     rgb(151,149,140) #97958C
- Border subtle:  rgba(226,225,218,0.15)
- Border button:  rgba(226,225,218,0.30)
- Clay accent:    #D97757  (Claude logo starburst, var --cds-clay)
- Primary btn bg: #FFFFFF, text rgb(11,11,11) #0B0B0B

## Fonts
- Sans ("Anthropic Sans", proprietary) -> substitute Inter
- Serif display ("Anthropic Serif", proprietary) -> substitute Fraunces

## Layout
- <main>: grid grid-cols-1 gap-4 xl:grid-cols-2, min-h screen, centered.
- LEFT column: flex, py-6, min-h-[89vh], items-center. Inner: flex-col, justify-between, items-center.
  - Middle block (max-w-md ~402px wide):
    - h2 "Question what's next" — Fraunces, 56px, weight 300, line-height 67.2px, centered, mt-12. `<br>` after "Question what's".
    - h3 "Your thinking partner for big ambitions" — Fraunces, 18px, weight 400, lh 24.75px, centered, mt-4.
    - Auth card: mt-8, p-7 (28px), max-w-md (448px) min-w-xs (320px), rounded-[32px], bg #121212, border 1px rgba(226,225,218,0.15), soft shadow. Contains:
      - flex-col gap-5:
        - Button "Continue with Google": outline 1px rgba(226,225,218,0.3), rounded-[9.6px], h-44, px-5, 16px/500, gap-8, Google logo img (public/images/google.svg) 18px.
        - Divider "OR" — muted, uppercase-ish, centered with hairlines.
        - Button "Continue with email": PRIMARY — bg white, text #0B0B0B, rounded-[10px], h-40, px-4, 15px/500.
        - Button "Continue with SSO": ghost, transparent, text white, rounded-[10px], h-40, px-4, 15px/500.
      - Legal line: "By continuing, you acknowledge Anthropic's Privacy Policy (opens in a new tab)." 12px, muted #97958C; "Privacy Policy" is a link.
    - Download button: mt-6, centered, outline 1px rgba(226,225,218,0.3), rounded-[9.6px], h-44, px-5, 16px/500, download arrow icon + "Download desktop app".
- RIGHT column: hidden lg:flex, justify/items-center. Card aspect 1080/1350 (~460x576), rounded-2xl (16px), bg #171716, shadow 0 4px 20px rgba(0,0,0,.04), overflow-hidden. Contains autoplay/loop/muted/playsinline <video> poster=still.webp src=login-hero.mp4 (object-cover). Entrance: animate login-hero-in (opacity 0->1, translateY 20px->0) ~0.8s ease-out.

## Assets
- public/images/google.svg
- public/videos/login-hero.mp4 (+ login-hero-still.webp poster)
- Claude wordmark: inline SVG component (viewBox 0 0 112 24), starburst path fill #D97757, wordmark path fill currentColor.

## Top-left logo
- Claude wordmark fixed at top-left of viewport (parent: flex items-center h-[4.5rem] pointer-events-auto), height ~24px scaled, text-primary color.

## Responsive
- Below lg (1024px): right video column hidden; single centered column.
- xl (1280px+): two-column grid.
