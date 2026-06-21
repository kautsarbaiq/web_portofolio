/* =========================================================================
   ✦  EDIT EVERYTHING HERE  ✦
   Semua teks & data portofolio ada di file ini. Setiap field bilingual:
   { id: 'Bahasa Indonesia', en: 'English' }.
   Konten di bawah diambil dari CV Kautsar Qaulan Sadida Baiquni.
   Catatan: link demo/repo proyek masih '#' — isi dengan URL asli bila ada.
   ========================================================================= */

export const profile = {
  name: 'Kautsar Qaulan Sadida Baiquni',
  initials: 'KB',
  role: {
    id: 'Fullstack Web Developer',
    en: 'Fullstack Web Developer',
  },
  location: {
    id: 'Bandung, Indonesia',
    en: 'Bandung, Indonesia',
  },
  // Kalimat besar di hero. Kata di dalam tanda * * akan tampil italic serif beraksen.
  headline: {
    id: 'Merancang & membangun web yang *terasa hidup*',
    en: 'I design & build web that *feels alive*',
  },
  tagline: {
    id: 'Fullstack developer yang terobsesi frontend — membangun aplikasi web yang scalable & pixel-perfect dengan Next.js, React, dan TypeScript.',
    en: 'A fullstack developer with a frontend obsession — building scalable, pixel-perfect web apps with Next.js, React & TypeScript.',
  },
  available: {
    id: 'Terbuka untuk peluang & kolaborasi',
    en: 'Open to opportunities & collaboration',
  },
  email: 'pragozjawir@gmail.com',
  phone: '+62 812-2193-2219',
  socials: [
    { label: 'LinkedIn', handle: '/in/kautsar-baiq', url: 'https://www.linkedin.com/in/kautsar-baiq/' },
    { label: 'WhatsApp', handle: '+62 812-2193-2219', url: 'https://wa.me/6281221932219' },
    { label: 'Email', handle: 'pragozjawir@gmail.com', url: 'mailto:pragozjawir@gmail.com' },
  ],
}

export const about = {
  paragraphs: {
    id: [
      'Saya Kautsar — fullstack web developer dengan spesialisasi di arsitektur frontend, dan rekam jejak merilis aplikasi web yang scalable serta siap produksi.',
      'Saat ini saya memimpin sebuah inisiatif digital untuk Pemerintah Kota Serang dan bekerja sebagai fullstack & app developer di Blue Soft IoT, Malaysia — merancang produk yang kokoh dan berpusat pada pengguna dengan Next.js, React, dan TypeScript.',
      'Saya senang menjembatani logika backend yang kompleks dengan antarmuka yang cepat, responsif, dan pixel-perfect — serta sangat peduli pada kode yang bersih dan mudah dirawat. Peraih Medali Emas POSN bidang Informatika.',
    ],
    en: [
      'I’m Kautsar — a fullstack web developer specializing in frontend architecture, with a proven track record of shipping scalable, production-ready web applications.',
      'Right now I’m leading a digital initiative for the Serang City Government and working as a fullstack & app developer at Blue Soft IoT in Malaysia — architecting robust, user-centric products with Next.js, React, and TypeScript.',
      'I love bridging complex backend logic with high-performance, responsive, pixel-perfect interfaces — and I care deeply about clean, maintainable code. POSN Informatika Gold Medalist.',
    ],
  },
  stats: [
    { value: '8+', label: { id: 'Proyek dikerjakan', en: 'Projects shipped' } },
    { value: 'Gold', label: { id: 'POSN Informatika', en: 'POSN Informatics' } },
    { value: '3', label: { id: 'Sertifikasi', en: 'Certifications' } },
    { value: '2', label: { id: 'Negara (ID & MY)', en: 'Countries (ID & MY)' } },
  ],
}

