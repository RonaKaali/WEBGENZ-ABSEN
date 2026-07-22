import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const jenisLabels: Record<string, string> = { sakit: 'Sakit', cuti: 'Cuti', keperluan: 'Keperluan', dinas: 'Dinas' };

export default function IzinPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: result } = await supabase
        .from('leave_requests')
        .select('*, employees(nama, nip, departemen)')
        .order('created_at', { ascending: false });
      setData(result || []);
    } catch (err) {
      console.warn('Supabase not configured');
    }
    setLoading(false);
  };

  const handleAction = async (id: string, status: 'disetujui' | 'ditolak') => {
    await supabase.from('leave_requests').update({ status }).eq('id', id);
    fetchData();
  };

  const pending = data.filter(d => d.status === 'menunggu');
  const history = data.filter(d => d.status !== 'menunggu');

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Persetujuan Izin</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {pending.length} pengajuan menunggu persetujuan
        </p>
      </div>

      {/* Pending Requests */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Menunggu Persetujuan</h3>
        {loading ? (
          <p style={{ color: 'var(--color-text-light)', padding: '2rem', textAlign: 'center' }}>Memuat...</p>
        ) : pending.length === 0 ? (
          <div className="chart-container" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--color-text-light)' }}>Tidak ada pengajuan yang menunggu</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pending.map((item, i) => (
              <div key={item.id} className="stat-card animate-fadeIn" style={{ display: 'flex', alignItems: 'center', gap: '1rem', animationDelay: `${i * 0.05}s` }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', flexShrink: 0,
                }}>
                  📋
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.employees?.nama || '-'}</p>
                    <span className="badge-menunggu" style={{ padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 600 }}>
                      {jenisLabels[item.jenis] || item.jenis}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    {item.tanggal_mulai} — {item.tanggal_selesai}
                    {item.keterangan && ` • ${item.keterangan}`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    onClick={() => handleAction(item.id, 'disetujui')}
                    className="btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    ✓ Setujui
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'ditolak')}
                    className="btn-danger"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    ✕ Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Riwayat</h3>
        <div className="chart-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Jenis</th>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>Belum ada riwayat</td></tr>
              ) : (
                history.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.65rem', fontWeight: 600, flexShrink: 0,
                        }}>
                          {item.employees?.nama?.[0] || '?'}
                        </div>
                        <span style={{ fontWeight: 500 }}>{item.employees?.nama || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600,
                        background: '#f1f5f9', color: '#475569',
                      }}>
                        {jenisLabels[item.jenis] || item.jenis}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{item.tanggal_mulai} — {item.tanggal_selesai}</td>
                    <td style={{ color: 'var(--color-text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.keterangan || '-'}
                    </td>
                    <td>
                      <span className={`badge-${item.status}`} style={{
                        padding: '0.25rem 0.625rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600,
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
