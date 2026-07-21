-- ============================================================
-- WEBGENZ ABSEN — RESET DATA (mulai dari 0)
-- ============================================================
-- Jalankan SQL ini jika ingin menghapus semua data
-- tanpa menghapus struktur tabel.
-- ============================================================

-- 1. HAPUS SEMUA DATA
TRUNCATE TABLE leave_requests CASCADE;
TRUNCATE TABLE attendance CASCADE;
TRUNCATE TABLE employees CASCADE;

-- 2. HAPUS USER DARI AUTH (tapi tidak otomatis)
--     Untuk hapus user, buka Supabase Dashboard → Auth → Users
--     Lalu delete manual satu-satu.
--     Atau jalankan query di bawah (tapi butuh hak akses service_role):

-- DELETE FROM auth.users WHERE email IS NOT NULL;

-- 3. COMPANY SETTINGS — reset ke default
TRUNCATE TABLE company_settings CASCADE;
INSERT INTO company_settings (nama_perusahaan, jam_kerja_mulai, jam_kerja_selesai, toleransi_menit)
VALUES ('Webgenz Indonesia', '08:00', '17:00', 30);
