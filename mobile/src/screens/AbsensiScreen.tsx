import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const statusFilters = ['Semua', 'hadir', 'terlambat', 'absen', 'izin'];
const statusLabels: Record<string, string> = { hadir: 'Hadir', terlambat: 'Terlambat', absen: 'Absen', izin: 'Izin' };
const statusColors: Record<string, string> = { hadir: '#10b981', terlambat: '#f59e0b', absen: '#ef4444', izin: '#3b82f6' };

// Dummy data for demo
const dummyHistory = [
  { tanggal: '2026-07-21', jam_masuk: '2026-07-21T07:55:00', jam_keluar: '2026-07-21T17:05:00', status: 'hadir' },
  { tanggal: '2026-07-20', jam_masuk: '2026-07-20T08:20:00', jam_keluar: '2026-07-20T17:00:00', status: 'terlambat' },
  { tanggal: '2026-07-19', jam_masuk: null, jam_keluar: null, status: 'izin' },
  { tanggal: '2026-07-18', jam_masuk: '2026-07-18T07:50:00', jam_keluar: '2026-07-18T16:55:00', status: 'hadir' },
  { tanggal: '2026-07-17', jam_masuk: '2026-07-17T07:58:00', jam_keluar: '2026-07-17T17:10:00', status: 'hadir' },
  { tanggal: '2026-07-16', jam_masuk: null, jam_keluar: null, status: 'absen' },
  { tanggal: '2026-07-15', jam_masuk: '2026-07-15T08:35:00', jam_keluar: '2026-07-15T17:02:00', status: 'terlambat' },
  { tanggal: '2026-07-14', jam_masuk: '2026-07-14T07:45:00', jam_keluar: '2026-07-14T17:00:00', status: 'hadir' },
];

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const now = new Date();
const currentMonthName = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

export default function AbsensiScreen() {
  const [filter, setFilter] = useState('Semua');

  const filtered = filter === 'Semua'
    ? dummyHistory
    : dummyHistory.filter(d => d.status === filter);

  return (
    <View style={{ flex: 1, backgroundColor: '#e2e8f0' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#0f172a', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>Riwayat Absensi</Text>
        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{currentMonthName}</Text>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
        {statusFilters.map(s => (
          <TouchableOpacity
            key={s}
            onPress={() => setFilter(s)}
            style={{
              paddingHorizontal: 16, paddingVertical: 6, marginRight: 8, borderRadius: 20,
              backgroundColor: filter === s ? '#0d9488' : 'white',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: filter === s ? 'white' : '#64748b' }}>
              {s === 'Semua' ? 'Semua' : statusLabels[s]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* History List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        {filtered.map((item, i) => (
          <View key={i} style={{
            backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 10,
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
            flexDirection: 'row', alignItems: 'center',
          }}>
            <View style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: statusColors[item.status] + '20',
              alignItems: 'center', justifyContent: 'center', marginRight: 12,
            }}>
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
            <View style={{
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
              backgroundColor: item.status === 'hadir' ? '#d1fae5' : item.status === 'terlambat' ? '#fef3c7' : item.status === 'izin' ? '#dbeafe' : '#fee2e2',
            }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: statusColors[item.status] }}>
                {statusLabels[item.status]}
              </Text>
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
