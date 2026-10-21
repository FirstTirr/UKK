const db = require('../config/db');

// Stok yang benar-benar tersedia untuk pengajuan baru:
// stok fisik di laboratorium dikurangi alat yang sudah dipesan (Menunggu / Disetujui).
// Transaksi 'Dipinjam' tidak dihitung lagi karena stoknya sudah dipotong trigger.
const STOK_TERSEDIA = `(a.stok - IFNULL(res.dipesan, 0)) AS stok_tersedia`;

const JOIN_RESERVASI = `
  LEFT JOIN (
    SELECT dp.id_alat, SUM(dp.jumlah) AS dipesan
    FROM detail_peminjaman dp
    JOIN peminjaman p ON p.id_peminjaman = dp.id_peminjaman
    WHERE p.status IN ('Menunggu', 'Disetujui')
    GROUP BY dp.id_alat
  ) res ON res.id_alat = a.id_alat
`;

async function getAll() {
  const query = `
    SELECT a.*, k.nama_kategori, ${STOK_TERSEDIA}
    FROM alat a
    LEFT JOIN kategori k ON a.id_kategori = k.id_kategori
    ${JOIN_RESERVASI}
    WHERE a.deleted_at IS NULL
  `;
  return await db.query(query);
}

async function getById(id) {
  const query = `
    SELECT a.*, k.nama_kategori, ${STOK_TERSEDIA}
    FROM alat a
    LEFT JOIN kategori k ON a.id_kategori = k.id_kategori
    ${JOIN_RESERVASI}
    WHERE a.id_alat = ? AND a.deleted_at IS NULL
  `;
  const result = await db.query(query, [id]);
  return result[0];
}

async function create(data) {
  const { nama_alat, id_kategori, stok, deskripsi, harga_perhari } = data;
  return await db.query(
    'INSERT INTO alat (nama_alat, id_kategori, stok, deskripsi, harga_perhari) VALUES (?, ?, ?, ?, ?)',
    [nama_alat, id_kategori, stok, deskripsi || null, harga_perhari || 0]
  );
}

async function update(id, data) {
  const { nama_alat, id_kategori, stok, deskripsi, harga_perhari } = data;
  return await db.query(
    'UPDATE alat SET nama_alat = ?, id_kategori = ?, stok = ?, deskripsi = ?, harga_perhari = ? WHERE id_alat = ? AND deleted_at IS NULL',
    [nama_alat, id_kategori, stok, deskripsi || null, harga_perhari || 0, id]
  );
}

// Soft delete
async function remove(id) {
  return await db.query('UPDATE alat SET deleted_at = CURRENT_TIMESTAMP WHERE id_alat = ?', [id]);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
