'use client';

import { useEffect, useState } from 'react';
import { peminjamanService } from '@/services/peminjaman';
import { daftarAlat, gabungTransaksi, totalBiaya, type BarisPeminjaman, type Transaksi } from '@/lib/peminjaman';

const tanggal = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

const totalUnit = (item: Transaksi) => item.detail.reduce((jumlah, row) => jumlah + row.jumlah, 0);

export default function PetugasPengambilanPage() {
  const [baris, setBaris] = useState<BarisPeminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'gagal'; teks: string } | null>(null);

  const fetchData = () =>
    peminjamanService
      .getAll()
      .then((res: BarisPeminjaman[] | { data?: BarisPeminjaman[] }) => {
        setBaris(Array.isArray(res) ? res : res.data || []);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setLoading(false);
        setPesan({ tipe: 'gagal', teks: err instanceof Error ? err.message : 'Gagal memuat data peminjaman.' });
      });

  useEffect(() => {
    fetchData();
  }, []);

  const handleSerahkan = async (item: Transaksi) => {
    const konfirmasi = confirm(
      `Alat diserahkan kepada ${item.username}?\n\n` +
        `Kirim ke: ${item.alamat || 'alamat belum diisi'}\nNo. HP: ${item.no_hp || 'belum diisi'}\n\n` +
        'Status menjadi Dipinjam dan stok alat akan dipotong.'
    );
    if (!konfirmasi) return;

    setBusyId(item.id_peminjaman);
    try {
      const res = (await peminjamanService.validasi(item.id_peminjaman, 'Dipinjam')) as { message?: string };
      setPesan({ tipe: 'sukses', teks: res?.message || `Transaksi #${item.id_peminjaman} diserahkan.` });
      await fetchData();
    } catch (err) {
      setPesan({ tipe: 'gagal', teks: err instanceof Error ? err.message : 'Gagal memproses penyerahan alat.' });
    } finally {
      setBusyId(null);
    }
  };

  const list = gabungTransaksi(baris).filter((item) => item.status === 'Disetujui');
  const kata = search.trim().toLowerCase();
  const filtered = list.filter(
    (item) => !kata || item.username.toLowerCase().includes(kata) || daftarAlat(item).toLowerCase().includes(kata)
  );

  const totalPages = Math.ceil(filtered.length / 5) || 1;
  const paginated = filtered.slice((page - 1) * 5, page * 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengambilan Alat</h1>
        <p className="text-sm text-slate-500 mt-1">
          Pengajuan yang sudah disetujui dan menunggu diambil. Ubah status menjadi{' '}
          <span className="text-slate-700">Dipinjam</span> ketika alat diserahkan — stok dipotong otomatis saat itu.
        </p>
      </div>

      {pesan && (
        <div
          className={`flex items-start justify-between gap-3 px-4 py-3 rounded-xl border text-sm ${
            pesan.tipe === 'sukses'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <span>{pesan.teks}</span>
          <button type="button" onClick={() => setPesan(null)} className="font-medium underline shrink-0">
            Tutup
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">{list.length} pengajuan menunggu pengambilan alat</span>
          <input
            type="text"
            placeholder="Cari peminjam / alat..."
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
                <th className="p-4">Peminjam</th>
                <th className="p-4">Tujuan Pengantaran</th>
                <th className="p-4">Alat</th>
                <th className="p-4">Rencana Kembali</th>
                <th className="p-4">Total</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada pengajuan yang menunggu pengambilan.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id_peminjaman} className="hover:bg-slate-50 align-top">
                    <td className="p-4 pl-6 text-slate-400">#{item.id_peminjaman}</td>
                    <td className="p-4 font-medium text-slate-900">{item.username}</td>
                    <td className="p-4">
                      <span
                        className={`block text-xs ${item.alamat ? 'text-slate-700' : 'text-amber-700 font-medium'}`}
                      >
                        {item.alamat || 'Alamat belum diisi'}
                      </span>
                      <span className={`block text-xs ${item.no_hp ? 'text-slate-500' : 'text-amber-700'}`}>
                        {item.no_hp || 'No. HP belum diisi'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="block font-medium text-slate-900">{daftarAlat(item)}</span>
                      <span className="text-xs text-slate-500">
                        {totalUnit(item)} unit · pinjam {tanggal(item.tgl_pinjam)}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{tanggal(item.tgl_rencana_kembali)}</td>
                    <td className="p-4 font-medium text-slate-900">{rupiah(totalBiaya(item))}</td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        type="button"
                        disabled={busyId === item.id_peminjaman}
                        onClick={() => handleSerahkan(item)}
                        className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded disabled:opacity-50"
                      >
                        Alat Diserahkan
                      </button>
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
