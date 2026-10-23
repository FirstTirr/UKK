const kategoriService = require('../services/kategoriService');
const logAktivitasService = require('../services/logAktivitasService');

async function getAll(req, res) {
  try {
    const data = await kategoriService.getAllKategori();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function create(req, res) {
  try {
    const { nama_kategori } = req.body;
    if (!nama_kategori) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    }
    await kategoriService.createKategori(nama_kategori);
    await logAktivitasService.catatAktivitas(
      req.user.id_user,
      `TAMBAH KATEGORI: ${nama_kategori}`,
      req.ip
    );
    res.status(201).json({ message: 'Kategori berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const { nama_kategori } = req.body;
    if (!nama_kategori) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    }
    await kategoriService.updateKategori(req.params.id, nama_kategori);
    await logAktivitasService.catatAktivitas(
      req.user.id_user,
      `UBAH KATEGORI #${req.params.id}: ${nama_kategori}`,
      req.ip
    );
    res.json({ message: 'Kategori berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    // Ambil dulu agar log menyimpan nama kategori, bukan sekadar nomor id
    const kategori = await kategoriService.getKategoriById(req.params.id);
    await kategoriService.deleteKategori(req.params.id);
    await logAktivitasService.catatAktivitas(
      req.user.id_user,
      `HAPUS KATEGORI: ${kategori ? kategori.nama_kategori : `#${req.params.id}`}`,
      req.ip
    );
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAll,
  create,
  update,
  remove
};