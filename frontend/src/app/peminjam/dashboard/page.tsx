'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { peminjamanService } from '@/services/peminjaman';
import { userService } from '@/services/user';
import { daftarAlat, gabungTransaksi, totalBiaya, type BarisPeminjaman, type Transaksi } from '@/lib/peminjaman';

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

const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

const totalUnit = (item: Transaksi) => item.detail.reduce((jumlah, row) => jumlah + row.jumlah, 0);

const METRIK = [
  { label: 'Total Pinjaman', kelas: 'text-slate-500', keterangan: 'Seluruh pengajuan Anda' },
  { label: 'Menunggu', kelas: 'text-amber-600', keterangan: 'Menunggu validasi petugas' },
  { label: 'Siap Diambil', kelas: 'text-sky-600', keterangan: 'Disetujui, siap diambil' },
  { label: 'Sedang Dipinjam', kelas: 'text-blue-600', keterangan: 'Alat masih Anda pegang' },
  { label: 'Terlambat', kelas: 'text-orange-600', keterangan: 'Melewati tanggal kembali' },
  { label: 'Selesai', kelas: 'text-emerald-600', keterangan: 'Sudah dikembalikan' },
];

export default function PeminjamDashboard() {
  const [baris, setBaris] = useState<BarisPeminjaman[]>([]);
  const [profil, setProfil] = useState<{ id_user: number; no_hp: string; alamat: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPeminjaman = () =>
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

  const fetchProfil = () =>
    userService
      .getProfil()
      .then((res) => setProfil({ id_user: Number(res.id_user), no_hp: res.no_hp, alamat: res.alamat }))
      .catch(() => undefined);

  useEffect(() => {
    fetchProfil();
    fetchPeminjaman();
  }, []);

  const milikSaya = profil ? gabungTransaksi(baris).filter((item) => item.id_user === profil.id_user) : [];
  const hitung = (...status: string[]) => milikSaya.filter((item) => status.includes(item.status)).length;
  const hitungan = [
    milikSaya.length,
    hitung('Menunggu'),
    hitung('Disetujui'),
    hitung('Dipinjam'),
    hitung('Terlambat'),
    hitung('Selesai'),
  ];
  const profilKurang = profil !== null && (!profil.no_hp || !profil.alamat);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Peminjam</h1>
          <p className="text-sm text-slate-500 mt-1">Status peminjaman alat milik Anda saat ini.</p>
        </div>
        <Link
          href="/peminjam/pinjam"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Ajukan Peminjaman
        </Link>
      </div>

      {profilKurang && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-800">
          <span>Nomor HP dan alamat Anda belum lengkap. Isi sebelum mengajukan peminjaman.</span>
          <Link href="/peminjam/pinjam" className="font-medium underline shrink-0">
            Lengkapi sekarang
          </Link>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {METRIK.map((metrik, index) => (
          <div key={metrik.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className={`text-xs font-semibold uppercase tracking-wider ${metrik.kelas}`}>{metrik.label}</p>
            <p className={`text-2xl font-bold mt-1 ${metrik.kelas}`}>{loading ? '-' : hitungan[index]}</p>
            <p className="text-xs text-slate-500 mt-1">{metrik.keterangan}</p>
          </div>
        ))}
      </div>

      {/* Pengajuan terbaru */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pengajuan Terbaru</h2>
            <p className="text-xs text-slate-500 mt-0.5">Maksimal 5 transaksi terakhir Anda.</p>
          </div>
          <Link
            href="/peminjam/riwayat"
            className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded"
          >
            Lihat riwayat lengkap
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Alat</th>
                <th className="p-4">Tgl Pinjam</th>
                <th className="p-4">Rencana Kembali</th>
                <th className="p-4">Total</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : milikSaya.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Anda belum pernah mengajukan peminjaman.
                  </td>
                </tr>
              ) : (
                milikSaya.slice(0, 5).map((item) => (
                  <tr key={item.id_peminjaman} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="block font-medium text-slate-900">{daftarAlat(item)}</span>
                      <span className="text-xs text-slate-500">{totalUnit(item)} unit</span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{tanggal(item.tgl_pinjam)}</td>
                    <td className="p-4 text-xs text-slate-500">{tanggal(item.tgl_rencana_kembali)}</td>
                    <td className="p-4 font-medium text-slate-900">{rupiah(totalBiaya(item))}</td>
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
