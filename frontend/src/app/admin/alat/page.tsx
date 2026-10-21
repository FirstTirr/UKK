'use client';

import { useEffect, useState } from 'react';
import { alatService } from '@/services/alat';
import { kategoriService } from '@/services/kategori';

export default function AdminAlatPage() {
  const [alatList, setAlatList] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({ nama_alat: '', id_kategori: '', stok: 0, deskripsi: '', harga_perhari: '' });

  const fetchData = async () => {
    try {
      const [resAlat, resKat]: [any, any] = await Promise.all([alatService.getAll(), kategoriService.getAll()]);
      setAlatList(Array.isArray(resAlat) ? resAlat : resAlat.data || []);
      setKategoriList(Array.isArray(resKat) ? resKat : resKat.data || []);
    } catch (err: any) { alert(err.message); }
  };

  useEffect(() => { fetchData(); }, []);

  const formatRupiah = (val: string) => {
    const raw = val.replace(/\D/g, '');
    return raw ? Number(raw).toLocaleString('id-ID') : '';
  };

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, harga_perhari: formatRupiah(e.target.value) });
  };

  const openFormModal = (item?: any) => {
    if (item) {
      setEditId(item.id_alat);
      setForm({
        nama_alat: item.nama_alat,
        id_kategori: item.id_kategori,
        stok: item.stok,
        deskripsi: item.deskripsi || '',
        harga_perhari: item.harga_perhari ? Number(item.harga_perhari).toLocaleString('id-ID') : '',
      });
    } else {
      setEditId(null);
      setForm({ nama_alat: '', id_kategori: '', stok: 0, deskripsi: '', harga_perhari: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, harga_perhari: Number(form.harga_perhari.replace(/\./g, '')) };
    try {
      if (editId) await alatService.update(editId, payload);
      else await alatService.create(payload);
      setModalOpen(false);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus alat ini?')) {
      try { await alatService.delete(id); fetchData(); } catch (err: any) { alert(err.message); }
    }
  };

  const filtered = alatList.filter((i) => i.nama_alat.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / 5) || 1;
  const paginated = filtered.slice((page - 1) * 5, page * 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Data Alat</h1>
          <p className="text-sm text-slate-500">Kelola daftar inventaris laboratorium dan stok barang.</p>
        </div>
        <button onClick={() => openFormModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Tambah Alat
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <input
            type="text"
            placeholder="Cari nama alat..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full max-w-xs px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-blue-600 focus:outline-none"
          />
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
              <th className="p-4">Nama Alat</th>
              <th className="p-4">Stok</th>
              <th className="p-4">Harga / Hari</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {paginated.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">Data tidak ditemukan.</td></tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id_alat} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-900">{item.nama_alat}</td>
                  <td className="p-4"><span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100">{item.stok} unit</span></td>
                  <td className="p-4 font-medium">Rp {Number(item.harga_perhari).toLocaleString('id-ID')}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => setDetailItem(item)} className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded">Detail</button>
                    <button onClick={() => openFormModal(item)} className="text-xs font-medium text-amber-600 hover:bg-amber-50 px-2.5 py-1.5 rounded">Edit</button>
                    <button onClick={() => handleDelete(item.id_alat)} className="text-xs font-medium text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded">Hapus</button>
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

      {/* Modal Input/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">{editId ? 'Edit Alat' : 'Tambah Alat'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Nama Alat" value={form.nama_alat} onChange={(e) => setForm({ ...form, nama_alat: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
              <select value={form.id_kategori} onChange={(e) => setForm({ ...form, id_kategori: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" required>
                <option value="">-- Pilih Kategori --</option>
                {kategoriList.map((k) => <option key={k.id_kategori} value={k.id_kategori}>{k.nama_kategori}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Stok" value={form.stok} onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
                <input type="text" placeholder="Harga/Hari (Rp)" value={form.harga_perhari} onChange={handleHargaChange} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" required />
              </div>
              <textarea placeholder="Deskripsi Alat" rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {detailItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Detail Alat</h2>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-500 block">Nama Alat:</span> {detailItem.nama_alat}</p>
              <p><span className="font-semibold text-slate-500 block">Stok:</span> {detailItem.stok} unit</p>
              <p><span className="font-semibold text-slate-500 block">Harga/Hari:</span> Rp {Number(detailItem.harga_perhari).toLocaleString('id-ID')}</p>
              <p><span className="font-semibold text-slate-500 block">Deskripsi:</span> {detailItem.deskripsi || '-'}</p>
            </div>
            <div className="text-right">
              <button onClick={() => setDetailItem(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}