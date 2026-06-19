/* =========================================================================
   ✦  EDIT EVERYTHING HERE  ✦
   Semua teks & data portofolio ada di file ini. Setiap field bilingual:
   { id: 'Bahasa Indonesia', en: 'English' }.
   Ganti konten placeholder di bawah dengan data asli kamu dari LinkedIn/CV.
   ========================================================================= */

export const profile = {
  name: 'Kautsar Baiq',
  // Inisial untuk monogram / logo
  initials: 'KB',
  role: {
    id: 'Software & Web Developer',
    en: 'Software & Web Developer',
  },
  location: {
    id: 'Indonesia',
    en: 'Indonesia',
  },
  // Kalimat besar di hero. Kata di dalam tanda * * akan tampil italic serif beraksen.
  headline: {
    id: 'Merancang & membangun web yang *terasa hidup*',
    en: 'I design & build web that *feels alive*',
  },
  tagline: {
    id: 'Developer yang ngoding dengan rasa desain — dari ide kasar sampai antarmuka yang halus.',
    en: 'A developer who codes with a designer’s eye — from rough idea to polished interface.',
  },
  available: {
    id: 'Terbuka untuk peluang & kolaborasi',
    en: 'Open to opportunities & collaboration',
  },
  email: 'pragozjawir@gmail.com',
  socials: [
    { label: 'LinkedIn', handle: '/in/kautsar-baiq', url: 'https://www.linkedin.com/in/kautsar-baiq/' },
    { label: 'GitHub', handle: '@kautsarbaiq', url: 'https://github.com/' },
    { label: 'Email', handle: 'pragozjawir@gmail.com', url: 'mailto:pragozjawir@gmail.com' },
  ],
}

export const about = {
  paragraphs: {
    id: [
      'Halo, saya Kautsar — seorang web developer yang percaya bahwa kode yang baik dan desain yang baik adalah satu kesatuan. Saya senang menerjemahkan ide menjadi antarmuka yang cepat, mulus, dan punya karakter.',
      'Sehari-hari saya bekerja dengan ekosistem JavaScript modern — React di depan, Node di belakang — sambil terus menjaga detail kecil yang membuat sebuah produk terasa berkelas: animasi yang pas, tipografi yang rapi, dan performa yang ringan.',
      'Di luar layar, saya selalu penasaran dengan hal baru: eksperimen visual, motion design, dan cara membuat teknologi terasa lebih manusiawi.',
    ],
    en: [
      'Hi, I’m Kautsar — a web developer who believes good code and good design are the same craft. I love turning ideas into interfaces that are fast, fluid, and full of character.',
      'Day to day I work across the modern JavaScript ecosystem — React on the front, Node on the back — while obsessing over the small details that make a product feel premium: the right motion, clean typography, and a light, fast experience.',
      'Away from the screen I stay curious — visual experiments, motion design, and finding ways to make technology feel a little more human.',
    ],
  },
  stats: [
    { value: '3+', label: { id: 'Tahun ngoding', en: 'Years coding' } },
    { value: '20+', label: { id: 'Proyek dikerjakan', en: 'Projects shipped' } },
    { value: '10+', label: { id: 'Teknologi dikuasai', en: 'Technologies' } },
    { value: '∞', label: { id: 'Rasa penasaran', en: 'Curiosity' } },
  ],
}

export const experience = [
  {
    role: { id: 'Frontend Developer', en: 'Frontend Developer' },
    company: 'Company / Studio',
    period: '2024 — Sekarang',
    location: { id: 'Remote', en: 'Remote' },
    points: {
      id: [
        'Membangun antarmuka web responsif dengan React & TypeScript untuk produk yang dipakai ribuan pengguna.',
        'Meningkatkan performa halaman hingga lebih cepat dimuat lewat optimasi rendering & aset.',
      ],
      en: [
        'Built responsive web interfaces with React & TypeScript for products used by thousands of users.',
        'Improved page performance through rendering and asset optimization.',
      ],
    },
    stack: ['React', 'TypeScript', 'Vite'],
  },
  {
    role: { id: 'Web Developer (Freelance)', en: 'Web Developer (Freelance)' },
    company: 'Independent',
    period: '2023 — 2024',
    location: { id: 'Indonesia', en: 'Indonesia' },
    points: {
      id: [
        'Merancang & membangun landing page dan website company profile dari nol untuk klien lokal.',
        'Mengintegrasikan CMS dan menjaga konsistensi desain di berbagai perangkat.',
      ],
      en: [
        'Designed & built landing pages and company-profile websites from scratch for local clients.',
        'Integrated CMS and kept design consistent across devices.',
      ],
    },
    stack: ['JavaScript', 'Next.js', 'Tailwind'],
  },
  {
    role: { id: 'Mahasiswa / Belajar Mandiri', en: 'Student / Self-taught' },
    company: 'Universitas / Bootcamp',
    period: '2021 — 2023',
    location: { id: 'Indonesia', en: 'Indonesia' },
    points: {
      id: [
        'Mendalami fondasi pemrograman web, struktur data, dan prinsip desain antarmuka.',
        'Membangun banyak proyek latihan untuk mengasah kemampuan dari dasar.',
      ],
      en: [
        'Studied the foundations of web programming, data structures, and interface design principles.',
        'Built many practice projects to sharpen skills from the ground up.',
      ],
    },
    stack: ['HTML', 'CSS', 'JavaScript'],
  },
]

