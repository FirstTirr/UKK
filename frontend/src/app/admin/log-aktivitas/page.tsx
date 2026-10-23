'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { logAktivitasService, type LogAktivitas } from '@/services/logAktivitas';

type KategoriAktivitas = 'Autentikasi' | 'Data Master' | 'Transaksi';
type PilihanFilter = 'Semua' | KategoriAktivitas;

const FILTER: PilihanFilter[] = ['Semua', 'Autentikasi', 'Data Master', 'Transaksi'];
const PER_HALAMAN = 10;

// Log ditulis dengan pola "PREFIX: detail" sehingga bisa dikelompokkan
// tanpa perlu kolom tipe tambahan di tabel log_aktivitas.
function kategoriDari(aktivitas: string): KategoriAktivitas {
  const kepala = (aktivitas.split(':')[0] || '').trim().toUpperCase();
  if (kepala.startsWith('LOGIN') || kepala.startsWith('REGISTER')) return 'Autentikasi';
  if (kepala.startsWith('AJUAN') || kepala.startsWith('VALIDASI') || kepala.startsWith('PENGEMBALIAN')) {
    return 'Transaksi';
  }
  return 'Data Master';
}

const warnaKategori: Record<KategoriAktivitas, string> = {
  Autentikasi: 'bg-violet-50 text-violet-700 border-violet-200',
  'Data Master': 'bg-blue-50 text-blue-700 border-blue-200',
  Transaksi: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function formatWaktu(iso: string) {
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return iso || '-';
  return tanggal.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function warnaPeran(role: string | null) {
  if (role === 'admin') return 'bg-purple-50 text-purple-700 border-purple-200';
  if (role === 'petugas') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export default function AdminLogAktivitasPage() {
  const [list, setList] = useState<LogAktivitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PilihanFilter>('Semua');
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await logAktivitasService.getAll();
      setList(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat log aktivitas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const jumlahPerKategori = (kategori: KategoriAktivitas) =>
    list.filter((item) => kategoriDari(item.aktivitas) === kategori).length;

  const filtered = list.filter((item) => {
    if (filter !== 'Semua' && kategoriDari(item.aktivitas) !== filter) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (item.username || '').toLowerCase().includes(q) ||
      item.aktivitas.toLowerCase().includes(q) ||
      (item.ip_address || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PER_HALAMAN) || 1;
  const paginated = filtered.slice((page - 1) * PER_HALAMAN, page * PER_HALAMAN);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Log Aktivitas</h1>
          <p className="text-sm text-slate-500">
            Jejak audit seluruh aksi pengguna — hanya dapat diakses oleh admin.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Muat Ulang
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex justify-between items-center gap-4">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchData}
            className="font-medium text-red-700 underline whitespace-nowrap cursor-pointer"
          >
            Coba lagi
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative w-full lg:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aktivitas, username, atau IP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTER.map((item) => {
              const aktif = filter === item;
              const jumlah = item === 'Semua' ? list.length : jumlahPerKategori(item as KategoriAktivitas);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setFilter(item);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    aktif
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item} ({jumlah})
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
                <th className="p-4 pl-6">Waktu</th>
                <th className="p-4">Pengguna</th>
                <th className="p-4">Peran</th>
                <th className="p-4">Aktivitas</th>
                <th className="p-4 pr-6">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Memuat data log...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    {list.length === 0 ? 'Belum ada aktivitas tercatat.' : 'Data tidak ditemukan.'}
                  </td>
                </tr>
              ) : (
                paginated.map((item) => {
                  const kategori = kategoriDari(item.aktivitas);
                  return (
                    <tr key={item.id_log_aktivitas} className="hover:bg-slate-50">
                      <td className="p-4 pl-6 whitespace-nowrap text-slate-500">
                        {formatWaktu(item.created_at)}
                      </td>
                      <td className="p-4 font-medium text-slate-900">
                        {item.username || (
                          <span className="text-slate-400 font-normal italic">akun terhapus</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${warnaPeran(
                            item.role
                          )}`}
                        >
                          {item.role || '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded border text-[11px] font-semibold whitespace-nowrap ${warnaKategori[kategori]}`}
                          >
                            {kategori}
                          </span>
                          <span className="text-slate-700">{item.aktivitas}</span>
                        </div>
                      </td>
                      <td className="p-4 pr-6 font-mono text-xs text-slate-500">
                        {item.ip_address || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>
            Menampilkan {paginated.length} dari {filtered.length} aktivitas
            {filter !== 'Semua' ? ` · filter ${filter}` : ''}
          </span>
          <div className="space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 bg-slate-100 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
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
