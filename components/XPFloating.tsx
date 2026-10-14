// FutStar — XPFloating
// Animação de XP ganho que sobe e desaparece
// Usa react-native-reanimated para performance nativa

import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface XPFloatingProps {
  amount: number;
  visible: boolean;
  onComplete?: () => void;
}

export default function XPFloating({ amount, visible, onComplete }: XPFloatingProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (!visible || amount <= 0) return;

    // Reset
    translateY.value = 0;
    opacity.value = 0;
    scale.value = 0.5;

    // Animate: pop in → float up → fade out
    scale.value = withSequence(
      withTiming(1.3, { duration: 200, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 150 })
    );

    opacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withDelay(900, withTiming(0, { duration: 450 }))
    );

    translateY.value = withTiming(-80, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });

    // Callback after animation
    if (onComplete) {
      const timeout = setTimeout(() => onComplete(), 1500);
      return () => clearTimeout(timeout);
    }
  }, [visible, amount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  if (!visible || amount <= 0) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <Text style={styles.text}>+{amount} XP ⚡</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    zIndex: 9999,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  text: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
