import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMobileAuth } from '../lib/AuthProvider';
import { useAttendance } from '../hooks/useAttendance';

const statusFilters = ['Semua', 'hadir', 'terlambat', 'absen', 'izin'];
const statusLabels: Record<string, string> = { hadir: 'Hadir', terlambat: 'Terlambat', absen: 'Absen', izin: 'Izin' };
const statusColors: Record<string, string> = { hadir: '#10b981', terlambat: '#f59e0b', absen: '#ef4444', izin: '#3b82f6' };

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const now = new Date();
const currentMonthName = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

export default function AbsensiScreen() {
  const [filter, setFilter] = useState('Semua');
  const { user } = useMobileAuth();
  const { history, loading } = useAttendance(user?.id);

  const filtered = filter === 'Semua'
    ? history
    : history.filter(d => d.status === filter);

  return (
    <View style={{ flex: 1, backgroundColor: '#e2e8f0' }}>
      <View style={{ backgroundColor: '#0f172a', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>Riwayat Absensi</Text>
        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{currentMonthName}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
        {statusFilters.map(s => (
          <TouchableOpacity
            key={s}
            onPress={() => setFilter(s)}
            style={{ paddingHorizontal: 16, paddingVertical: 6, marginRight: 8, borderRadius: 20, backgroundColor: filter === s ? '#0d9488' : 'white' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: filter === s ? 'white' : '#64748b' }}>
              {s === 'Semua' ? 'Semua' : statusLabels[s]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8' }}>Memuat data...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8' }}>Belum ada data absensi</Text>
          </View>
        ) : (
          filtered.map((item, i) => (
            <React.Fragment key={i}>
              <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: statusColors[item.status] + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 16 }}>
                    {item.status === 'hadir' ? '✅' : item.status === 'terlambat' ? '⚠️' : item.status === 'izin' ? '📋' : '❌'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#0f172a' }}>{item.tanggal}</Text>
                  <Text style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    {item.jam_masuk ? new Date(item.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    {' → '}
                    {item.jam_keluar ? new Date(item.jam_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </Text>
                </View>
                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: statusColors[item.status] + '30' }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: statusColors[item.status] }}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>
            </React.Fragment>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
