import { apiFetch } from '@/lib/api';
import type { BarisPeminjaman } from '@/lib/peminjaman';

export interface ItemPinjam {
  id_alat: number;
  jumlah: number;
}

export interface FormPinjam {
  tgl_pinjam: string;
  tgl_rencana_kembali: string;
  items: ItemPinjam[];
}

export const peminjamanService = {
  // GET /api/peminjaman/read -> satu baris per rincian alat (gabungkan di lib/peminjaman)
  getAll: () => apiFetch<BarisPeminjaman[]>('/peminjaman/read'),

  getById: (id: string | number) => apiFetch(`/peminjaman/read/${id}`),

  // Satu transaksi boleh memuat beberapa alat sekaligus.
  create: (data: FormPinjam) => apiFetch('/peminjaman', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  /**
   * Validasi petugas:
   *   Disetujui = pengajuan lolos, menunggu pengambilan
   *   Dipinjam  = alat sudah diserahkan (stok dipotong trigger)
   *   Ditolak   = pengajuan dibatalkan
   */
  validasi: (id: string | number, status: 'Disetujui' | 'Dipinjam' | 'Ditolak') =>
    apiFetch(`/peminjaman/validasi/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  kembalikan: (id: string | number) => apiFetch(`/pengembalian/${id}`, { method: 'PUT' }),
};
