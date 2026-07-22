-- ============================================================
-- WEBGENZ ABSEN — RESET DATA (user tetap ada, data nol)
-- ============================================================
-- Hanya hapus data absensi & izin, employees & user tetap ada
-- ============================================================

TRUNCATE TABLE leave_requests CASCADE;
TRUNCATE TABLE attendance CASCADE;

-- Reset kehadiran di employees (semua jadi 0)
UPDATE employees SET created_at = created_at; -- no-op, just placeholder

-- Company settings — reset ke default
TRUNCATE TABLE company_settings CASCADE;
INSERT INTO company_settings (nama_perusahaan, jam_kerja_mulai, jam_kerja_selesai, toleransi_menit)
VALUES ('Webgenz Indonesia', '08:00', '17:00', 30);
