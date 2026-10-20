const peminjamanService = require('../services/peminjamanService');

async function processPengembalian(req, res) {
  try {
    const id_petugas = req.user.id_user;
    await peminjamanService.kembalikanAlat(req.params.id, id_petugas);
    res.json({ message: 'Pengembalian alat berhasil diproses dan stok telah dikembalikan' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = {
  processPengembalian
};