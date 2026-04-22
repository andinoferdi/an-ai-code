import { Chat } from './types';

const now = Date.now();
const hour  = 60 * 60 * 1000;
const day   = 24 * hour;

export const DUMMY_CHATS: Chat[] = [
  // ── Today ─────────────────────────────────────────
  {
    id: 'chat-001',
    title: 'Optimasi performa Next.js',
    createdAt: new Date(now - 2 * hour),
    updatedAt: new Date(now - 40 * 60 * 1000),
    messages: [
      {
        id: 'm-001-1',
        role: 'user',
        content: 'Bagaimana cara mengoptimalkan performa aplikasi Next.js yang sudah masuk production?',
        createdAt: new Date(now - 2 * hour),
      },
      {
        id: 'm-001-2',
        role: 'assistant',
        content: `Ada beberapa area utama yang perlu diperiksa untuk mengoptimalkan performa Next.js di production:\n\n**1. Image Optimization**\nGunakan komponen \`<Image>\` dari Next.js untuk lazy loading dan format WebP otomatis. Pastikan properti \`width\` dan \`height\` selalu diisi untuk mencegah layout shift.\n\n**2. Code Splitting & Dynamic Imports**\nGunakan \`next/dynamic\` untuk komponen yang berat dan tidak langsung dibutuhkan saat halaman pertama dimuat. Ini signifikan mengurangi bundle size awal.\n\n**3. Caching Strategy**\nManfaatkan \`revalidate\` di Server Components dan ISR (Incremental Static Regeneration) untuk halaman yang datanya tidak terlalu real-time.\n\n**4. Bundle Analysis**\nJalankan \`@next/bundle-analyzer\` untuk melihat dependency mana yang menyumbang ukuran terbesar, lalu pertimbangkan alternatif yang lebih ringan.\n\nMana dari area ini yang paling ingin Anda explore lebih dalam?`,
        createdAt: new Date(now - 2 * hour + 30_000),
      },
      {
        id: 'm-001-3',
        role: 'user',
        content: 'Saya perlu tahu lebih banyak soal dynamic imports. Bagaimana pattern terbaiknya?',
        createdAt: new Date(now - 90 * 60 * 1000),
      },
      {
        id: 'm-001-4',
        role: 'assistant',
        content: `Pattern terbaik untuk dynamic imports di Next.js tergantung kasusnya:\n\n**Client-only components:**\n\`\`\`tsx\nconst HeavyChart = dynamic(() => import('@/components/HeavyChart'), {\n  ssr: false,\n  loading: () => <ChartSkeleton />,\n});\n\`\`\`\n\n**Conditional rendering:**\nImport secara dinamis hanya saat komponen benar-benar dibutuhkan—misalnya modal, drawer, atau fitur yang hanya muncul setelah interaksi tertentu.\n\n**Named exports:**\n\`\`\`tsx\nconst { SpecificComponent } = dynamic(\n  () => import('@/lib/heavy-module').then((m) => ({ default: m.SpecificComponent }))\n);\n\`\`\`\n\nSatu hal yang perlu diperhatikan: jangan berlebihan menggunakan dynamic imports. Gunakan hanya untuk komponen yang benar-benar berat (>20KB setelah minifikasi) atau yang hanya dipakai sebagian kecil pengguna.`,
        createdAt: new Date(now - 85 * 60 * 1000),
      },
    ],
  },
  {
    id: 'chat-002',
    title: 'Rancangan skema database PostgreSQL',
    createdAt: new Date(now - 3 * hour),
    updatedAt: new Date(now - 1.5 * hour),
    messages: [
      {
        id: 'm-002-1',
        role: 'user',
        content: 'Saya sedang merancang skema database untuk platform e-learning. Ada rekomendasi struktur tabelnya?',
        createdAt: new Date(now - 3 * hour),
      },
      {
        id: 'm-002-2',
        role: 'assistant',
        content: `Untuk platform e-learning, berikut struktur tabel inti yang saya rekomendasikan:\n\n**Core entities:**\n- \`users\` — data pengguna (pelajar & instruktur)\n- \`courses\` — kursus dengan metadata lengkap\n- \`modules\` — bagian dalam kursus (bab/section)\n- \`lessons\` — konten individual dalam modul\n- \`enrollments\` — relasi user ↔ course dengan progress\n\n**Supporting tables:**\n- \`lesson_completions\` — tracking progress per lesson\n- \`quizzes\` & \`quiz_attempts\` — sistem penilaian\n- \`certificates\` — sertifikat penyelesaian\n- \`payments\` — jika ada kursus berbayar\n\nSatu keputusan penting: apakah Anda membutuhkan multi-tenancy (banyak institusi/organisasi)? Ini akan menentukan apakah perlu menambahkan layer \`organizations\` di hierarki database.`,
        createdAt: new Date(now - 3 * hour + 45_000),
      },
    ],
  },

  // ── Yesterday ─────────────────────────────────────
  {
    id: 'chat-003',
    title: 'Perbedaan useMemo dan useCallback',
    createdAt: new Date(now - 1 * day - 4 * hour),
    updatedAt: new Date(now - 1 * day - 4 * hour),
    messages: [
      {
        id: 'm-003-1',
        role: 'user',
        content: 'Kapan harus pakai useMemo dan kapan pakai useCallback? Saya selalu bingung.',
        createdAt: new Date(now - 1 * day - 4 * hour),
      },
      {
        id: 'm-003-2',
        role: 'assistant',
        content: `Keduanya sama-sama untuk memoization, bedanya pada apa yang di-cache:\n\n**useCallback** → memoize **fungsi**\nGunakan saat Anda perlu menstabilkan referensi fungsi, terutama ketika fungsi tersebut dikirim sebagai prop ke child component atau masuk ke dependency array useEffect.\n\n**useMemo** → memoize **hasil komputasi**\nGunakan saat Anda punya komputasi yang mahal (filter/sort array besar, transformasi data kompleks) dan hasilnya dipakai di render.\n\n**Aturan sederhana:**\n- Menyimpan *fungsi*? → \`useCallback\`\n- Menyimpan *nilai hasil kalkulasi*? → \`useMemo\`\n\nPerlu dicatat: jangan terlalu agresif menggunakannya. Memoization sendiri punya overhead. Pakai profiler React dulu untuk memastikan ada masalah performa nyata sebelum menambahkan keduanya.`,
        createdAt: new Date(now - 1 * day - 4 * hour + 25_000),
      },
    ],
  },
  {
    id: 'chat-004',
    title: 'Review arsitektur microservices',
    createdAt: new Date(now - 1 * day - 6 * hour),
    updatedAt: new Date(now - 1 * day - 2 * hour),
    messages: [
      {
        id: 'm-004-1',
        role: 'user',
        content: 'Tolong review arsitektur microservices yang sedang saya rancang. Apakah wajar jika service auth terpisah dari service user?',
        createdAt: new Date(now - 1 * day - 6 * hour),
      },
      {
        id: 'm-004-2',
        role: 'assistant',
        content: `Ya, memisahkan Auth Service dan User Service adalah pattern yang valid dan cukup umum. Berikut pertimbangannya:\n\n**Alasan memisahkan:**\n- Auth berubah lebih jarang, punya concern berbeda (token, session, OAuth)\n- User service bisa scale independen dari auth\n- Lebih mudah mengaudit akses dan keamanan auth secara terisolasi\n\n**Tantangan yang perlu diantisipasi:**\n- Latency tambahan saat auth perlu data user (misal: validasi role)\n- Konsistensi data jika user dihapus tapi token masih aktif\n- Perlu strategi token revocation yang baik\n\n**Rekomendasi:** Pastikan Auth Service hanya menyimpan credential dan session data, bukan data profil. User Service yang menjadi source of truth untuk identitas pengguna. Komunikasi antar service bisa via event (async) untuk data yang tidak perlu real-time.`,
        createdAt: new Date(now - 1 * day - 6 * hour + 35_000),
      },
    ],
  },

  // ── Last 7 days ────────────────────────────────────
  {
    id: 'chat-005',
    title: 'Strategi deploy zero-downtime',
    createdAt: new Date(now - 3 * day),
    updatedAt: new Date(now - 3 * day),
    messages: [
      {
        id: 'm-005-1',
        role: 'user',
        content: 'Apa strategi terbaik untuk deploy ke production tanpa downtime?',
        createdAt: new Date(now - 3 * day),
      },
      {
        id: 'm-005-2',
        role: 'assistant',
        content: `Beberapa strategi zero-downtime deployment yang umum dipakai:\n\n**Blue-Green Deployment**\nSiapkan dua environment identik. Deploy ke "green" (idle), test, lalu alihkan traffic dari "blue" ke "green". Rollback cukup dengan balik arah traffic.\n\n**Rolling Update**\nUpdate instance bertahap—misalnya 10% dulu, amati, lanjutkan 25%, dst. Default di Kubernetes. Lebih hemat resource, tapi transisi lebih panjang.\n\n**Canary Release**\nArahkan sebagian kecil traffic (1–5%) ke versi baru, pantau error rate dan latency, baru rollout penuh jika aman.\n\nPilihan tergantung kebutuhan: Blue-Green paling aman untuk perubahan besar, Canary ideal untuk fitur baru berisiko tinggi. Pastikan juga database migration bisa berjalan backward-compatible.`,
        createdAt: new Date(now - 3 * day + 28_000),
      },
    ],
  },
  {
    id: 'chat-006',
    title: 'Menulis unit test yang efektif',
    createdAt: new Date(now - 5 * day),
    updatedAt: new Date(now - 5 * day),
    messages: [
      {
        id: 'm-006-1',
        role: 'user',
        content: 'Bagaimana prinsip menulis unit test yang benar-benar berguna, bukan sekadar mengejar coverage?',
        createdAt: new Date(now - 5 * day),
      },
      {
        id: 'm-006-2',
        role: 'assistant',
        content: `Prinsip yang paling sering diabaikan: **test behavior, bukan implementation**.\n\nIni artinya test Anda tidak boleh rusak hanya karena nama fungsi internal berubah atau Anda refactor cara kerjanya—selama outputnya sama.\n\n**Prinsip praktis:**\n- Satu test = satu assertion utama (boleh multiple expect, tapi satu scenario)\n- Nama test harus menjelaskan *apa yang diuji* dan *kondisinya*: \`should return 404 when user not found\`\n- Arrange-Act-Assert sebagai struktur dasar\n- Hindari mock yang terlalu granular—ini tanda test terlalu terikat ke implementasi\n\n**Red flag test yang buruk:**\n- Test lulus meski logika salah\n- Test gagal karena refactor internal tanpa perubahan behavior\n- Test terlalu sulit dibaca tanpa komentar panjang\n\nMetrik yang lebih bermakna dari coverage: *mutation score*. Jalankan mutation testing (misal Stryker) untuk tahu seberapa sensitif test Anda terhadap bug nyata.`,
        createdAt: new Date(now - 5 * day + 40_000),
      },
    ],
  },

  // ── Older ──────────────────────────────────────────
  {
    id: 'chat-007',
    title: 'Memilih state management React',
    createdAt: new Date(now - 10 * day),
    updatedAt: new Date(now - 10 * day),
    messages: [
      {
        id: 'm-007-1',
        role: 'user',
        content: 'Redux, Zustand, atau Jotai? Mana yang cocok untuk aplikasi skala menengah?',
        createdAt: new Date(now - 10 * day),
      },
      {
        id: 'm-007-2',
        role: 'assistant',
        content: `Untuk skala menengah, **Zustand** adalah rekomendasi saya saat ini. Alasannya:\n\n**Zustand:**\n- API minimal, tidak ada boilerplate\n- Mudah dipahami tim baru\n- Performa sangat baik dengan selective subscriptions\n- Bisa tumbuh bersama aplikasi tanpa refactor besar\n\n**Redux (Toolkit):**\nMasih relevan jika tim sudah familiar, atau Anda butuh devtools yang mature dan predictable state history untuk debugging kompleks. Overhead-nya lebih tinggi tapi ekosistemnya kuat.\n\n**Jotai:**\nCocok jika state Anda bersifat atomic dan banyak fine-grained subscriptions. Lebih cocok untuk kasus spesifik seperti editor atau form kompleks.\n\n**Panduan cepat:**\n- Skala kecil-menengah, tim baru → Zustand\n- Enterprise, tim besar, butuh strict patterns → Redux Toolkit\n- State atomic banyak → Jotai\n\nHindari over-engineering: coba Context API dulu. Tambahkan state manager hanya jika performa atau kompleksitas jelas membutuhkannya.`,
        createdAt: new Date(now - 10 * day + 38_000),
      },
    ],
  },
];

export const DUMMY_RESPONSES = [
  'Pertanyaan yang menarik. Berdasarkan konteks yang Anda berikan, ada beberapa hal penting yang perlu dipertimbangkan sebelum mengambil keputusan.',
  'Saya mengerti kekhawatiran Anda. Mari kita telaah ini secara sistematis agar jawabannya benar-benar relevan dengan situasi Anda.',
  'Tentu. Ini adalah topik yang sering disalahpahami, jadi saya akan coba jelaskan dengan cara yang lebih praktis dan langsung ke poin utamanya.',
  'Bagus, ini pertanyaan yang tepat untuk ditanyakan sejak awal. Jawabannya tergantung pada beberapa faktor kunci yang perlu kita tentukan dulu.',
  'Ada beberapa pendekatan untuk ini, dan pilihan terbaik bergantung pada konteks spesifik Anda. Izinkan saya menjelaskan trade-off masing-masing.',
  'Saya bisa membantu dengan itu. Sebelum menjawab, penting untuk memastikan kita memiliki pemahaman yang sama tentang scope masalahnya.',
  'Ini adalah keputusan arsitektur yang cukup penting. Saya akan memberikan perspektif yang jujur termasuk kelebihan dan kekurangannya.',
];
