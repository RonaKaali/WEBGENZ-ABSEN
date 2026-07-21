import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useMobileAuth } from '../lib/AuthProvider';

export default function LoginScreen() {
  const { signIn, loading: authLoading } = useMobileAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logging, setLogging] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email harus diisi');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Password harus diisi');
      return;
    }

    setLogging(true);
    const error = await signIn(email.trim(), password);
    setLogging(false);

    if (error) {
      Alert.alert('Login Gagal', error);
    }
  };

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 16 }}>Memuat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: '#14b8a6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Text style={{ color: 'white', fontSize: 32, fontWeight: '800' }}>W</Text>
          </View>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>Webgenz Absen</Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Absensi Karyawan</Text>
        </View>

        {/* Form */}
        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '500', marginBottom: 6 }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@perusahaan.com"
              placeholderTextColor="#475569"
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 12,
                padding: 16,
                fontSize: 15,
                color: 'white',
                borderWidth: 1,
                borderColor: '#334155',
              }}
            />
          </View>

          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '500', marginBottom: 6 }}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#475569"
              secureTextEntry
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 12,
                padding: 16,
                fontSize: 15,
                color: 'white',
                borderWidth: 1,
                borderColor: '#334155',
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={logging}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#14b8a6',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginTop: 8,
              opacity: logging ? 0.6 : 1,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
              {logging ? 'Memproses...' : 'Masuk'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
