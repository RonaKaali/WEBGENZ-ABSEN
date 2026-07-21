import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useEmployee(userId: string | undefined) {
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchEmployee();
  }, [userId]);

  const fetchEmployee = async () => {
    try {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('id', userId)
        .single();
      setEmployee(data);
    } catch (err) {
      console.warn('Supabase not configured');
    }
    setLoading(false);
  };

  return { employee, loading, refetch: fetchEmployee };
}

export function useAttendance(userId: string | undefined) {
  const [today, setToday] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [monthSummary, setMonthSummary] = useState<any>({ hadir: 0, terlambat: 0, absen: 0, izin: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthStr = monthStart.toISOString().split('T')[0];

      // Today
      const { data: todayData } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', userId)
        .eq('tanggal', todayStr)
        .maybeSingle();
      setToday(todayData);

      // History (30 hari terakhir)
      const { data: historyData } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', userId)
        .order('tanggal', { ascending: false })
        .limit(30);
      setHistory(historyData || []);

      // Month summary
      const { data: monthData } = await supabase
        .from('attendance')
        .select('status')
        .eq('employee_id', userId)
        .gte('tanggal', monthStr);

      const summary: Record<string, number> = { hadir: 0, terlambat: 0, absen: 0, izin: 0 };
      monthData?.forEach((d: any) => {
        if (summary[d.status] !== undefined) summary[d.status]++;
      });
      setMonthSummary(summary);
    } catch (err) {
      console.warn('Supabase not configured');
    }
    setLoading(false);
  };

  const checkIn = async () => {
    try {
      const now = new Date().toISOString();
      const todayStr = new Date().toISOString().split('T')[0];

      // Get company settings for tolerance
      const { data: settings } = await supabase
        .from('company_settings')
        .select('*')
        .single();

      const jamMulai = settings?.jam_kerja_mulai || '08:00';
      const toleransi = settings?.toleransi_menit || 15;

      // Check if late
      const [h, m] = jamMulai.split(':').map(Number);
      const batas = new Date();
      batas.setHours(h, m + toleransi, 0, 0);
      const status = new Date() > batas ? 'terlambat' : 'hadir';

      const { error } = await supabase.from('attendance').insert({
        employee_id: userId,
        tanggal: todayStr,
        jam_masuk: now,
        status,
      });

      if (!error) fetchData();
      return { error: error?.message };
    } catch (err) {
      return { error: 'Supabase not configured' };
    }
  };

  const checkOut = async () => {
    try {
      const now = new Date().toISOString();
      const todayStr = new Date().toISOString().split('T')[0];

      if (today?.jam_masuk) {
        const masuk = new Date(today.jam_masuk).getTime();
        const keluar = new Date().getTime();
        const durasi = Math.round((keluar - masuk) / 60000);

        const { error } = await supabase
          .from('attendance')
          .update({ jam_keluar: now, durasi_menit: durasi })
          .eq('employee_id', userId)
          .eq('tanggal', todayStr);

        if (!error) fetchData();
        return { error: error?.message };
      }
      return { error: 'Belum absen masuk' };
    } catch (err) {
      return { error: 'Supabase not configured' };
    }
  };

  return { today, history, monthSummary, loading, checkIn, checkOut, refetch: fetchData };
}
