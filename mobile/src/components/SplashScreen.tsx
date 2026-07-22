import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [step, setStep] = useState(0);

  // Animasi nilai
  const logoOpacity = React.useRef(new Animated.Value(0)).current;
  const logoscale = React.useRef(new Animated.Value(0.5)).current;
  const textOpacity = React.useRef(new Animated.Value(0)).current;
  const textTranslate = React.useRef(new Animated.Value(20)).current;
  const barOpacity = React.useRef(new Animated.Value(0)).current;
  const loadWidth = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 0→1: Logo muncul (300ms)
    const t1 = setTimeout(() => {
      setStep(1);
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(logoscale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();
    }, 100);

    // Step 1→2: Teks muncul (900ms)
    const t2 = setTimeout(() => {
      setStep(2);
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(textTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }, 800);

    // Step 2→3: Loading bar (1500ms)
    const t3 = setTimeout(() => {
      setStep(3);
      Animated.timing(barOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      Animated.timing(loadWidth, { toValue: 1, duration: 1300, useNativeDriver: false }).start();
    }, 1400);

    // Done: 2800ms
    const t4 = setTimeout(() => {
      onDone();
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Generate dot grid background
  const dots = [];
  for (let i = 0; i < 40; i++) {
    dots.push(
      <View
        key={i}
        style={{
          position: 'absolute',
          width: 2,
          height: 2,
          borderRadius: 1,
          backgroundColor: 'rgba(20, 184, 166, 0.08)',
          left: `${(i % 8) * 14}%` as any,
          top: `${Math.floor(i / 8) * 14}%` as any,
        }}
      />
    );
  }

  const loadBarWidth = loadWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Background dot grid */}
      {dots}

      {/* Teal glow orb */}
      <View style={styles.glowOrb} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoscale }],
          },
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 88, height: 88, borderRadius: 24 }}
          resizeMode="contain"
        />
        {/* Ripple rings */}
        {step >= 1 && (
          <>
            <View style={[styles.ripple, { animationDelay: '0s' }]} />
            <View style={[styles.ripple, { animationDelay: '0.6s' }]} />
            <View style={[styles.ripple, { animationDelay: '1.2s' }]} />
          </>
        )}
      </Animated.View>

      {/* Brand Text */}
      <Animated.View
        style={{
          opacity: textOpacity,
          transform: [{ translateY: textTranslate }],
          alignItems: 'center',
          marginTop: 24,
        }}
      >
        <Text style={styles.brandText}>WEBGENZ</Text>
        <Text style={styles.brandSub}>ABSENSI</Text>
        <Text style={styles.tagline}>Sistem Absensi Modern</Text>
      </Animated.View>

      {/* Loading Bar */}
      <Animated.View style={[styles.loadingContainer, { opacity: barOpacity }]}>
        <View style={styles.loadBarBg}>
          <Animated.View style={[styles.loadBarFill, { width: loadBarWidth }]} />
        </View>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, { animationDelay: '0s' }]} />
          <View style={[styles.dot, { animationDelay: '0.2s' }]} />
          <View style={[styles.dot, { animationDelay: '0.4s' }]} />
        </View>
      </Animated.View>

      {/* Footer */}
      <Text style={styles.footer}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  glowOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    top: '30%',
    alignSelf: 'center',
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 40,
    fontWeight: '800',
  },
  ripple: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  brandText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 4,
    textShadowColor: 'rgba(20, 184, 166, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  brandSub: {
    color: '#14b8a6',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 12,
    marginTop: -4,
  },
  tagline: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginTop: 8,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: '30%',
    alignItems: 'center',
  },
  loadBarBg: {
    width: 192,
    height: 3,
    backgroundColor: '#1e293b',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadBarFill: {
    height: '100%',
    backgroundColor: '#14b8a6',
    borderRadius: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14b8a6',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    color: '#334155',
    fontSize: 12,
    fontFamily: 'monospace' as const,
  },
});