export const experience = [
  {
    role: { id: 'Fullstack Web & App Developer', en: 'Fullstack Web & App Developer' },
    company: 'Blue Soft IoT Sdn Bhd',
    period: { id: 'Apr 2026 — Sekarang', en: 'Apr 2026 — Present' },
    location: { id: 'Selangor, Malaysia', en: 'Selangor, Malaysia' },
    points: {
      id: [
        'Membangun website company profile dan tools internal untuk PHH (industri baja, Malaysia & Indonesia) serta Blue Soft (IoT & software development).',
        'Mengembangkan PHH Inventory — aplikasi web untuk manajemen pemotongan baja yang kompleks — dengan React, Vite, TypeScript & Tailwind CSS.',
        'Membangun HRMAPP, aplikasi manajemen karyawan lintas platform (absensi, izin, kontrak, check-out) menggunakan Flutter.',
      ],
      en: [
        'Building company-profile sites and internal tools for PHH (steel industry, Malaysia & Indonesia) and Blue Soft (IoT & software development).',
        'Engineered PHH Inventory — a web app for complex steel-cutting management — with React, Vite, TypeScript & Tailwind CSS.',
        'Developed HRMAPP, a cross-platform employee-management app (attendance, permits, contracts, check-outs) using Flutter.',
      ],
    },
    stack: ['React', 'TypeScript', 'Vite', 'Flutter'],
  },
  {
    role: { id: 'Web Developer', en: 'Web Developer' },
    company: 'KPU Kota Serang',
    period: { id: 'Agu 2025 — Mei 2026', en: 'Aug 2025 — May 2026' },
    location: { id: 'Serang, Indonesia', en: 'Serang, Indonesia' },
    points: {
      id: [
        'Membangun portal pegawai e-Office KPU Kota Serang — sistem SPPD (Surat Perjalanan Dinas) digital.',
        'Mengembangkan fitur Buat SPD, Surat Perintah Tugas (SPT), Bukti Konfirmasi, Kuitansi, dan Laporan Perjalanan untuk merampingkan administrasi perjalanan dinas pegawai.',
      ],
      en: [
        'Built the e-Office staff portal for the Serang Election Commission (KPU) — a digital official-travel (SPPD) system.',
        'Developed Create Travel Order (SPD), Assignment Letter (SPT), Confirmation, Receipt, and Travel Report features to streamline employee travel administration.',
      ],
    },
    stack: ['JavaScript', 'WebGL', 'CSS'],
  },
  {
    role: { id: 'Fullstack Web Developer', en: 'Fullstack Web Developer' },
    company: 'Pemerintah Kota Serang',
    period: { id: 'Agu 2025 — Mei 2026', en: 'Aug 2025 — May 2026' },
    location: { id: 'Serang, Indonesia', en: 'Serang, Indonesia' },
    points: {
      id: [
        'Memimpin pengembangan dan peningkatan teknis website Pemerintah Kota Serang dengan Next.js & TypeScript, mendorong transformasi digital layanan publik.',
        'Membangun website pribadi Wali Kota Serang, mengoptimalkan performa dan merancang fitur baru yang berpusat pada pengguna.',
      ],
      en: [
        'Spearheaded the development and technical upgrade of the Serang City Government website with Next.js & TypeScript, driving digital transformation for public services.',
        'Built the Mayor of Serang’s personal website, optimizing performance and architecting new user-centric features.',
      ],
    },
    stack: ['Next.js', 'TypeScript', 'Tailwind'],
  },
  {
    role: { id: 'Web Developer', en: 'Web Developer' },
    company: 'Kementerian Agama Kota Lebak',
    period: { id: 'Agu 2025 — Mei 2026', en: 'Aug 2025 — May 2026' },
    location: { id: 'Lebak, Indonesia', en: 'Lebak, Indonesia' },
    points: {
      id: [
        'Membangun “Selaras”, platform ta’aruf digital — atas usulan Kepala Kemenag Lebak — untuk mempertemukan calon pasangan secara syar’i: “Match Online, Meet Offline, With Ustadz”.',
        'Merancang alur pendaftaran, pencocokan, dan kelas pra-nikah dengan pendampingan ustadz.',
      ],
      en: [
        'Built “Selaras”, a digital ta’aruf platform — at the suggestion of the head of Kemenag Lebak — to connect prospective partners the syariah way: “Match Online, Meet Offline, With Ustadz”.',
        'Designed the registration, matching, and pre-marriage class flows with ustadz guidance.',
      ],
    },
    stack: ['Laravel', 'Tailwind'],
  },
  {
    role: { id: 'IT Trainer (Relawan)', en: 'IT Trainer (Volunteer)' },
    company: 'SMA Mekar Harum & SMK 1 Cimahi',
    period: { id: '2025', en: '2025' },
    location: { id: 'Bandung, Indonesia', en: 'Bandung, Indonesia' },
    points: {
      id: [
        'Relawan pengajar IT yang membekali siswa dengan keterampilan teknis dasar dan literasi digital.',
        'Merancang silabus interaktif pengenalan pemrograman web, mengajarkan HTML, CSS & JavaScript lewat praktik langsung yang ramah pemula.',
      ],
      en: [
        'Volunteer IT trainer empowering students with foundational technical skills and digital literacy.',
        'Designed an interactive intro-to-web-programming syllabus, teaching HTML, CSS & JavaScript through beginner-friendly, hands-on practice.',
      ],
    },
    stack: ['HTML', 'CSS', 'JavaScript'],
  },
]

