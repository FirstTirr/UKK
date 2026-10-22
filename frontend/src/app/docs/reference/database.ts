import type { ModuleDoc, StatusTransition } from "./types";

export const statusFlow: StatusTransition[] = [
  { from: "— (baru dibuat)", to: "Menunggu", trigger: "POST /api/peminjaman" },
  { from: "Menunggu", to: "Disetujui", trigger: "PUT /api/peminjaman/validasi/:id" },
  { from: "Disetujui", to: "Dipinjam", trigger: "PUT /api/peminjaman/validasi/:id (alat diserahkan)" },
  { from: "Dipinjam", to: "Selesai", trigger: "PUT /api/pengembalian/:id" },
  { from: "Dipinjam", to: "Terlambat", trigger: "Otomatis saat dibaca lewat GET /api/peminjaman/read" },
  { from: "Menunggu / Disetujui", to: "Ditolak", trigger: "PUT /api/peminjaman/validasi/:id" },
];

export const stockRules = [
  "Stok hanya diubah oleh trigger MariaDB — tidak pernah dihitung di kode backend.",
  "trg_kurangi_stok_alat memotong stok saat status menjadi Dipinjam.",
  "trg_kembalikan_stok_alat mengembalikan stok saat status menjadi Selesai.",
  "Selama status Menunggu/Disetujui, unit dihitung sebagai “dipesan” sehingga tidak ditawarkan ke peminjam lain (kolom stok_tersedia).",
];

const kolom = (id: string, title: string, desc: string, constants: { name: string; type: string }[]): ModuleDoc => ({
  id,
  file: "scema.sql · MariaDB (ENGINE=InnoDB)",
  title,
  desc,
  constants,
  functions: [],
});

export const dbTables: ModuleDoc[] = [
  kolom("db-user", "user", "Akun dengan tiga peran; no_hp & alamat wajib diisi peminjam sebelum pengantaran.", [
    { name: "id_user", type: "INT PK AI" },
    { name: "username", type: "VARCHAR(50) UNIQUE" },
    { name: "password_hash", type: "VARCHAR(255)" },
    { name: "role", type: "ENUM('admin','petugas','peminjam')" },
    { name: "no_hp / alamat", type: "VARCHAR · NULL" },
    { name: "created_at", type: "TIMESTAMP" },
  ]),
  kolom("db-kategori", "kategori", "Kelompok alat.", [
    { name: "id_kategori", type: "INT PK AI" },
    { name: "nama_kategori", type: "VARCHAR(100)" },
  ]),
  kolom("db-alat", "alat", "Inventaris dengan soft delete melalui deleted_at.", [
    { name: "id_alat", type: "INT PK AI" },
    { name: "nama_alat", type: "VARCHAR(100)" },
    { name: "id_kategori", type: "INT FK → kategori (CASCADE)" },
    { name: "stok", type: "INT DEFAULT 0" },
    { name: "deskripsi", type: "TEXT" },
    { name: "harga_perhari", type: "DECIMAL(10,2)" },
    { name: "deleted_at", type: "TIMESTAMP NULL" },
  ]),
  kolom("db-peminjaman", "peminjaman", "Header transaksi; id_petugas mencatat petugas yang memproses.", [
    { name: "id_peminjaman", type: "INT PK AI" },
    { name: "id_user", type: "INT FK → user (CASCADE)" },
    { name: "id_petugas", type: "INT FK → user (SET NULL)" },
    { name: "tgl_pinjam / tgl_rencana_kembali", type: "DATE" },
    { name: "status", type: "ENUM('Menunggu','Disetujui','Ditolak','Dipinjam','Selesai')" },
  ]),
  kolom("db-detail", "detail_peminjaman", "Rincian alat per transaksi; total_harga sudah termasuk jumlah unit.", [
    { name: "id_detail", type: "INT PK AI" },
    { name: "id_peminjaman", type: "INT FK (CASCADE)" },
    { name: "id_alat", type: "INT FK (CASCADE)" },
    { name: "jumlah", type: "INT DEFAULT 1" },
    { name: "total_harga", type: "DECIMAL(10,2)" },
  ]),
  kolom("db-pengembalian", "pengembalian", "Satu baris per transaksi yang selesai (id_peminjaman UNIQUE).", [
    { name: "id_pengembalian", type: "INT PK AI" },
    { name: "id_peminjaman", type: "INT FK UNIQUE (CASCADE)" },
    { name: "tgl_kembali_sebenarnya", type: "DATE" },
    { name: "denda", type: "DECIMAL(10,2)" },
    { name: "total_pembayaran", type: "DECIMAL(10,2)" },
  ]),
  kolom("db-log", "log_aktivitas", "Jejak aktivitas login & registrasi.", [
    { name: "id_log_aktivitas", type: "INT PK AI" },
    { name: "id_user", type: "INT FK (CASCADE)" },
    { name: "aktivitas", type: "VARCHAR(255)" },
    { name: "created_at", type: "TIMESTAMP" },
  ]),
];

export const dbObjects: ModuleDoc[] = [
  {
    id: "db-trigger-kurangi",
    file: "trigger.sql",
    title: "trg_kurangi_stok_alat",
    desc: "AFTER UPDATE peminjaman — memotong stok seluruh alat pada transaksi begitu status menjadi Dipinjam.",
    functions: [],
  },
  {
    id: "db-trigger-kembali",
    file: "trigger.sql",
    title: "trg_kembalikan_stok_alat",
    desc: "AFTER UPDATE peminjaman — mengembalikan stok ketika status menjadi Selesai.",
    functions: [],
  },
  {
    id: "db-proc",
    file: "trigger.sql",
    title: "sp_kembalikan_alat",
    desc: "Procedure pengembalian berbasis tanggal: menghitung denda keterlambatan, total pembayaran, lalu menutup transaksi.",
    functions: [
      {
        name: "sp_kembalikan_alat",
        signature: "sp_kembalikan_alat(p_id_peminjaman, p_tgl_kembali_sebenarnya, p_tarif_denda_perhari)",
        summary: "denda = max(0, hari terlambat) × tarif; total_pembayaran = total_harga + denda.",
        params: [
          { name: "p_id_peminjaman", type: "INT", required: true },
          { name: "p_tgl_kembali_sebenarnya", type: "DATE", required: true },
          { name: "p_tarif_denda_perhari", type: "DECIMAL(10,2)", required: true },
        ],
        notes: ["Saat ini belum dipanggil dari backend — pengembalian hanya membalikkan stok lewat trigger."],
      },
    ],
  },
];
