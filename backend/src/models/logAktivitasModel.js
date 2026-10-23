const db = require('../config/db');

// Join ke user agar halaman admin langsung tahu siapa yang beraktivitas.
// LEFT JOIN dipakai agar baris tetap terbaca walau user sudah terhapus.
const SELECT_LOG = `
  SELECT
    l.id_log_aktivitas,
    l.id_user,
    l.aktivitas,
    l.ip_address,
    l.created_at,
    u.username,
    u.role
  FROM log_aktivitas l
  LEFT JOIN user u ON u.id_user = l.id_user
  ORDER BY l.id_log_aktivitas DESC
`;

async function getAll() {
  return await db.query(SELECT_LOG);
}

async function create(id_user, aktivitas, ip_address = null) {
  return await db.query(
    'INSERT INTO log_aktivitas (id_user, aktivitas, ip_address) VALUES (?, ?, ?)',
    [id_user, aktivitas, ip_address]
  );
}

module.exports = {
  getAll,
  create
};
