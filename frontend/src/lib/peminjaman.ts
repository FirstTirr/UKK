/** Bentuk mentah satu baris dari GET /api/peminjaman/read (JOIN detail). */
export interface BarisPeminjaman {
  id_peminjaman: number;
  id_user: number;
  username?: string;
  no_hp?: string | null;
  alamat?: string | null;
  tgl_pinjam?: string | null;
  tgl_rencana_kembali?: string | null;
  status: string;
  id_alat?: number | null;
  nama_alat?: string | null;
  jumlah?: number | null;
  total_harga?: string | number | null;
}

export interface RincianAlat {
  id_alat: number;
  nama_alat: string;
  jumlah: number;
  total_harga: number;
}

export interface Transaksi {
  id_peminjaman: number;
  id_user: number;
  username: string;
  no_hp: string;
  alamat: string;
  tgl_pinjam: string | null;
  tgl_rencana_kembali: string | null;
  status: string;
  detail: RincianAlat[];
}

/**
 * Satu transaksi bisa memuat beberapa alat, sehingga API mengembalikan
 * satu baris per rincian. Gabungkan menjadi satu objek per transaksi.
 */
export function gabungTransaksi(rows: BarisPeminjaman[]): Transaksi[] {
  const peta = new Map<number, Transaksi>();

  for (const row of rows) {
    const id = Number(row.id_peminjaman);
    if (!peta.has(id)) {
      peta.set(id, {
        id_peminjaman: id,
        id_user: Number(row.id_user),
        username: row.username || '-',
        no_hp: row.no_hp || '',
        alamat: row.alamat || '',
        tgl_pinjam: row.tgl_pinjam || null,
        tgl_rencana_kembali: row.tgl_rencana_kembali || null,
        status: row.status,
        detail: [],
      });
    }

    if (row.id_alat !== null && row.id_alat !== undefined) {
      peta.get(id)!.detail.push({
        id_alat: Number(row.id_alat),
        nama_alat: row.nama_alat || 'Alat dihapus',
        jumlah: Number(row.jumlah || 0),
        total_harga: Number(row.total_harga || 0),
      });
    }
  }

  return Array.from(peta.values());
}

export const totalBiaya = (transaksi: Transaksi): number =>
  transaksi.detail.reduce((jumlah, item) => jumlah + item.total_harga, 0);

/** "Multimeter (2), Ombroskop (1)" untuk ditampilkan di kolom alat. */
export const daftarAlat = (transaksi: Transaksi): string =>
  transaksi.detail.map((item) => `${item.nama_alat} (${item.jumlah})`).join(', ') || '-';
