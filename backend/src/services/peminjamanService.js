const peminjamanModel = require('../models/peminjamanModel');
const alatModel = require('../models/alatModel');

async function getAllPeminjaman() {
  const data = await peminjamanModel.getAll();
  const today = new Date().toISOString().slice(0, 10);
  for (const p of data) {
    if (p.status === 'Dipinjam' && p.tgl_rencana_kembali < today) {
      await peminjamanModel.updateStatus(p.id_peminjaman, 'Terlambat');
      p.status = 'Terlambat';
    }
  }
  return data;
}

async function getPeminjamanById(id) {
  return await peminjamanModel.getById(id);
}

// 1. Pengajuan Peminjaman -> LANGSUNG potong stok di awal (status 'Menunggu')
async function pinjamAlat(data) {
  const { id_user, id_alat, tgl_pinjam, tgl_rencana_kembali, jumlah } = data;
  const alat = await alatModel.getById(id_alat);
  if (!alat) throw new Error('Alat tidak ditemukan');
  if (alat.stok < jumlah) throw new Error('Stok alat tidak mencukupi');

  const diff = Math.ceil(Math.abs(new Date(tgl_rencana_kembali) - new Date(tgl_pinjam)) / (1000 * 60 * 60 * 24)) || 1;
  const total_harga = diff * alat.harga_perhari * jumlah;

  // Simpan transaksi
  const idPeminjaman = await peminjamanModel.createHeader({ id_user, tgl_pinjam, tgl_rencana_kembali });
  await peminjamanModel.createDetail({ id_peminjaman: idPeminjaman, id_alat, jumlah, total_harga });

  // Potong stok alat saat pending/menunggu
  await alatModel.update(id_alat, { ...alat, stok: alat.stok - jumlah });

  return idPeminjaman;
}

// 2. Persetujuan/Validasi Petugas -> Jika Ditolak, kembalikan stoknya
async function setujuiPeminjaman(id_peminjaman, id_petugas, statusBaru = 'Dipinjam') {
  const p = await peminjamanModel.getById(id_peminjaman);
  if (!p) throw new Error('Data peminjaman tidak ditemukan');
  if (p.status !== 'Menunggu') throw new Error(`Status transaksi saat ini: ${p.status}`);

  // Kembalikan stok jika petugas menolak peminjaman
  if (statusBaru === 'Ditolak') {
    const alat = await alatModel.getById(p.id_alat);
    if (alat) await alatModel.update(p.id_alat, { ...alat, stok: alat.stok + p.jumlah });
  }

  await peminjamanModel.updateStatus(id_peminjaman, statusBaru, id_petugas);
  return true;
}

// 3. Pengembalian -> Kembalikan stok alat (status 'Selesai')
async function kembalikanAlat(id_peminjaman, id_petugas) {
  const p = await peminjamanModel.getById(id_peminjaman);
  if (!p) throw new Error('Data peminjaman tidak ditemukan');
  if (p.status === 'Selesai') throw new Error('Alat sudah dikembalikan sebelumnya');

  await peminjamanModel.updateStatus(id_peminjaman, 'Selesai', id_petugas);

  // Tambahkan stok kembali saat selesai
  const alat = await alatModel.getById(p.id_alat);
  if (alat) await alatModel.update(p.id_alat, { ...alat, stok: alat.stok + p.jumlah });

  return true;
}

module.exports = {
  getAllPeminjaman,
  getPeminjamanById,
  pinjamAlat,
  setujuiPeminjaman,
  kembalikanAlat
};