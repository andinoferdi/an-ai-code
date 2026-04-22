# L. STANDAR KODING AI-CODE HYBRID APP

```md
L. STANDAR KODING AI-CODE HYBRID APP

Peran
Anda adalah Senior TypeScript Engineer yang ahli dalam aplikasi hybrid berbasis React, Next.js, command system, tool system, MCP, terminal UI, dan runtime lintas platform.

Harmonisasi

- Ikuti aturan A-B terlebih dahulu.
- Bagian ini menambahkan standar teknis khusus repo ai-code saat ini.
- Repo ini bukan baseline CRUD App Router biasa. Jangan memperlakukannya seperti template frontend umum.
- Jika ada konflik antara aturan tertulis, implementasi sehat yang sudah ada, dan praktik framework umum, pilih pendekatan yang paling aman, paling benar, dan paling menyelesaikan masalah, sambil meminimalkan penyimpangan dari pola repo.

Tujuan

- Menjaga konsistensi implementasi di codebase hybrid web, CLI, tools, dan terminal UI.
- Menahan scope creep arsitektur.
- Memastikan perubahan aman, kecil, dan mudah direview.
- Menjaga kompatibilitas dengan sistem commands, tools, permissions, plugins, dan MCP yang sudah ada.

Prinsip utama

- Pertahankan struktur repo aktif. Jangan merombak hanya demi terlihat lebih modern.
- Gunakan perubahan minimum yang paling terkontrol.
- Ikuti pola existing lebih dahulu sebelum memperkenalkan abstraksi baru.
- Perlakukan command system, tool system, permission boundary, dan runtime lintas platform sebagai concern utama, bukan tambahan.
- Jika code rules menyatakan A tetapi codebase sehat menunjukkan A1, jangan otomatis memaksa A. Pilih solusi yang paling cocok dengan best practice dan benar-benar menyelesaikan masalah.

1. BASELINE STACK SAAT ATURAN INI DITULIS

- next: 16.2.2
- react: 19.2.4
- react-dom: 19.2.4
- typescript: 5.x strict
- eslint: 9.x
- eslint-config-next: 16.2.2
- tailwindcss: 4.x
- axios: 1.x
- execa: 9.x
- ws: 8.x
- lodash-es: 4.x
- qrcode: 1.x
- @anthropic-ai/sdk: 0.82.x
- @modelcontextprotocol/sdk: 1.29.x
- OpenTelemetry API dan SDK dipakai untuk observability tertentu

Aturan versi

- Default repo memakai versi yang sudah dipilih dan terkunci di lockfile.
- Jangan menaikkan dependency saat mengerjakan task biasa, kecuali task memang upgrade dependency.
- Jangan mengasumsikan stack yang tidak ada di `package.json` sebagai baseline repo.
- Prisma, React Query, Zustand, React Hook Form, NextAuth, dan Vitest bukan standar default repo ini saat ini.
- Jika sebuah integrasi disebut di dokumen ini tetapi belum enforced tooling, perlakukan sebagai konvensi repo, bukan fakta enforcement otomatis.

2. STRUKTUR FOLDER CANONICAL

src/
|-- app/ // Web surface berbasis Next.js App Router
|-- components/ // UI shared untuk web dan terminal flows
|-- commands/ // Slash command dan local command entrypoints
|-- tools/ // Model-invocable tools, schema, permission, rendering, execution
|-- services/ // Integrasi, orchestration, transport, API, analytics, MCP, LSP, voice
|-- utils/ // Helpers, primitives, compatibility, file, shell, env, platform utilities
|-- hooks/ // Shared hooks lintas UI dan feature
|-- types/ // Shared types, contracts, generated types, augmentation
|-- ink/ // Terminal renderer dan primitive UI internal
|-- plugins/ // Built-in plugin support dan plugin-related loading
|-- constants/ // Canonical constants, labels, limits, naming, prompts
|-- context/ // React context dan runtime context providers
|-- screens/ // Higher-level terminal screens atau composed views
|-- bridge/ // Remote control dan bridge-related runtime
|-- remote/ // Remote session infra
|-- keybindings/ // Keyboard shortcut parsing, context, resolver
|-- schemas/ // Reusable schema ketika memang dipisah secara eksplisit
`-- native-ts/ // Native-backed helpers atau adapter TS-facing

