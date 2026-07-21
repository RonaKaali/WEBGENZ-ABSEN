-- ============================================================
-- WEBGENZ ABSEN — Supabase Schema Migration v2
-- ============================================================

-- 1. TABLES
-- ============================================================

CREATE TABLE employees (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nip text UNIQUE NOT NULL,
  nama text NOT NULL,
  email text NOT NULL,
  jabatan text NOT NULL,
  departemen text NOT NULL,
  atasan text DEFAULT '',
  tanggal_bergabung date DEFAULT CURRENT_DATE,
  avatar_initials text GENERATED ALWAYS AS (
    UPPER(LEFT(nama, 1) || COALESCE(SPLIT_PART(nama, ' ', 2), ''))
  ) STORED,
  role text NOT NULL DEFAULT 'karyawan' CHECK (role IN ('karyawan', 'admin')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  jam_masuk timestamptz,
  jam_keluar timestamptz,
  status text NOT NULL DEFAULT 'absen' CHECK (status IN ('hadir', 'terlambat', 'absen', 'izin')),
  durasi_menit int,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, tanggal)
);

CREATE TABLE leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  jenis text NOT NULL CHECK (jenis IN ('sakit', 'cuti', 'keperluan', 'dinas')),
  tanggal_mulai date NOT NULL,
  tanggal_selesai date NOT NULL,
  keterangan text DEFAULT '',
  status text NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'disetujui', 'ditolak')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jam_kerja_mulai time NOT NULL DEFAULT '08:00',
  jam_kerja_selesai time NOT NULL DEFAULT '17:00',
  toleransi_menit int NOT NULL DEFAULT 15,
  nama_perusahaan text NOT NULL DEFAULT 'Perusahaan Saya',
  notifikasi_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);


-- 2. ROW LEVEL SECURITY POLICIES
-- ============================================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Employees
CREATE POLICY "Karyawan bisa lihat dirinya sendiri"
  ON employees FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Karyawan bisa update dirinya sendiri"
  ON employees FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin bisa lihat semua karyawan"
  ON employees FOR SELECT
  USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin bisa insert karyawan"
  ON employees FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin bisa update semua karyawan"
  ON employees FOR UPDATE
  USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));

-- Attendance
CREATE POLICY "Karyawan bisa lihat absensi sendiri"
  ON attendance FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Karyawan bisa insert absensi sendiri"
  ON attendance FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Karyawan bisa update absensi sendiri"
  ON attendance FOR UPDATE USING (employee_id = auth.uid());

CREATE POLICY "Admin bisa lihat semua absensi"
  ON attendance FOR SELECT
  USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin bisa update absensi"
  ON attendance FOR UPDATE
  USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin bisa hapus absensi"
  ON attendance FOR DELETE
  USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));

-- Leave requests
CREATE POLICY "Karyawan bisa lihat izin sendiri"
  ON leave_requests FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Karyawan bisa insert izin sendiri"
  ON leave_requests FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Admin bisa lihat semua izin"
  ON leave_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin bisa update status izin"
  ON leave_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));

-- Company settings
CREATE POLICY "Admin bisa manage company settings"
  ON company_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Semua user bisa lihat company settings"
  ON company_settings FOR SELECT USING (true);


-- 3. TRIGGER EKSPLISIT: handle_new_user()
-- ============================================================
-- Setelah signup di auth.users, auto-INSERT ke employees.
-- Role default = 'karyawan'. Admin dibuat manual via dashboard.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.employees (id, nip, nama, email, jabatan, departemen, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nip', 'EMP-' || SUBSTRING(gen_random_uuid()::text, 1, 6)),
    COALESCE(NEW.raw_user_meta_data ->> 'nama', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'jabatan', 'Karyawan'),
    COALESCE(NEW.raw_user_meta_data ->> 'departemen', 'Umum'),
    'karyawan'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- 4. SEED: Default company_settings (idempotent)
-- ============================================================
INSERT INTO company_settings (jam_kerja_mulai, jam_kerja_selesai, toleransi_menit, nama_perusahaan)
SELECT '08:00', '17:00', 30, 'WEBGENZ'
WHERE NOT EXISTS (SELECT 1 FROM company_settings);


-- 5. REALTIME (publikasi tabel, filter di client)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE leave_requests;
