-- ============================================================
-- WEBGENZ ABSEN — Seed Data untuk Testing
-- ============================================================

-- NOTE: Untuk seed employees, kita butuh auth.users dulu.
-- Untuk development, insert langsung ke employees dengan ID dummy
-- setelah bikin user via Supabase Auth.
--
-- Cara pakai:
-- 1. Setup Supabase Auth → buat user via Dashboard atau API
-- 2. Trigger handle_new_employee() akan auto-insert ke employees
-- 3. Atau INSERT manual setelah user terdaftar
--
-- Contoh data users yang perlu dibuat (via Supabase Auth UI):
-- Email: admin@webgenz.com, Password: admin123 → role: admin
-- Email: karyawan1@webgenz.com, Password: karyawan123 → role: karyawan
-- Email: karyawan2@webgenz.com, Password: karyawan123 → role: karyawan
-- Email: karyawan3@webgenz.com, Password: karyawan123 → role: karyawan
-- Email: karyawan4@webgenz.com, Password: karyawan123 → role: karyawan
-- Email: karyawan5@webgenz.com, Password: karyawan123 → role: karyawan

-- ============================================================
-- SAMPLE DATA: Attendance History (3 bulan terakhir)
-- ============================================================
-- Data ini bisa diinsert setelah employees terisi
-- Contoh untuk employee_id = 'uuid-dari-admin'

-- Sample attendance untuk admin (teladan — selalu tepat waktu)
-- INSERT INTO attendance (employee_id, tanggal, jam_masuk, jam_keluar, status, durasi_menit)
-- VALUES
--   ('admin-uuid', CURRENT_DATE - INTERVAL '1 day',  '2026-01-01 07:55:00+08', '2026-01-01 17:05:00+08', 'hadir', 490),
--   ('admin-uuid', CURRENT_DATE - INTERVAL '2 days', '2026-01-01 07:50:00+08', '2026-01-01 17:10:00+08', 'hadir', 500);

-- ============================================================
-- Untuk seed lengkap, jalankan setelah employees terisi:
-- 1. Ambil UUID dari tabel employees
-- 2. Insert attendance & leave_requests sesuai UUID tersebut
-- ============================================================

-- Contoh query untuk cek data setelah setup:
-- SELECT e.nama, e.nip, e.jabatan, e.departemen, e.role
-- FROM employees e ORDER BY e.nama;
