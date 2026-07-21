import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

// Simulated auth context (will connect to Supabase later)
const AuthContext = React.createContext<any>({ userId: 'demo-user-id' });
export const useMobileAuth = () => useContext(AuthContext);

// Sementara inline hooks untuk demo
function useEmployeeFallback(userId: string) {
  return { employee: { nama: 'Karyawan', jabatan: 'Staff', avatar_initials: 'K' }, loading: false };
}
function useAttendanceFallback(userId: string) {
  return {
    today: null,
    history: [],
    monthSummary: { hadir: 0, terlambat: 0, absen: 0, izin: 0 },
    loading: false,
    checkIn: async () => ({ error: null }),
    checkOut: async () => ({ error: null }),
  };
}

const GREETINGS = ['Selamat Pagi', 'Selamat Siang', 'Selamat Sore', 'Selamat Malam'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return GREETINGS[0];
  if (h < 15) return GREETINGS[1];
  if (h < 18) return GREETINGS[2];
  return GREETINGS[3];
}

function formatDate() {
  const d = new Date();
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Text style={{ fontFamily: 'monospace', fontSize: 42, fontWeight: '800', color: '#0f172a', letterSpacing: 2 }}>
      {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
    </Text>
  );
}

export default function BerandaScreen() {
  const { userId } = useMobileAuth();
  const { employee, loading: empLoading } = useEmployeeFallback(userId);
  const { today, history, monthSummary, loading, checkIn, checkOut } = useAttendanceFallback(userId);

  const totalMonth = monthSummary.hadir + monthSummary.terlambat + monthSummary.absen + monthSummary.izin;
  const hadirPct = totalMonth > 0 ? Math.round((monthSummary.hadir / totalMonth) * 100) : 0;

  const handleMainButton = async () => {
    if (!today) {
      await checkIn();
    } else if (!today.jam_keluar) {
      await checkOut();
    }
  };

  const isBeforeWork = !today;
  const isWorking = today && !today.jam_keluar;
  const isDone = today && today.jam_keluar;

  return (
    <View style={{ flex: 1, backgroundColor: '#e2e8f0' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#0f172a', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500' }}>{getGreeting()}</Text>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', marginTop: 2 }}>
              {employee?.nama || 'Karyawan'}
            </Text>
            <Text style={{ color: '#64748b', fontSize: 13, marginTop: 1 }}>{employee?.jabatan || 'Staff'}</Text>
          </View>
          <View style={{
            width: 52, height: 52, borderRadius: 26,
            backgroundColor: '#14b8a6',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>
              {employee?.avatar_initials || 'K'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
        {/* Clock Card */}
        <View style={{
          backgroundColor: 'white', borderRadius: 16, padding: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
          marginBottom: 16, alignItems: 'center',
        }}>
          <Clock />
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{formatDate()}</Text>
        </View>

        {/* Status Card */}
        <View style={{
          backgroundColor: 'white', borderRadius: 16, padding: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 12 }}>Status Hari Ini</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '500', marginBottom: 4 }}>Masuk</Text>
              <Text style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: '700', color: today?.jam_masuk ? '#0d9488' : '#94a3b8' }}>
                {today?.jam_masuk ? new Date(today.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '500', marginBottom: 4 }}>Keluar</Text>
              <Text style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: '700', color: today?.jam_keluar ? '#0d9488' : '#94a3b8' }}>
                {today?.jam_keluar ? new Date(today.jam_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '500', marginBottom: 4 }}>Status</Text>
              <View style={{
                paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
                backgroundColor: today?.status === 'hadir' ? '#d1fae5' : today?.status === 'terlambat' ? '#fef3c7' : '#fee2e2',
              }}>
                <Text style={{
                  fontSize: 12, fontWeight: '600',
                  color: today?.status === 'hadir' ? '#065f46' : today?.status === 'terlambat' ? '#92400e' : '#991b1b',
                }}>
                  {today ? (today.status === 'hadir' ? 'Tepat Waktu' : today.status === 'terlambat' ? 'Terlambat' : 'Absen') : 'Belum Absen'}
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            onPress={handleMainButton}
            disabled={isDone}
            activeOpacity={0.8}
            style={{
              backgroundColor: isDone ? '#94a3b8' : '#0d9488',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
              {isBeforeWork ? 'Absen Masuk Sekarang' : isWorking ? 'Absen Keluar' : 'Absensi Selesai ✓'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Month Summary */}
        <View style={{
          backgroundColor: 'white', borderRadius: 16, padding: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 12 }}>Ringkasan Bulan Ini</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            {[
              { label: 'Hadir', value: monthSummary.hadir, color: '#10b981' },
              { label: 'Telat', value: monthSummary.terlambat, color: '#f59e0b' },
              { label: 'Absen', value: monthSummary.absen, color: '#ef4444' },
              { label: 'Izin', value: monthSummary.izin, color: '#3b82f6' },
            ].map(item => (
              <View key={item.label} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: item.color }}>{item.value}</Text>
                <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.label}</Text>
              </View>
            ))}
          </View>
          {/* Progress Bar */}
          <View style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden', flexDirection: 'row' }}>
            {totalMonth > 0 && (
              <>
                <View style={{ width: `${hadirPct}%`, backgroundColor: '#10b981' }} />
                <View style={{ width: `${monthSummary.terlambat / totalMonth * 100}%`, backgroundColor: '#f59e0b' }} />
                <View style={{ width: `${monthSummary.absen / totalMonth * 100}%`, backgroundColor: '#ef4444' }} />
                <View style={{ width: `${monthSummary.izin / totalMonth * 100}%`, backgroundColor: '#3b82f6' }} />
              </>
            )}
          </View>
        </View>

        {/* Recent History */}
        <View style={{
          backgroundColor: 'white', borderRadius: 16, padding: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
          marginBottom: 24,
        }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 12 }}>Terakhir Absen</Text>
          {history.length === 0 ? (
            <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', paddingVertical: 16 }}>Belum ada riwayat absensi</Text>
          ) : (
            history.slice(0, 5).map((item: any, i: number) => (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingVertical: 10, borderBottomWidth: i < 4 ? 1 : 0, borderBottomColor: '#f1f5f9',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 16 }}>
                    {item.status === 'hadir' ? '✅' : item.status === 'terlambat' ? '⚠️' : item.status === 'izin' ? '📋' : '❌'}
                  </Text>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#0f172a' }}>
                      {item.tanggal}
                    </Text>
                    <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>
                      {item.jam_masuk ? new Date(item.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      {' → '}
                      {item.jam_keluar ? new Date(item.jam_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </Text>
                  </View>
                </View>
                <View style={{
                  paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
                  backgroundColor: item.status === 'hadir' ? '#d1fae5' : item.status === 'terlambat' ? '#fef3c7' : '#fee2e2',
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: item.status === 'hadir' ? '#065f46' : item.status === 'terlambat' ? '#92400e' : '#991b1b' }}>
                    {item.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
