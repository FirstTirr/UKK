const logAktivitasModel = require('../models/logAktivitasModel');

async function getAllLogAktivitas() {
  return await logAktivitasModel.getAll();
}

// Menulis jejak aktivitas. Sengaja tidak pernah melempar error:
// kegagalan mencatat log tidak boleh menggagalkan request utama.
async function catatAktivitas(id_user, aktivitas, ip_address = null) {
  if (!id_user || !aktivitas) return;

  try {
    const ip = typeof ip_address === 'string' && ip_address
      ? ip_address.replace(/^::ffff:/, '').slice(0, 45)
      : null;
    await logAktivitasModel.create(id_user, aktivitas, ip);
  } catch (err) {
    console.error('Gagal mencatat log aktivitas:', err.message);
  }
}

module.exports = {
  getAllLogAktivitas,
  catatAktivitas
};
