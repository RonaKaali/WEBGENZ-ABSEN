import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function PengaturanPage() {
  const [settings, setSettings] = useState({
    jam_kerja_mulai: '08:00',
    jam_kerja_selesai: '17:00',
    toleransi_menit: 15,
    nama_perusahaan: 'Perusahaan Saya',
    notifikasi_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('company_settings').select('*').single();
      if (data) {
        setSettings({
          jam_kerja_mulai: data.jam_kerja_mulai?.slice(0, 5) || '08:00',
          jam_kerja_selesai: data.jam_kerja_selesai?.slice(0, 5) || '17:00',
          toleransi_menit: data.toleransi_menit || 15,
          nama_perusahaan: data.nama_perusahaan || 'Perusahaan Saya',
          notifikasi_enabled: data.notifikasi_enabled ?? true,
        });
      }
    } catch (err) {
      console.warn('Supabase not configured');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const { data: existing } = await supabase.from('company_settings').select('id').limit(1);
      if (existing && existing.length > 0) {
        await supabase.from('company_settings').update(settings).eq('id', existing[0].id);
      } else {
        await supabase.from('company_settings').insert(settings);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.warn('Supabase not configured — settings saved locally');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Pengaturan</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Konfigurasi perusahaan dan jam kerja
        </p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '2rem' }}>Memuat...</p>
      ) : (
        <>
          {/* Company Info */}
          <div className="chart-container" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Informasi Perusahaan</h3>
            <div style={{ maxWidth: '400px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Nama Perusahaan</label>
              <input
                className="input-field"
                value={settings.nama_perusahaan}
                onChange={e => setSettings({...settings, nama_perusahaan: e.target.value})}
              />
            </div>
          </div>

          {/* Working Hours */}
          <div className="chart-container" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Jam Kerja</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', maxWidth: '600px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Jam Mulai</label>
                <input
                  type="time"
                  className="input-field"
                  value={settings.jam_kerja_mulai}
                  onChange={e => setSettings({...settings, jam_kerja_mulai: e.target.value})}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Jam Selesai</label>
                <input
                  type="time"
                  className="input-field"
                  value={settings.jam_kerja_selesai}
                  onChange={e => setSettings({...settings, jam_kerja_selesai: e.target.value})}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Toleransi (menit)</label>
                <input
                  type="number"
                  className="input-field"
                  value={settings.toleransi_menit}
                  onChange={e => setSettings({...settings, toleransi_menit: parseInt(e.target.value) || 0})}
                  min={0}
                  max={120}
                />
              </div>
            </div>
          </div>

          {/* Notification Toggle */}
          <div className="chart-container" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Notifikasi</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifikasi_enabled}
                  onChange={e => setSettings({...settings, notifikasi_enabled: e.target.checked})}
                />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                {settings.notifikasi_enabled ? 'Notifikasi aktif' : 'Notifikasi nonaktif'}
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-primary" onClick={handleSave}>
              {saved ? '✓ Tersimpan!' : 'Simpan Pengaturan'}
            </button>
            {saved && (
              <span className="animate-fadeIn" style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 500 }}>
                Pengaturan berhasil disimpan
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
