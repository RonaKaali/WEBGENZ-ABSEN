# WEBGENZ ABSEN

Sistem absensi terintegrasi dengan **Supabase** (backend), **React Native / Expo** (mobile untuk karyawan), dan **React + Vite + Tailwind v4** (admin dashboard).

---

## 📁 Struktur Proyek

```
WEBGENZ ABSEN/
├── supabase/
│   ├── migrations/
│   │   ├── 001_schema.sql      # Tabel, RLS, Trigger
│   │   └── 002_seed.sql        # Data dummy
│   └── .env.example
├── mobile/                      # Expo React Native App
│   ├── src/
│   │   ├── lib/supabase.ts
│   │   ├── screens/ (Beranda, Absensi, Izin, Profil)
│   │   ├── hooks/useAttendance.ts
│   │   └── navigation/AppNavigator.tsx
│   └── App.tsx
├── admin-web/                   # Vite + React + Tailwind v4
│   ├── src/
│   │   ├── lib/supabase.ts
│   │   ├── pages/ (Dasbor, Absensi, Izin, Karyawan, Laporan, Pengaturan)
│   │   └── components/ (Layout, AuthProvider)
│   └── App.tsx
└── README.md
```

---

## 🚀 Cara Setup

### 1. Setup Supabase

1. Buat project di [supabase.com](https://supabase.com)
2. Buka **SQL Editor**, jalankan `supabase/migrations/001_schema.sql`
3. (Opsional) Jalankan `supabase/migrations/002_seed.sql` untuk data dummy
4. Copy `.env.example` ke `.env` di kedua app (`mobile/` dan `admin-web/`)
5. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari project settings Supabase

### 2. Jalankan Admin Dashboard

```bash
cd admin-web
npm install
npm run dev
```

Buka `http://localhost:5173` — login dengan akun admin yang dibuat di Supabase Auth.

### 3. Jalankan Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan QR code dengan Expo Go, atau jalankan di emulator Android.

---

## 🧑‍💻 Akun Demo (Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@webgenz.com | admin123 |
| Karyawan | karyawan1@webgenz.com | karyawan123 |

---

## 🛠️ Tech Stack

| Bagian | Teknologi |
|--------|-----------|
| Backend & DB | Supabase (Postgres, Auth, Realtime) |
| Mobile App | React Native (Expo), TypeScript |
| Admin Dashboard | Vite, React, TypeScript, Tailwind CSS v4 |
| Charts (Admin) | Recharts |
| Icons | Inline (tanpa library eksternal) |
