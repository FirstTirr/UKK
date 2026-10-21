'use client';

import { useState } from 'react';

export interface Alat {
  id_alat: number;
  nama_alat: string;
  stok: number;
  stok_tersedia: string | number;
  harga_perhari: string | number;
  deskripsi?: string | null;
}

export const rupiah = (nilai: number) => `Rp ${nilai.toLocaleString('id-ID')}`;

export const hargaAlat = (alatList: Alat[], id: number) =>
  Number(alatList.find((item) => item.id_alat === id)?.harga_perhari ?? 0);

export const namaAlat = (alatList: Alat[], id: number) =>
  alatList.find((item) => item.id_alat === id)?.nama_alat || '-';

export const tersediaAlat = (alatList: Alat[], id: number) =>
  Number(alatList.find((item) => item.id_alat === id)?.stok_tersedia ?? 0);

const inputClass =
  'w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-600 focus:outline-none';

interface KeranjangItem {
  id_alat: number;
  jumlah: number;
}

interface PilihAlatProps {
  alatList: Alat[];
  keranjang: KeranjangItem[];
  /** Mengembalikan pesan kesalahan, atau null bila berhasil. */
  onTambah: (id_alat: number, jumlah: number) => string | null;
  onHapus: (id_alat: number) => void;
}

/** Panel pemilihan alat: satu pengajuan boleh memuat banyak alat berbeda. */
export function PilihAlatPanel({ alatList, keranjang, onTambah, onHapus }: PilihAlatProps) {
  const [idAlat, setIdAlat] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const [error, setError] = useState('');

  const tambah = () => {
    const pesan = onTambah(Number(idAlat), jumlah);
    setError(pesan || '');
    if (pesan) return;
    setIdAlat('');
    setJumlah(1);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-base font-bold text-slate-900">Pilih Alat</h2>
      <p className="text-xs text-slate-500 mt-0.5">Bebas menambah lebih dari satu jenis alat dalam satu pengajuan.</p>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_auto] gap-3 items-end mt-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Alat</label>
          <select value={idAlat} onChange={(e) => setIdAlat(e.target.value)} className={inputClass}>
            <option value="">-- Pilih Alat --</option>
            {alatList.map((item) => (
              <option key={item.id_alat} value={item.id_alat} disabled={tersediaAlat(alatList, item.id_alat) <= 0}>
                {item.nama_alat} — {rupiah(hargaAlat(alatList, item.id_alat))}/hari (tersedia {tersediaAlat(alatList, item.id_alat)})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Jumlah</label>
          <input
            type="number"
            min={1}
            value={jumlah}
            onChange={(e) => setJumlah(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <button
          type="button"
          onClick={tambah}
          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          + Tambah
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {keranjang.length > 0 ? (
        <ul className="mt-4 border-t border-slate-100">
          {keranjang.map((item) => (
            <li
              key={item.id_alat}
              className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 text-sm"
            >
              <span className="font-medium text-slate-900">{namaAlat(alatList, item.id_alat)}</span>
              <span className="flex items-center gap-3 text-slate-500">
                <span>
                  {item.jumlah} unit × {rupiah(hargaAlat(alatList, item.id_alat))}/hari
                </span>
                <button
                  type="button"
                  onClick={() => onHapus(item.id_alat)}
                  className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium"
                >
                  Hapus
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">Belum ada alat yang dipilih.</p>
      )}
    </div>
  );
}
