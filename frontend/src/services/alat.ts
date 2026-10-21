import { apiFetch } from '@/lib/api';

export const alatService = {
  getAll: () => apiFetch('/alat/read'),
  getById: (id: string | number) => apiFetch(`/alat/read/${id}`),
  create: (data: object) => apiFetch('/alat', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string | number, data: object) => apiFetch(`/alat/edit/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string | number) => apiFetch(`/alat/delete/${id}`, { method: 'DELETE' }),
};
