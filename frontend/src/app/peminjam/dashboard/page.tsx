'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { userService } from '@/services/user';

export default function PeminjamHome() {
  const [profil, setProfil] = useState<{ nama_user?: string; username?: string; no_hp: string; alamat: string } | null>(null);

  useEffect(() => {
    userService
      .getProfil()
      .then((res) => setProfil(res))
      .catch(() => undefined);
  }, []);

  const profilKurang = profil !== null && (!profil.no_hp || !profil.alamat);

  return (
    <div className="space-y-8 pb-12">
      {/* Banner Sambutan */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-sm">
        <div className="max-w-2xl space-y-3">
          <span className="inline-block rounded-full bg-blue-500/40 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-blue-100">
            Portal Peminjam &bull; Invela Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Selamat Datang{profil?.nama_user ? `, ${profil.nama_user}` : ''}!
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Sistem peminjaman peralatan laboratorium secara digital, cepat, dan terorganisir. Ikuti panduan di bawah untuk mulai mengajukan peminjaman alat.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/peminjam/pinjam"
              className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm"
            >
              + Buat Peminjaman Baru
            </Link>
            <Link
              href="/peminjam/riwayat"
              className="bg-blue-700/60 hover:bg-blue-700 text-white border border-blue-400/40 px-5 py-2.5 rounded-xl font-medium text-sm transition"
            >
              Lihat Riwayat Saya
            </Link>
          </div>
        </div>
      </div>

      {/* Warning jika profil belum lengkap */}
      {profilKurang && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-900">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Nomor HP dan alamat Anda belum lengkap. Harap lengkapi informasi profil sebelum mengajukan alat.</span>
          </div>
          <Link href="/peminjam/profil" className="font-semibold underline shrink-0 hover:text-amber-950">
            Lengkapi Profil &rarr;
          </Link>
        </div>
      )}

      {/* Panduan / Langkah-Langkah Penggunaan */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Panduan Peminjaman Alat Laboratorium</h2>
          <p className="text-sm text-slate-500">Ikuti 4 langkah mudah berikut untuk meminjam peralatan laboratorium.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold text-sm">
              1
            </span>
            <h3 className="font-semibold text-slate-900 text-base">Lengkapi Profil</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pastikan nomor telepon dan alamat Anda sudah terisi dengan benar pada menu profil akun.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold text-sm">
              2
            </span>
            <h3 className="font-semibold text-slate-900 text-base">Pilih Alat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Masuk ke menu Pinjam Alat, pilih kategori, tentukan jenis alat dan jumlah unit yang diperlukan.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold text-sm">
              3
            </span>
            <h3 className="font-semibold text-slate-900 text-base">Ajukan Peminjaman</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tentukan tanggal pinjam serta rencana tanggal pengembalian, lalu kirim pengajuan ke petugas.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold text-sm">
              4
            </span>
            <h3 className="font-semibold text-slate-900 text-base">Ambil & Kembalikan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pantau status persetujuan di riwayat, ambil alat di lab, dan kembalikan tepat waktu.
            </p>
          </div>
        </div>
      </div>

      {/* Informasi / Ketentuan Lab */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ketentuan & Informasi Laboratorium
        </h3>
        <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5">
          <li>Peminjaman wajib diajukan minimal 1 hari sebelum tanggal penggunaan alat di laboratorium.</li>
          <li>Peminjam bertanggung jawab penuh atas keutuhan dan kebersihan alat yang dipinjam.</li>
          <li>Keterlambatan pengembalian akan dicatat dalam sistem dan dapat dikenakan sanksi sesuai kebijakan laboratorium.</li>
          <li>Jika ada kendala kerusakan atau kehilangan alat, segera laporkan kepada petugas laboratorium.</li>
        </ul>
      </div>
    </div>
  );
}