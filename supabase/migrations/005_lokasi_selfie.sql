-- ============================================================
-- WEBGENZ ABSEN — Migration 005: Lokasi & Foto Selfie
-- ============================================================

-- 1. TAMBAH KOLOM BARU DI TABEL attendance
-- ============================================================
alter table attendance
  add column if not exists lokasi_masuk_lat float8,
  add column if not exists lokasi_masuk_lng float8,
  add column if not exists foto_masuk_url text,
  add column if not exists lokasi_keluar_lat float8,
  add column if not exists lokasi_keluar_lng float8,
  add column if not exists foto_keluar_url text;


-- 2. BUAT STORAGE BUCKET (private)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('absensi-foto', 'absensi-foto', false)
on conflict (id) do nothing;


-- 3. RLS POLICIES UNTUK STORAGE
-- ============================================================
-- Karyawan: upload hanya ke folder employee_id miliknya sendiri
create policy "Karyawan upload foto sendiri"
  on storage.objects for insert
  with check (
    bucket_id = 'absensi-foto'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Karyawan: bisa SELECT foto di folder miliknya sendiri
create policy "Karyawan lihat foto sendiri"
  on storage.objects for select
  using (
    bucket_id = 'absensi-foto'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin: bisa SELECT semua foto
create policy "Admin lihat semua foto"
  on storage.objects for select
  using (
    bucket_id = 'absensi-foto'
    and auth.role() = 'authenticated'
    and exists (select 1 from public.employees where id = auth.uid() and role = 'admin')
  );

-- Semua user authenticated bisa SELECT bucket absensi-foto
create policy "Authenticated users can view absensi-foto bucket"
  on storage.objects for select
  using (
    bucket_id = 'absensi-foto'
    and auth.role() = 'authenticated'
  );
