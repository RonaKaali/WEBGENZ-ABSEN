import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

function MenuItem({ label, icon, onPress, danger }: { label: string; icon: string; onPress?: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
      }}
    >
      <Text style={{ fontSize: 18, marginRight: 12 }}>{icon}</Text>
      <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: danger ? '#ef4444' : '#0f172a' }}>{label}</Text>
      <Text style={{ color: '#94a3b8', fontSize: 14 }}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfilScreen() {
  const employee = {
    nama: 'Karyawan User',
    jabatan: 'Staff IT',
    nip: 'EMP-001',
    departemen: 'Teknologi Informasi',
    email: 'karyawan@webgenz.com',
    atasan: 'Admin HR',
    tanggal_bergabung: '2026-01-15',
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#e2e8f0' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#0f172a', paddingTop: 60, paddingBottom: 32, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, alignItems: 'center' }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#14b8a6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>K</Text>
        </View>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>{employee.nama}</Text>
        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{employee.jabatan}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
          <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '500' }}>Aktif</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Info Karyawan */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 12 }}>Informasi Karyawan</Text>
          {[
            { label: 'NIP', value: employee.nip },
            { label: 'Departemen', value: employee.departemen },
            { label: 'Email', value: employee.email },
            { label: 'Atasan', value: employee.atasan },
            { label: 'Bergabung', value: employee.tanggal_bergabung },
          ].map(item => (
            <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ fontSize: 13, color: '#64748b' }}>{item.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#0f172a' }}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Performa */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 12 }}>Performa Bulan Ini</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#0d9488 }}>85%</Text>
              <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Kehadiran</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#f59e0b }}>92%</Text>
              <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Tepat Waktu</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', marginBottom: 32 }}>
          <MenuItem label="Ubah Password" icon="🔒" onPress={() => {}} />
          <MenuItem label="Pengaturan Notifikasi" icon="🔔" onPress={() => {}} />
          <MenuItem label="Kebijakan Privasi" icon="📄" onPress={() => {}} />
          <MenuItem label="Keluar" icon="🚪" danger onPress={() => {}} />
        </View>
      </ScrollView>
    </View>
  );
}