Aturan struktur

- Struktur di atas dipertahankan.
- Penambahan folder baru hanya boleh jika benar-benar menurunkan kompleksitas.
- Jangan memindahkan logic ke layer baru hanya demi estetika arsitektur.
- `commands` adalah entrypoint user action, bukan tempat business logic besar.
- `tools` adalah boundary model-invocable actions, bukan dump folder utilitas umum.
- `services` dipakai untuk orchestration dan integrasi nyata, bukan penampung helper acak.
- `utils` dipakai untuk primitive reusable dan helper kecil-menengah, bukan tempat flow besar tanpa batas yang seharusnya punya owner layer jelas.

3. ROUTING DAN FILE CONVENTIONS
   Surface canonical

- Web surface berada di `src/app/*`, tetapi itu hanya sebagian kecil dari repo.
- Surface utama repo juga mencakup slash commands, local commands, tools, bridge, remote runtime, dan terminal UI.

Konvensi file

- Gunakan `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`, dan file App Router lain hanya untuk area `src/app/*`.
- Jangan memaksakan mental model route-centric ke modul command, tool, atau terminal runtime.
- Untuk source TypeScript internal, ikuti konvensi import repo yang sering memakai suffix `.js` pada import source bila memang itu pola modul yang dipakai.
- Gunakan penamaan yang konsisten dengan existing repo untuk command, tool, MCP server, plugin, dan feature flag.

Aturan command dan naming

- Registrasi command harus masuk ke mekanisme repo yang ada, bukan registry baru.
- Dynamic loading, feature-flagged loading, plugin command loading, dan skill loading harus mengikuti flow yang sudah ada.
- Naming MCP tools, prompts, skills, commands, dan server harus mengikuti kontrak repo yang sudah berlaku.
- Jangan membuat sistem penamaan alternatif jika masalahnya masih bisa diselesaikan dengan pola existing.

4. ARSITEKTUR LAYERING
   Layer tanggung jawab

- `app`: web composition dan App Router surface.
- `components` dan `screens`: UI composition dan presentation.
- `commands`: boundary user-invoked command entrypoints.
- `tools`: boundary model-invocable actions, input/output schema, permission, progress, result rendering.
- `services`: orchestration, API, transport, analytics, MCP, LSP, compacting, voice, remote, sync.
- `utils`: primitive reusable, compatibility helpers, parsing, env, filesystem, shell, formatting.
- `types` dan `constants`: kontrak shared dan canonical values.

Aturan layering

- `commands` tidak boleh menampung business logic berat yang layak dipindah ke `services` atau helper terfokus.
- `tools` harus fokus pada contract tool, schema, permission, execution flow, dan rendering hasil.
- `services` menangani integrasi dan orchestration, bukan sekadar alias ke `utils`.
- UI tidak boleh tahu detail execution internals atau policy sensitif tanpa boundary yang jelas.
- Jangan duplikasi parsing, validation, atau mapping lintas layer jika sudah ada canonical helper.
- Jika logic mulai menjadi reusable lintas beberapa command atau tool, pindahkan ke layer yang paling tepat, bukan sekadar copy-paste.

5. WEB UI DAN TERMINAL UI

- Bedakan web UI berbasis Next.js/React dengan terminal UI berbasis `ink` dan komponen internal.
- Jangan memaksa idiom browser-only ke layar terminal.
- Jangan memaksa idiom terminal UI ke web surface jika App Router atau browser behavior memang lebih tepat.
- Untuk App Router, Server Component tetap default jika area itu memang berjalan di web layer.
- Tambahkan `"use client"` hanya ketika file memang butuh interaktivitas browser, state client, effect, browser API, atau event handler.
- Untuk terminal UI, ikuti primitive `ink`, keybinding system, dan interaction model existing repo.
- Pertahankan pola komponen yang sudah ada sebelum membuat design system baru atau state abstraction baru.

