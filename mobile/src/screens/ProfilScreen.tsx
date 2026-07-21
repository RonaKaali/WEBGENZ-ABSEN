import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useMobileAuth } from '../lib/AuthProvider';
import { useEmployee, useAttendance } from '../hooks/useAttendance';

export default function ProfilScreen() {
  const { user, profile, signOut } = useMobileAuth();
  const { employee } = useEmployee(user?.id);
  const { monthSummary } = useAttendance(user?.id);
  const data = profile || employee || {};

  const totalMonth = monthSummary.hadir + monthSummary.terlambat + monthSummary.absen + monthSummary.izin;
  const hadirPct = totalMonth > 0 ? Math.round((monthSummary.hadir / totalMonth) * 100) : 0;

  const handleLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Ya, Keluar', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#e2e8f0' }}>
      <View style={{ backgroundColor: '#0f172a', paddingTop: 60, paddingBottom: 32, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, alignItems: 'center' }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#14b8a6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>
            {data?.avatar_initials || (data?.nama ? data.nama.charAt(0).toUpperCase() : 'K')}
          </Text>
        </View>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>{data?.nama || 'Karyawan'}</Text>
        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{data?.jabatan || 'Staff'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
          <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '500' }}>Aktif</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 12 }}>Informasi Karyawan</Text>
          {[
            { label: 'NIP', value: data?.nip || '-' },
            { label: 'Departemen', value: data?.departemen || '-' },
            { label: 'Email', value: data?.email || user?.email || '-' },
            { label: 'Jabatan', value: data?.jabatan || '-' },
          ].map(item => (
            <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ fontSize: 13, color: '#64748b' }}>{item.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#0f172a' }}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 12 }}>Performa Bulan Ini</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#0d9488' }}>{`${hadirPct}%`}</Text>
              <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Kehadiran</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#f59e0b' }}>{`${totalMonth > 0 ? Math.round((monthSummary.hadir / totalMonth) * 100) : 0}%`}</Text>
              <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Tepat Waktu</Text>
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', marginBottom: 32 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
          >
            <Text style={{ fontSize: 18, marginRight: 12 }}>🚪</Text>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: '#ef4444' }}>Keluar</Text>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
