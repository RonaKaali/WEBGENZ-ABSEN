# WEBGENZ ABSEN — Rebuild Total (Supabase + React Native + React Admin)

Bangun ulang sistem absensi dari nol dengan arsitektur berikut:
- **Backend & Database**: Supabase (Postgres, Auth, Realtime, Storage)
- **Mobile App (karyawan)**: React Native (Expo), dibuild via Android Studio untuk target Android
- **Admin Dashboard**: React + TypeScript + Tailwind CSS v4 (web)

Kedua aplikasi terhubung ke Supabase project yang sama, sehingga data absensi yang dicatat di mobile langsung muncul real-time di dashboard admin.

---

## 1. SUPABASE — Schema & Setup

### Tabel yang dibutuhkan

**`employees`**
- id (uuid, PK, references auth.users)
- nip (text, unique)
- nama (text)
- email (text)
- jabatan (text)
- departemen (text)
- atasan (text)
- tanggal_bergabung (date)
- avatar_initials (text)
- role (text: 'karyawan' | 'admin')
- created_at (timestamptz)

**`attendance`**
- id (uuid, PK)
- employee_id (uuid, FK → employees.id)
- tanggal (date)
- jam_masuk (timestamptz, nullable)
- jam_keluar (timestamptz, nullable)
- status (text: 'hadir' | 'terlambat' | 'absen' | 'izin')
- durasi_menit (int, computed saat jam_keluar diisi)
- created_at (timestamptz)

**`leave_requests`**
- id (uuid, PK)
- employee_id (uuid, FK)
- jenis (text: 'sakit' | 'cuti' | 'keperluan' | 'dinas')
- tanggal_mulai (date)
- tanggal_selesai (date)
- keterangan (text)
- status (text: 'menunggu' | 'disetujui' | 'ditolak')
- created_at (timestamptz)

**`company_settings`**
- id (uuid, PK)
- jam_kerja_mulai (time)
- jam_kerja_selesai (time)
- toleransi_menit (int)
- nama_perusahaan (text)
- notifikasi_enabled (boolean)

### Aturan (Row Level Security)
- Karyawan hanya bisa SELECT/INSERT/UPDATE data absensi & izin miliknya sendiri (`employee_id = auth.uid()`)
- Admin (role = 'admin') bisa SELECT semua data di semua tabel, dan UPDATE `leave_requests.status` serta `company_settings`
- Aktifkan RLS di semua tabel, tulis policy eksplisit untuk masing-masing

### Realtime
- Aktifkan Supabase Realtime pada tabel `attendance` dan `leave_requests` agar dashboard admin bisa menampilkan feed aktivitas live tanpa polling.

### Auth
- Gunakan Supabase Auth (email + password) untuk login karyawan dan admin
- Setelah signup, buat trigger Postgres yang otomatis insert row ke `employees` dengan data default

---

## 2. MOBILE APP — React Native (Expo, target Android via Android Studio)

Bangun ulang UI dan logic berikut, sekarang terhubung ke Supabase (bukan lagi dummy state):

### Setup
- Expo + React Native + TypeScript
- Supabase client (`@supabase/supabase-js`) dengan AsyncStorage untuk session persistence
- NativeWind (Tailwind untuk React Native) untuk styling, agar class Tailwind tetap bisa dipakai
- Font: Plus Jakarta Sans (UI text), Geist Mono (timestamp & angka) — load via `expo-font`
- Navigasi: bottom tab navigator (`@react-navigation/bottom-tabs`) dengan 4 tab: Beranda, Absensi, Izin, Profil
- Build & jalankan via Android Studio emulator/device menggunakan `npx expo run:android`

### Palet warna
- Background: slate-200 (luar), slate-100 (konten), putih (card), slate-900 (header)
- Aksen utama: teal-500/600
- Status: teal=hadir, amber=terlambat, red=absen, blue=izin

### Tab 1 — Beranda
- Header slate-900: sapaan waktu (Pagi/Siang/Sore/Malam otomatis berdasar jam), nama & jabatan dari tabel `employees` (fetch by `auth.uid()`), avatar inisial
- Jam digital live (update tiap detik pakai `setInterval` dalam `useEffect`), tanggal lengkap format Indonesia
- Card "Status Hari Ini": ambil row `attendance` untuk `tanggal = hari ini`, tampilkan jam masuk/keluar (Geist Mono, `--:--` jika kosong), badge Tepat Waktu/Terlambat berdasar `company_settings.jam_kerja_mulai + toleransi`
- Tombol CTA "Absen Masuk Sekarang" → INSERT row baru ke `attendance` dengan `jam_masuk = now()`, hitung status otomatis; setelah itu tombol berubah jadi "Absen Keluar" → UPDATE row dengan `jam_keluar = now()` dan `durasi_menit` terhitung; lalu jadi "Absensi Selesai" (disabled)
- Efek `scale-95` saat ditekan (`onPressIn`/`onPressOut`)
- Card "Ringkasan Bulan Ini": query aggregate COUNT dari `attendance` bulan berjalan per status, tampilkan grid 4 kolom + progress bar segmented
- Card "Terakhir Absen": 3 entri terakhir dari `attendance`, order by tanggal desc