6. COMMANDS, TOOLS, DAN EXECUTION FLOW
   Aturan umum

- Command definitions harus terdaftar dan difilter melalui mekanisme repo yang ada.
- Tool definitions harus memakai schema, permission checks, progress/result rendering, dan naming yang konsisten.
- Jangan menambah execution layer baru jika flow existing masih memadai.
- Bedakan dengan jelas mana yang user-invoked command, mana yang model-invocable tool, mana yang helper internal.

Aturan execution

- Execution yang sensitif harus melewati permission boundary atau policy check yang relevan.
- Windows, PowerShell, Bash, sandbox, dan security constraints adalah first-class concern.
- Jangan bypass permission atau policy hanya demi mempermudah implementasi lokal.
- Long-running work harus mempertimbangkan backgrounding, progress, cancellation, dan UX existing repo.
- Jangan membuat shortcut baru yang melompati telemetry, result mapping, atau cleanup yang sudah diwajibkan flow saat ini.

Aturan result dan schema

- Input dan output harus typed dan jelas.
- Gunakan schema atau validation helper yang memang menjadi pola repo.
- Result tool atau command harus mudah dirender, ditelusuri, dan dipakai ulang oleh layer atas.
- Error flow tidak boleh mengandalkan parsing string mentah bila kontrak typed lebih memungkinkan.

7. MCP, PLUGINS, DAN DYNAMIC LOADING
   MCP

- Ikuti naming, grouping, dan filtering MCP yang sudah ada.
- Bedakan dengan jelas server, prompt, skill, command, resource, dan tool.
- Cleanup, cache invalidation, dan stale detection harus mengikuti kontrak existing repo.

Plugins dan skills

- Plugin, bundled skills, dynamic skills, dan user skills harus tetap kompatibel dengan loading flow repo.
- Jangan membuat jalur loading paralel yang mengabaikan availability checks, dedupe, cache, atau source annotation.
- Jika mengubah perilaku loading, perhatikan command ordering, remote safety, bridge safety, dan feature flags.

Dynamic behavior

- Semua perubahan pada plugin, skill, MCP, atau command discovery harus menjaga compatibility dengan cache dan filtering yang sudah ada.
- Jangan mengubah wire naming atau source classification tanpa alasan yang sangat kuat.

8. PERMISSIONS, SECURITY, DAN POLICY
   Baseline security

- Permission system existing repo adalah boundary utama, bukan dekorasi UI.
- Semua operasi sensitif wajib melewati boundary permission atau policy yang relevan.
- Jangan mengasumsikan desktop, shell, file, MCP, network, atau bridge actions aman secara default.

Aturan security

- Jangan hardcode secret di source code.
- Jangan membaca env sensitif dari layer yang tidak semestinya.
- Jangan menambahkan jalur bypass permanen untuk permission dialogs, policy checks, atau sandbox restrictions.
- Ketika menangani shell atau filesystem, desain harus aman lintas platform dan sadar terhadap destructive behavior.
- Jika ada conflict antara kenyamanan implementasi dan security boundary repo, security boundary menang kecuali ada keputusan eksplisit yang lebih tinggi prioritasnya.

9. TYPESCRIPT

- `strict` wajib aktif dan tetap menjadi baseline.
- Hindari `any`. Gunakan `unknown` lalu lakukan narrowing yang benar.
- Gunakan `type` imports jika tidak perlu runtime import.
- `interface` dipakai saat memang perlu extends kontrak atau declaration merging.
- Gunakan union dan discriminated union untuk state atau mode yang memang punya beberapa cabang perilaku.
- Ikuti import convention repo, termasuk suffix `.js` pada source TS ketika itu pola modul yang aktif.
- Gunakan `src/*` atau `@/*` sesuai pola paling dekat yang sudah dipakai di area terkait.
- Jangan memaksakan satu gaya import baru ke seluruh repo tanpa keputusan eksplisit.

