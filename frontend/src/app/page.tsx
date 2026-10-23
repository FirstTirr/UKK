import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-zinc-50 text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-100">
      {/* Header / Navbar Sederhana */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm">
              IC
            </span>
            <span>INVELA CONTROL</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center px-6 py-16">
        <div className="max-w-2xl space-y-6">
          <div className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            Sistem Informasi Inventaris Laboratorium
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Kelola & Pinjam Alat Laboratorium Lebih Mudah
          </h1>

          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Platform peminjaman peralatan laboratorium secara praktis dan terorganisir. Cari barang, ajukan peminjaman, dan pantau status pengembalian dalam satu sistem.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/auth/register"
              className="flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 font-medium text-white transition hover:bg-blue-700"
            >
              Buat Akun Peminjam
            </Link>
            <Link
              href="/auth/login"
              className="flex h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>

        {/* Ringkasan Alur Kerja */}
        <div className="mt-16 grid w-full grid-cols-1 gap-6 border-t border-zinc-200 pt-10 dark:border-zinc-800 sm:grid-cols-3">
          <div>
            <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">01.</span>
            <h3 className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">Daftar Akun</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Registrasi akun peminjam mandiri dengan verifikasi aman.</p>
          </div>
          <div>
            <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">02.</span>
            <h3 className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">Pilih Peralatan</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Cek ketersediaan barang dan pilih alat yang dibutuhkan.</p>
          </div>
          <div>
            <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">03.</span>
            <h3 className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">Ajukan & Pantau</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Kirim permohonan pinjam dan pantau status persetujuan petugas.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-center text-xs text-zinc-500 sm:flex-row sm:text-left">
          <p>&copy; 2026 Invela Control UKK. Hak Cipta Dilindungi.</p>
          <div className="flex gap-4">
            <span>Sistem Peminjaman Lab</span>
            <span>&bull;</span>
            <span>UKK RPL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}