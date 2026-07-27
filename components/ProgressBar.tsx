// FutStar — ProgressBar reutilizável
// Barra de progresso com animação suave e porcentagem opcional

import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAppContext } from '../store/progress';

interface ProgressBarProps {
  progress: number; // 0-100
  color: string;
  height?: number;
  showLabel?: boolean;
  trackColor?: string;
  animated?: boolean;
}

export default function ProgressBar({
  progress,
  color,
  height = 6,
  showLabel = false,
  trackColor,
  animated = true,
}: ProgressBarProps) {
  const { theme } = useAppContext();
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(animatedWidth, {
        toValue: clampedProgress,
        friction: 12,
        tension: 40,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clampedProgress);
    }
  }, [clampedProgress, animated]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.track,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: trackColor || theme.colors.borderDefault,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolated,
              height,
              borderRadius: height / 2,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    overflow: 'hidden',
  },
  fill: {},
  label: {
    fontSize: 10,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'right',
  },
});
