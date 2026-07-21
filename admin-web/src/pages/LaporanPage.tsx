import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LaporanPage() {
  const [period, setPeriod] = useState(3);
  const [data, setData] = useState<any[]>([]);
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
        .select('*, employees(departemen)')
        .gte('tanggal', startDate)
        .lte('tanggal', today);

      const { data: employees } = await supabase
        .from('employees')
        .select('*');

      const totalHari = attendance?.length || 0;
      const hadir = attendance?.filter(d => d.status === 'hadir' || d.status === 'terlambat').length || 0;
      const tepatWaktu = attendance?.filter(d => d.status === 'hadir').length || 0;
      const terlambat = attendance?.filter(d => d.status === 'terlambat').length || 0;
      const kehadiranPct = totalHari > 0 ? Math.round((hadir / totalHari) * 100) : 0;
      const ketepatanPct = hadir > 0 ? Math.round((tepatWaktu / hadir) * 100) : 0;

      // Per departemen
      const deptMap: Record<string, { total: number; hadir: number }> = {};
      attendance?.forEach(d => {
        const dept = (d as any).employees?.departemen || 'Unknown';
        if (!deptMap[dept]) deptMap[dept] = { total: 0, hadir: 0 };
        deptMap[dept].total++;
        if (d.status === 'hadir' || d.status === 'terlambat') deptMap[dept].hadir++;
      });

      const deptData = Object.entries(deptMap).map(([departemen, val]) => ({
        departemen,
        total: val.total,
        hadir: val.hadir,
        persentase: val.total > 0 ? Math.round((val.hadir / val.total) * 100) : 0,
      }));

      setData([
        { label: 'Rata-rata Kehadiran', value: `${kehadiranPct}%`, subtitle: `Dari ${totalHari} total hari` },
        { label: 'Ketepatan Waktu', value: `${ketepatanPct}%`, subtitle: `Dari ${hadir} kehadiran` },
        { label: 'Total Keterlambatan', value: terlambat, subtitle: `${period} bulan terakhir` },
        { label: 'Jumlah Karyawan', value: employees?.length || 0, subtitle: 'Terdaftar aktif' },
      ]);

      setData((prev: any) => [...prev, { deptData }]);
    } catch (err) {
      console.warn('Supabase not configured');
    }
    setLoading(false);
  };

  // Dapatkan deptData dari state
  const deptData = Array.isArray(data) ? data.find((d: any) => d.deptData)?.deptData || [] : [];
  const kpis = Array.isArray(data) ? data.filter((d: any) => !d.deptData) : [];

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
              {m} {m === 1 ? 'Bulan' : 'Bulan'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '2rem' }}>Memuat...</p>
      ) : (
        <>
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
          <div className="chart-container">
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
        </>
      )}
    </div>
  );
}
