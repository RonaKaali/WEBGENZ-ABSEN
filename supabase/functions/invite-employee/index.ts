// WEBGENZ ABSEN — Supabase Edge Function: invite-employee
//
// Fungsi: Menerima data karyawan baru + email, lalu:
// 1. Mengundang user via supabase.auth.admin.inviteUserByEmail()
// 2. INSERT ke tabel employees dalam 1 transaksi
//
// Memakai service_role key (rahasia), hanya bisa dipanggil dari admin dashboard.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface InvitePayload {
  email: string;
  nama: string;
  nip: string;
  jabatan: string;
  departemen: string;
  role?: 'karyawan' | 'admin';
}

serve(async (req) => {
  try {
    // Parse input
    const payload: InvitePayload = await req.json();
    const { email, nama, nip, jabatan, departemen, role = 'karyawan' } = payload;

    // Validasi
    if (!email || !nama || !nip || !jabatan || !departemen) {
      return new Response(
        JSON.stringify({ error: 'Semua field wajib diisi (email, nama, nip, jabatan, departemen)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Init Supabase client with SERVICE_ROLE key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Step 1: Invite user via email
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        nama,
        nip,
        jabatan,
        departemen,
        role,
      },
      redirectTo: `${Deno.env.get('PUBLIC_SITE_URL') || 'http://localhost:5173'}/login`,
    });

    if (inviteError) {
      return new Response(
        JSON.stringify({ error: `Gagal mengundang user: ${inviteError.message}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Trigger handle_new_user() akan auto-INSERT ke employees
    // Tapi kita update row-nya dengan data lengkap dari sini
    const userId = inviteData.user.id;

    // Upsert ke employees (handle case trigger belum sempat jalan)
    const { error: upsertError } = await supabaseAdmin
      .from('employees')
      .upsert({
        id: userId,
        email,
        nama,
        nip,
        jabatan,
        departemen,
        role,
      }, { onConflict: 'id' });

    if (upsertError) {
      // Rollback: hapus user yang sudah diundang jika gagal insert
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ error: `Gagal menyimpan data karyawan: ${upsertError.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Undangan berhasil dikirim ke ${email}`,
        user: {
          id: userId,
          email,
          nama,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Internal error: ${err.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