/* Urutan: proyek web dengan screenshot asli dulu, lalu KPU (masih mockup,
   belum ada foto asli), terakhir proyek aplikasi (app) di paling bawah.
   `image` -> screenshot di /public/projects; `type`: 'web' | 'app'. */
export const projects = [
  {
    title: 'Akapack POS',
    year: '2026',
    type: 'web',
    tagline: {
      id: 'Aplikasi kasir & manajemen retail untuk UMKM.',
      en: 'POS & retail management app for small businesses.',
    },
    tech: ['Next.js', 'Supabase', 'TanStack', 'Tailwind'],
    links: { live: 'https://akapack-program-kasir.vercel.app', repo: 'https://github.com/kautsarbaiq/akapack_program_kasir' },
    image: '/projects/akapack-kasir.png',
    accent: '#f472b6',
  },
  {
    title: 'Akapack Website',
    year: '2026',
    type: 'web',
    tagline: {
      id: 'Website perusahaan untuk Akapack.',
      en: 'Company website for Akapack.',
    },
    tech: ['Next.js', 'Supabase', 'Tailwind'],
    links: { live: 'https://akapack-website.vercel.app', repo: 'https://github.com/kautsarbaiq/akapack_website' },
    image: '/projects/akapack-website.png',
    accent: '#2dd4ff',
  },
  {
    title: 'PHH Inventory',
    year: '2026',
    type: 'web',
    tagline: {
      id: 'Manajemen inventaris & pemotongan baja.',
      en: 'Steel inventory & cutting management.',
    },
    tech: ['React', 'Vite', 'TypeScript', 'Tailwind'],
    links: { live: 'https://phh-inventory-web-client.vercel.app', repo: 'https://github.com/kautsarbaiq/PHH-inventory-web' },
    image: '/projects/phh-inventory.png',
    accent: '#6d5efc',
  },
  {
    title: 'Blue Soft',
    year: '2026',
    type: 'web',
    tagline: {
      id: 'Company profile interaktif dengan elemen 3D (Spline).',
      en: 'Interactive company profile with 3D (Spline).',
    },
    tech: ['React', 'Vite', 'Spline', 'Tailwind'],
    links: { live: 'https://web-blue-soft.vercel.app', repo: 'https://github.com/kautsarbaiq/web-blue-soft' },
    image: '/projects/blue-soft.png',
    accent: '#6d5efc',
  },
  {
    title: 'PHH Ecommerce',
    year: '2026',
    type: 'web',
    tagline: {
      id: 'Situs perusahaan & katalog untuk PHH (sektor baja).',
      en: 'Company site & catalog for PHH (steel sector).',
    },
    tech: ['HTML', 'CSS', 'JavaScript'],
    links: { live: 'https://phh-ecommerce.vercel.app', repo: 'https://github.com/kautsarbaiq/PHH-Ecommerce' },
    image: '/projects/phh-ecommerce.png',
    accent: '#2dd4ff',
  },
  {
    title: 'Selaras',
    year: '2025',
    type: 'web',
    tagline: {
      id: 'Platform ta’aruf digital — “Match Online, Meet Offline, With Ustadz”.',
      en: 'A digital ta’aruf platform — “Match Online, Meet Offline, With Ustadz”.',
    },
    tech: ['Laravel', 'Tailwind CSS'],
    links: { live: '', repo: '' },
    image: '/projects/selaras.png',
    accent: '#16a34a',
  },
  {
    title: 'KPU Kota Serang',
    year: '2026',
    type: 'web',
    tagline: {
      id: 'Sistem pelaporan & absensi untuk KPU Kota Serang.',
      en: 'Reporting & attendance system for the Serang Election Commission.',
    },
    tech: ['JavaScript', 'WebGL', 'CSS'],
    links: { live: '', repo: 'https://github.com/kautsarbaiq/web_KPU_kota_serang' },
    image: '/projects/kpu-serang.png',
    accent: '#f472b6',
  },
  {
    title: 'HCM PHH',
    year: '2026',
    type: 'app',
    tagline: {
      id: 'Aplikasi manajemen komunitas perumahan dengan panel admin web.',
      en: 'Housing-community management app with a web admin panel.',
    },
    tech: ['Flutter', 'Dart', 'PostgreSQL'],
    links: { live: 'https://adminhousing.vercel.app', repo: 'https://github.com/kautsarbaiq/HCM-PHH-App' },
    image: '/projects/hcm-phh.png',
    accent: '#6d5efc',
  },
  {
    title: 'HRM App',
    year: '2026',
    type: 'app',
    tagline: {
      id: 'Aplikasi manajemen karyawan: absensi, izin, kontrak.',
      en: 'Employee management app: attendance, permits, contracts.',
    },
    tech: ['Flutter', 'Dart'],
    links: { live: '', repo: 'https://github.com/kautsarbaiq/HRM-APP' },
    image: '/projects/hrm-app.png',
    accent: '#2dd4ff',
  },
]

