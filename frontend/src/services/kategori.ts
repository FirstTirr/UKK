import { apiFetch } from '@/lib/api';

export const kategoriService = {
  getAll: () => apiFetch('/kategori/read'),
  create: (data: { nama_kategori: string }) => apiFetch('/kategori', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { nama_kategori: string }) => apiFetch(`/kategori/edit/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch(`/kategori/delete/${id}`, { method: 'DELETE' }),
};
