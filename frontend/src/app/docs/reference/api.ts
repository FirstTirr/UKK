import type { ApiGroup } from "./types";

export const apiGroups: ApiGroup[] = [
  {
    id: "api-auth",
    title: "Auth",
    base: "/api/auth",
    desc: "Login dan registrasi. Registrasi selalu menghasilkan role peminjam.",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/login",
        summary: "Masuk dan mendapatkan JWT.",
        auth: "Publik · dibatasi 5 percobaan/menit per IP",
        body: [
          { name: "username", type: "string", required: true },
          { name: "password", type: "string", required: true },
          { name: "captchaToken", type: "string", note: "Dikirim frontend, tidak diverifikasi server." },
        ],
        response: `{
  "message": "Login berhasil",
  "token": "eyJhbGciOi...",
  "user": {
    "id_user": 1,
    "username": "admin",
    "role": "admin",
    "no_hp": null,
    "alamat": null
  }
}`,
        notes: [
          "400 bila username/password kosong, 401 bila kredensial salah.",
          "429 bila melebihi batas rate limiter (pesan “Maksimal percobaan login tercapai”).",
          "Setiap login tercatat di tabel log_aktivitas.",
        ],
      },
      {
        method: "POST",
        path: "/api/auth/register",
        summary: "Mendaftarkan akun peminjam baru.",
        auth: "Publik · CAPTCHA wajib valid",
        body: [
          { name: "nama_user", type: "string", required: true },
          { name: "username", type: "string", required: true, note: "Harus unik." },
          { name: "password", type: "string", required: true, note: "Di-hash bcrypt (10 rounds)." },
          { name: "captchaToken", type: "string", required: true, note: "Token reCAPTCHA v2 dari frontend." },
        ],
        response: `{
  "message": "Registrasi berhasil",
  "success": true,
  "user": { "id_user": 7, "nama_user": "Budi", "username": "budi", "role": "peminjam" }
}`,
        notes: [
          "400 bila CAPTCHA gagal, username dipakai, atau server belum mengisi RECAPTCHA_SECRET_KEY.",
          "Role selalu dipaksa menjadi peminjam.",
        ],
      },
    ],
  },
  {
    id: "api-users",
    title: "Users",
    base: "/api/users",
    desc: "Profil milik sendiri (semua role) dan manajemen akun (khusus admin).",
    endpoints: [
      {
        method: "GET",
        path: "/api/users/profil",
        summary: "Membaca profil sendiri.",
        auth: "Login (semua role)",
        response: `{ "id_user": 4, "username": "budi", "role": "peminjam", "no_hp": "0812...", "alamat": "Jl. Merdeka 1" }`,
        notes: ["no_hp dan alamat dikembalikan sebagai string kosong bila belum diisi."],
      },
      {
        method: "PUT",
        path: "/api/users/profil",
        summary: "Menyimpan nomor HP & alamat (wajib sebelum alat dikirim).",
        auth: "Login (semua role)",
        body: [
          { name: "no_hp", type: "string", required: true },
          { name: "alamat", type: "string", required: true },
        ],
        response: `{ "message": "Nomor HP dan alamat berhasil disimpan" }`,
        notes: ["400 bila salah satu field kosong."],
      },
      {
        method: "GET",
        path: "/api/users/read",
        summary: "Seluruh user (tanpa hash password).",
        auth: "admin",
        response: `[
  { "id_user": 1, "username": "admin", "role": "admin", "no_hp": null, "alamat": null }
]`,
      },
      {
        method: "POST",
        path: "/api/users",
        summary: "Membuat akun oleh admin.",
        auth: "admin",
        body: [
          { name: "username", type: "string", required: true },
          { name: "password", type: "string", required: true },
          { name: "role", type: "'admin' | 'petugas' | 'peminjam'", required: true },
        ],
        response: `{ "message": "User berhasil ditambahkan" }`,
        notes: ["201 Created. Password di-hash sebelum disimpan."],
      },
      {
        method: "DELETE",
        path: "/api/users/delete/:id",
        summary: "Menghapus user (hard delete).",
        auth: "admin",
        params: [{ name: "id", type: "number", required: true, note: "id_user." }],
        response: `{ "message": "User berhasil dihapus" }`,
      },
    ],
  },
  {
    id: "api-kategori",
    title: "Kategori",
    base: "/api/kategori",
    desc: "Kelompokkan alat. Semua route butuh token, hanya admin yang boleh menulis.",
    endpoints: [
      {
        method: "GET",
        path: "/api/kategori/read",
        summary: "Daftar seluruh kategori.",
        auth: "Login (semua role)",
        response: `[{ "id_kategori": 1, "nama_kategori": "Elektronik" }]`,
      },
      {
        method: "POST",
        path: "/api/kategori",
        summary: "Menambah kategori.",
        auth: "admin",
        body: [{ name: "nama_kategori", type: "string", required: true }],
        response: `{ "message": "Kategori berhasil ditambahkan" }`,
        notes: ["201 Created."],
      },
      {
        method: "PUT",
        path: "/api/kategori/edit/:id",
        summary: "Mengubah nama kategori.",
        auth: "admin",
        params: [{ name: "id", type: "number", required: true }],
        body: [{ name: "nama_kategori", type: "string", required: true }],
        response: `{ "message": "Kategori berhasil diperbarui" }`,
      },
      {
        method: "DELETE",
        path: "/api/kategori/delete/:id",
        summary: "Menghapus kategori.",
        auth: "admin",
        params: [{ name: "id", type: "number", required: true }],
        response: `{ "message": "Kategori berhasil dihapus" }`,
        notes: ["ON DELETE CASCADE: alat pada kategori ikut terhapus dari tabel alat."],
      },
    ],
  },
  {
    id: "api-alat",
    title: "Alat",
    base: "/api/alat",
    desc: "Inventaris alat. Penghapusan bersifat soft delete (deleted_at).",
    endpoints: [
      {
        method: "GET",
        path: "/api/alat/read",
        summary: "Daftar alat aktif beserta kategori & stok tersedia.",
        auth: "Login (semua role)",
        response: `[
  {
    "id_alat": 3,
    "nama_alat": "Multimeter",
    "id_kategori": 1,
    "stok": 10,
    "deskripsi": "Avometer digital",
    "harga_perhari": "5000.00",
    "created_at": "...",
    "deleted_at": null,
    "nama_kategori": "Elektronik",
    "stok_tersedia": 8
  }
]`,
        notes: ["stok_tersedia = stok fisik − unit yang dipesan transaksi Menunggu/Disetujui."],
      },
      {
        method: "GET",
        path: "/api/alat/read/:id",
        summary: "Detail satu alat.",
        auth: "Login (semua role)",
        params: [{ name: "id", type: "number", required: true }],
        response: `{ ...objek_alat, "nama_kategori": "Elektronik", "stok_tersedia": 8 }`,
        notes: ["404 bila tidak ada atau sudah soft delete."],
      },
      {
        method: "POST",
        path: "/api/alat",
        summary: "Menambah alat.",
        auth: "admin | petugas",
        body: [
          { name: "nama_alat", type: "string", required: true },
          { name: "id_kategori", type: "number", required: true },
          { name: "stok", type: "number", required: true },
          { name: "deskripsi", type: "string | null" },
          { name: "harga_perhari", type: "number", note: "Default 0." },
        ],
        response: `{ "message": "Alat berhasil ditambahkan" }`,
        notes: ["201 Created. 400 bila nama/id_kategori/stok kosong."],
      },
      {
        method: "PUT",
        path: "/api/alat/edit/:id",
        summary: "Mengubah data alat.",
        auth: "admin | petugas",
        params: [{ name: "id", type: "number", required: true }],
        body: [
          { name: "nama_alat", type: "string", required: true },
          { name: "id_kategori", type: "number", required: true },
          { name: "stok", type: "number", required: true },
          { name: "deskripsi", type: "string | null" },
          { name: "harga_perhari", type: "number" },
        ],
        response: `{ "message": "Data alat berhasil diperbarui" }`,
      },
      {
        method: "DELETE",
        path: "/api/alat/delete/:id",
        summary: "Menghapus alat (soft delete).",
        auth: "admin",
        params: [{ name: "id", type: "number", required: true }],
        response: `{ "message": "Alat berhasil dihapus" }`,
        notes: ["Baris tetap ada; deleted_at diisi CURRENT_TIMESTAMP agar riwayat lama tetap terbaca."],
      },
    ],
  },
  {
    id: "api-peminjaman",
    title: "Peminjaman",
    base: "/api/peminjaman",
    desc: "Inti aplikasi: pengajuan transaksi dan validasi oleh petugas.",
    endpoints: [
      {
        method: "GET",
        path: "/api/peminjaman/read",
        summary: "Seluruh transaksi — satu baris per rincian alat.",
        auth: "Login (semua role)",
        response: `[
  {
    "id_peminjaman": 12, "id_user": 4, "username": "budi",
    "no_hp": "0812...", "alamat": "Jl. Merdeka 1", "id_petugas": 2,
    "tgl_pinjam": "2026-01-10", "tgl_rencana_kembali": "2026-01-17",
    "status": "Menunggu", "created_at": "...",
    "id_detail": 15, "id_alat": 3, "nama_alat": "Multimeter",
    "jumlah": 2, "total_harga": "70000.00"
  }
]`,
        notes: [
          "Karena satu transaksi bisa berisi beberapa alat, jumlah baris = jumlah detail. Gabungkan di client dengan gabungTransaksi().",
          "Efek samping: transaksi Dipinjam yang lewat tgl_rencana_kembali otomatis diubah menjadi Terlambat.",
        ],
      },
      {
        method: "GET",
        path: "/api/peminjaman/read/:id",
        summary: "Satu transaksi: header + array detail.",
        auth: "Login (semua role)",
        params: [{ name: "id", type: "number", required: true }],
        response: `{
  "id_peminjaman": 12, "id_user": 4, "username": "budi",
  "no_hp": "0812...", "alamat": "Jl. Merdeka 1", "id_petugas": null,
  "tgl_pinjam": "2026-01-10", "tgl_rencana_kembali": "2026-01-17",
  "status": "Menunggu", "created_at": "...",
  "detail": [
    { "id_alat": 3, "nama_alat": "Multimeter", "jumlah": 2, "total_harga": "70000.00" }
  ]
}`,
        notes: ["404 bila id tidak ditemukan."],
      },
      {
        method: "POST",
        path: "/api/peminjaman",
        summary: "Mengajukan peminjaman (boleh beberapa alat sekaligus).",
        auth: "Login (semua role) — atas nama diri sendiri",
        body: [
          { name: "items", type: "Array<{ id_alat: number, jumlah: number }>", required: true, note: "Format baru, boleh banyak item." },
          { name: "id_alat", type: "number", note: "Format lama (1 alat) — tetap diterima." },
          { name: "jumlah", type: "number", note: "Pasangan id_alat format lama." },
          { name: "tgl_pinjam", type: "string (YYYY-MM-DD)", required: true },
          { name: "tgl_rencana_kembali", type: "string (YYYY-MM-DD)", required: true },
        ],
        response: `{ "message": "Peminjaman berhasil dicatat, menunggu validasi petugas" }`,
        notes: [
          "201 Created dengan status awal Menunggu — stok belum dipotong.",
          "400 bila stok tersedia kurang, alat tidak ada, atau jumlah < 1.",
          "total_harga per detail = hari × harga_perhari × jumlah (dibulatkan ke atas, minimum 1 hari).",
        ],
      },
      {
        method: "PUT",
        path: "/api/peminjaman/validasi/:id",
        summary: "Menyetujui, menyerahkan, atau menolak pengajuan.",
        auth: "admin | petugas",
        params: [{ name: "id", type: "number", required: true }],
        body: [
          { name: "status", type: "'Disetujui' | 'Dipinjam' | 'Ditolak'", note: "Default 'Disetujui'." },
        ],
        response: `{ "message": "Peminjaman disetujui dan menunggu pengambilan alat" }`,
        notes: [
          "Transisi dijaga: Disetujui hanya dari Menunggu; Dipinjam hanya dari Disetujui; Ditolak dari Menunggu/Disetujui.",
          "Menjadi Dipinjam memotong stok (via trigger) dan menolak bila stok fisik tidak cukup.",
          "400 bila transisi tidak valid.",
        ],
      },
    ],
  },
  {
    id: "api-pengembalian",
    title: "Pengembalian",
    base: "/api/pengembalian",
    desc: "Menutup transaksi dan mengembalikan stok.",
    endpoints: [
      {
        method: "PUT",
        path: "/api/pengembalian/:id",
        summary: "Memproses pengembalian alat.",
        auth: "admin | petugas",
        params: [{ name: "id", type: "number", required: true, note: "id_peminjaman." }],
        response: `{ "message": "Pengembalian alat berhasil diproses dan stok telah dikembalikan" }`,
        notes: [
          "Hanya transaksi berstatus Dipinjam atau Terlambat.",
          "Status menjadi Selesai; stok kembali otomatis lewat trigger.",
          "400 bila sudah pernah dikembalikan atau status tidak sesuai.",
        ],
      },
    ],
  },
  {
    id: "api-health",
    title: "Health check",
    base: "/api",
    desc: "Endpoint sederhana untuk memastikan server hidup.",
    endpoints: [
      {
        method: "GET",
        path: "/api",
        summary: "Cek kesehatan server backend.",
        auth: "Publik",
        response: `Server Backend UKK Aktif!`,
        notes: ["Respons berupa teks polos (bukan JSON)."],
      },
    ],
  },
];
