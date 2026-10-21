import { apiFetch } from '@/lib/api';

export const userService = {
  // GET /api/users/read
  getAll: () => apiFetch('/users/read'),

  // POST /api/users
  create: (data: any) => apiFetch('/users', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),

  // PUT /api/users/:id
  update: (id: number, data: any) => apiFetch(`/users/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),

  // DELETE /api/users/delete/:id
  delete: (id: number) => apiFetch(`/users/delete/${id}`, { 
    method: 'DELETE' 
  }),

  // PUT /api/users/profil (nomor HP & alamat milik sendiri, semua role)
  updateProfil: (data: { no_hp: string; alamat: string }) =>
    apiFetch('/users/profil', { method: 'PUT', body: JSON.stringify(data) }),

  // GET /api/users/profil (profil milik sendiri, semua role)
  getProfil: () =>
    apiFetch<{ id_user: number; username: string; role: string; no_hp: string; alamat: string }>('/users/profil'),
};
