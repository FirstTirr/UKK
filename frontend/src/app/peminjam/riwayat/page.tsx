'use client';

import { useEffect, useState } from 'react';
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

const STATUS_OPTION = ['Semua', 'Menunggu', 'Disetujui', 'Dipinjam', 'Terlambat', 'Ditolak', 'Selesai'];

export default function PeminjamRiwayatPage() {
  const [baris, setBaris] = useState<BarisPeminjaman[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

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
      .then((res) => setUserId(Number(res.id_user)))
      .catch(() => undefined);

  useEffect(() => {
    fetchProfil();
    fetchPeminjaman();
  }, []);

  const milikSaya = userId === null ? [] : gabungTransaksi(baris).filter((item) => item.id_user === userId);
  const filtered = milikSaya.filter((item) => {
    const statusCocok = filter === 'Semua' || item.status === filter;
    const kata = search.trim().toLowerCase();
    const cariCocok = !kata || daftarAlat(item).toLowerCase().includes(kata);
    return statusCocok && cariCocok;
  });

  const totalPages = Math.ceil(filtered.length / 5) || 1;
  const paginated = filtered.slice((page - 1) * 5, page * 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat Pinjam</h1>
        <p className="text-sm text-slate-500 mt-1">
          Seluruh peminjaman alat yang pernah Anda ajukan beserta statusnya.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-blue-600 focus:outline-none"
            >
              {STATUS_OPTION.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500">{filtered.length} transaksi</span>
          </div>
          <input
            type="text"
            placeholder="Cari nama alat..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-xs px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
                <th className="p-4 pl-6">#</th>
                <th className="p-4">Alat</th>
                <th className="p-4">Tgl Pinjam</th>
                <th className="p-4">Rencana Kembali</th>
                <th className="p-4">Total</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Riwayat tidak ditemukan.</td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id_peminjaman} className="hover:bg-slate-50 align-top">
                    <td className="p-4 pl-6 text-slate-400">#{item.id_peminjaman}</td>
                    <td className="p-4">
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

        <div className="p-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>
            Halaman {page} dari {totalPages}
          </span>
          <div className="space-x-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-slate-100 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 bg-slate-100 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
