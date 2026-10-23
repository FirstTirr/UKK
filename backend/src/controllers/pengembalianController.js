const peminjamanService = require('../services/peminjamanService');
const logAktivitasService = require('../services/logAktivitasService');

async function processPengembalian(req, res) {
  try {
    const id_petugas = req.user.id_user;
    await peminjamanService.kembalikanAlat(req.params.id, id_petugas);
    await logAktivitasService.catatAktivitas(
      id_petugas,
      `PENGEMBALIAN ALAT #${req.params.id}`,
      req.ip
    );
    res.json({ message: 'Pengembalian alat berhasil diproses dan stok telah dikembalikan' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = {
  processPengembalian
};