const peminjamanService = require('../services/peminjamanService');

async function getAll(req, res) {
  try {
    const data = await peminjamanService.getAllPeminjaman();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getById(req, res) {
  try {
    const data = await peminjamanService.getPeminjamanById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Data peminjaman tidak ditemukan' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function create(req, res) {
  try {
    const { id_alat, tgl_pinjam, tgl_rencana_kembali, jumlah } = req.body;
    const id_user = req.user.id_user;

    if (!id_alat || !tgl_pinjam || !tgl_rencana_kembali || !jumlah) {
      return res.status(400).json({ message: 'Field id_alat, tgl_pinjam, tgl_rencana_kembali, dan jumlah wajib diisi' });
    }

    await peminjamanService.pinjamAlat({
      id_user,
      id_alat,
      tgl_pinjam,
      tgl_rencana_kembali,
      jumlah
    });

    res.status(201).json({ message: 'Peminjaman berhasil dicatat' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function setujui(req, res) {
  try {
    const id_petugas = req.user.id_user; // Diambil dari token petugas/admin
    const { status } = req.body; // opsional: "Dipinjam" atau "Disetujui"
    
    await peminjamanService.setujuiPeminjaman(
      req.params.id, 
      id_petugas, 
      status || 'Dipinjam'
    );
    
    res.json({ message: 'Peminjaman berhasil disetujui dan status diubah ke Dipinjam' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function kembalikan(req, res) {
  try {
    const id_petugas = req.user.id_user;
    await peminjamanService.kembalikanAlat(req.params.id, id_petugas);
    res.json({ message: 'Alat berhasil dikembalikan dan stok diperbarui' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = {
  getAll,
  getById,
  create,
  setujui,
  kembalikan
};