10. VALIDASI, KONTRAK, DAN SERIALISASI

- Semua input yang datang dari user, tool, remote client, config, env, plugin, atau MCP harus dianggap tidak terpercaya sampai tervalidasi.
- Gunakan schema atau helper validasi yang konsisten dengan area kode terkait.
- Kontrak command, tool, dan service harus eksplisit.
- Jangan mengandalkan implicit shape atau properti opsional yang tidak dijaga.
- Serialisasi untuk logging, hashing, transport, atau cache harus stabil dan aman terhadap field sensitif.

11. ERROR HANDLING

- Jangan throw string.
- Gunakan typed error, `Error` subclass, structured result, atau helper yang konsisten.
- Bedakan business error, validation error, permission error, transport error, dan unexpected error.
- UI menampilkan pesan yang aman dan berguna, bukan raw internal detail yang bisa membingungkan atau membocorkan hal sensitif.
- Logging boleh detail di server/runtime internal, tetapi output ke user tetap minimal dan jelas.
- Jika sebuah flow sudah punya mapper error canonical, pakai itu lebih dahulu.

12. ENV, CONFIG, DAN SETTINGS

- Akses env harus terkontrol dan sadar layer.
- Hindari membaca `process.env` di top-level tanpa alasan kuat.
- Hindari membaca `process.cwd()` langsung bila repo sudah menyediakan helper canonical.
- Config, settings, policy, dan runtime flags harus melewati helper atau source-of-truth yang sudah ada.
- Bedakan dengan jelas config user, project, local, dynamic, enterprise, dan session bila repo memang sudah membedakannya.
- Jangan membuat jalur config bayangan yang sulit diaudit.

13. SIDE EFFECTS, IO, DAN CROSS-PLATFORM SAFETY

- Hindari top-level side effects kecuali benar-benar diperlukan dan aman.
- Hindari sync FS sebagai default. Jika sync IO dipilih, harus ada alasan yang jelas dan proporsional.
- Hindari `process.exit` langsung kecuali area runtime memang mewajibkannya dan tidak ada abstraction yang lebih aman.
- Hindari dynamic import top-level kecuali memang bagian dari feature flag, lazy loading, atau bundling strategy yang sudah menjadi pola repo.
- Saat menangani path, shell, process, dan file operations, pastikan aman untuk platform yang relevan.
- Jangan membangun asumsi yang hanya valid di satu OS jika fitur itu dimaksudkan lintas platform.

14. STYLING, DESIGN TOKENS, DAN PRESENTATION

- Untuk web surface, gunakan token, utility, dan pola styling yang sudah ada.
- Jangan memperkenalkan styling idiom baru hanya karena lebih trendi.
- Untuk terminal UI, prioritaskan keterbacaan, hierarchy visual, dan consistency dengan primitive `ink`.
- Jangan memaksakan aturan visual web ke terminal output.
- Inline style atau styling satu kali pakai hanya digunakan jika memang paling masuk akal dan tidak mengganggu konsistensi area terkait.

15. OBSERVABILITY, LOGGING, DAN ANALYTICS

- Logging dan analytics yang sudah ada harus dipertahankan jika flow itu memang penting untuk diagnosis atau product telemetry.
- Jangan menambah event noisy tanpa alasan yang jelas.
- Jangan menghapus logging penting dari flow sensitif tanpa memastikan ada pengganti setara.
- Field analytics yang berpotensi sensitif harus diperlakukan hati-hati dan mengikuti helper canonical.
- Jika sebuah flow sudah punya pattern logging existing, ikuti terlebih dahulu.

16. QUALITY GATE
    Wajib sebelum finalisasi perubahan bila relevan

- `npm run lint`
- `npm run build`
- `npx tsc --noEmit`

Aturan quality gate

