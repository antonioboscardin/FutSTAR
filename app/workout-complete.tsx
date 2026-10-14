// FutStar — Tela de Vitória ao Completar Treino
// Celebração fullscreen com confetti, XP animado, streak e conquistas

import { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  withSpring,
  Easing,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppContext } from '../store/progress';
import { withOpacity } from '../constants/theme';
import ConfettiOverlay from '../components/ConfettiOverlay';
import PressableScale from '../components/PressableScale';
import { t } from '../i18n';
import { useRequestReview } from '../hooks/useRequestReview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WorkoutCompleteScreen() {
  const { theme, streak, xp, unlockedAchievements } = useAppContext();
  const c = theme.colors;
  const router = useRouter();
  const params = useLocalSearchParams<{
    xpGained?: string;
    achievement?: string;
    achievementIcon?: string;
    weekComplete?: string;
    phaseComplete?: string;
  }>();

  const xpGained = parseInt(params.xpGained || '0', 10);
  const achievement = params.achievement || null;
  const achievementIcon = params.achievementIcon || '🏆';
  const weekComplete = params.weekComplete === 'true';
  const phaseComplete = params.phaseComplete === 'true';

  // XP counter animation
  const [displayXP, setDisplayXP] = useState(0);
  const counterRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Animated values
  const trophyScale = useSharedValue(0);
  const trophyRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const { requestReview } = useRequestReview();

  useEffect(() => {
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Trophy bounce in
    trophyScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withDelay(300, withSpring(1.2, { damping: 8, stiffness: 100 })),
      withSpring(1, { damping: 12 })
    );

    // Trophy gentle wobble
    trophyRotate.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(5, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true
      )
    );

    // Glow pulse
    glowOpacity.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1200 }),
          withTiming(0.2, { duration: 1200 }),
        ),
        -1,
        true
      )
    );

    // XP counter
    const duration = 1200;
    const startTime = Date.now();
    const startDelay = 800;

    const timeout = setTimeout(() => {
      counterRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime - startDelay;
        const progress = Math.min(elapsed / duration, 1);
        // Eased progress
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayXP(Math.round(eased * xpGained));

        if (progress >= 1) {
          clearInterval(counterRef.current);
          setDisplayXP(xpGained);
        }
      }, 16);
    }, startDelay);

    // Request store review after celebration (delay para não interromper a animação)
    const reviewTimeout = setTimeout(() => {
      requestReview();
    }, 3000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(reviewTimeout);
      if (counterRef.current) clearInterval(counterRef.current);
    };
  }, []);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: trophyScale.value },
      { rotate: `${trophyRotate.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleShare = async () => {
    try {
      await Share.share({
        message: t('workout_complete_share_msg', {
          xp: xpGained,
          streak,
          total: xp,
        }),
      });
    } catch {}
  };

  const mainEmoji = phaseComplete ? '⭐' : weekComplete ? '🏆' : '🏆';
  const titleKey = phaseComplete
    ? 'workout_complete_phase'
    : weekComplete
    ? 'workout_complete_week'
    : 'workout_complete_title';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ConfettiOverlay visible={true} isPhaseComplete={phaseComplete} duration={3000} />

      <View style={styles.center}>
        {/* Glow */}
        <Animated.View
          style={[styles.glow, glowStyle, {
            backgroundColor: phaseComplete ? c.accentPurple : c.accentGreen,
          }]}
        />

        {/* Trophy */}
        <Animated.View style={trophyStyle}>
          <Text style={styles.trophyEmoji}>{mainEmoji}</Text>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeIn.delay(500).duration(400)}
          style={[styles.title, { color: c.textPrimary }]}
        >
          {t(titleKey)}
        </Animated.Text>

        {/* XP Gained */}
        <Animated.View
          entering={SlideInDown.delay(700).springify().damping(12)}
          style={[styles.xpCard, {
            backgroundColor: withOpacity('#FFD700', 0.08),
            borderColor: withOpacity('#FFD700', 0.2),
          }]}
        >
          <Text style={styles.xpLabel}>{t('workout_complete_xp_gained')}</Text>
          <Text style={styles.xpNumber}>+{displayXP} XP</Text>
        </Animated.View>

        {/* Streak */}
        <Animated.View
          entering={SlideInDown.delay(900).springify().damping(12)}
          style={[styles.streakCard, {
            backgroundColor: withOpacity(streak >= 7 ? '#EF4444' : '#FB923C', 0.08),
            borderColor: withOpacity(streak >= 7 ? '#EF4444' : '#FB923C', 0.2),
          }]}
        >
          <Text style={styles.streakFlame}>🔥</Text>
          <View>
            <Text style={[styles.streakNum, { color: streak >= 7 ? '#EF4444' : '#FB923C' }]}>
              {streak} {streak === 1 ? t('workout_complete_day') : t('workout_complete_days')}
            </Text>
            <Text style={[styles.streakLabel, { color: c.textDim }]}>
              {t('workout_complete_streak')}
            </Text>
          </View>
        </Animated.View>

        {/* Achievement unlocked */}
        {achievement && (
          <Animated.View
            entering={SlideInDown.delay(1100).springify().damping(12)}
            style={[styles.achievementCard, {
              backgroundColor: withOpacity(c.accentPurple, 0.08),
              borderColor: withOpacity(c.accentPurple, 0.2),
            }]}
          >
            <Text style={styles.achievementIcon}>{achievementIcon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.achievementLabel, { color: c.textDim }]}>
                {t('workout_complete_achievement')}
              </Text>
              <Text style={[styles.achievementName, { color: c.accentPurple }]}>
                {achievement}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Bottom buttons */}
      <Animated.View
        entering={FadeIn.delay(1300).duration(500)}
        style={styles.bottomButtons}
      >
        <PressableScale
          onPress={() => router.back()}
          style={[styles.continueBtn, { backgroundColor: c.accentGreen }]}
        >
          <Text style={[styles.continueBtnText, { color: c.textInverse }]}>
            {t('workout_complete_continue')}
          </Text>
        </PressableScale>

        <PressableScale
          onPress={handleShare}
          style={[styles.shareBtn, {
            borderColor: withOpacity(c.accentBlue, 0.3),
          }]}
        >
          <Text style={[styles.shareBtnText, { color: c.accentBlue }]}>
            📤 {t('workout_complete_share')}
          </Text>
        </PressableScale>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.15,
  },
  trophyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
  },
  xpCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  xpLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  xpNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFD700',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    width: '100%',
    marginBottom: 10,
  },
  streakFlame: {
    fontSize: 28,
  },
  streakNum: {
    fontSize: 18,
    fontWeight: '900',
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    width: '100%',
  },
  achievementIcon: {
    fontSize: 32,
  },
  achievementLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  bottomButtons: {
    padding: 20,
    gap: 10,
  },
  continueBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '900',
  },
  shareBtn: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
