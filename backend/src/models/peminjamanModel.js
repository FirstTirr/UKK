const db = require('../config/db');

async function getAll() {
  const query = `
    SELECT 
      p.id_peminjaman, p.id_user, u.username, p.id_petugas, 
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

async function getById(id) {
  const query = `
    SELECT 
      p.id_peminjaman, p.id_user, u.username, p.id_petugas, 
      p.tgl_pinjam, p.tgl_rencana_kembali, p.status, p.created_at,
      dp.id_detail, dp.id_alat, a.nama_alat, dp.jumlah, dp.total_harga
    FROM peminjaman p
    JOIN user u ON p.id_user = u.id_user
    LEFT JOIN detail_peminjaman dp ON p.id_peminjaman = dp.id_peminjaman
    LEFT JOIN alat a ON dp.id_alat = a.id_alat
    WHERE p.id_peminjaman = ?
  `;
  const result = await db.query(query, [id]);
  return result[0];
}

async function createHeader(data) {
  const { id_user, tgl_pinjam, tgl_rencana_kembali } = data;
  const result = await db.query(
    'INSERT INTO peminjaman (id_user, tgl_pinjam, tgl_rencana_kembali, status) VALUES (?, ?, ?, "Menunggu")',
    [id_user, tgl_pinjam, tgl_rencana_kembali]
  );
  return result.insertId;
}

async function createDetail(data) {
  const { id_peminjaman, id_alat, jumlah, total_harga } = data;
  return await db.query(
    'INSERT INTO detail_peminjaman (id_peminjaman, id_alat, jumlah, total_harga) VALUES (?, ?, ?, ?)',
    [id_peminjaman, id_alat, jumlah, total_harga]
  );
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
  createDetail,
  updateStatus
};