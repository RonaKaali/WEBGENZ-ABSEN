import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, Animated } from 'react-native';
import { useMobileAuth } from '../lib/AuthProvider';

export default function LoginScreen() {
  const { signIn, loading: authLoading } = useMobileAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logging, setLogging] = useState(false);

  // Animasi masuk
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

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
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 20 }}
          resizeMode="contain"
        />
        <Text style={{ color: '#64748b', fontSize: 14 }}>Memuat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 32,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Logo & Selamat Datang */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 120, height: 120, borderRadius: 24, marginBottom: 24 }}
            resizeMode="contain"
          />
          <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>
            Selamat Datang 👋
          </Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 6, textAlign: 'center' }}>
            Masuk ke akun WEBGENZ Absensi
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '500', marginBottom: 6 }}>Email</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1e293b',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#334155',
              paddingHorizontal: 14,
            }}>
              <Text style={{ fontSize: 16, marginRight: 10 }}>✉️</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="email@perusahaan.com"
                placeholderTextColor="#475569"
                autoCapitalize="none"
                keyboardType="email-address"
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  fontSize: 15,
                  color: 'white',
                }}
              />
            </View>
          </View>

          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '500', marginBottom: 6 }}>Password</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1e293b',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#334155',
              paddingHorizontal: 14,
            }}>
              <Text style={{ fontSize: 16, marginRight: 10 }}>🔒</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#475569"
                secureTextEntry
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  fontSize: 15,
                  color: 'white',
                }}
              />
            </View>
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
              {logging ? 'Memverifikasi...' : 'Masuk'}
            </Text>
          </TouchableOpacity>

          {/* Demo credentials hint */}
          <Text style={{
            color: '#475569',
            fontSize: 12,
            textAlign: 'center',
            marginTop: 8,
          }}>
            Demo: admin@webgenz.com / admin123
          </Text>
        </View>

        {/* Footer */}
        <Text style={{
          color: '#334155',
          fontSize: 11,
          textAlign: 'center',
          marginTop: 40,
          fontFamily: 'monospace' as const,
        }}>
          WEBGENZ Absensi v1.0.0
        </Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
