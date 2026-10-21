-- 1. Buat dan Pilih Database
CREATE DATABASE IF NOT EXISTS db_peminjaman_alat;
USE db_peminjaman_alat;

-- 2. Tabel user
CREATE TABLE user (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'petugas', 'peminjam') NOT NULL,
    no_hp VARCHAR(20) NULL,            -- wajib diisi peminjam sebelum memesan
    alamat VARCHAR(255) NULL,          -- tujuan pengantaran alat
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabel kategori
CREATE TABLE kategori (
    id_kategori INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 4. Tabel alat
CREATE TABLE alat (
    id_alat INT AUTO_INCREMENT PRIMARY KEY,
    nama_alat VARCHAR(100) NOT NULL,
    id_kategori INT NOT NULL,
    stok INT NOT NULL DEFAULT 0,
    deskripsi TEXT,
    harga_perhari DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (id_kategori) REFERENCES kategori(id_kategori) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabel peminjaman (Header Transaksi)
-- Alur status: Menunggu -> Disetujui (petugas) -> Dipinjam (alat diserahkan) -> Selesai
--              Menunggu/Disetujui -> Ditolak (pengajuan dibatalkan)
-- Stok alat dipotong trigger saat 'Dipinjam' dan dikembalikan saat 'Selesai'.
CREATE TABLE peminjaman (
    id_peminjaman INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    id_petugas INT NULL,
    tgl_pinjam DATE NOT NULL,
    tgl_rencana_kembali DATE NOT NULL,
    status ENUM('Menunggu', 'Disetujui', 'Ditolak', 'Dipinjam', 'Selesai') DEFAULT 'Menunggu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_petugas) REFERENCES user(id_user) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Tabel detail_peminjaman (Rincian Alat)
CREATE TABLE detail_peminjaman (
    id_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_peminjaman INT NOT NULL,
    id_alat INT NOT NULL,
    jumlah INT NOT NULL DEFAULT 1,
    total_harga DECIMAL(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (id_peminjaman) REFERENCES peminjaman(id_peminjaman) ON DELETE CASCADE,
    FOREIGN KEY (id_alat) REFERENCES alat(id_alat) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Tabel pengembalian
CREATE TABLE pengembalian (
    id_pengembalian INT AUTO_INCREMENT PRIMARY KEY,
    id_peminjaman INT NOT NULL UNIQUE,
    tgl_kembali_sebenarnya DATE NOT NULL,
    denda DECIMAL(10,2) DEFAULT 0,
    total_pembayaran DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_peminjaman) REFERENCES peminjaman(id_peminjaman) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Tabel log_aktivitas
CREATE TABLE log_aktivitas (
    id_log_aktivitas INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    aktivitas VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES user(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;