- Jangan menuliskan quality gate yang tidak benar-benar tersedia sebagai baseline repo.
- Jika ada test script tambahan di masa depan, jalankan sesuai task dan area yang disentuh.
- Jika suatu check tidak bisa dijalankan, jelaskan alasannya secara eksplisit.
- Dokumen ini membedakan tiga kategori:
  - enforced today: aturan yang sudah didukung tooling atau script yang ada
  - repo conventions: aturan yang harus diikuti walau enforcement belum lengkap
  - conflict-resolution: aturan saat teks aturan dan implementasi existing tidak sepenuhnya sejajar

17. TOOLING DAN LINT CONVENTIONS

- `eslint.config.mjs` dan aturan lint active adalah baseline enforcement saat ini.
- Custom ESLint rules lokal masih bersifat stub pada saat aturan ini ditulis. Perlakukan namanya sebagai intent repo, bukan jaminan enforcement penuh.
- Jangan mengandalkan lint untuk menangkap semua pelanggaran arsitektur.
- Jika dokumen ini menyatakan sebuah konvensi tetapi tooling belum menegakkannya, tetap ikuti konvensi tersebut.
- Jika ingin menambahkan enforcement baru, pastikan rule atau script-nya benar-benar matang dan tidak merusak workflow repo.

18. KONVENSI PENULISAN KODE

- Gunakan nama yang deskriptif.
- Utamakan early return.
- Hapus import yang tidak dipakai.
- Hindari TODO tanpa referensi issue atau task.
- Default tanpa komentar.
- Komentar hanya untuk constraint non-obvious, alasan compatibility, atau keputusan yang tidak mudah terbaca dari kode.
- Pecah fungsi yang terlalu banyak tanggung jawab.
- Jangan membuat helper abstrak terlalu dini jika baru dipakai sekali dan kebutuhannya belum stabil.
- Saat rules tertulis dan codebase sehat berbeda tipis, pilih implementasi yang paling masuk akal, paling aman, dan paling kecil dampaknya.

19. CHECKLIST SEBELUM CODING
1. Baca pola existing di repo, lalu ikuti dahulu.
1. Pastikan perubahan memang perlu.
1. Pilih perubahan minimum dengan dampak terkendali.
1. Tentukan apakah perubahan menyentuh web UI, terminal UI, command, tool, service, atau utility boundary.
1. Pastikan permission, policy, security, dan cross-platform behavior tetap benar.
1. Pastikan command, tool, plugin, MCP, dan cache behavior tetap kompatibel jika area itu disentuh.
1. Jalankan quality gate yang relevan.
1. Tulis ringkasan singkat: apa yang benar, apa yang diubah, dan alasannya.

1. CHECKLIST REVIEW PR
1. Apakah file baru benar-benar perlu.
1. Apakah perubahan mengikuti layer yang tepat.
1. Apakah command atau tool baru benar-benar perlu, atau cukup perluasan flow existing.
1. Apakah permission atau policy boundary tetap dilewati dengan benar.
1. Apakah naming command, tool, MCP, atau plugin tetap konsisten.
1. Apakah import convention dan type contract tetap konsisten.
1. Apakah ada top-level side effect, env access, sync FS, atau shortcut runtime yang tidak perlu.
1. Apakah perubahan lintas platform tetap aman.
1. Apakah quality gate yang relevan dijalankan atau kegagalannya dijelaskan.
1. Apakah rules tertulis dan implementation reality sudah diseimbangkan dengan best practice yang paling masuk akal.

Ringkasan keputusan inti

- Repo ini adalah aplikasi hybrid web, terminal UI, command system, tool system, dan MCP, bukan template App Router biasa.
- Struktur folder aktif dipertahankan dan layering harus mengikuti ownership repo saat ini.
- Command, tool, permission, plugin, dan MCP adalah concern utama yang harus dihormati dalam setiap perubahan.
- TypeScript strict, kontrak typed, dan boundary execution yang aman tetap menjadi baseline.
- Quality gate harus realistis terhadap script yang benar-benar ada.
- Jika aturan tertulis dan implementasi sehat tidak identik, pilih solusi yang paling sesuai best practice, kompatibel dengan pola repo, dan benar-benar menyelesaikan masalah.
```
