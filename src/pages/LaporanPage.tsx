import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const statusLabels: Record<string, string> = { hadir: 'Hadir', terlambat: 'Terlambat', absen: 'Absen', izin: 'Izin' };

function exportCSV(data: any[], label: string) {
  const headers = ['Karyawan', 'NIP', 'Departemen', 'Tanggal', 'Jam Masuk', 'Jam Keluar', 'Durasi', 'Status', 'Lokasi Masuk', 'Lokasi Keluar'];
  const rows = data.map(d => [
    d.employees?.nama || '-',
    d.employees?.nip || '-',
    d.employees?.departemen || '-',
    d.tanggal || '-',
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
  a.download = `laporan-${label}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LaporanPage() {
  const [period, setPeriod] = useState(3);
  const [kpis, setKpis] = useState<any[]>([]);
  const [deptData, setDeptData] = useState<any[]>([]);
  const [attendanceRows, setAttendanceRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - period);
      const startDate = monthsAgo.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      const { data: attendance } = await supabase
        .from('attendance')
        .select('*, employees(nama, nip, departemen)')
        .gte('tanggal', startDate)
        .lte('tanggal', today)
        .order('tanggal', { ascending: false });

      const { data: employees } = await supabase
        .from('employees')
        .select('*');

      const rows = attendance || [];
      setAttendanceRows(rows);

      const totalHari = rows.length;
      const hadir = rows.filter(d => d.status === 'hadir' || d.status === 'terlambat').length;
      const tepatWaktu = rows.filter(d => d.status === 'hadir').length;
      const terlambat = rows.filter(d => d.status === 'terlambat').length;
      const kehadiranPct = totalHari > 0 ? Math.round((hadir / totalHari) * 100) : 0;
      const ketepatanPct = hadir > 0 ? Math.round((tepatWaktu / hadir) * 100) : 0;

      setKpis([
        { label: 'Rata-rata Kehadiran', value: `${kehadiranPct}%`, subtitle: `Dari ${totalHari} total hari` },
        { label: 'Ketepatan Waktu', value: `${ketepatanPct}%`, subtitle: `Dari ${hadir} kehadiran` },
        { label: 'Total Keterlambatan', value: terlambat, subtitle: `${period} bulan terakhir` },
        { label: 'Jumlah Karyawan', value: employees?.length || 0, subtitle: 'Terdaftar aktif' },
      ]);

      // Per departemen
      const deptMap: Record<string, { total: number; hadir: number }> = {};
      rows.forEach(d => {
        const dept = (d as any).employees?.departemen || 'Unknown';
        if (!deptMap[dept]) deptMap[dept] = { total: 0, hadir: 0 };
        deptMap[dept].total++;
        if (d.status === 'hadir' || d.status === 'terlambat') deptMap[dept].hadir++;
      });

      setDeptData(
        Object.entries(deptMap).map(([departemen, val]) => ({
          departemen,
          total: val.total,
          hadir: val.hadir,
          persentase: val.total > 0 ? Math.round((val.hadir / val.total) * 100) : 0,
        }))
      );
    } catch (err) {
      console.warn('Supabase not configured');
    }
    setLoading(false);
  };

  const periodLabel = `${period}${period === 1 ? 'bulan' : 'bulan'}`;

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Laporan</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Analisis kehadiran karyawan
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[1, 3, 6].map(m => (
            <button
              key={m}
              onClick={() => setPeriod(m)}
              className={period === m ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            >
              {m} Bulan
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '2rem' }}>Memuat...</p>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {kpis.map((kpi: any, i: number) => (
              <div key={i} className="stat-card animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>{kpi.label}</p>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: '#0d9488' }}>{kpi.value}</p>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.75rem', marginTop: '0.5rem' }}>{kpi.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Department Recap */}
          <div className="chart-container" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Rekap per Departemen</h3>
            {deptData.length === 0 ? (
              <p style={{ color: 'var(--color-text-light)', textAlign: 'center', padding: '1rem' }}>Belum ada data</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Departemen</th>
                    <th>Total Kehadiran</th>
                    <th>Hadir</th>
                    <th>Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {deptData.map((d: any, i: number) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{d.departemen}</td>
                      <td>{d.total}</td>
                      <td>{d.hadir}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            flex: 1, height: 8, borderRadius: 4,
                            background: '#f1f5f9', overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${d.persentase}%`, height: '100%',
                              background: d.persentase >= 80 ? '#10b981' : d.persentase >= 60 ? '#f59e0b' : '#ef4444',
                              borderRadius: 4,
                              transition: 'width 1s ease',
                            }} />
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, width: '3rem', textAlign: 'right' }}>
                            {d.persentase}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Full Attendance Data Table + Export */}
          <div className="chart-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Data Absensi ({period} Bulan)</h3>
              <button
                onClick={() => exportCSV(attendanceRows, periodLabel)}
                disabled={attendanceRows.length === 0}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: attendanceRows.length === 0 ? 'not-allowed' : 'pointer',
                  background: '#0d9488',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s',
                  opacity: attendanceRows.length === 0 ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (attendanceRows.length > 0) e.currentTarget.style.background = '#0f766e'; }}
                onMouseLeave={e => e.currentTarget.style.background = '#0d9488'}
              >
                ⬇ Export CSV ({period} Bulan)
              </button>
            </div>

            {attendanceRows.length === 0 ? (
              <p style={{ color: 'var(--color-text-light)', textAlign: 'center', padding: '2rem' }}>Belum ada data absensi</p>
            ) : (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '0.75rem' }}>
                  Menampilkan {attendanceRows.length} data dari {new Date(new Date().setMonth(new Date().getMonth() - period)).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} hingga sekarang
                </p>
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Karyawan</th>
                        <th>NIP</th>
                        <th>Departemen</th>
                        <th>Tanggal</th>
                        <th>Masuk</th>
                        <th>Keluar</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRows.map((d, i) => (
                        <tr key={d.id} className="animate-fadeIn" style={{ animationDelay: `${i * 0.02}s` }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '0.65rem', fontWeight: 600, flexShrink: 0,
                              }}>
                                {d.employees?.nama?.[0] || '?'}
                              </div>
                              <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{d.employees?.nama || '-'}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{d.employees?.nip || '-'}</td>
                          <td style={{ fontSize: '0.8rem' }}>{d.employees?.departemen || '-'}</td>
                          <td style={{ fontSize: '0.8rem' }}>{d.tanggal || '-'}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {d.jam_masuk ? new Date(d.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {d.jam_keluar ? new Date(d.jam_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </td>
                          <td>
                            <span className={`badge-${d.status}`} style={{
                              padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 600,
                            }}>
                              {statusLabels[d.status] || d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
