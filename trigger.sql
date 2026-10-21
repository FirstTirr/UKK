-- ============================================================
-- TRIGGER STOK ALAT
-- Seluruh perubahan stok hanya terjadi di trigger ini; backend
-- tidak menghitung stok sama sekali.
--   trg_kurangi_stok_alat    : status -> 'Dipinjam' (alat diserahkan)
--   trg_kembalikan_stok_alat : status -> 'Selesai'  (alat kembali)
-- Keduanya JOIN ke detail_peminjaman, jadi satu transaksi yang
-- memuat beberapa alat tetap memotong/mengembalikan seluruh stoknya.
-- ============================================================

DELIMITER //

CREATE TRIGGER trg_kurangi_stok_alat
AFTER UPDATE ON peminjaman
FOR EACH ROW
BEGIN
    IF NEW.status = 'Dipinjam' AND OLD.status != 'Dipinjam' THEN
        UPDATE alat a
        JOIN detail_peminjaman dp ON a.id_alat = dp.id_alat
        SET a.stok = a.stok - dp.jumlah
        WHERE dp.id_peminjaman = NEW.id_peminjaman;
    END IF;
END //

CREATE TRIGGER trg_kembalikan_stok_alat
AFTER UPDATE ON peminjaman
FOR EACH ROW
BEGIN
    IF NEW.status = 'Selesai' AND OLD.status != 'Selesai' THEN
        UPDATE alat a
        JOIN detail_peminjaman dp ON a.id_alat = dp.id_alat
        SET a.stok = a.stok + dp.jumlah
        WHERE dp.id_peminjaman = NEW.id_peminjaman;
    END IF;
END //

DELIMITER ;

-- ============================================================
-- Prosedur pengembalian (menghitung denda keterlambatan)
-- ============================================================

DELIMITER //

CREATE PROCEDURE sp_kembalikan_alat(
    IN p_id_peminjaman INT,
    IN p_tgl_kembali_sebenarnya DATE,
    IN p_tarif_denda_perhari DECIMAL(10,2)
)
BEGIN
    DECLARE v_tgl_rencana DATE;
    DECLARE v_keterlambatan INT;
    DECLARE v_denda DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total_harga DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total_bayar DECIMAL(10,2) DEFAULT 0;

    -- Ambil data tanggal rencana kembali
    SELECT tgl_rencana_kembali INTO v_tgl_rencana 
    FROM peminjaman 
    WHERE id_peminjaman = p_id_peminjaman;

    -- Hitung selisih hari keterlambatan
    SET v_keterlambatan = DATEDIFF(p_tgl_kembali_sebenarnya, v_tgl_rencana);

    IF v_keterlambatan > 0 THEN
        SET v_denda = v_keterlambatan * p_tarif_denda_perhari;
    END IF;

    -- Hitung total harga peminjaman dari detail
    SELECT IFNULL(SUM(total_harga), 0) INTO v_total_harga 
    FROM detail_peminjaman 
    WHERE id_peminjaman = p_id_peminjaman;

    SET v_total_bayar = v_total_harga + v_denda;

    -- Masukkan ke tabel pengembalian
    INSERT INTO pengembalian (id_peminjaman, tgl_kembali_sebenarnya, denda, total_pembayaran)
    VALUES (p_id_peminjaman, p_tgl_kembali_sebenarnya, v_denda, v_total_bayar);

    -- Update status peminjaman menjadi Selesai
    UPDATE peminjaman 
    SET status = 'Selesai' 
    WHERE id_peminjaman = p_id_peminjaman;
END //

DELIMITER ;