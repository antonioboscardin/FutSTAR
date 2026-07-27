// FutStar — Toast / Snackbar
// Animated notification that slides in from top and auto-dismisses
// Supports confetti-style celebration toasts

import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ToastData {
  id: string;
  message: string;
  emoji?: string;
  color?: string;
  duration?: number; // ms, default 2500
  type?: 'normal' | 'celebration' | 'phase';
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss(toast.id));
    }, toast.duration || 2500);

    return () => clearTimeout(timer);
  }, []);

  const bgColor = toast.type === 'phase'
    ? '#1a0a2e'
    : toast.type === 'celebration'
      ? '#052e16'
      : '#0d1422';

  const borderColor = toast.type === 'phase'
    ? '#a78bfa44'
    : toast.type === 'celebration'
      ? '#4ade8044'
      : (toast.color || '#4ade80') + '33';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
          backgroundColor: bgColor,
          borderColor,
        },
      ]}
    >
      <Text style={styles.emoji}>{toast.emoji || '🔥'}</Text>
      <Text style={[styles.message, { color: toast.color || '#4ade80' }]}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emoji: {
    fontSize: 20,
  },
  message: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
});
