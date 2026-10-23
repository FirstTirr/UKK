import type { ModuleDoc } from "./types";

export const middlewareModule: ModuleDoc = {
  id: "be-middleware",
  file: "backend/src/middleware/",
  title: "Middleware",
  desc: "Gerbang otentikasi, otorisasi, dan pembatasan percobaan login.",
  functions: [
    {
      name: "verifyToken",
      signature: "verifyToken(req, res, next)",
      summary:
        "Membaca header Authorization: Bearer <token>, memverifikasi JWT, lalu menempelkan payload ke req.user.",
      returns: "Lanjut ke middleware berikutnya, atau 401 (tanpa token) / 403 (token tidak valid).",
      notes: ["Kunci JWT dari env JWT_SECRET dengan fallback 'rahasia_ukk'."],
    },
    {
      name: "checkRole",
      signature: "checkRole(roles: string[]) => (req, res, next)",
      summary: "Memastikan req.user.role ada dalam daftar role yang diizinkan.",
      params: [{ name: "roles", type: "string[]", required: true, note: "Mis. ['admin', 'petugas']." }],
      returns: "403 { message: 'Akses ditolak: Privilege tidak sesuai' } bila role tidak cocok.",
      notes: ["Harus dipasang setelah verifyToken agar req.user sudah terisi."],
    },
    {
      name: "loginLimiter",
      signature: "loginLimiter",
      summary: "Rate limiter untuk POST /api/auth/login.",
      returns: "Maksimal 5 percobaan per 1 menit per IP; respons 429 bertanda RateLimit-*.",
      notes: ["Pesan galat menyebut “5 menit”, padahal jendela windowMs hanya 1 menit."],
    },
  ],
};

