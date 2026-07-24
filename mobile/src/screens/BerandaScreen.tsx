import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useMobileAuth } from '../lib/AuthProvider';
import { useEmployee, useAttendance } from '../hooks/useAttendance';
import CameraSelfieScreen from '../components/CameraSelfieScreen';
import LoadingOverlay from '../components/LoadingOverlay';

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
    <Text style={{ fontFamily: 'monospace' as const, fontSize: 42, fontWeight: '800', color: '#0f172a', letterSpacing: 2 }}>
      {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
    </Text>
  );
}

export default function BerandaScreen() {
  const { user } = useMobileAuth();
  const { employee, loading: empLoading } = useEmployee(user?.id);
  const { today, history, monthSummary, loading, checkInWithLocation, checkOutWithLocation, refetch } = useAttendance(user?.id);

  const [showCamera, setShowCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<'masuk' | 'keluar' | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const totalMonth = monthSummary.hadir + monthSummary.terlambat + monthSummary.absen + monthSummary.izin;
  const hadirPct = totalMonth > 0 ? Math.round((monthSummary.hadir / totalMonth) * 100) : 0;

  const isBeforeWork = !today;
  const isWorking = today && !today.jam_keluar;
  const isDone = today && today.jam_keluar;

  // Step 1: Minta izin lokasi & ambil koordinat
  const requestLocation = async (action: 'masuk' | 'keluar') => {
    console.log('[ABSEN][LOKASI] Memulai requestLocation, action:', action);
    try {
      setLoadingMessage('Mengambil lokasi...');
      setIsLoading(true);

      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      console.log('[ABSEN][LOKASI] Status izin:', status, 'canAskAgain:', canAskAgain);

      if (status !== 'granted') {
        setIsLoading(false);
        if (!canAskAgain) {
          // User pernah pilih "Don't ask again"
          Alert.alert(
            'Izin Lokasi Dibutuhkan',
            'Aplikasi butuh akses lokasi untuk absen. Aktifkan lewat Pengaturan HP > Aplikasi > WebGenZ Absen > Izin > Lokasi.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Lokasi Diperlukan', 'Lokasi wajib diaktifkan untuk absen');
        }
        return;
      }

      setLoadingMessage('Mendapatkan koordinat GPS...');
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      console.log('[ABSEN][LOKASI] Koordinat:', loc.coords.latitude, loc.coords.longitude);

      setCapturedLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
      setIsLoading(false);

      // Lanjut ke kamera
      console.log('[ABSEN][LOKASI] Lokasi berhasil, beralih ke kamera...');
      setPendingAction(action);
      setShowCamera(true);
    } catch (err: any) {
      console.error('[ABSEN][LOKASI] Error:', err.message || err);
      setIsLoading(false);
      Alert.alert('Gagal Mendapatkan Lokasi', err.message || 'Lokasi wajib diaktifkan untuk absen. Periksa pengaturan GPS Anda.');
    }
  };

  // Step 2-4: Foto diambil → upload + simpan
  const handlePhotoCapture = async (photoUri: string) => {
    console.log('[ABSEN][FOTO] Foto diterima, pendingAction:', pendingAction);
    setShowCamera(false);
    if (!pendingAction || !capturedLocation) {
      console.warn('[ABSEN][FOTO] pendingAction atau capturedLocation null, abort');
      return;
    }

    setIsLoading(true);

    let result;
    if (pendingAction === 'masuk') {
      result = await checkInWithLocation(photoUri, capturedLocation.lat, capturedLocation.lng, setLoadingMessage);
    } else {
      result = await checkOutWithLocation(photoUri, capturedLocation.lat, capturedLocation.lng, setLoadingMessage);
    }

    console.log('[ABSEN][HASIL] Result:', result);
    setIsLoading(false);
    setPendingAction(null);
    setCapturedLocation(null);

    if (result?.error) {
      Alert.alert('Gagal', result.error);
    } else {
      Alert.alert('Berhasil', 'Absen berhasil dicatat!');
    }
  };

  const handleCameraClose = () => {
    setShowCamera(false);
    setPendingAction(null);
    setCapturedLocation(null);
  };

  const handleMainButton = () => {
    console.log('[ABSEN] Tombol ditekan, isBeforeWork:', isBeforeWork, 'isWorking:', isWorking, 'isDone:', isDone);
    if (isDone) {
      console.log('[ABSEN] Tombol disabled (already done), tidak melakukan apa-apa');
      return;
    }
    if (isBeforeWork) {
      requestLocation('masuk');
    } else if (isWorking) {
      requestLocation('keluar');
    }
  };

  if (loading || empLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#64748b', fontSize: 16 }}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#e2e8f0' }}>
      <View style={{ backgroundColor: '#0f172a', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500' }}>{getGreeting()}</Text>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', marginTop: 2 }}>{employee?.nama || 'Karyawan'}</Text>
            <Text style={{ color: '#64748b', fontSize: 13, marginTop: 1 }}>{employee?.jabatan || 'Staff'}</Text>
          </View>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#14b8a6', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>{employee?.avatar_initials || 'K'}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, marginBottom: 16, alignItems: 'center' }}>
          <Clock />
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{formatDate()}</Text>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 12 }}>Status Hari Ini</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '500', marginBottom: 4 }}>Masuk</Text>
              <Text style={{ fontFamily: 'monospace' as const, fontSize: 18, fontWeight: '700', color: today?.jam_masuk ? '#0d9488' : '#94a3b8' }}>
                {today?.jam_masuk ? new Date(today.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '500', marginBottom: 4 }}>Keluar</Text>
              <Text style={{ fontFamily: 'monospace' as const, fontSize: 18, fontWeight: '700', color: today?.jam_keluar ? '#0d9488' : '#94a3b8' }}>
                {today?.jam_keluar ? new Date(today.jam_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '500', marginBottom: 4 }}>Status</Text>
              <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, backgroundColor: today?.status === 'hadir' ? '#d1fae5' : today?.status === 'terlambat' ? '#fef3c7' : '#fee2e2' }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: today?.status === 'hadir' ? '#065f46' : today?.status === 'terlambat' ? '#92400e' : '#991b1b' }}>
                  {today ? (today.status === 'hadir' ? 'Tepat Waktu' : today.status === 'terlambat' ? 'Terlambat' : 'Absen') : 'Belum Absen'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={handleMainButton} disabled={isDone} activeOpacity={0.8}
            style={{ backgroundColor: isDone ? '#94a3b8' : '#0d9488', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
              {isBeforeWork ? 'Absen Masuk Sekarang' : isWorking ? 'Absen Keluar' : 'Absensi Selesai ✓'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, marginBottom: 16 }}>
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
          <View style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden', flexDirection: 'row' }}>
            {totalMonth > 0 && (
              <>
                <View style={{ width: `${hadirPct}%` as any, backgroundColor: '#10b981' }} />
                <View style={{ width: `${(monthSummary.terlambat / totalMonth * 100)}%` as any, backgroundColor: '#f59e0b' }} />
                <View style={{ width: `${(monthSummary.absen / totalMonth * 100)}%` as any, backgroundColor: '#ef4444' }} />
                <View style={{ width: `${(monthSummary.izin / totalMonth * 100)}%` as any, backgroundColor: '#3b82f6' }} />
              </>
            )}
          </View>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, marginBottom: 24 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 12 }}>Terakhir Absen</Text>
          {history.length === 0 ? (
            <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', paddingVertical: 16 }}>Belum ada riwayat absensi</Text>
          ) : (
            history.slice(0, 5).map((item: any, i: number) => (
              <React.Fragment key={i}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: i < 4 ? 1 : 0, borderBottomColor: '#f1f5f9' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 16 }}>
                      {item.status === 'hadir' ? '✅' : item.status === 'terlambat' ? '⚠️' : item.status === 'izin' ? '📋' : '❌'}
                    </Text>
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '500', color: '#0f172a' }}>{item.tanggal}</Text>
                      <Text style={{ fontFamily: 'monospace' as const, fontSize: 11, color: '#94a3b8' }}>
                        {item.jam_masuk ? new Date(item.jam_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        {' → '}
                        {item.jam_keluar ? new Date(item.jam_keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </Text>
                    </View>
                  </View>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: item.status === 'hadir' ? '#d1fae5' : item.status === 'terlambat' ? '#fef3c7' : item.status === 'izin' ? '#dbeafe' : '#fee2e2' }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: item.status === 'hadir' ? '#065f46' : item.status === 'terlambat' ? '#92400e' : item.status === 'izin' ? '#1e40af' : '#991b1b' }}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>

      {/* Kamera Selfie Modal */}
      {showCamera && (
        <CameraSelfieScreen onCapture={handlePhotoCapture} onClose={handleCameraClose} />
      )}

      {/* Loading Overlay */}
      <LoadingOverlay visible={isLoading} message={loadingMessage} />
    </View>
  );
}
