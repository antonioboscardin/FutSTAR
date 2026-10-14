// FutStar — StreakFlame
// Chama de fogo animada com flickering suave
// Usa react-native-reanimated para animações nativas

import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { useAppContext } from '../store/progress';
import { withOpacity } from '../constants/theme';
import { t } from '../i18n';

interface StreakFlameProps {
  size?: 'sm' | 'lg';
}

export default function StreakFlame({ size = 'lg' }: StreakFlameProps) {
  const { streak, theme } = useAppContext();
  const c = theme.colors;

  // Flame flickering animation
  const flameScale = useSharedValue(1);
  const flameRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  // Particle animations (for streak 7+)
  const particle1Y = useSharedValue(0);
  const particle1Opacity = useSharedValue(0);
  const particle2Y = useSharedValue(0);
  const particle2Opacity = useSharedValue(0);
  const particle3Y = useSharedValue(0);
  const particle3Opacity = useSharedValue(0);

  useEffect(() => {
    // Flame flicker
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.95, { duration: 350, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.08, { duration: 300, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 350, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, // infinite
      false
    );

    // Slight rotation wobble
    flameRotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        withTiming(-5, { duration: 600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true
    );

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.2, { duration: 800 }),
      ),
      -1,
      true
    );

    // Particles (only if streak >= 7)
    if (streak >= 7) {
      const animateParticle = (y: SharedValue<number>, opacity: SharedValue<number>, delay: number) => {
        y.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(-30, { duration: 1000 + delay }),
          ),
          -1,
          false
        );
        opacity.value = withRepeat(
          withSequence(
            withTiming(0.8, { duration: 200 }),
            withTiming(0, { duration: 800 + delay }),
          ),
          -1,
          false
        );
      };
      animateParticle(particle1Y, particle1Opacity, 0);
      animateParticle(particle2Y, particle2Opacity, 300);
      animateParticle(particle3Y, particle3Opacity, 600);
    }
  }, [streak]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: flameScale.value },
      { rotate: `${flameRotate.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const particle1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particle1Y.value }, { translateX: -8 }],
    opacity: particle1Opacity.value,
  }));

  const particle2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particle2Y.value }, { translateX: 6 }],
    opacity: particle2Opacity.value,
  }));

  const particle3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: particle3Y.value }, { translateX: 0 }],
    opacity: particle3Opacity.value,
  }));

  // Colors based on streak level
  const getStreakConfig = () => {
    if (streak === 0) return { color: c.textDim, label: t('streak_start'), bg: c.bgCard };
    if (streak < 7) return { color: '#FB923C', label: t('streak_warming'), bg: withOpacity('#FB923C', 0.08) };
    return { color: '#EF4444', label: t('streak_fire'), bg: withOpacity('#EF4444', 0.08) };
  };

  const config = getStreakConfig();
  const isLarge = size === 'lg';
  const flameSize = isLarge ? 44 : 24;
  const numSize = isLarge ? 36 : 18;

  return (
    <View style={[styles.container, isLarge && styles.containerLg, { backgroundColor: config.bg, borderColor: withOpacity(config.color, 0.2) }]}>
      {/* Glow */}
      {streak > 0 && (
        <Animated.View style={[styles.glow, glowStyle, { backgroundColor: config.color }]} />
      )}

      {/* Flame */}
      <Animated.View style={[flameStyle]}>
        <Text style={{ fontSize: flameSize }}>
          {streak === 0 ? '💤' : '🔥'}
        </Text>
      </Animated.View>

      {/* Particles (streak 7+) */}
      {streak >= 7 && (
        <View style={styles.particlesContainer}>
          <Animated.View style={[styles.particle, particle1Style, { backgroundColor: '#FCA5A5' }]} />
          <Animated.View style={[styles.particle, particle2Style, { backgroundColor: '#FDBA74' }]} />
          <Animated.View style={[styles.particle, particle3Style, { backgroundColor: '#FDE68A' }]} />
        </View>
      )}

      {/* Number */}
      <Text style={[styles.number, { color: config.color, fontSize: numSize }]}>
        {streak}
      </Text>

      {/* Label */}
      {isLarge && (
        <Text style={[styles.label, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    overflow: 'hidden',
  },
  containerLg: {
    flexDirection: 'column',
    padding: 16,
    borderRadius: 20,
    gap: 4,
  },
  glow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
  },
  number: {
    fontWeight: '900',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
  particlesContainer: {
    position: 'absolute',
    top: 8,
    left: '50%',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
