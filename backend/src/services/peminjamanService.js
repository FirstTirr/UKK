const peminjamanModel = require('../models/peminjamanModel');
const alatModel = require('../models/alatModel');

/**
 * ALUR STATUS PEMINJAMAN
 *   Menunggu -> Disetujui (validasi petugas)
 *            -> Dipinjam  (alat diserahkan ke peminjam)
 *            -> Selesai   (pengembalian diproses)
 *   Menunggu / Disetujui -> Ditolak (pengajuan dibatalkan)
 *
 * STOK
 * Kode ini TIDAK mengubah stok sama sekali. Stok dijaga oleh trigger di database:
 *   - trg_kurangi_stok_alat   : memotong stok saat status menjadi 'Dipinjam'
 *   - trg_kembalikan_stok_alat: mengembalikan stok saat status menjadi 'Selesai'
 * Selama status masih 'Menunggu'/'Disetujui', unit dianggap "dipesan" sehingga
 * tidak boleh ditawarkan ke peminjam lain (dicek lewat getTersedia).
 */

const TRANSISI_STATUS = {
  Disetujui: ['Menunggu'],
  Dipinjam: ['Disetujui'],
  Ditolak: ['Menunggu', 'Disetujui'],
};

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

function hitungHari(tglPinjam, tglKembali) {
  const beda = Math.abs(new Date(tglKembali) - new Date(tglPinjam));
  return Math.ceil(beda / 86_400_000) || 1;
}

/** Sisa unit yang boleh ditawarkan. `excludeId` = transaksi yang sedang diproses. */
async function getTersedia(alat, excludeId = 0) {
  const dipesan = await peminjamanModel.getJumlahDipesan(alat.id_alat, excludeId);
  return Number(alat.stok) - dipesan;
}

// 1. Pengajuan peminjaman: satu transaksi boleh memuat beberapa alat sekaligus.
async function pinjamAlat({ id_user, tgl_pinjam, tgl_rencana_kembali, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Peminjaman harus memuat minimal satu alat');
  }

  // Alat yang sama dipesan dua kali digabung jadi satu baris detail,
  // supaya trigger stok (UPDATE ... JOIN) tidak melewatkan salah satunya.
  const ringkasan = new Map();
  for (const item of items) {
    const jumlah = Number(item.jumlah);
    if (!item.id_alat || !Number.isInteger(jumlah) || jumlah < 1) {
      throw new Error('Setiap alat harus memiliki jumlah minimal 1');
    }
    const id = Number(item.id_alat);
    ringkasan.set(id, (ringkasan.get(id) || 0) + jumlah);
  }

  const hari = hitungHari(tgl_pinjam, tgl_rencana_kembali);
  const rincian = [];

  for (const [id_alat, jumlah] of ringkasan) {
    const alat = await alatModel.getById(id_alat);
    if (!alat) throw new Error(`Alat dengan id ${id_alat} tidak ditemukan`);

    const tersedia = await getTersedia(alat);
    if (tersedia < jumlah) {
      throw new Error(`Stok ${alat.nama_alat} hanya tersisa ${tersedia} unit`);
    }

    rincian.push({ id_alat, jumlah, total_harga: hari * Number(alat.harga_perhari) * jumlah });
  }

  const id_peminjaman = await peminjamanModel.createHeader({
    id_user,
    tgl_pinjam,
    tgl_rencana_kembali,
  });
  await peminjamanModel.createDetails(id_peminjaman, rincian);

  return id_peminjaman;
}

// 2. Petugas memproses transaksi: setujui, serahkan alat, atau tolak.
async function setujuiPeminjaman(id_peminjaman, id_petugas, statusBaru = 'Disetujui') {
  const id = Number(id_peminjaman);
  const p = await peminjamanModel.getById(id);
  if (!p) throw new Error('Data peminjaman tidak ditemukan');

  const statusAsal = TRANSISI_STATUS[statusBaru];
  if (!statusAsal) {
    throw new Error('Status harus "Disetujui", "Dipinjam", atau "Ditolak"');
  }
  if (!statusAsal.includes(p.status)) {
    throw new Error(`Transaksi berstatus "${p.status}" tidak bisa diubah menjadi "${statusBaru}"`);
  }

  // Penyerahan alat: pastikan stok fisik masih cukup untuk transaksi ini
  // tanpa mengorbankan pesanan peminjam lain yang masih menunggu.
  if (statusBaru === 'Dipinjam') {
    for (const item of p.detail) {
      const alat = await alatModel.getById(item.id_alat);
      if (!alat) continue;
      const tersedia = await getTersedia(alat, id);
      if (tersedia < item.jumlah) {
        throw new Error(
          `Stok ${alat.nama_alat} hanya tersisa ${tersedia} unit, tidak cukup untuk transaksi ini`
        );
      }
    }
  }

  await peminjamanModel.updateStatus(id, statusBaru, id_petugas);
  return true;
}

// 3. Pengembalian: stok dikembalikan oleh trigger saat status menjadi 'Selesai'.
async function kembalikanAlat(id_peminjaman, id_petugas) {
  const id = Number(id_peminjaman);
  const p = await peminjamanModel.getById(id);
  if (!p) throw new Error('Data peminjaman tidak ditemukan');
  if (p.status === 'Selesai') throw new Error('Alat sudah dikembalikan sebelumnya');
  if (!['Dipinjam', 'Terlambat'].includes(p.status)) {
    throw new Error(`Transaksi berstatus "${p.status}" tidak bisa diproses pengembalian`);
  }

  await peminjamanModel.updateStatus(id, 'Selesai', id_petugas);
  return true;
}

module.exports = {
  getAllPeminjaman,
  getPeminjamanById,
  pinjamAlat,
  setujuiPeminjaman,
  kembalikanAlat
};
