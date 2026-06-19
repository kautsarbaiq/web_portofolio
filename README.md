# ✦ Kautsar Baiq — Portfolio

A dark, glowing, interactive developer portfolio. Built with **React + Vite + Framer Motion**, with a bespoke **three.js** particle field as the hero centerpiece. Bilingual (Indonesia / English).

![stack](https://img.shields.io/badge/React-18-61dafb) ![stack](https://img.shields.io/badge/Vite-5-646cff) ![stack](https://img.shields.io/badge/three.js-r170-000)

---

## Menjalankan (Run)

```bash
npm install      # sekali saja
npm run dev      # buka http://localhost:5173
npm run build    # build produksi ke /dist
npm run preview  # preview hasil build
```

---

## ✏️ Mengedit konten — SATU file saja

Semua teks & data ada di **`src/content/data.js`**. Tidak perlu menyentuh komponen.
Setiap teks ditulis bilingual:

```js
role: { id: 'Software & Web Developer', en: 'Software & Web Developer' }
```

- `id` = Bahasa Indonesia, `en` = English. Tombol **ID / EN** di nav mengganti bahasa.
- Pada `headline`, kata di dalam tanda `*...*` tampil sebagai **italic serif beraksen gradien**.
  Contoh: `'Merancang web yang *terasa hidup*'`.

Bagian yang bisa diedit di `data.js`:

| Objek | Isi |
|-------|-----|
| `profile` | nama, peran, headline, tagline, email, sosial media |
| `about` | paragraf perkenalan + statistik |
| `experience` | daftar pengalaman kerja (posisi, perusahaan, periode, poin, stack) |
| `projects` | proyek (judul, deskripsi, teknologi, link, warna aksen) |
| `skills` | keahlian per kategori |
| `education` | pendidikan |
| `marquee` | teknologi yang berputar di section Skills |

> Konten saat ini masih **placeholder**. Ganti dengan data asli dari LinkedIn/CV kamu.

### Foto / gambar proyek
Saat ini cover proyek dibuat otomatis (gradien + nomor). Untuk memakai gambar asli,
taruh file di `public/` lalu tambahkan field `image: '/nama.jpg'` pada proyek dan
render di `src/components/Projects.jsx`.

---

## 🎨 Mengubah tampilan

- **Warna & font**: `src/index.css` (bagian `:root` — token `--violet`, `--cyan`, `--font-display`, dst).
- **Bola partikel 3D**: `src/components/Scene3D.jsx` (jumlah partikel, warna, kecepatan).
- **Animasi intro**: `src/components/Preloader.jsx`.

Semua animasi otomatis non-aktif saat pengguna mengaktifkan *reduce motion* di OS-nya.

---

## 🚀 Deploy

Hasil `npm run build` ada di folder `dist/` (static). Bisa di-deploy gratis ke:

- **Vercel** — `npm i -g vercel && vercel` (atau hubungkan repo GitHub).
- **Netlify** — drag & drop folder `dist/`, atau hubungkan repo.
- **GitHub Pages** — upload isi `dist/`.

---

Dibuat dengan React, Three.js & rasa. ✦
