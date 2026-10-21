'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { peminjamanService } from '@/services/peminjaman';
import { daftarAlat, gabungTransaksi, type BarisPeminjaman, type Transaksi } from '@/lib/peminjaman';

const badge = (status: string) =>
  status === 'Menunggu'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : status === 'Dipinjam'
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : status === 'Disetujui'
    ? 'bg-sky-50 text-sky-700 border-sky-200'
    : status === 'Ditolak'
    ? 'bg-red-50 text-red-700 border-red-200'
    : status === 'Terlambat'
    ? 'bg-orange-50 text-orange-700 border-orange-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

const tanggal = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const totalUnit = (item: Transaksi) => item.detail.reduce((jumlah, row) => jumlah + row.jumlah, 0);

const METRIK = [
  {
    label: 'Menunggu Validasi',
    kelas: 'text-amber-600',
    latar: 'bg-amber-50',
    keterangan: 'Pengajuan belum diproses',
    kode: 'Wait',
  },
  {
    label: 'Siap Diambil',
    kelas: 'text-sky-600',
    latar: 'bg-sky-50',
    keterangan: 'Disetujui, belum diserahkan',
    kode: 'Ready',
  },
  {
    label: 'Sedang Dipinjam',
    kelas: 'text-blue-600',
    latar: 'bg-blue-50',
    keterangan: 'Berada di luar laboratorium',
    kode: 'Out',
  },
  {
    label: 'Terlambat',
    kelas: 'text-orange-600',
    latar: 'bg-orange-50',
    keterangan: 'Melewati tanggal pengembalian',
    kode: 'Late',
  },
];

export default function PetugasDashboard() {
  const [baris, setBaris] = useState<BarisPeminjaman[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () =>
    peminjamanService
      .getAll()
      .then((res: BarisPeminjaman[] | { data?: BarisPeminjaman[] }) => {
        setBaris(Array.isArray(res) ? res : res.data || []);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setLoading(false);
        alert(err instanceof Error ? err.message : 'Gagal memuat data peminjaman.');
      });

  useEffect(() => {
    fetchData();
  }, []);

  const list = gabungTransaksi(baris);
  const hitung = (...status: string[]) => list.filter((item) => status.includes(item.status)).length;
  const hitungan = [hitung('Menunggu'), hitung('Disetujui'), hitung('Dipinjam'), hitung('Terlambat')];
  const unitDiLuar = list
    .filter((item) => ['Dipinjam', 'Terlambat'].includes(item.status))
    .reduce((jumlah, item) => jumlah + totalUnit(item), 0);

  const aksiUtama =
    hitungan[0] > 0
      ? { href: '/petugas/validasi', teks: `Validasi ${hitungan[0]} Pengajuan` }
      : hitungan[1] > 0
      ? { href: '/petugas/pengambilan', teks: `Proses ${hitungan[1]} Pengambilan` }
      : { href: '/petugas/validasi', teks: 'Validasi Pinjam' };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Petugas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan pengajuan dan alat yang sedang beredar di laboratorium.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/petugas/pengambilan"
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Pengambilan Alat
          </Link>
          <Link
            href={aksiUtama.href}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {aksiUtama.teks}
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {METRIK.map((metrik, index) => (
          <div
            key={metrik.label}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider ${metrik.kelas}`}>{metrik.label}</p>
              <p className={`text-2xl font-bold mt-1 ${metrik.kelas}`}>{loading ? '-' : hitungan[index]}</p>
              <p className="text-xs text-slate-500 mt-1">{metrik.keterangan}</p>
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${metrik.latar} ${metrik.kelas}`}
            >
              {metrik.kode}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 text-sm text-blue-800">
        <span className="font-semibold">{unitDiLuar}</span> unit alat berada di luar laboratorium.
      </div>

      {/* Monitoring Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Aktivitas Peminjaman Terbaru</h2>
          <p className="text-xs text-slate-500 mt-0.5">Urut dari transaksi terbaru.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Peminjam</th>
                <th className="p-4">Alat</th>
                <th className="p-4">Tgl Pinjam</th>
                <th className="p-4">Rencana Kembali</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Belum ada transaksi peminjaman.</td>
                </tr>
              ) : (
                list.slice(0, 8).map((item) => (
                  <tr key={item.id_peminjaman} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-medium text-slate-900">{item.username}</td>
                    <td className="p-4 text-slate-700">
                      <span className="block">{daftarAlat(item)}</span>
                      <span className="text-xs text-slate-500">{totalUnit(item)} unit</span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{tanggal(item.tgl_pinjam)}</td>
                    <td className="p-4 text-xs text-slate-500">{tanggal(item.tgl_rencana_kembali)}</td>
                    <td className="p-4 pr-6 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
