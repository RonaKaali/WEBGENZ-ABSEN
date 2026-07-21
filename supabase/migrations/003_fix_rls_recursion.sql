-- ============================================================
-- WEBGENZ ABSEN — Fix RLS Infinite Recursion
-- ============================================================
-- Masalah: Policy admin query tabel employees di dalam
-- subquery SELECT, yang memicu RLS lagi (loop tak terbatas).
-- 
-- Solusi: Buat helper function SECURITY DEFINER yang bypass RLS.
-- Jalankan SQL ini di Supabase SQL Editor untuk fix.
-- ============================================================

-- 1. BUAT HELPER FUNCTION (bypass RLS via SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.employees WHERE id = auth.uid() AND role = 'admin');
$$;

-- 2. HAPUS POLICY LAMA YANG BIKIN RECURSION
-- ============================================================
DROP POLICY IF EXISTS "Admin bisa lihat semua karyawan" ON employees;
DROP POLICY IF EXISTS "Admin bisa insert karyawan" ON employees;
DROP POLICY IF EXISTS "Admin bisa update semua karyawan" ON employees;
DROP POLICY IF EXISTS "Admin bisa lihat semua absensi" ON attendance;
DROP POLICY IF EXISTS "Admin bisa update absensi" ON attendance;
DROP POLICY IF EXISTS "Admin bisa hapus absensi" ON attendance;
DROP POLICY IF EXISTS "Admin bisa lihat semua izin" ON leave_requests;
DROP POLICY IF EXISTS "Admin bisa update status izin" ON leave_requests;
DROP POLICY IF EXISTS "Admin bisa manage company settings" ON company_settings;

-- 3. BUAT ULANG PAKAI is_admin()
-- ============================================================

-- Employees
CREATE POLICY "Admin bisa lihat semua karyawan"
  ON employees FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin bisa insert karyawan"
  ON employees FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin bisa update semua karyawan"
  ON employees FOR UPDATE
  USING (public.is_admin());

-- Attendance
CREATE POLICY "Admin bisa lihat semua absensi"
  ON attendance FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin bisa update absensi"
  ON attendance FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin bisa hapus absensi"
  ON attendance FOR DELETE
  USING (public.is_admin());

-- Leave requests
CREATE POLICY "Admin bisa lihat semua izin"
  ON leave_requests FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin bisa update status izin"
  ON leave_requests FOR UPDATE
  USING (public.is_admin());

-- Company settings
CREATE POLICY "Admin bisa manage company settings"
  ON company_settings FOR ALL
  USING (public.is_admin());
