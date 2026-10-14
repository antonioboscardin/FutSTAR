// FutStar — AchievementCard
// Card de conquista com animação de reveal, shimmer e haptics
// Conquistas bloqueadas: grayscale com cadeado

import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { withOpacity } from '../constants/theme';
import { useAppContext } from '../store/progress';

interface AchievementCardProps {
  icon: string;
  name: string;
  unlocked: boolean;
  isNewUnlock?: boolean; // triggers reveal animation
}

export default function AchievementCard({
  icon,
  name,
  unlocked,
  isNewUnlock = false,
}: AchievementCardProps) {
  const { theme } = useAppContext();
  const c = theme.colors;
  const hasTriggered = useRef(false);

  // Animation values
  const cardScale = useSharedValue(unlocked && !isNewUnlock ? 1 : 0.8);
  const cardOpacity = useSharedValue(unlocked && !isNewUnlock ? 1 : 0.4);
  const shimmerX = useSharedValue(-100);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isNewUnlock && !hasTriggered.current) {
      hasTriggered.current = true;

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Scale pop animation
      cardScale.value = withSequence(
        withTiming(0.6, { duration: 0 }),
        withSpring(1.15, { damping: 6, stiffness: 150 }),
        withSpring(1, { damping: 10 })
      );

      // Fade in
      cardOpacity.value = withTiming(1, { duration: 300 });

      // Shimmer sweep
      shimmerX.value = withDelay(
        400,
        withTiming(200, { duration: 600, easing: Easing.inOut(Easing.ease) })
      );

      // Glow pulse
      glowOpacity.value = withDelay(
        300,
        withSequence(
          withTiming(0.8, { duration: 300 }),
          withTiming(0, { duration: 1000 }),
        )
      );
    } else if (unlocked) {
      cardScale.value = withTiming(1, { duration: 200 });
      cardOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [isNewUnlock, unlocked]);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        cardAnimStyle,
        {
          backgroundColor: unlocked
            ? withOpacity(c.accentGreen, 0.06)
            : c.bgCard,
          borderColor: unlocked
            ? withOpacity(c.accentGreen, 0.2)
            : c.borderDefault,
        },
      ]}
    >
      {/* Glow effect on unlock */}
      {isNewUnlock && (
        <Animated.View
          style={[styles.glow, glowStyle, { backgroundColor: c.accentGreen }]}
        />
      )}

      {/* Shimmer sweep */}
      {isNewUnlock && (
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      )}

      {/* Icon */}
      <Text style={[styles.icon, !unlocked && styles.lockedIcon]}>
        {unlocked ? icon : '🔒'}
      </Text>

      {/* Name */}
      <Text
        style={[
          styles.name,
          { color: unlocked ? c.textPrimary : c.textDim },
        ]}
        numberOfLines={2}
      >
        {name}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '31%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    flexGrow: 1,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: -30,
    marginTop: -30,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    transform: [{ skewX: '-20deg' }],
  },
  icon: {
    fontSize: 20,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  name: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
});
