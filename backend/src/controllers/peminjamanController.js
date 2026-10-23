const peminjamanService = require('../services/peminjamanService');
const logAktivitasService = require('../services/logAktivitasService');

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
    const { items, id_alat, jumlah, tgl_pinjam, tgl_rencana_kembali } = req.body;
    const id_user = req.user.id_user;

    // Format baru: items = [{ id_alat, jumlah }, ...] (boleh lebih dari satu alat).
    // Format lama id_alat + jumlah tetap diterima untuk kompatibilitas.
    const daftar = Array.isArray(items) && items.length > 0
      ? items
      : id_alat && jumlah
        ? [{ id_alat, jumlah }]
        : [];

    if (daftar.length === 0 || !tgl_pinjam || !tgl_rencana_kembali) {
      return res.status(400).json({
        message: 'Field items (id_alat + jumlah), tgl_pinjam, dan tgl_rencana_kembali wajib diisi'
      });
    }

    const idPeminjaman = await peminjamanService.pinjamAlat({
      id_user,
      tgl_pinjam,
      tgl_rencana_kembali,
      items: daftar
    });

    await logAktivitasService.catatAktivitas(
      id_user,
      `AJUAN PEMINJAMAN #${idPeminjaman}: ${daftar.length} jenis alat`,
      req.ip
    );

    res.status(201).json({ message: 'Peminjaman berhasil dicatat, menunggu validasi petugas' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function setujui(req, res) {
  try {
    const id_petugas = req.user.id_user; // Diambil dari token petugas/admin
    const { status } = req.body; // "Disetujui" | "Dipinjam" | "Ditolak"
    const statusBaru = status || 'Disetujui';

    await peminjamanService.setujuiPeminjaman(req.params.id, id_petugas, statusBaru);

    await logAktivitasService.catatAktivitas(
      id_petugas,
      `VALIDASI PEMINJAMAN #${req.params.id}: ${statusBaru}`,
      req.ip
    );

    const pesan = {
      Disetujui: 'Peminjaman disetujui dan menunggu pengambilan alat',
      Dipinjam: 'Alat diserahkan kepada peminjam, status menjadi Dipinjam',
      Ditolak: 'Peminjaman ditolak'
    }[statusBaru];

    res.json({ message: pesan || 'Status peminjaman diperbarui' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function kembalikan(req, res) {
  try {
    const id_petugas = req.user.id_user;
    await peminjamanService.kembalikanAlat(req.params.id, id_petugas);
    res.json({ message: 'Pengembalian berhasil dicatat dan stok alat kembali' });
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