export const projects = [
  {
    title: 'Aurora Dashboard',
    year: '2025',
    featured: true,
    tagline: {
      id: 'Dashboard analitik real-time dengan visualisasi data yang halus.',
      en: 'A real-time analytics dashboard with silky data visualisations.',
    },
    description: {
      id: 'Antarmuka dashboard penuh fitur: grafik interaktif, mode gelap, dan pembaruan data langsung. Fokus pada kecepatan dan kejelasan informasi.',
      en: 'A feature-rich dashboard interface: interactive charts, dark mode, and live data updates. Built for speed and clarity.',
    },
    tech: ['React', 'D3.js', 'WebSocket', 'Vite'],
    links: { live: '#', repo: '#' },
    accent: '#7c5cff',
  },
  {
    title: 'Nimbus Commerce',
    year: '2024',
    featured: false,
    tagline: {
      id: 'Toko online modern dengan checkout yang mulus.',
      en: 'A modern storefront with a frictionless checkout.',
    },
    description: {
      id: 'Platform e-commerce dengan keranjang real-time, pencarian instan, dan halaman produk yang cepat dimuat.',
      en: 'An e-commerce platform with a real-time cart, instant search, and lightning-fast product pages.',
    },
    tech: ['Next.js', 'Stripe', 'PostgreSQL'],
    links: { live: '#', repo: '#' },
    accent: '#22d3ee',
  },
  {
    title: 'Pulse Motion',
    year: '2024',
    featured: false,
    tagline: {
      id: 'Library animasi mikro untuk antarmuka web.',
      en: 'A micro-animation library for web interfaces.',
    },
    description: {
      id: 'Kumpulan komponen animasi ringan yang bisa dipakai ulang, dengan dokumentasi interaktif.',
      en: 'A collection of lightweight, reusable animation components with interactive docs.',
    },
    tech: ['TypeScript', 'Framer Motion', 'Rollup'],
    links: { live: '#', repo: '#' },
    accent: '#ff5c87',
  },
  {
    title: 'Lumen Portfolio',
    year: '2023',
    featured: false,
    tagline: {
      id: 'Template portofolio kreatif untuk para desainer.',
      en: 'A creative portfolio template for designers.',
    },
    description: {
      id: 'Template open-source dengan transisi halaman yang elegan dan kustomisasi tema yang mudah.',
      en: 'An open-source template with elegant page transitions and easy theme customisation.',
    },
    tech: ['Astro', 'GSAP', 'CSS'],
    links: { live: '#', repo: '#' },
    accent: '#8b6dff',
  },
]

export const skills = [
  {
    group: { id: 'Bahasa', en: 'Languages' },
    items: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Python'],
  },
  {
    group: { id: 'Frontend', en: 'Frontend' },
    items: ['React', 'Next.js', 'Vite', 'Framer Motion', 'Tailwind', 'Three.js'],
  },
  {
    group: { id: 'Backend & Tools', en: 'Backend & Tools' },
    items: ['Node.js', 'Express', 'PostgreSQL', 'Git', 'Figma', 'REST API'],
  },
]

export const education = [
  {
    school: { id: 'Nama Universitas', en: 'University Name' },
    degree: { id: 'S1 — Teknik Informatika', en: 'B.Sc. — Computer Science' },
    period: '2021 — 2025',
  },
]

/* Pita teknologi yang berputar di section Skills */
export const marquee = [
  'React',
  'TypeScript',
  'Next.js',
  'Three.js',
  'Node.js',
  'Framer Motion',
  'Vite',
  'Tailwind',
  'PostgreSQL',
  'Figma',
  'GSAP',
  'WebGL',
]
