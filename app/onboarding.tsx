// FutStar — Onboarding (4 slides interativos)
// Slide 1: Boas-vindas
// Slide 2: Objetivo do jogador (selecionável)
// Slide 3: Sistema de treinos/progresso
// Slide 4: Permissão de notificações

import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  type ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  FadeInUp,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestNotifPermission } from '../services/notifications';
import { t } from '../i18n';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
  accentColor: string;
  type: 'info' | 'objective' | 'notif';
}

const SLIDES: Slide[] = [
  {
    id: '1',
    emoji: '⚽',
    title: t('onboarding_s1_title'),
    subtitle: t('onboarding_s1_sub'),
    gradient: ['#0b2218', '#06100a'],
    accentColor: '#2aff9e',
    type: 'info',
  },
  {
    id: '2',
    emoji: '🎯',
    title: t('onboarding_s2_title'),
    subtitle: t('onboarding_s2_sub'),
    gradient: ['#1e1b4b', '#06100a'],
    accentColor: '#a78bfa',
    type: 'objective',
  },
  {
    id: '3',
    emoji: '🏆',
    title: t('onboarding_s3_title'),
    subtitle: t('onboarding_s3_sub'),
    gradient: ['#431407', '#06100a'],
    accentColor: '#fb923c',
    type: 'info',
  },
  {
    id: '4',
    emoji: '🔔',
    title: t('onboarding_s4_title'),
    subtitle: t('onboarding_s4_sub'),
    gradient: ['#0c4a6e', '#06100a'],
    accentColor: '#38bdf8',
    type: 'notif',
  },
];

const OBJECTIVES = [
  { key: 'tecnica', emoji: '🎯', labelKey: 'onboarding_obj_tecnica' },
  { key: 'velocidade', emoji: '⚡', labelKey: 'onboarding_obj_velocidade' },
  { key: 'forca', emoji: '💪', labelKey: 'onboarding_obj_forca' },
  { key: 'coletivo', emoji: '🤝', labelKey: 'onboarding_obj_coletivo' },
];

// ---- Slide Item ----

interface SlideItemProps {
  item: Slide;
  index: number;
  scrollX: SharedValue<number>;
  selectedObjective: string | null;
  onSelectObjective: (key: string) => void;
  notifGranted: boolean | null;
  onRequestNotif: () => void;
}

