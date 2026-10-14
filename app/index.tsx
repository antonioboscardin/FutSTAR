// FutStar — Animated Splash + Router
// Splash animada com logo FutSTAR, depois redireciona
// Onboarding (1ª vez) ou tabs (retorno)

import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAppContext } from '../store/progress';
import { hasConsent } from './consent';

export default function IndexRouter() {
  const { profile, isLoaded, theme } = useAppContext();
  const router = useRouter();
  const c = theme.colors;

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isLoaded) return;

    // 1. Logo scale bounce: 0 → 1.1 → 1
    Animated.parallel([
      Animated.sequence([
        Animated.spring(logoScale, {
          toValue: 1.1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Subtitle fade in (delayed)
    const subTimer = setTimeout(() => {
      Animated.timing(subOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 600);

    // 3. Exit + redirect after 1.8s
    const exitTimer = setTimeout(() => {
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(async () => {
        const consentGiven = await hasConsent();
        if (!consentGiven) {
          router.replace('/consent' as any);
        } else if (!profile || !profile.onboardingDone) {
          router.replace('/onboarding' as any);
        } else {
          router.replace('/(tabs)/treinos' as any);
        }
      });
    }, 1800);

    return () => {
      clearTimeout(subTimer);
      clearTimeout(exitTimer);
    };
  }, [isLoaded, profile]);

  return (
    <Animated.View style={[styles.container, { backgroundColor: c.bgPrimary, opacity: exitOpacity }]}>
      <Animated.View style={{
        transform: [{ scale: logoScale }],
        opacity: logoOpacity,
        alignItems: 'center',
      }}>
        <Text style={styles.logoEmoji}>⚽</Text>
        <Text style={[styles.logoText, { color: c.accentGreen }]}>
          Fut<Text style={{ color: c.textPrimary }}>STAR</Text>
        </Text>
      </Animated.View>

      <Animated.Text style={[styles.subtitle, { color: c.textDim, opacity: subOpacity }]}>
        Treine como um craque
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    letterSpacing: 1,
  },
});
