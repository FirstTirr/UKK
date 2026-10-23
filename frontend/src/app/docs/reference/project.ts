import type { Field, NoteDoc, Step } from "./types";

export const stack = [
  { label: "Frontend", value: "Next.js 16.4 (App Router) · React 19 · TypeScript · Tailwind CSS v4" },
  { label: "Backend", value: "Express 5 (Node.js, CommonJS) · JWT · bcrypt · express-rate-limit" },
  { label: "Database", value: "MariaDB (InnoDB, driver `mariadb`) + trigger & stored procedure" },
  { label: "Lainnya", value: "Google reCAPTCHA v2 · lucide-react · framer-motion" },
];

export const roles = [
  {
    name: "admin",
    desc: "Kelola data master (alat, kategori, user) dan memantau seluruh transaksi serta jejak aktivitas sistem.",
    pages: "/admin/dashboard · /admin/alat · /admin/kategori · /admin/user · /admin/log-aktivitas",
  },
  {
    name: "petugas",
    desc: "Memproses alur harian: menyetujui pengajuan, menyerahkan, dan menerima pengembalian alat.",
    pages: "/petugas/dashboard · /petugas/validasi · /petugas/pengambilan · /petugas/pengembalian",
  },
  {
    name: "peminjam",
    desc: "Mengajukan peminjaman multi-alat dan melihat riwayat pribadi. Dibuat lewat registrasi publik.",
    pages: "/peminjam/dashboard · /peminjam/pinjam · /peminjam/riwayat",
  },
];

export const structure = `UKK/
├── backend/                 # REST API (Express 5)
│   ├── seed.js              # Membuat user admin bawaan
│   └── src/
│       ├── index.js         # Entry point + pemasangan route /api
│       ├── config/db.js     # Connection pool MariaDB
│       ├── middleware/      # verifyToken, checkRole, loginLimiter
│       ├── routes/          # Deklarasi endpoint + guard role
│       ├── controllers/     # Validasi input & format respons
│       ├── services/        # Bisnis peminjaman, auth, dkk.
│       └── models/          # Semua query SQL
├── frontend/                # Next.js App Router
│   └── src/
│       ├── middleware.ts    # Proteksi route & alias /login
│       ├── lib/             # apiFetch + helper transaksi
│       ├── services/        # Pembungkus endpoint per resource
│       ├── components/      # Sidebar (dipakai semua layout)
│       └── app/             # Halaman per peran (admin/petugas/peminjam)
├── scema.sql                # Definisi tabel
└── trigger.sql              # Trigger stok + procedure pengembalian`;

export const setupSteps: Step[] = [
  {
    title: "1 · Siapkan database MariaDB",
    code: `mysql -u root -p < scema.sql     # membuat db_peminjaman_alat + tabel
mysql -u root -p < trigger.sql    # trigger stok & procedure pengembalian`,
  },
  {
    title: "2 · Buat akun admin bawaan",
    code: `cd backend && npm install
node seed.js                      # user "admin" / password "admin123"`,
  },
  {
    title: "3 · Jalankan backend",
    code: `cd backend
npx nodemon src/index.js          # atau: node src/index.js
# berjalan di http://localhost:5000 (sesuaikan PORT)`,
  },
  {
    title: "4 · Jalankan frontend",
    code: `cd frontend
npm install
npm run dev                       # buka http://localhost:3000/docs`,
  },
];

export const envVars: Field[] = [
  { name: "PORT", type: "backend · default 5000", note: "Port Express." },
  { name: "DB_HOST / DB_USER / DB_PASS / DB_NAME", type: "backend · default localhost / root / (kosong) / db_ukk", note: "Koneksi MariaDB." },
  { name: "JWT_SECRET", type: "backend · default 'rahasia_ukk'", note: "Kunci tanda tangan token. Ganti di produksi." },
  { name: "RECAPTCHA_SECRET_KEY", type: "backend", note: "Wajib untuk registrasi; tanpa ini register selalu gagal." },
  { name: "NEXT_PUBLIC_API_URL", type: "frontend · default http://localhost:8080", note: "URL dasar API." },
];

export const gotchas: NoteDoc[] = [
  {
    title: "Port backend vs frontend",
    text: "Frontend default ke http://localhost:8080, sementara backend default PORT 5000. Samakan lewat env NEXT_PUBLIC_API_URL dan PORT.",
  },
  {
    title: "Stok bukan dihitung aplikasi",
    text: "Jangan menambah pengurangan stok di service — cukup ubah status peminjaman dan biarkan trigger.sql yang menjaga stok.",
  },
  {
    title: "GET /peminjaman/read berbentuk datar",
    text: "Satu transaksi menghasilkan banyak baris. Selalu lewati hasilnya ke gabungTransaksi() sebelum dirender.",
  },
  {
    title: "Halaman admin/user memakai endpoint yang belum ada",
    text: "userService.update() memanggil PUT /users/:id, tetapi backend hanya menyediakan /users/profil. Edit user akan gagal sampai route tersebut ditambahkan.",
  },
  {
    title: "Registrasi menyentuh kolom nama_user",
    text: "authService.register meng-insert nama_user, sedangkan scema.sql belum mendefinisikan kolom tersebut — pastikan database produksi sudah menambahkannya.",
  },
  {
    title: "Middleware frontend hanya cek keberadaan cookie",
    text: "Token kedaluwarsa tetap lolos middleware; penolakan terjadi di backend (403 Token tidak valid).",
  },
  {
    title: "Login tidak memverifikasi CAPTCHA",
    text: "captchaToken hanya diverifikasi pada registrasi. Rate limiter (5/menit/IP) menjadi pelindung utama endpoint login.",
  },
  {
    title: "Log aktivitas ikut terhapus bersama user-nya",
    text: "log_aktivitas.id_user memakai ON DELETE CASCADE, jadi menghapus akun ikut menghapus seluruh jejak aktivitas akun tersebut.",
  },
  {
    title: "Database lama butuh ALTER untuk ip_address",
    text: "Kolom ip_address ditambahkan belakangan. Untuk tabel yang sudah ada jalankan: ALTER TABLE log_aktivitas ADD COLUMN ip_address VARCHAR(45) NULL AFTER aktivitas;",
  },
];
