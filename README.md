# Resto Maeso Aji Barokah — Digital QR Menu & Dasbor Kasir

Aplikasi web menu digital dan sistem kelola kasir modern untuk **Resto Maeso Aji Barokah**, dibangun sebagai **Single Page Application (SPA) React + Vite** murni di sisi client yang terhubung langsung ke **Supabase** (Database Postgres, Supabase Auth, dan Supabase Storage) dan siap di-deploy langsung secara gratis ke **GitHub Pages**.

---

## Fitur Utama

- **Menu Digital Tamu**: Tampilan katalog menu khas Pati (Sop, Asem-asem, Nasi Gandul, Rawon, Aneka Bakaran & Minuman) dengan filter kategori cepat, pencarian instan, varian porsi (Kecil/Besar), dan level pedas.
- **Koneksi Langsung ke Supabase**: Menggunakan `@supabase/supabase-js` dengan kunci `anon` (publishable).
- **Keamanan Berlapis (Row Level Security)**: Data menu dapat dibaca publik, namun penambahan, pengubahan ketersediaan stok, dan penghapusan menu hanya dapat dilakukan oleh staf kasir terautentikasi.
- **Unggah Foto Menu Langsung**: Upload foto menu resolusi tinggi langsung dari browser ke Supabase Storage bucket `menu-photos`.
- **Dasbor Kasir Privat (`/admin`)**: Manajemen kategori, item menu, toggle ketersediaan stok secara *live*, dan informasi restoran.
- **Otomasi CI/CD GitHub Pages**: Workflow GitHub Actions otomatis membangun dan menerbitkan aplikasi ke GitHub Pages setiap ada `git push` ke branch `main`.

---

## Langkah 1: Persiapan Database Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan pilih/buat project baru Anda.
2. Masuk ke menu **SQL Editor** di panel sebelah kiri, klik **New Query**.
3. Buka file [`supabase_schema.sql`](./supabase_schema.sql) pada repositori ini, salin seluruh isinya, tempel ke dalam SQL Editor Supabase, lalu klik tombol **Run**.
   *(Skrip ini otomatis membuat tabel `restaurant_info`, `categories`, `menu_items`, bucket storage `menu-photos`, serta seluruh aturan keamanan Row Level Security).*
4. Buat akun kasir di menu **Authentication > Users**:
   - Klik **Add User** > **Create User**.
   - Masukkan email (contoh: `kasir@maesoaji.com`) dan kata sandi yang kuat.
   - Centang opsi **Auto Confirm User** (Email Confirm).

---

## Langkah 2: Deploy ke GitHub Pages

### A. Buat Repositori GitHub & Push Kode

1. Buat repositori baru di [GitHub](https://github.com/new) (misal: `resto-maeso-aji`).
2. Di terminal komputer Anda, inisialisasi git dan push kode ini ke branch `main`:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi menu digital resto maeso aji client-side"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/resto-maeso-aji.git
   git push -u origin main
   ```

### B. Tambahkan 2 Repository Secrets di GitHub

Karena Vite meng-embed environment variables yang berawalan `VITE_` pada saat proses kompilasi (`npm run build`), Anda perlu mendaftarkannya di GitHub Secrets:

1. Di repositori GitHub Anda, buka tab **Settings**.
2. Di sidebar kiri, klik **Secrets and variables** > **Actions**.
3. Klik tombol **New repository secret**, lalu tambahkan dua rahasia berikut:

| Nama Secret | Deskripsi / Nilai |
|---|---|
| `VITE_SUPABASE_URL` | URL project Supabase Anda (contoh: `https://xyzcompany.supabase.co`). Didapat dari *Supabase > Project Settings > API*. |
| `VITE_SUPABASE_ANON_KEY` | Kunci **anon / public** Supabase Anda (`eyJhbGciOi...`). Didapat dari *Supabase > Project Settings > API > Project API keys*. |

### C. Aktifkan GitHub Pages (Source: GitHub Actions)

1. Masih di halaman **Settings** repositori GitHub Anda, klik menu **Pages** di sidebar kiri.
2. Pada bagian **Build and deployment > Source**, pilih opsi:
   **GitHub Actions** (bukan "Deploy from a branch").
3. Selesai! Buka tab **Actions** di repositori Anda. Anda akan melihat workflow **Deploy to GitHub Pages** berjalan secara otomatis.
4. Begitu workflow selesai (tanda centang hijau), URL web Anda akan muncul di tab Pages (contoh: `https://USERNAME_ANDA.github.io/resto-maeso-aji/`).

---

## Pengaturan Base Path pada `vite.config.ts`

Secara default, file `vite.config.ts` telah dikonfigurasi dengan:
```ts
base: process.env.VITE_BASE_PATH || './',
```
Pengaturan `./` ini membuat seluruh path asset bersifat relatif sehingga aplikasi langsung berjalan mulus di subfolder GitHub Pages maupun custom domain tanpa perlu konfigurasi tambahan.

Jika Anda ingin menentukan nama repositori secara eksplisit, Anda dapat mengubahnya di `vite.config.ts`:
```ts
base: '/resto-maeso-aji/',
```

---

## Cara Mengakses Aplikasi

- **Menu Tamu / Pelanggan**:
  Buka URL utama situs Anda:
  `https://USERNAME_ANDA.github.io/NAMA_REPO/`
- **Dasbor Kasir**:
  Buka URL khusus admin:
  `https://USERNAME_ANDA.github.io/NAMA_REPO/admin`
  *(Masukkan email dan kata sandi kasir yang telah didaftarkan di Supabase Auth untuk masuk).*