export const controllerModules: ModuleDoc[] = [
  {
    id: "be-auth-controller",
    file: "backend/src/controllers/authController.js",
    title: "authController",
    desc: "Endpoint masuk untuk autentikasi.",
    functions: [
      {
        name: "login",
        signature: "login(req, res)",
        summary: "Validasi input lalu memanggil authService.login.",
        params: [
          { name: "req.body.username", type: "string", required: true },
          { name: "req.body.password", type: "string", required: true },
        ],
        returns: "200 { message, token, user } atau 401 { message }.",
      },
      {
        name: "register",
        signature: "register(req, res)",
        summary: "Meneruskan pendaftaran (dengan captcha) ke authService.register.",
        params: [
          { name: "req.body.nama_user", type: "string", required: true },
          { name: "req.body.username", type: "string", required: true },
          { name: "req.body.password", type: "string", required: true },
          { name: "req.body.captchaToken", type: "string", required: true },
        ],
        returns: "201 { message, success, user } atau 400 { message }.",
      },
    ],
  },
  {
    id: "be-user-controller",
    file: "backend/src/controllers/userController.js",
    title: "userController",
    desc: "CRUD user (admin) dan profil pribadi (semua role).",
    functions: [
      { name: "getAll", signature: "getAll(req, res)", summary: "Mengembalikan seluruh user.", returns: "200 array user." },
      {
        name: "create",
        signature: "create(req, res)",
        summary: "Membuat user baru dari username/password/role.",
        returns: "201 { message } atau 400 bila field wajib kosong.",
      },
      { name: "remove", signature: "remove(req, res)", summary: "Membaca dulu user (agar log menyimpan nama) lalu menghapus berdasar :id.", returns: "200 { message } atau 404 bila :id tidak ditemukan.", notes: ["Mencatat 'HAPUS USER: <username> (<role>)' ke log aktivitas." ] },
      {
        name: "getProfil",
        signature: "getProfil(req, res)",
        summary: "Profil milik req.user (dipakai halaman peminjam untuk no_hp & alamat).",
        returns: "200 { id_user, username, role, no_hp, alamat } atau 404.",
      },
      {
        name: "updateProfil",
        signature: "updateProfil(req, res)",
        summary: "Menyimpan no_hp & alamat milik req.user.",
        returns: "200 { message } atau 400 bila ada field kosong.",
      },
    ],
  },
  {
    id: "be-kategori-controller",
    file: "backend/src/controllers/kategoriController.js",
    title: "kategoriController",
    desc: "CRUD kategori dengan guard admin di route.",
    functions: [
      { name: "getAll", signature: "getAll(req, res)", summary: "Daftar kategori.", returns: "200 array." },
      { name: "create", signature: "create(req, res)", summary: "Tambah kategori.", returns: "201 { message } atau 400." },
      { name: "update", signature: "update(req, res)", summary: "Ubah nama kategori :id.", returns: "200 { message } atau 400." },
      { name: "remove", signature: "remove(req, res)", summary: "Hapus kategori :id.", returns: "200 { message }.", notes: ["Membaca nama kategori lebih dulu agar log berbunyi 'HAPUS KATEGORI: <nama>'."] },
    ],
  },
  {
    id: "be-alat-controller",
    file: "backend/src/controllers/alatController.js",
    title: "alatController",
    desc: "CRUD alat; pembuatan & ubah boleh admin/petugas, hapus hanya admin.",
    functions: [
      { name: "getAll", signature: "getAll(req, res)", summary: "Daftar alat aktif + nama_kategori + stok_tersedia.", returns: "200 array." },
      { name: "getById", signature: "getById(req, res)", summary: "Detail satu alat.", returns: "200 objek alat atau 404." },
      { name: "create", signature: "create(req, res)", summary: "Tambah alat baru.", returns: "201 { message } atau 400 bila field wajib kosong." },
      { name: "update", signature: "update(req, res)", summary: "Perbarui alat :id.", returns: "200 { message }." },
      { name: "remove", signature: "remove(req, res)", summary: "Soft delete alat :id.", returns: "200 { message }.", notes: ["Membaca nama alat lebih dulu agar log berbunyi 'HAPUS ALAT: <nama>'."] },
    ],
  },
  {
    id: "be-peminjaman-controller",
    file: "backend/src/controllers/peminjamanController.js",
    title: "peminjamanController",
    desc: "Endpoint transaksi: membaca, mengajukan, dan memvalidasi.",
    functions: [
      {
        name: "getAll",
        signature: "getAll(req, res)",
        summary: "Seluruh transaksi (satu baris per detail) + penandaan Terlambat.",
        returns: "200 array baris datar.",
      },
      { name: "getById", signature: "getById(req, res)", summary: "Header + detail satu transaksi.", returns: "200 objek atau 404." },
      {
        name: "create",
        signature: "create(req, res)",
        summary: "Mengajukan peminjaman atas nama req.user; mendukung items[] atau format lama id_alat+jumlah.",
        returns: "201 { message } atau 400 { message }.",
        notes: ["id_user diambil dari token, bukan dari body."],
      },
      {
        name: "setujui",
        signature: "setujui(req, res)",
        summary: "Menerapkan status baru (Disetujui/Dipinjam/Ditolak) dan mencatat id_petugas.",
        returns: "200 { message } atau 400 bila transisi tidak diizinkan.",
      },
      {
        name: "kembalikan",
        signature: "kembalikan(req, res)",
        summary: "Versi lama pemrosesan pengembalian.",
        returns: "200 { message } atau 400.",
        notes: ["Tidak dipasang di route mana pun; jalur resmi kini lewat pengembalianController.processPengembalian."],
      },
    ],
  },
  {
    id: "be-pengembalian-controller",
    file: "backend/src/controllers/pengembalianController.js",
    title: "pengembalianController",
    desc: "Titik masuk tunggal untuk pengembalian alat.",
    functions: [
      {
        name: "processPengembalian",
        signature: "processPengembalian(req, res)",
        summary: "Menutup transaksi :id menjadi Selesai dan mengembalikan stok.",
        returns: "200 { message } atau 400 { message }.",
        notes: ["Meneruskan id_petugas dari token ke peminjamanService.kembalikanAlat."],
      },
    ],
  },
  {
    id: "be-log-aktivitas-controller",
    file: "backend/src/controllers/logAktivitasController.js",
    title: "logAktivitasController",
    desc: "Titik masuk tunggal pembacaan log aktivitas; penulisan dilakukan lewat logAktivitasService.catatAktivitas di controller lain.",
    functions: [
      {
        name: "getAll",
        signature: "getAll(req, res)",
        summary: "Mengembalikan seluruh log beserta username & role pemiliknya, terurut terbaru.",
        returns: "200 array atau 500 { message }.",
        notes: ["Akses dibatasi guard di route: verifyToken + checkRole(['admin'])."],
      },
    ],
  },
];

