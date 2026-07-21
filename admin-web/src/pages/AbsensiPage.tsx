import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const statusFilters = ['Semua', 'hadir', 'terlambat', 'absen', 'izin'];
const statusLabels: Record<string, string> = { hadir: 'Hadir', terlambat: 'Terlambat', absen: 'Absen', izin: 'Izin' };

export default function AbsensiPage() {
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { fetchData(); }, [filter, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('attendance')
        .select('*, employees(nama, nip, departemen)')
        .eq('tanggal', selectedDate)
        .order('jam_masuk', { ascending: false });

      if (filter !== 'Semua') query = query.eq('status', filter);

      const { data: result } = await query;
      setData(result || []);
    } catch (err) {
      console.warn('Supabase not configured');
    }
    setLoading(false);
  };

  const countByStatus = (status: string) => data.filter(d => d.status === status).length;

  const filtered = search
    ? data.filter(d => (d.employees?.nama || '').toLowerCase().includes(search.toLowerCase()))
    : data;

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data absensi ini?')) return;
    await supabase.from('attendance').delete().eq('id', id);
    fetchData();
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Absensi</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Riwayat absensi karyawan
        </p>
      </div>

      {/* Ringkasan Tanggal */}
      <div className="stat-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Tanggal:</p>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="input-field"
              style={{ width: 'auto' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['hadir', 'terlambat', 'absen', 'izin'].map(s => (
              <div key={s} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{statusLabels[s]}</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: s === 'hadir' ? '#10b981' : s === 'terlambat' ? '#f59e0b' : s === 'absen' ? '#ef4444' : '#3b82f6' }}>
                  {countByStatus(s)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {statusFilters.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              background: filter === s ? '#0d9488' : '#f1f5f9',
              color: filter === s ? 'white' : 'var(--color-text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            {s === 'Semua' ? 'Semua' : statusLabels[s]}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <input
          type="text"
          placeholder="Cari nama..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field"
          style={{ maxWidth: '250px' }}
        />
      </div>

      {/* Table */}
      <div className="chart-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Karyawan</th>
              <th>NIP</th>
              <th>Departemen</th>
              <th>Jam Masuk</th>
              <th>Jam Keluar</th>
              <th>Durasi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>Memuat...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>Belum ada data absensi</td></tr>
            ) : (
              filtered.map((d, i) => (
                <tr key={d.id} className="animate-fadeIn" style={{ animationDelay: `${i * 0.03}s` }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.65rem', fontWeight: 600, flexShrink: 0,
                      }}>
                        {d.employees?.nama?.[0] || '?'}
                      </div>
                      <span style={{ fontWeight: 500 }}>{d.employees?.nama || '-'}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{d.employees?.nip || '-'}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{d.employees?.departemen || '-'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {d.jam_masuk ? new Date(d.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {d.jam_keluar ? new Date(d.jam_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {d.durasi_menit ? `${Math.floor(d.durasi_menit / 60)}j ${d.durasi_menit % 60}m` : '-'}
                  </td>
                  <td>
                    <span className={`badge-${d.status}`} style={{
                      padding: '0.25rem 0.625rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600,
                    }}>
                      {statusLabels[d.status] || d.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(d.id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: 'none',
                        border: '1px solid #fee2e2',
                        borderRadius: '0.375rem',
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
