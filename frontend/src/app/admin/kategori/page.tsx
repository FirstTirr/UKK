'use client';

import { useEffect, useState } from 'react';
import { kategoriService } from '@/services/kategori';

export default function AdminKategoriPage() {
  const [list, setList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [namaKategori, setNamaKategori] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const res: any = await kategoriService.getAll();
      setList(Array.isArray(res) ? res : res.data || []);
    } catch (err: any) { alert(err.message); }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (item?: any) => {
    if (item) {
      setEditId(item.id_kategori);
      setNamaKategori(item.nama_kategori);
    } else {
      setEditId(null);
      setNamaKategori('');
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) await kategoriService.update(editId, { nama_kategori: namaKategori });
      else await kategoriService.create({ nama_kategori: namaKategori });
      setModalOpen(false);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus kategori ini?')) {
      try { await kategoriService.delete(id); fetchData(); } catch (err: any) { alert(err.message); }
    }
  };

  const filtered = list.filter((i) => i.nama_kategori.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / 5) || 1;
  const paginated = filtered.slice((page - 1) * 5, page * 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Data Kategori</h1>
          <p className="text-sm text-slate-500">Kelola pengelompokan jenis alat laboratorium.</p>
        </div>
        <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <input
            type="text"
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full max-w-xs px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-blue-600 focus:outline-none"
          />
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
              <th className="p-4 pl-6">Nama Kategori</th>
              <th className="p-4 pr-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {paginated.length === 0 ? (
              <tr><td colSpan={2} className="p-8 text-center text-slate-400">Data tidak ditemukan.</td></tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id_kategori} className="hover:bg-slate-50">
                  <td className="p-4 pl-6 font-medium text-slate-900">{item.nama_kategori}</td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <button onClick={() => openModal(item)} className="text-xs font-medium text-amber-600 hover:bg-amber-50 px-2.5 py-1.5 rounded">Edit</button>
                    <button onClick={() => handleDelete(item.id_kategori)} className="text-xs font-medium text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="p-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Halaman {page} dari {totalPages}</span>
          <div className="space-x-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 bg-slate-100 rounded disabled:opacity-50">Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 bg-slate-100 rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nama Kategori"
                value={namaKategori}
                onChange={(e) => setNamaKategori(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}