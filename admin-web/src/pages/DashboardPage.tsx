import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const COLORS = ['#0d9488', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

function StatCard({ title, value, subtitle, color, icon }: { title: string; value: string | number; subtitle: string; color: string; icon: string }) {
  return (
    <div className="stat-card animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, color }}>{value}</p>
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.75rem', marginTop: '0.5rem' }}>{subtitle}</p>
        </div>
        <span style={{ fontSize: '2rem', opacity: 0.5 }}>{icon}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalKaryawan: 0, hadirHariIni: 0, terlambat: 0, tidakHadir: 0 });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [deptData, setDeptData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    const today = new Date().toISOString().split('T')[0];
    const channel = supabase
      .channel('attendance-changes-today')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'attendance',
          filter: `tanggal=eq.${today}` 
        },
        (payload) => {
          setFeed(prev => [payload.new, ...prev.slice(0, 19)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAll = async () => {
    try {
      // Total Karyawan
      const { count: totalK } = await supabase.from('employees').select('*', { count: 'exact', head: true });

      // Hadir hari ini
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData } = await supabase
        .from('attendance')
        .select('*, employees(nama, departemen)')
        .eq('tanggal', today);

      const hadir = todayData?.filter(d => d.status === 'hadir').length || 0;
      const terlambat = todayData?.filter(d => d.status === 'terlambat').length || 0;
      const tidakHadir = todayData?.filter(d => d.status === 'absen').length || 0;

      setStats({
        totalKaryawan: totalK || 0,
        hadirHariIni: hadir,
        terlambat,
        tidakHadir,
      });

      // Weekly data (7 hari terakhir)
      const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
      const { data: weekData } = await supabase
        .from('attendance')
        .select('tanggal, status')
        .gte('tanggal', sevenDaysAgo)
        .lte('tanggal', today);

      const days: any = {};
      weekData?.forEach(d => {
        if (!days[d.tanggal]) days[d.tanggal] = { tanggal: d.tanggal, hadir: 0 };
        if (d.status === 'hadir' || d.status === 'terlambat') days[d.tanggal].hadir++;
      });
      setWeeklyData(Object.values(days).sort((a: any, b: any) => a.tanggal.localeCompare(b.tanggal)));

      // Departemen distribution
      const { data: empData } = await supabase.from('employees').select('departemen');
      const dept: any = {};
      empData?.forEach(d => {
        dept[d.departemen] = (dept[d.departemen] || 0) + 1;
      });
      setDeptData(Object.entries(dept).map(([name, value]) => ({ name, value })));

      // Monthly data (6 bulan)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const { data: monthData } = await supabase
        .from('attendance')
        .select('tanggal, status')
        .gte('tanggal', sixMonthsAgo.toISOString().split('T')[0]);

      const months: any = {};
      const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
      monthData?.forEach(d => {
        const m = monthNames[new Date(d.tanggal).getMonth()];
        if (!months[m]) months[m] = { bulan: m, hadir: 0, total: 0 };
        months[m].total++;
        if (d.status === 'hadir' || d.status === 'terlambat') months[m].hadir++;
      });
      setMonthlyData(Object.values(months).map((m: any) => ({
        ...m,
        persentase: m.total > 0 ? Math.round((m.hadir / m.total) * 100) : 0,
      })));

      // Feed aktivitas (hari ini)
      if (todayData) {
        setFeed(todayData.slice(-10).reverse());
      }
    } catch (err) {
      console.warn('Supabase not configured yet, using placeholder');
    }
    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.75rem 1rem' }}>
          <p style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600 }}>{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Dasbor</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Ringkasan absensi real-time
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard title="Total Karyawan" value={stats.totalKaryawan} subtitle="Terdaftar di sistem" color="#0d9488" icon="👥" />
        <StatCard title="Hadir Hari Ini" value={stats.hadirHariIni} subtitle="Tepat waktu" color="#10b981" icon="✅" />
        <StatCard title="Terlambat" value={stats.terlambat} subtitle="Hari ini" color="#f59e0b" icon="⚠️" />
        <StatCard title="Tidak Hadir" value={stats.tidakHadir} subtitle="Belum absen / izin" color="#ef4444" icon="❌" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Area Chart */}
        <div className="chart-container animate-fadeIn">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Tren Kehadiran (7 Hari)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => v?.slice(5) || ''} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="hadir" stroke="#0d9488" fillOpacity={1} fill="url(#colorHadir)" strokeWidth={2} name="Hadir" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="chart-container animate-fadeIn">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Sebaran Departemen</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={deptData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {deptData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart + Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Bar Chart */}
        <div className="chart-container animate-fadeIn">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Tingkat Kehadiran (6 Bulan)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} unit="%" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="persentase" fill="#0d9488" radius={[6, 6, 0, 0]} name="Kehadiran %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div className="chart-container animate-fadeIn">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Aktivitas Langsung
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} className="animate-pulse-dot" />
          </h3>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {feed.length === 0 ? (
              <p style={{ color: 'var(--color-text-light)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
                {loading ? 'Memuat...' : 'Belum ada aktivitas hari ini'}
              </p>
            ) : (
              feed.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0',
                  borderBottom: '1px solid #f1f5f9',
                  animation: `fadeIn 0.3s ease-out ${i * 0.05}s both`,
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: item.status === 'hadir' ? '#d1fae5' : '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    flexShrink: 0,
                  }}>
                    {item.status === 'hadir' ? '✅' : '⚠️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {(item as any).employees?.nama || 'Karyawan'}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>
                      {item.status === 'hadir' ? 'Hadir' : 'Terlambat'} • {item.jam_masuk ? new Date(item.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontWeight: 600,
                    background: item.status === 'hadir' ? '#d1fae5' : '#fef3c7',
                    color: item.status === 'hadir' ? '#065f46' : '#92400e',
                  }}>
                    {item.status === 'hadir' ? 'Tepat' : 'Telat'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
