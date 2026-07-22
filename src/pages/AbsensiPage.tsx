import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const statusFilters = ['Semua', 'hadir', 'terlambat', 'absen', 'izin'];
const statusLabels: Record<string, string> = { hadir: 'Hadir', terlambat: 'Terlambat', absen: 'Absen', izin: 'Izin' };

function exportCSV(data: any[]) {
  const headers = ['Karyawan', 'NIP', 'Departemen', 'Jam Masuk', 'Jam Keluar', 'Durasi', 'Status', 'Lokasi Masuk', 'Lokasi Keluar'];
  const rows = data.map(d => [
    d.employees?.nama || '-',
    d.employees?.nip || '-',
    d.employees?.departemen || '-',
    d.jam_masuk ? new Date(d.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--',
    d.jam_keluar ? new Date(d.jam_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--',
    d.durasi_menit ? `${Math.floor(d.durasi_menit / 60)}j ${d.durasi_menit % 60}m` : '-',
    statusLabels[d.status] || d.status,
    d.lokasi_masuk_lat ? `${d.lokasi_masuk_lat}, ${d.lokasi_masuk_lng}` : '-',
    d.lokasi_keluar_lat ? `${d.lokasi_keluar_lat}, ${d.lokasi_keluar_lng}` : '-',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `absensi-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AbsensiPage() {
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

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

  const openDetail = async (item: any) => {
    setDetailItem(item);
    setSignedUrls({});

    // Fetch signed URLs untuk foto
    const urls: Record<string, string> = {};
    if (item.foto_masuk_url) {
      try {
        const { data } = await supabase.storage
          .from('absensi-foto')
          .createSignedUrl(item.foto_masuk_url, 3600);
        if (data) urls.masuk = data.signedUrl;
      } catch {}
    }
    if (item.foto_keluar_url) {
      try {
        const { data } = await supabase.storage
          .from('absensi-foto')
          .createSignedUrl(item.foto_keluar_url, 3600);
        if (data) urls.keluar = data.signedUrl;
      } catch {}
    }
    setSignedUrls(urls);
  };

  const closeDetail = () => {
    setDetailItem(null);
    setSignedUrls({});
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
        <button
          onClick={() => exportCSV(filtered)}
          disabled={filtered.length === 0}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.75rem',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
            background: '#0d9488',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            transition: 'all 0.2s',
            opacity: filtered.length === 0 ? 0.5 : 1,
          }}
          onMouseEnter={e => { if (filtered.length > 0) e.currentTarget.style.background = '#0f766e'; }}
          onMouseLeave={e => e.currentTarget.style.background = '#0d9488'}
        >
          ⬇ Export CSV
        </button>
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openDetail(d)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: 'none',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.375rem',
                          color: 'var(--color-text-secondary)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Lihat Detail
                      </button>
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
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail */}
      {detailItem && (
        <div
          onClick={closeDetail}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '1rem', maxWidth: 480, width: '100%',
              padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Detail Absensi</h3>
              <button
                onClick={closeDetail}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8', padding: '0 4px' }}
              >
                ✕
              </button>
            </div>

            {/* Info karyawan */}
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{detailItem.employees?.nama || '-'}</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{detailItem.employees?.departemen} • {detailItem.tanggal}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Foto Masuk */}
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Foto Selfie Masuk</p>
                {signedUrls.masuk ? (
                  <img
                    src={signedUrls.masuk}
                    alt="Foto Masuk"
                    style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: '0.75rem', background: '#f1f5f9' }}
                  />
                ) : (
                  <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '0.75rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {detailItem.foto_masuk_url ? 'Memuat...' : 'Tidak ada foto'}
                  </div>
                )}
              </div>

              {/* Lokasi Masuk */}
              {detailItem.lokasi_masuk_lat && (
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text-secondary)' }}>Lokasi Masuk</p>
                  <p style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#334155' }}>
                    {detailItem.lokasi_masuk_lat}, {detailItem.lokasi_masuk_lng}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${detailItem.lokasi_masuk_lat},${detailItem.lokasi_masuk_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8rem', color: '#0d9488', textDecoration: 'underline' }}
                  >
                    Buka di Google Maps →
                  </a>
                </div>
              )}

              {/* Foto Keluar */}
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Foto Selfie Keluar</p>
                {signedUrls.keluar ? (
                  <img
                    src={signedUrls.keluar}
                    alt="Foto Keluar"
                    style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: '0.75rem', background: '#f1f5f9' }}
                  />
                ) : (
                  <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '0.75rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {detailItem.foto_keluar_url ? 'Memuat...' : 'Tidak ada foto'}
                  </div>
                )}
              </div>

              {/* Lokasi Keluar */}
              {detailItem.lokasi_keluar_lat && (
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text-secondary)' }}>Lokasi Keluar</p>
                  <p style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#334155' }}>
                    {detailItem.lokasi_keluar_lat}, {detailItem.lokasi_keluar_lng}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${detailItem.lokasi_keluar_lat},${detailItem.lokasi_keluar_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8rem', color: '#0d9488', textDecoration: 'underline' }}
                  >
                    Buka di Google Maps →
                  </a>
                </div>
              )}
            </div>

            {/* Jam */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>Jam Masuk</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                  {detailItem.jam_masuk ? new Date(detailItem.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>Jam Keluar</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                  {detailItem.jam_keluar ? new Date(detailItem.jam_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>Status</p>
                <span className={`badge-${detailItem.status}`} style={{ padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  {statusLabels[detailItem.status] || detailItem.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