### Tab 2 — Absensi
- Header slate-900, judul "Riwayat Absensi" + bulan berjalan
- Filter chip horizontal (Semua/Hadir/Terlambat/Absen/Izin), scroll horizontal tanpa scrollbar
- List history: fetch dari `attendance` milik user, urut tanggal desc, filter sesuai chip aktif
- Tiap card: ikon status berwarna, tanggal, jam masuk→keluar (Geist Mono), durasi, badge status

### Tab 3 — Izin
- Header slate-900, judul "Ajukan Izin"
- Form: jenis izin (grid 2×2 toggle: Sakit/Cuti/Keperluan/Dinas), tanggal dari-sampai (date picker native), textarea keterangan
- Submit → INSERT ke `leave_requests` dengan `status = 'menunggu'`
- Setelah submit sukses: tampilkan success state ("Pengajuan Terkirim!", "Menunggu persetujuan HR"), tombol "Ajukan Lagi" reset form

### Tab 4 — Profil
- Header: avatar besar, nama, jabatan, dot hijau "Aktif"
- Card "Informasi Karyawan": tarik langsung dari tabel `employees`
- Card "Performa Bulan Ini": hitung persentase tepat waktu & kehadiran dari data `attendance` bulan berjalan (query aggregate, bukan hardcode)
- Menu: Ubah Password (Supabase Auth updateUser), Pengaturan Notifikasi, Kebijakan Privasi, Keluar (Supabase `signOut()`)

### Struktur kode
- `src/lib/supabase.ts` — client init
- `src/screens/BerandaScreen.tsx`, `AbsensiScreen.tsx`, `IzinScreen.tsx`, `ProfilScreen.tsx`
- `src/hooks/` — custom hooks untuk fetch data (`useAttendance`, `useEmployee`, dll)
- Semua ikon sebagai inline SVG component, tanpa library ikon eksternal
- Tidak ada data dummy — semua tampil dari Supabase, termasuk state kosong yang wajar (misal user baru belum absen)

---

## 3. ADMIN DASHBOARD — React + TypeScript + Tailwind CSS v4

Bangun ulang dashboard, sekarang membaca data real dari Supabase (bukan mock):

### Setup
- Vite + React + TypeScript + Tailwind v4
- `@supabase/supabase-js` untuk fetch data + subscribe realtime channel
- Recharts untuk chart
- Login admin via Supabase Auth, redirect ke dashboard hanya jika `role = 'admin'`

### 5 halaman (sidebar navigasi)

**Dasbor**
- 4 stat card: Total Karyawan, Hadir Hari Ini, Terlambat, Tidak Hadir — semua dari query real-time
- Area chart tren 7 hari terakhir (jumlah hadir per hari)
- Pie chart sebaran departemen (COUNT dari `employees` group by departemen)
- Feed aktivitas live — subscribe ke Supabase Realtime channel pada `attendance`, tampilkan event masuk terbaru
- Bar chart tingkat kehadiran 6 bulan terakhir

**Absensi**
- Strip ringkasan tanggal terpilih + count per status
- Filter multi-kolom: cari nama, filter status, filter departemen (semua query ke Supabase, bukan filter client-side saja jika data besar)
- Tabel lengkap dengan durasi kerja terhitung, row hover menampilkan aksi (edit/hapus)

**Karyawan**
- Toggle Grid ↔ List
- Kartu karyawan dengan status kehadiran hari ini (badge) + hover reveal detail
- Tombol "Tambah Karyawan" → form INSERT ke `employees` + trigger Supabase Auth invite

**Laporan**
- Period switcher (3 bulan terakhir)
- 4 KPI card (rata-rata kehadiran, keterlambatan, dll — hasil aggregate query)
- Tabel rekap per departemen dengan progress bar kehadiran inline

**Pengaturan**
- Form jam kerja + toleransi → UPDATE `company_settings`
- Toggle notifikasi (CSS toggle murni, tanpa library)
- Form informasi perusahaan
- Tombol simpan dengan konfirmasi sukses (toast/inline message)

### Approval Izin
- Tambahkan halaman/section untuk approve/reject `leave_requests` yang statusnya 'menunggu' (admin action → UPDATE status jadi 'disetujui'/'ditolak')

---

## Catatan untuk coding agent
- Pakai environment variable untuk Supabase URL & anon key (`.env`), jangan hardcode
- Semua query pakai Supabase client, sertakan error handling & loading state di tiap fetch
- Tulis RLS policies sebagai bagian dari deliverable (SQL migration file), bukan hanya disable RLS untuk kemudahan development
- Sertakan seed data SQL untuk testing (beberapa employees dummy + attendance history seperti contoh data realistis sebelumnya)
- Struktur project: dua folder terpisah `mobile/` (Expo) dan `admin-web/` (Vite), dengan shared Supabase schema di `supabase/migrations/`
