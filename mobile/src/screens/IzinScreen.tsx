import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';

const jenisIzin = [
  { id: 'sakit', label: 'Sakit', icon: '🤒', color: '#f59e0b' },
  { id: 'cuti', label: 'Cuti', icon: '🏖️', color: '#3b82f6' },
  { id: 'keperluan', label: 'Keperluan', icon: '📋', color: '#8b5cf6' },
  { id: 'dinas', label: 'Dinas', icon: '🏢', color: '#0d9488' },
];

export default function IzinScreen() {
  const [jenis, setJenis] = useState('');
  const [tglMulai, setTglMulai] = useState('');
  const [tglSelesai, setTglSelesai] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!jenis || !tglMulai || !tglSelesai) return;
    // In real app: INSERT to leave_requests table
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 32, alignItems: 'center', width: '100%', maxWidth: 320 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>✅</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 8 }}>Pengajuan Terkirim!</Text>
          <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
            Menunggu persetujuan HR
          </Text>
          <TouchableOpacity
            onPress={() => { setSubmitted(false); setJenis(''); setTglMulai(''); setTglSelesai(''); setKeterangan(''); }}
            style={{ backgroundColor: '#0d9488', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
          >
            <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>Ajukan Lagi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#e2e8f0' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#0f172a', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>Ajukan Izin</Text>
        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>Isi form pengajuan izin di bawah</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Jenis Izin */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 12 }}>Jenis Izin</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {jenisIzin.map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setJenis(item.id)}
                style={{
                  flex: 1, minWidth: '45%',
                  paddingVertical: 14, paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: jenis === item.id ? '#0d9488' : '#f8fafc',
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: 8,
                  borderWidth: jenis === item.id ? 0 : 1,
                  borderColor: '#e2e8f0',
                }}
              >
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                <Text style={{
                  fontSize: 14, fontWeight: '600',
                  color: jenis === item.id ? 'white' : '#475569',
                }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tanggal */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 12 }}>Tanggal</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Dari</Text>
              <TextInput
                value={tglMulai}
                onChangeText={setTglMulai}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                style={{
                  backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, fontSize: 14,
                  borderWidth: 1, borderColor: '#e2e8f0', color: '#0f172a',
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Sampai</Text>
              <TextInput
                value={tglSelesai}
                onChangeText={setTglSelesai}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                style={{
                  backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, fontSize: 14,
                  borderWidth: 1, borderColor: '#e2e8f0', color: '#0f172a',
                }}
              />
            </View>
          </View>
        </View>

        {/* Keterangan */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 8 }}>Keterangan</Text>
          <TextInput
            value={keterangan}
            onChangeText={setKeterangan}
            placeholder="Tulis alasan izin..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, fontSize: 14,
              borderWidth: 1, borderColor: '#e2e8f0', color: '#0f172a',
              minHeight: 100, textAlignVertical: 'top',
            }}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!jenis || !tglMulai || !tglSelesai}
          style={{
            backgroundColor: (!jenis || !tglMulai || !tglSelesai) ? '#94a3b8' : '#0d9488',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Kirim Pengajuan</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
