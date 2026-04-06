# Claude Code Source Leak (via npm Sourcemap)

Repository ini berisi mirror/arsip source code Claude Code yang sempat terekspos melalui file sourcemap di paket npm.

## Ringkasan
Pada 31 Maret 2026, ditemukan bahwa paket Claude Code di npm menyertakan sourcemap yang memuat `sourcesContent`. Karena itu, source asli dapat direkonstruksi dari file `.map`.

Temuan awal dipublikasikan oleh Chaofan Shou (@Fried_rice):
- https://x.com/Fried_rice/status/2038894956459290963

## Bagaimana leak terjadi
Sourcemap JavaScript/TypeScript biasanya menyimpan mapping dari kode hasil build ke source asli.
Jika sourcemap dipublish ke npm tanpa filter yang tepat, source code bisa ikut terbuka melalui field `sourcesContent`.

Contoh struktur sourcemap:

```json
{
  "version": 3,
  "sources": ["../src/main.tsx", "../src/tools/BashTool.ts"],
  "sourcesContent": ["/* source asli */", "/* source asli */"],
  "mappings": "..."
}
```

## Isi repositori ini
Tujuan repo ini adalah dokumentasi dan analisis teknis atas codebase yang terekspos. Beberapa area yang menarik untuk dipelajari:
- Arsitektur CLI berbasis React/Ink
- Sistem tools dan orkestrasi agent
- Integrasi bridge/remote control
- Komponen internal lain yang sebelumnya tidak dipublikasikan

Struktur utama:

```text
src/
  main.tsx
  QueryEngine.ts
  Tool.ts
  tools/
  services/
  coordinator/
  bridge/
  buddy/
```

## Cara eksplorasi lokal
Persyaratan:
- Bun atau Node.js (disarankan versi terbaru)
- npm

Langkah:

```bash
git clone <repo-url>
cd ai-code
npm install
npm run build
node dist/main.js
```

## Catatan penting
- Repositori ini bukan produk resmi Anthropic.
- Saya bukan pihak yang membocorkan file.
- Kepemilikan source code tetap milik Anthropic PBC.
- Gunakan hanya untuk tujuan riset, edukasi, dan dokumentasi teknis.

## Kredit
- Penemu awal: Chaofan Shou (@Fried_rice)
- Post sumber: https://x.com/Fried_rice/status/2038894956459290963