export const skills = [
  {
    group: { id: 'Frontend', en: 'Frontend' },
    items: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Vite'],
  },
  {
    group: { id: 'Backend & Mobile', en: 'Backend & Mobile' },
    items: ['Laravel', 'Flutter', 'REST API', 'HTML', 'CSS'],
  },
  {
    group: { id: 'Desain & Tools', en: 'Design & Tools' },
    items: ['Figma', 'Canva', 'UI/UX Design'],
  },
]

export const awards = [
  {
    title: { id: 'Peraih Medali Emas — Informatika', en: 'Gold Medalist — Informatics' },
    issuer: 'POSN (Pekan Olimpiade Sains Nasional)',
  },
]

/* Sertifikat — yang kuat/IBM di atas. Section Skills menampilkan beberapa
   dulu, sisanya di balik tombol "Lihat semua". */
export const certifications = [
  { title: 'Introduction to Artificial Intelligence', issuer: 'IBM', year: '2025' },
  { title: 'Introduction to Generative AI', issuer: 'IBM', year: '2025' },
  { title: 'AI Ethics', issuer: 'IBM', year: '2025' },
  { title: 'Belajar Dasar Cloud dan Gen AI di AWS', issuer: 'Dicoding Indonesia', year: '2026' },
  { title: 'Front-End Developer', issuer: 'Dicoding Indonesia', year: '2025' },
  { title: 'Career Management Essentials', issuer: 'IBM', year: '2025' },
  { title: 'Ace Your Professional Interview', issuer: 'IBM', year: '2025' },
  { title: 'Create a Great Professional Resume', issuer: 'IBM', year: '2025' },
  { title: 'Develop Your Professional Network and Brand', issuer: 'IBM', year: '2025' },
  { title: 'Focus Your Direction with Workplace Research', issuer: 'IBM', year: '2025' },
  { title: 'Fundamental Front-End Web Development', issuer: 'Coding Studio' },
  { title: 'Belajar Dasar Pemrograman JavaScript', issuer: 'Dicoding Indonesia' },
  { title: 'HTML Basic', issuer: 'Skilvul' },
]

export const education = [
  {
    school: { id: 'SMK IDN Boarding School', en: 'SMK IDN Boarding School' },
    degree: {
      id: 'SMK — Web & Software Development, Public Speaking',
      en: 'Vocational High — Web & Software Development, Public Speaking',
    },
    period: { id: 'Jul 2024 — Mei 2027 (Perkiraan)', en: 'Jul 2024 — May 2027 (Expected)' },
  },
  {
    school: { id: 'SMP Welas Asih', en: 'SMP Welas Asih' },
    degree: { id: 'SMP — Bisnis & Alam', en: 'Junior High — Business & Nature' },
    period: { id: 'Jun 2021 — Mei 2024', en: 'Jun 2021 — May 2024' },
  },
]

/* Pita teknologi yang berputar di section Skills */
export const marquee = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Tailwind CSS',
  'Laravel',
  'Flutter',
  'Vite',
  'Figma',
  'HTML',
  'CSS',
  'UI/UX',
]
