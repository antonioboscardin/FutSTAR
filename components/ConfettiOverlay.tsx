// FutStar — ConfettiOverlay
// Animated confetti particles using React Native Animated API
// Shows a burst of colored particles falling from top

import { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 30;
const CONFETTI_COLORS = ['#4ade80', '#fbbf24', '#60a5fa', '#fb923c', '#f43f5e', '#a78bfa', '#38bdf8'];

interface ConfettiOverlayProps {
  visible: boolean;
  onComplete?: () => void;
  duration?: number; // ms, default 2500
  isPhaseComplete?: boolean; // bigger, longer animation
}

interface ConfettiPiece {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
  size: number;
  startX: number;
}

export default function ConfettiOverlay({
  visible,
  onComplete,
  duration = 2500,
  isPhaseComplete = false,
}: ConfettiOverlayProps) {
  const count = isPhaseComplete ? 50 : CONFETTI_COUNT;

  const pieces = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: count }, () => {
      const startX = Math.random() * SCREEN_WIDTH;
      return {
        x: new Animated.Value(0),
        y: new Animated.Value(-30),
        rotate: new Animated.Value(0),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 6,
        startX,
      };
    });
  }, [count]);

  useEffect(() => {
    if (!visible) return;

    const animations = pieces.map((piece, i) => {
      const delay = Math.random() * 400;
      const xDrift = (Math.random() - 0.5) * 120;
      const fallDuration = (duration * 0.8) + Math.random() * 600;

      // Reset
      piece.y.setValue(-30);
      piece.x.setValue(0);
      piece.rotate.setValue(0);
      piece.opacity.setValue(1);
      piece.scale.setValue(0);

      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Scale in
          Animated.spring(piece.scale, {
            toValue: 1,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
          }),
          // Fall down
          Animated.timing(piece.y, {
            toValue: SCREEN_HEIGHT + 50,
            duration: fallDuration,
            useNativeDriver: true,
          }),
          // Drift sideways
          Animated.timing(piece.x, {
            toValue: xDrift,
            duration: fallDuration,
            useNativeDriver: true,
          }),
          // Rotate
          Animated.timing(piece.rotate, {
            toValue: 2 + Math.random() * 4,
            duration: fallDuration,
            useNativeDriver: true,
          }),
          // Fade out at end
          Animated.sequence([
            Animated.delay(fallDuration * 0.7),
            Animated.timing(piece.opacity, {
              toValue: 0,
              duration: fallDuration * 0.3,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => {
      onComplete?.();
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {pieces.map((piece, i) => (
        <Animated.View
          key={i}
          style={[
            styles.piece,
            {
              left: piece.startX,
              width: piece.size,
              height: piece.size * (Math.random() > 0.5 ? 1.5 : 1),
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? piece.size / 2 : 2,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                {
                  rotate: piece.rotate.interpolate({
                    inputRange: [0, 6],
                    outputRange: ['0deg', '2160deg'],
                  }),
                },
                { scale: piece.scale },
              ],
              opacity: piece.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...(StyleSheet.absoluteFill as object),
    zIndex: 9998,
    elevation: 9,
  },
  piece: {
    position: 'absolute',
    top: 0,
  },
});