export const serviceModules: ModuleDoc[] = [
  {
    id: "be-auth-service",
    file: "backend/src/services/authService.js",
    title: "authService",
    desc: "Logika masuk/keluar: verifikasi CAPTCHA, hashing, dan penerbitan JWT.",
    functions: [
      {
        name: "verifyCaptcha",
        signature: "verifyCaptcha(captchaToken) => Promise<boolean>",
        summary: "Menukar token reCAPTCHA ke server Google (siteverify).",
        params: [{ name: "captchaToken", type: "string", required: true }],
        returns: "true bila token valid.",
        notes: ["Melempar Error bila env RECAPTCHA_SECRET_KEY belum diisi."],
      },
      {
        name: "login",
        signature: "login(username, password, ip?) => Promise<{ token, user }>",
        summary: "Membandingkan bcrypt, menerbitkan JWT (berlaku 1 hari), dan mencatat aktivitas LOGIN beserta IP.",
        returns: "Objek { token, user: { id_user, username, role, no_hp, alamat } }.",
        notes: ["Pesan galat sengaja sama untuk username tak dikenal dan password salah."],
      },
      {
        name: "register",
        signature: "register({ nama_user, username, password, captchaToken }, ip?) => Promise<{ success, user }>",
        summary: "Memvalidasi CAPTCHA, mengecek keunikan username, lalu membuat akun peminjam.",
        returns: "Objek { success: true, user }.",
        notes: ["Username duplikat → Error 'Username sudah digunakan...' yang dikirim sebagai 400."],
      },
    ],
  },
  {
    id: "be-user-service",
    file: "backend/src/services/userService.js",
    title: "userService",
    desc: "Akses data user termasuk hashing password dan aturan profil.",
    functions: [
      { name: "getAllUsers", signature: "getAllUsers() => Promise<User[]>", summary: "Seluruh user tanpa hash password." },
      {
        name: "getProfilUser",
        signature: "getProfilUser(id) => Promise<Profil>",
        summary: "Profil singkat milik satu user.",
        returns: "{ id_user, username, role, no_hp, alamat } (no_hp/alamat default '').",
        notes: ["Melempar Error 'User tidak ditemukan' bila id tak ada."],
      },
      { name: "createUser", signature: "createUser(username, password, role)", summary: "Hash password (10 rounds) lalu insert." },
      { name: "deleteUser", signature: "deleteUser(id)", summary: "Hard delete user." },
      {
        name: "updateProfilUser",
        signature: "updateProfilUser(id, { no_hp, alamat })",
        summary: "Menyimpan kontak milik user.",
        notes: ["Melempar Error bila no_hp atau alamat kosong."],
      },
    ],
  },
  {
    id: "be-kategori-service",
    file: "backend/src/services/kategoriService.js",
    title: "kategoriService",
    desc: "Lapisan tipis yang meneruskan operasi CRUD ke kategoriModel.",
    functions: [
      { name: "getAllKategori", signature: "getAllKategori()", summary: "Daftar kategori." },
      { name: "getKategoriById", signature: "getKategoriById(id)", summary: "Satu kategori atau undefined — dipakai untuk menulis log berisi nama saat hapus." },
      { name: "createKategori", signature: "createKategori(nama_kategori)", summary: "Tambah kategori." },
      { name: "updateKategori", signature: "updateKategori(id, nama_kategori)", summary: "Ubah nama kategori." },
      { name: "deleteKategori", signature: "deleteKategori(id)", summary: "Hapus kategori (cascade ke alat)." },
    ],
  },
  {
    id: "be-alat-service",
    file: "backend/src/services/alatService.js",
    title: "alatService",
    desc: "Lapisan tipis delegasi ke alatModel.",
    functions: [
      { name: "getAllAlat", signature: "getAllAlat()", summary: "Alat aktif + nama kategori + stok_tersedia." },
      { name: "getAlatById", signature: "getAlatById(id)", summary: "Satu alat atau undefined." },
      { name: "createAlat", signature: "createAlat({ nama_alat, id_kategori, stok, deskripsi, harga_perhari })", summary: "Tambah alat." },
      { name: "updateAlat", signature: "updateAlat(id, data)", summary: "Perbarui alat." },
      { name: "deleteAlat", signature: "deleteAlat(id)", summary: "Soft delete (set deleted_at)." },
    ],
  },
  {
    id: "be-peminjaman-service",
    file: "backend/src/services/peminjamanService.js",
    title: "peminjamanService",
    desc: "Otak aplikasi: aturan status, ketersediaan stok, dan perhitungan biaya.",
    constants: [
      { name: "TRANSISI_STATUS", type: "Record<string, string[]>", note: "Peta status asal yang diizinkan untuk tiap status tujuan." },
    ],
    functions: [
      {
        name: "getAllPeminjaman",
        signature: "getAllPeminjaman() => Promise<Baris[]>",
        summary: "Membaca semua transaksi sekaligus menandai keterlambatan.",
        notes: ["Transaksi Dipinjam dengan tgl_rencana_kembali < hari ini diubah menjadi Terlambat."],
      },
      { name: "getPeminjamanById", signature: "getPeminjamanById(id) => Promise<Transaksi | null>", summary: "Header + detail satu transaksi." },
      {
        name: "hitungHari",
        signature: "hitungHari(tglPinjam, tglKembali) => number",
        summary: "Selisih hari antar tanggal, dibulatkan ke atas, minimum 1.",
        params: [
          { name: "tglPinjam", type: "string | Date", required: true },
          { name: "tglKembali", type: "string | Date", required: true },
        ],
      },
      {
        name: "getTersedia",
        signature: "getTersedia(alat, excludeId = 0) => Promise<number>",
        summary: "Stok fisik dikurangi unit yang sudah dipesan pihak lain.",
        params: [
          { name: "alat", type: "{ id_alat, stok }", required: true },
          { name: "excludeId", type: "number", note: "Transaksi yang sedang diproses agar tidak dihitung dua kali." },
        ],
      },
      {
        name: "pinjamAlat",
        signature: "pinjamAlat({ id_user, tgl_pinjam, tgl_rencana_kembali, items }) => Promise<number>",
        summary: "Membuat header + detail transaksi baru berstatus Menunggu.",
        returns: "id_peminjaman yang baru dibuat.",
        notes: [
          "Item dengan alat sama digabung menjadi satu baris detail agar trigger stok tidak melewatkannya.",
          "Melempar Error bila stok tersedia kurang atau alat tidak ditemukan.",
        ],
      },
      {
        name: "setujuiPeminjaman",
        signature: "setujuiPeminjaman(id_peminjaman, id_petugas, statusBaru = 'Disetujui') => Promise<boolean>",
        summary: "Memvalidasi transisi status lalu menyimpannya beserta petugas yang memproses.",
        notes: ["Saat statusBaru 'Dipinjam', stok fisik dicek ulang tanpa mengorbankan pesanan Menunggu/Disetujui lain."],
      },
      {
        name: "kembalikanAlat",
        signature: "kembalikanAlat(id_peminjaman, id_petugas) => Promise<boolean>",
        summary: "Menutup transaksi menjadi Selesai; stok dikembalikan trigger.",
        notes: ["Hanya menerima status Dipinjam atau Terlambat; 'Selesai' ganda ditolak."],
      },
    ],
  },
  {
    id: "be-log-aktivitas-service",
    file: "backend/src/services/logAktivitasService.js",
    title: "logAktivitasService",
    desc: "Satu-satunya penulis log aktivitas; dipanggil dari authController (via authService) dan seluruh controller CRUD/transaksi.",
    functions: [
      { name: "getAllLogAktivitas", signature: "getAllLogAktivitas()", summary: "Seluruh log terbaru beserta username & role (LEFT JOIN user)." },
      {
        name: "catatAktivitas",
        signature: "catatAktivitas(id_user, aktivitas, ip_address?) => Promise<void>",
        summary: "Menulis satu baris log; memangkas prefiks ::ffff: dan membatasi IP ke 45 karakter.",
        params: [
          { name: "id_user", type: "number", required: true, note: "Pelaku aksi (dari req.user.id_user)." },
          { name: "aktivitas", type: "string", required: true, note: "Pola 'PREFIX: detail', mis. 'TAMBAH ALAT: Multimeter'." },
          { name: "ip_address", type: "string | null", note: "Biasanya req.ip." },
        ],
        notes: [
          "Tidak pernah melempar error: kegagalan mencatat log hanya dicetak ke console sehingga request utama tetap berhasil.",
          "Diamkan bila id_user atau aktivitas kosong (menjaga integritas FK).",
        ],
      },
    ],
  },
];

