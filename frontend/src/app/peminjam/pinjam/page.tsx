'use client';

import { useEffect, useState } from 'react';
import { alatService } from '@/services/alat';
import { peminjamanService } from '@/services/peminjaman';
import { userService } from '@/services/user';
import { hargaAlat, namaAlat, rupiah, tersediaAlat, type Alat, PilihAlatPanel } from './pilih-alat';

const iso = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

/** Tambah n hari ke string tanggal YYYY-MM-DD. */
const tambahHari = (tanggalStr: string, hari: number) => {
  const date = new Date(`${tanggalStr}T00:00:00`);
  date.setDate(date.getDate() + hari);
  return iso(date);
};

/** Lama pinjam mengikuti rumus backend: minimal 1 hari. */
const hitungHari = (mulai: string, selesai: string) => {
  if (!mulai || !selesai) return 0;
  const beda = Math.abs(new Date(`${selesai}T00:00:00`).getTime() - new Date(`${mulai}T00:00:00`).getTime());
  return Math.ceil(beda / 86400000) || 1;
};

const inputClass =
  'w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-600 focus:outline-none';

export default function PeminjamPinjamPage() {
  const [alatList, setAlatList] = useState<Alat[]>([]);
  const [profil, setProfil] = useState({ no_hp: '', alamat: '' });
  const [tanggal, setTanggal] = useState({ tgl_pinjam: '', tgl_rencana_kembali: '' });
  const [keranjang, setKeranjang] = useState<{ id_alat: number; jumlah: number }[]>([]);
  const [proses, setProses] = useState(false);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');

  const muatAlat = () =>
    alatService
      .getAll()
      .then((res) => setAlatList(Array.isArray(res) ? res : res.data || []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat daftar alat.'));

  // Nomor HP & alamat diambil dari server agar sesuai dengan data tersimpan
  const muatProfil = () =>
    userService
      .getProfil()
      .then((res) => setProfil({ no_hp: res.no_hp || '', alamat: res.alamat || '' }))
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat profil Anda.'));

  useEffect(() => { muatAlat(); muatProfil(); }, []);

  // Tanggal kembali terisi otomatis saat tanggal pinjam dipilih
  const ubahTanggalPinjam = (nilai: string) =>
    setTanggal((prev) => ({
      tgl_pinjam: nilai,
      tgl_rencana_kembali: prev.tgl_rencana_kembali || (nilai ? tambahHari(nilai, 7) : ''),
    }));

  const hari = hitungHari(tanggal.tgl_pinjam, tanggal.tgl_rencana_kembali);

  const tambahKeKeranjang = (id: number, jumlahBaru: number): string | null => {
    if (!id) return 'Pilih alat yang ingin dipinjam terlebih dahulu.';
    const jumlah = Math.max(1, Number(jumlahBaru) || 1);
    const sudahDipesan = keranjang.find((item) => item.id_alat === id)?.jumlah || 0;
    const sisa = tersediaAlat(alatList, id) - sudahDipesan;
    if (jumlah > sisa) return `Stok ${namaAlat(alatList, id)} hanya tersisa ${sisa} unit.`;

    setKeranjang((prev) => {
      const ada = prev.find((item) => item.id_alat === id);
      return ada
        ? prev.map((item) => (item.id_alat === id ? { ...item, jumlah: item.jumlah + jumlah } : item))
        : [...prev, { id_alat: id, jumlah }];
    });
    return null;
  };

  const totalEstimasi = keranjang.reduce(
    (jumlah, item) => jumlah + hargaAlat(alatList, item.id_alat) * item.jumlah * Math.max(hari, 1),
    0
  );
  const unitDipilih = keranjang.reduce((jumlah, item) => jumlah + item.jumlah, 0);

  const profilLengkap = Boolean(profil.no_hp.trim() && profil.alamat.trim());
  const tanggalSalah = Boolean(tanggal.tgl_pinjam && tanggal.tgl_rencana_kembali && tanggal.tgl_rencana_kembali <= tanggal.tgl_pinjam);
  const siapKirim = keranjang.length > 0 && profilLengkap && hari >= 1 && !tanggalSalah;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSukses('');
    if (!siapKirim || proses) return;

    setProses(true);
    try {
      // 1. Simpan dulu nomor HP & alamat (petugas memakainya untuk pengantaran)
      await userService.updateProfil(profil);

      // 2. Kirim pengajuan berisi banyak alat sekaligus
      const res = await peminjamanService.create({
        tgl_pinjam: tanggal.tgl_pinjam,
        tgl_rencana_kembali: tanggal.tgl_rencana_kembali,
        items: keranjang.map((item) => ({ id_alat: item.id_alat, jumlah: item.jumlah })),
      });

      setSukses(res.message || 'Peminjaman berhasil dicatat, tunggu validasi petugas.');
      setKeranjang([]);
      muatAlat();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim pengajuan.');
    } finally {
      setProses(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pinjam Alat</h1>
        <p className="text-sm text-slate-500 mt-1">
          Satu pengajuan boleh memuat beberapa alat sekaligus. Stok dipotong ketika alat diserahkan.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
      )}
      {sukses && (
        <div className="px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-800">{sukses}</div>
      )}
      {!profilLengkap && (
        <div className="px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-800">
          Lengkapi nomor HP dan alamat pada bagian <b>Data Pengiriman</b> sebelum mengirim pengajuan.
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          {/* Data pengiriman: petugas membutuhkannya untuk mengantarkan alat */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900">Data Pengiriman</h2>
            <p className="text-xs text-slate-500 mt-0.5">Dipakai petugas untuk mengantarkan alat.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">No. HP (WhatsApp)</label>
                <input
                  type="tel"
                  value={profil.no_hp}
                  onChange={(e) => setProfil({ ...profil, no_hp: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Alamat Pengantaran</label>
                <input
                  type="text"
                  value={profil.alamat}
                  onChange={(e) => setProfil({ ...profil, alamat: e.target.value })}
                  placeholder="Jalan, nomor, kelurahan, kota"
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          {/* Tanggal peminjaman */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900">Tanggal Peminjaman</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Tgl Pinjam</label>
                <input
                  type="date"
                  value={tanggal.tgl_pinjam}
                  onChange={(e) => ubahTanggalPinjam(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Rencana Kembali</label>
                <input
                  type="date"
                  value={tanggal.tgl_rencana_kembali}
                  onChange={(e) => setTanggal({ ...tanggal, tgl_rencana_kembali: e.target.value })}
                  className={inputClass}
                  required
                />
                {tanggalSalah && (
                  <p className="text-xs text-red-600 mt-1.5">Harus setelah tanggal pinjam.</p>
                )}
              </div>
            </div>
          </div>

          <PilihAlatPanel
            alatList={alatList}
            keranjang={keranjang}
            onTambah={tambahKeKeranjang}
            onHapus={(id) => setKeranjang((prev) => prev.filter((item) => item.id_alat !== id))}
          />
        </div>

        {/* Ringkasan */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900">Ringkasan Pengajuan</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Isi keranjang</dt>
              <dd className="font-medium text-slate-900">
                {keranjang.length} jenis · {unitDipilih} unit
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Lama pinjam</dt>
              <dd className="font-medium text-slate-900">{hari >= 1 ? `${hari} hari` : '—'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Kirim ke</dt>
              <dd className="font-medium text-slate-900 text-right">{profil.alamat || '-'}</dd>
            </div>
          </dl>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Estimasi</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {hari >= 1 && keranjang.length > 0 ? rupiah(totalEstimasi) : 'Rp 0'}
            </p>
            <p className="text-xs text-slate-500 mt-2">Lama pinjam × harga harian × jumlah unit.</p>
          </div>
          <button
            type="submit"
            disabled={!siapKirim || proses}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {proses ? 'Mengirim...' : 'Kirim Pengajuan'}
          </button>
        </div>
      </form>
    </div>
  );
}
