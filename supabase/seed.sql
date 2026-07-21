-- ============================================================
-- WEBGENZ ABSEN — Seed Data untuk Testing
-- ============================================================
-- Jalankan SETELAH auth users dibuat via Supabase Auth UI / API.
-- 
-- Langkah:
-- 1. Buat user via Supabase Auth → trigger handle_new_user() akan
--    auto-insert ke employees dengan role 'karyawan'
-- 2. UPDATE role jadi 'admin' untuk user admin
-- 3. Jalankan SQL di bawah untuk insert data dummy attendance
--
-- ============================================================

-- 1. INSERT SAMPLE ATTENDANCE (30 hari terakhir untuk setiap karyawan)
-- ============================================================

-- Generate attendance for all employees for last 30 days
INSERT INTO attendance (employee_id, tanggal, jam_masuk, jam_keluar, status, durasi_menit)
SELECT
  e.id,
  d.tanggal,
  -- Random jam masuk antara 07:30 - 09:00
  (d.tanggal::timestamptz + (INTERVAL '1 hour' * (7 + floor(random() * 2)::int)) + (INTERVAL '1 minute' * floor(random() * 60)::int) + CASE WHEN random() < 0.3 THEN INTERVAL '30 minutes' ELSE INTERVAL '0 minutes' END) as jam_masuk,
  -- Random jam keluar antara 16:30 - 18:00
  (d.tanggal::timestamptz + (INTERVAL '1 hour' * (16 + floor(random() * 2)::int)) + (INTERVAL '1 minute' * floor(random() * 60)::int)) as jam_keluar,
  CASE
    WHEN random() < 0.6 THEN 'hadir'       -- 60% hadir tepat waktu
    WHEN random() < 0.8 THEN 'terlambat'    -- 20% terlambat
    WHEN random() < 0.9 THEN 'izin'         -- 10% izin
    ELSE 'absen'                             -- 10% absen
  END as status,
  NULL  -- durasi dihitung otomatis dari jam_masuk - jam_keluar (bisa dibuat trigger)
FROM
  employees e
CROSS JOIN
  generate_series(
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '1 day',
    INTERVAL '1 day'
  ) as d(tanggal)
WHERE
  e.role = 'karyawan'  -- Only seed for regular employees
  -- Skip weekends
  AND EXTRACT(DOW FROM d.tanggal) NOT IN (0, 6)  -- 0=Sunday, 6=Saturday
  -- Skip some days for izin/absen variability
  AND NOT (
    -- 15% chance of skipping any given day (for izin/absen)
    random() < 0.15
    -- But only if the status would be 'hadir' or 'terlambat' - we already handle this above
  );

-- Update durasi_menit where both times exist
UPDATE attendance
SET durasi_menit = EXTRACT(EPOCH FROM (jam_keluar - jam_masuk)) / 60
WHERE jam_masuk IS NOT NULL AND jam_keluar IS NOT NULL;


-- 2. INSERT SAMPLE LEAVE REQUESTS
-- ============================================================
INSERT INTO leave_requests (employee_id, jenis, tanggal_mulai, tanggal_selesai, keterangan, status)
SELECT
  e.id,
  unnest(ARRAY['sakit', 'cuti', 'keperluan', 'dinas']) as jenis,
  CURRENT_DATE - INTERVAL '5 days' as tanggal_mulai,
  CURRENT_DATE - INTERVAL '3 days' as tanggal_selesai,
  unnest(ARRAY[
    'Demam dan tidak enak badan',
    'Cuti tahunan bersama keluarga',
    'Urusan keluarga mendadak',
    'Dinas luar kota meeting client'
  ]) as keterangan,
  unnest(ARRAY['disetujui', 'disetujui', 'menunggu', 'ditolak']) as status
FROM employees e
WHERE e.role = 'karyawan'
LIMIT 1;


-- 3. SET ADMIN ROLE (jalankan setelah admin user dibuat)
-- ============================================================
-- Contoh: UPDATE employees SET role = 'admin' WHERE email = 'admin@webgenz.com';


-- 4. VERIFIKASI DATA
-- ============================================================
-- SELECT e.nama, COUNT(a.id) as total_absen
-- FROM employees e
-- LEFT JOIN attendance a ON a.employee_id = e.id
-- GROUP BY e.nama
-- ORDER BY e.nama;
