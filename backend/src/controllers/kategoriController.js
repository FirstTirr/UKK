const kategoriService = require('../services/kategoriService');

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
    res.json({ message: 'Kategori berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    await kategoriService.deleteKategori(req.params.id);
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