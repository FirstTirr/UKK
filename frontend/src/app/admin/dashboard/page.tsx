'use client';

import { useEffect, useState } from 'react';
import { peminjamanService } from '@/services/peminjaman';

export default function AdminDashboard() {
  const [listPeminjaman, setListPeminjaman] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPeminjaman = async () => {
    try {
      const res = await peminjamanService.getAll() as { data?: any[] } | any[];
      setListPeminjaman(Array.isArray(res) ? res : res.data || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeminjaman();
  }, []);

  const totalPinjam = listPeminjaman.length;
  const pendingCount = listPeminjaman.filter((i) => i.status === 'Menunggu' || i.status === 'Pending').length;
  const approvedCount = listPeminjaman.filter((i) => i.status === 'Disetujui' || i.status === 'Dipinjam').length;

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Pantau aktivitas seluruh peminjaman alat di laboratorium.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Peminjaman</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalPinjam}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">Total</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Menunggu Validasi</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">Wait</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Aktif / Disetujui</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">OK</div>
        </div>
      </div>

      {/* Monitoring Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Riwayat & Status Peminjaman</h2>
          <p className="text-xs text-slate-500 mt-0.5">Daftar transaksi peminjaman oleh peminjam.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Peminjam</th>
                <th className="p-4">Alat</th>
                <th className="p-4">Tanggal Pinjam</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Memuat data...</td></tr>
              ) : listPeminjaman.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Belum ada transaksi peminjaman.</td></tr>
              ) : (
                listPeminjaman.map((item) => (
                  <tr key={item.id_peminjaman} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-medium text-slate-900">{item.nama_user || item.username || item.user?.nama_user || '-'}</td>
                    <td className="p-4 text-slate-700">{item.nama_alat || item.alat?.nama_alat || '-'}</td>
                    <td className="p-4 text-xs text-slate-500">{item.tgl_pinjam ? new Date(item.tgl_pinjam).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="p-4 pr-6 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Menunggu' || item.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : item.status === 'Ditolak'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : item.status === 'Selesai'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
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
