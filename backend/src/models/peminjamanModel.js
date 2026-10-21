const db = require('../config/db');

async function getAll() {
  const query = `
    SELECT 
      p.id_peminjaman, p.id_user, u.username, u.no_hp, u.alamat, p.id_petugas, 
      p.tgl_pinjam, p.tgl_rencana_kembali, p.status, p.created_at,
      dp.id_detail, dp.id_alat, a.nama_alat, dp.jumlah, dp.total_harga
    FROM peminjaman p
    JOIN user u ON p.id_user = u.id_user
    LEFT JOIN detail_peminjaman dp ON p.id_peminjaman = dp.id_peminjaman
    LEFT JOIN alat a ON dp.id_alat = a.id_alat
    ORDER BY p.id_peminjaman DESC
  `;
  return await db.query(query);
}

/**
 * Satu transaksi bisa memuat banyak alat, jadi getById mengembalikan
 * header + array detail (bukan satu baris detail).
 */
async function getById(id) {
  const header = await db.query(
    `SELECT p.id_peminjaman, p.id_user, u.username, u.no_hp, u.alamat, p.id_petugas,
            p.tgl_pinjam, p.tgl_rencana_kembali, p.status, p.created_at
     FROM peminjaman p
     JOIN user u ON p.id_user = u.id_user
     WHERE p.id_peminjaman = ?`,
    [id]
  );

  if (header.length === 0) return null;

  const detail = await db.query(
    `SELECT dp.id_alat, a.nama_alat, dp.jumlah, dp.total_harga
     FROM detail_peminjaman dp
     LEFT JOIN alat a ON dp.id_alat = a.id_alat
     WHERE dp.id_peminjaman = ?`,
    [id]
  );

  return { ...header[0], detail };
}

async function createHeader(data) {
  const { id_user, tgl_pinjam, tgl_rencana_kembali } = data;
  const result = await db.query(
    'INSERT INTO peminjaman (id_user, tgl_pinjam, tgl_rencana_kembali, status) VALUES (?, ?, ?, "Menunggu")',
    [id_user, tgl_pinjam, tgl_rencana_kembali]
  );
  return result.insertId;
}

/** Simpan seluruh rincian alat dalam satu transaksi (bisa lebih dari satu alat). */
async function createDetails(id_peminjaman, items) {
  const placeholders = items.map(() => '(?, ?, ?, ?)').join(', ');
  const params = items.flatMap((item) => [id_peminjaman, item.id_alat, item.jumlah, item.total_harga]);
  return await db.query(
    `INSERT INTO detail_peminjaman (id_peminjaman, id_alat, jumlah, total_harga) VALUES ${placeholders}`,
    params
  );
}

/**
 * Jumlah unit sebuah alat yang sudah dipesan peminjam lain (Menunggu / Disetujui).
 * `excludeId` dipakai saat memproses transaksi itu sendiri agar tidak dihitung dua kali.
 */
async function getJumlahDipesan(id_alat, excludeId = 0) {
  const rows = await db.query(
    `SELECT IFNULL(SUM(dp.jumlah), 0) AS dipesan
     FROM detail_peminjaman dp
     JOIN peminjaman p ON p.id_peminjaman = dp.id_peminjaman
     WHERE dp.id_alat = ? AND p.id_peminjaman != ?
       AND p.status IN ('Menunggu', 'Disetujui')`,
    [id_alat, excludeId]
  );
  return Number(rows[0]?.dipesan || 0);
}

async function updateStatus(id, status, id_petugas = null) {
  if (id_petugas) {
    return await db.query(
      'UPDATE peminjaman SET status = ?, id_petugas = ? WHERE id_peminjaman = ?',
      [status, id_petugas, id]
    );
  }
  return await db.query('UPDATE peminjaman SET status = ? WHERE id_peminjaman = ?', [status, id]);
}

module.exports = {
  getAll,
  getById,
  createHeader,
  createDetails,
  getJumlahDipesan,
  updateStatus
};
