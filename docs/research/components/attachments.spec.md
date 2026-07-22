# File attachments

Extracted live 2026-07-22 via browser-harness (CDP), authenticated session, viewport
1136×746, DPR 1.25. Test files were attached to the composer with
`DOM.setFileInputFiles` and **never sent**; the draft was discarded on navigation. One
existing conversation was opened read-only to capture a sent attachment.

## Composer row

```
flex flex-row gap-3 overflow-x-auto p-2 -m-2
```

`gap-3` (12px) and it **scrolls sideways** — it does not wrap. The `p-2 / -m-2` pair
gives the row invisible slack so card shadows and the overhanging remove button aren't
clipped by `overflow-x-auto`.

## Card — 120×120, all kinds

Locked by inline `width / height / min-width / min-height: 120px`.

```
border-radius: 8px
border: 0.8px solid rgba(255,255,255,0.2)      /* hover: brighter */
box-shadow: 0 1px 2px rgba(11,11,11,0.06), 0 2px 8px rgba(0,0,0,0.24)
background: rgb(44,44,42)
transition: all .15s cubic-bezier(.4,0,.2,1)
```

### Document card
```html
<button class="flex flex-col justify-between gap-2.5 overflow-hidden px-2.5 py-2"
        aria-label="AGENTS.md, md, 6 lines">
  <div class="flex flex-col gap-1 min-h-0">
    <h3 class="text-[12px] break-words text-text-100 line-clamp-3">AGENTS.md</h3>
    <p  class="text-[10px] line-clamp-1 break-words text-text-500">6 lines</p>
  </div>
  <div class="h-[18px] flex items-center gap-0.5 px-1 border-0.5 border-strong shadow-sm
              rounded-[4px] bg-bg-000/70 backdrop-blur-sm font-medium">
    <p class="uppercase truncate text-text-300 text-[11px] leading-[13px]">md</p>
  </div>
</button>
```
Title is **12px, weight 400** (not semibold), clamped to 3 lines. Meta is 10px
`text-text-500`. The extension chip is 18px tall with a blurred translucent fill.

### Image / PDF card
```html
<button class="relative bg-bg-000" style="width:120px;height:120px">
  <img class="w-full h-full object-cover transition duration-400 opacity-100">
</button>
```
`transition duration-400` on `opacity` 0→100 — the preview **fades in over 400ms** once
the bytes paint. A PDF gets the same treatment plus its extension chip overlaid at
`absolute bottom-2 left-0 right-0 px-2.5`.

### Remove button
```
opacity-0 group-hover/thumbnail:opacity-100 group-focus-within/thumbnail:opacity-100
transition-all w-5 h-5 absolute -top-2 -left-2 rounded-full border-0.5 border-strong
bg-bg-000/90 backdrop-blur-sm
```
**Top-left**, not top-right. Reachable by keyboard via `focus-within`.

## Sent message

```html
<div class="mb-1 mt-[var(--msg-gap,1.5rem)] group group/message-row">
  <div class="gap-2 mx-0.5 mb-3 flex flex-wrap justify-end"> …cards… </div>
  <!-- then the text bubble -->
```
Above the bubble, right-aligned, `gap-2` (8px) and here it **does** wrap. Same card,
minus the remove button. A file-only prompt renders no bubble at all.

## Clone deviations

| Point | Note |
|---|---|
| PDF first-page preview | **Not implemented.** claude.ai renders it server-side (`/files/<id>/thumbnail`). The zero-dependency route was tried and abandoned: Chrome will not paint its PDF plugin inside a blob-URL iframe — the injected `<embed type="application/pdf">` stalls on `about:blank`, blank at any size, with or without a CSS transform, and `data:` URLs are blocked for the plugin outright. Rasterising client-side needs a PDF library (`pdfjs-dist`). PDFs fall back to the document card, which is also claude.ai's own fallback for unpreviewable files. |
| Persistence | claude.ai stores files server-side. The clone inlines a `dataUrl` copy for files under 1.5MB so previews survive a reload, and blanks the dead `blob:` URL on write. Larger files keep their card but lose the preview after a refresh. |
| Ordering | Text files arrive asynchronously through `FileReader`, so the composer sorts by the id assigned at pick time to preserve the order files were chosen in. |
