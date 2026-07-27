// FutStar — GolAnimation
// Animated "⚽ GOL!" overlay for KIDS theme (<=12 anos)
// Scale bounce: 0 → 1.3 → 1.0 with darkened background

import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GolAnimationProps {
  visible: boolean;
  onComplete: () => void;
}

export default function GolAnimation({ visible, onComplete }: GolAnimationProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    // Reset
    scale.setValue(0);
    opacity.setValue(0);
    bgOpacity.setValue(0);

    // Animate in
    Animated.parallel([
      // Darken background
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Text fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Scale bounce: 0 → 1.3 → 1.0
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.3,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1.0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Auto dismiss after 2s
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bgOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onComplete());
    }, 2000);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.backdrop, { opacity: bgOpacity }]} />
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={styles.emoji}>⚽</Text>
        <Text style={styles.golText}>GOL!</Text>
        <Text style={styles.subText}>Treino concluído!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 11,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  textContainer: {
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 4,
  },
  golText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#00C853',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 200, 83, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.8,
  },
});
