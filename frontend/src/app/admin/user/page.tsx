'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services/user';

export default function AdminUserPage() {
  const [list, setList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({ username: '', password: '', role: 'peminjam' });

  const fetchData = async () => {
    try {
      const res: any = await userService.getAll();
      // Handle response array langsung atau wrapping object { data: [...] }
      const rawData = Array.isArray(res) ? res : res?.data || [];
      setList(rawData);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (item?: any) => {
    if (item) {
      setEditId(item.id_user);
      setForm({ username: item.username || '', password: '', role: item.role || 'peminjam' });
    } else {
      setEditId(null);
      setForm({ username: '', password: '', role: 'peminjam' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) await userService.update(editId, form);
      else await userService.create(form);
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus akun user ini?')) {
      try {
        await userService.delete(id);
        fetchData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Safe filter untuk mencegah TypeError jika field undefined
  const filtered = list.filter((i) =>
    (i.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / 5) || 1;
  const paginated = filtered.slice((page - 1) * 5, page * 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Data User</h1>
          <p className="text-sm text-slate-500">Kelola akun admin, petugas, dan peminjam sistem.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Tambah User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <input
            type="text"
            placeholder="Cari username..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-xs px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-blue-600 focus:outline-none"
          />
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
              <th className="p-4 pl-6">Username</th>
              <th className="p-4">Role</th>
              <th className="p-4 pr-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-400">
                  Data tidak ditemukan.
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id_user} className="hover:bg-slate-50">
                  <td className="p-4 pl-6 font-medium text-slate-900">{item.username}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                        item.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : item.role === 'petugas'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.role}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <button
                      onClick={() => openModal(item)}
                      className="text-xs font-medium text-amber-600 hover:bg-amber-50 px-2.5 py-1.5 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id_user)}
                      className="text-xs font-medium text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="p-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>
            Halaman {page} dari {totalPages}
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

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">{editId ? 'Edit User' : 'Tambah User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                required
              />
              <input
                type="password"
                placeholder={editId ? 'Password (kosongkan jika tidak diubah)' : 'Password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                required={!editId}
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                required
              >
                <option value="peminjam">Peminjam</option>
                <option value="petugas">Petugas</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}