function SlideItem({
  item, index, scrollX,
  selectedObjective, onSelectObjective,
  notifGranted, onRequestNotif,
}: SlideItemProps) {
  const animStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];
    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], 'clamp');
    const translateY = interpolate(scrollX.value, inputRange, [30, 0, 30], 'clamp');

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  return (
    <View style={styles.slideContainer}>
      <LinearGradient
        colors={item.gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />
      <Animated.View style={[styles.slideContent, animStyle]}>
        {/* Glow circle behind emoji */}
        <View style={[styles.emojiGlow, { shadowColor: item.accentColor }]}>
          <View style={[styles.emojiRing, { borderColor: item.accentColor + '22' }]}>
            <Text style={styles.slideEmoji}>{item.emoji}</Text>
          </View>
        </View>

        <Text style={[styles.slideTitle, { color: '#f1f5f9' }]}>
          {item.title}
        </Text>
        <Text style={[styles.slideSubtitle, { color: '#64748b' }]}>
          {item.subtitle}
        </Text>

        {/* Objective selector (slide 2) */}
        {item.type === 'objective' && (
          <View style={styles.objectiveGrid}>
            {OBJECTIVES.map(obj => {
              const isSelected = selectedObjective === obj.key;
              return (
                <TouchableOpacity
                  key={obj.key}
                  onPress={() => onSelectObjective(obj.key)}
                  activeOpacity={0.7}
                  style={[
                    styles.objectiveBtn,
                    {
                      backgroundColor: isSelected
                        ? item.accentColor + '20'
                        : '#0d1f17',
                      borderColor: isSelected
                        ? item.accentColor
                        : '#1a2840',
                    },
                  ]}
                >
                  <Text style={styles.objectiveEmoji}>{obj.emoji}</Text>
                  <Text style={[
                    styles.objectiveLabel,
                    {
                      color: isSelected ? item.accentColor : '#94a3b8',
                      fontWeight: isSelected ? '800' : '500',
                    },
                  ]}>
                    {t(obj.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Notification request (slide 4) */}
        {item.type === 'notif' && (
          <View style={styles.notifSection}>
            {notifGranted === null ? (
              <TouchableOpacity
                onPress={onRequestNotif}
                activeOpacity={0.8}
                style={[styles.notifBtn, { backgroundColor: item.accentColor }]}
              >
                <Text style={styles.notifBtnText}>{t('onboarding_notif_allow')}</Text>
              </TouchableOpacity>
            ) : notifGranted ? (
              <View style={[styles.notifStatus, { borderColor: '#2aff9e' + '44' }]}>
                <Text style={[styles.notifStatusText, { color: '#2aff9e' }]}>
                  ✅ {t('onboarding_notif_granted')}
                </Text>
              </View>
            ) : (
              <View style={[styles.notifStatus, { borderColor: '#fb923c' + '44' }]}>
                <Text style={[styles.notifStatusText, { color: '#fb923c' }]}>
                  {t('onboarding_notif_denied')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Decorative accent line */}
        <View
          style={[styles.accentLine, { backgroundColor: item.accentColor + '33' }]}
        >
          <View
            style={[styles.accentLineFill, { backgroundColor: item.accentColor }]}
          />
        </View>
      </Animated.View>
    </View>
  );
}

// ---- Main Screen ----

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (isLastSlide) {
      handleStart();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleStart = async () => {
    // Save objective if selected
    if (selectedObjective) {
      try {
        await AsyncStorage.setItem('futstar_onboarding_objective', selectedObjective);
      } catch {}
    }
    router.replace('/cadastro' as any);
  };

  const handleRequestNotif = async () => {
    const granted = await requestNotifPermission();
    setNotifGranted(granted);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item, index }) => (
          <SlideItem
            item={item}
            index={index}
            scrollX={scrollX}
            selectedObjective={selectedObjective}
            onSelectObjective={setSelectedObjective}
            notifGranted={notifGranted}
            onRequestNotif={handleRequestNotif}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Bottom controls */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(600)}
        style={styles.bottomContainer}
      >
        {/* Skip button */}
        {!isLastSlide && (
          <TouchableOpacity
            onPress={handleStart}
            style={styles.skipButton}
            activeOpacity={0.6}
          >
            <Text style={styles.skipText}>{t('onboarding_skip')}</Text>
          </TouchableOpacity>
        )}

        {/* Dot indicators */}
        <View style={styles.dotContainer}>
          {SLIDES.map((slide, i) => {
            const isActive = i === currentIndex;
            return (
              <View
                key={slide.id}
                style={[
                  styles.dot,
                  {
                    backgroundColor: isActive
                      ? SLIDES[currentIndex].accentColor
                      : '#1e3050',
                    width: isActive ? 28 : 8,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Next / Start button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={styles.nextButtonOuter}
        >
          <LinearGradient
            colors={
              isLastSlide
                ? ['#01875f', '#2aff9e']
                : [SLIDES[currentIndex].accentColor, SLIDES[currentIndex].accentColor + 'cc']
            }
            style={styles.nextButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? t('onboarding_start') : t('onboarding_next')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* FutStar branding */}
        <Text style={styles.brandingText}>FutStar ⚽</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06100a',
  },
  slideContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: -60,
  },
  emojiGlow: {
    marginBottom: 32,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  emojiRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    backgroundColor: '#0d1f17',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideEmoji: {
    fontSize: 56,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  slideSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  // Objective selector
  objectiveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  objectiveBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: '42%',
    justifyContent: 'center',
  },
  objectiveEmoji: {
    fontSize: 18,
  },
  objectiveLabel: {
    fontSize: 13,
  },
  // Notification section
  notifSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  notifBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  notifBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#06100a',
  },
  notifStatus: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  notifStatusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Accent line
  accentLine: {
    width: 60,
    height: 3,
    borderRadius: 3,
    overflow: 'hidden',
  },
  accentLineFill: {
    width: '50%',
    height: '100%',
    borderRadius: 3,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: -40,
    right: 24,
  },
  skipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButtonOuter: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  nextButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#06100a',
    letterSpacing: 0.3,
  },
  brandingText: {
    fontSize: 11,
    color: '#1e3050',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