export const modelModules: ModuleDoc[] = [
  {
    id: "be-user-model",
    file: "backend/src/models/userModel.js",
    title: "userModel",
    desc: "Query tabel user; kolom password_hash tidak pernah ikut dipilih pada daftar.",
    functions: [
      { name: "getAll", signature: "getAll()", summary: "id_user, username, role, no_hp, alamat." },
      { name: "getById", signature: "getById(id)", summary: "Satu user (array 0/1 baris)." },
      { name: "findByUsername", signature: "findByUsername(username)", summary: "SELECT * (termasuk hash) untuk login." },
      { name: "create", signature: "create(username, hash, role, no_hp = null, alamat = null)", summary: "Insert user baru." },
      { name: "updateProfil", signature: "updateProfil(id, { no_hp, alamat })", summary: "Simpan kontak user." },
      { name: "remove", signature: "remove(id)", summary: "DELETE fisik." },
    ],
  },
  {
    id: "be-kategori-model",
    file: "backend/src/models/kategoriModel.js",
    title: "kategoriModel",
    desc: "CRUD polos tabel kategori.",
    functions: [
      { name: "getAll", signature: "getAll()", summary: "SELECT * kategori." },
      { name: "getById", signature: "getById(id)", summary: "Satu kategori (array 0/1 baris) — untuk pesan log saat hapus." },
      { name: "create", signature: "create(nama_kategori)", summary: "INSERT kategori." },
      { name: "update", signature: "update(id, nama_kategori)", summary: "UPDATE nama kategori." },
      { name: "remove", signature: "remove(id)", summary: "DELETE kategori." },
    ],
  },
  {
    id: "be-alat-model",
    file: "backend/src/models/alatModel.js",
    title: "alatModel",
    desc: "Query alat dengan join kategori dan sub-query reservasi untuk stok_tersedia.",
    constants: [
      { name: "STOK_TERSEDIA", type: "string (SQL)", note: "Fragmen SQL: stok − unit dipesan sebagai stok_tersedia." },
      { name: "JOIN_RESERVASI", type: "string (SQL)", note: "LEFT JOIN agregasi detail_peminjaman berstatus Menunggu/Disetujui." },
    ],
    functions: [
      { name: "getAll", signature: "getAll()", summary: "Alat aktif (deleted_at IS NULL) + nama_kategori + stok_tersedia." },
      { name: "getById", signature: "getById(id)", summary: "Satu alat aktif; undefined bila tak ada." },
      { name: "create", signature: "create({ nama_alat, id_kategori, stok, deskripsi, harga_perhari })", summary: "INSERT alat." },
      { name: "update", signature: "update(id, data)", summary: "UPDATE alat aktif." },
      { name: "remove", signature: "remove(id)", summary: "Soft delete: UPDATE deleted_at = CURRENT_TIMESTAMP." },
    ],
  },
  {
    id: "be-peminjaman-model",
    file: "backend/src/models/peminjamanModel.js",
    title: "peminjamanModel",
    desc: "Query header & detail peminjaman.",
    functions: [
      {
        name: "getAll",
        signature: "getAll()",
        summary: "JOIN peminjaman × user × detail_peminjaman × alat, urut id_peminjaman DESC.",
        returns: "Satu baris per rincian alat.",
      },
      { name: "getById", signature: "getById(id)", summary: "Header lalu detail terpisah; menghasilkan { ...header, detail: [] }." },
      { name: "createHeader", signature: "createHeader({ id_user, tgl_pinjam, tgl_rencana_kembali })", summary: "INSERT dengan status awal Menunggu; mengembalikan insertId." },
      { name: "createDetails", signature: "createDetails(id_peminjaman, items)", summary: "INSERT banyak detail sekaligus (multi VALUES)." },
      {
        name: "getJumlahDipesan",
        signature: "getJumlahDipesan(id_alat, excludeId = 0) => Promise<number>",
        summary: "Total unit yang dipesan transaksi Menunggu/Disetujui (kecuali excludeId).",
      },
      { name: "updateStatus", signature: "updateStatus(id, status, id_petugas = null)", summary: "UPDATE status; id_petugas hanya ditulis bila tersedia." },
    ],
  },
  {
    id: "be-config",
    file: "backend/src/config/db.js · backend/src/index.js",
    title: "Konfigurasi & entry point",
    desc: "Connection pool MariaDB dan perakitan aplikasi Express.",
    constants: [
      { name: "db", type: "mariadb Pool", note: "DB_HOST, DB_USER, DB_PASS, DB_NAME (fallback localhost/root/'/db_ukk)." },
      { name: "apiRouter", type: "express.Router", note: "Prefix /api untuk seluruh resource." },
    ],
    functions: [
      {
        name: "app.get('/api')",
        signature: "app.get('/api', (req, res) => res.send('Server Backend UKK Aktif!'))",
        summary: "Health check teks polos.",
      },
      {
        name: "app.listen",
        signature: "app.listen(PORT)",
        summary: "Menjalankan server pada env PORT (default 5000).",
        notes: ["File .env dibaca dari parent folder backend (path '../.env')."],
      },
    ],
  },
];
