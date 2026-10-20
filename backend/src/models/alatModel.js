const db = require('../config/db');

async function getAll() {
  const query = `
    SELECT a.*, k.nama_kategori 
    FROM alat a 
    LEFT JOIN kategori k ON a.id_kategori = k.id_kategori
    WHERE a.deleted_at IS NULL
  `;
  return await db.query(query);
}

async function getById(id) {
  const query = `
    SELECT a.*, k.nama_kategori 
    FROM alat a 
    LEFT JOIN kategori k ON a.id_kategori = k.id_kategori
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