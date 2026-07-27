// FutStar — Onboarding (3 slides animados)
// Exibido apenas na 1ª vez que o app é aberto

import { useState, useRef } from 'react';
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
  withSpring,
  withTiming,
  interpolate,
  FadeIn,
  FadeInDown,
  FadeInUp,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
  accentColor: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    emoji: '⚽',
    title: 'Treinos profissionais\nno seu bolso',
    subtitle: 'Exercícios detalhados criados para te\ntransformar no jogador que você sonha ser.',
    gradient: ['#052e16', '#060b14'],
    accentColor: '#4ade80',
  },
  {
    id: '2',
    emoji: '🏆',
    title: 'Evolua na\nsua posição',
    subtitle: 'Treinos específicos para cada posição.\nPonta, centroavante, meia — você escolhe.',
    gradient: ['#1e1b4b', '#060b14'],
    accentColor: '#a78bfa',
  },
  {
    id: '3',
    emoji: '🌍',
    title: 'Compete com jogadores\ndo mundo todo',
    subtitle: 'Ranking, conquistas e XP.\nSua evolução nunca mais será invisível.',
    gradient: ['#431407', '#060b14'],
    accentColor: '#fb923c',
  },
];

interface SlideItemProps {
  item: Slide;
  index: number;
  scrollX: SharedValue<number>;
}

function SlideItem({ item, index, scrollX }: SlideItemProps) {
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

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);

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

  const handleStart = () => {
    router.replace('/cadastro' as any);
  };

  // Button animated style
  const buttonAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(1) }],
    };
  });

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item, index }) => (
          <SlideItem item={item} index={index} scrollX={scrollX} />
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
            <Text style={styles.skipText}>Pular</Text>
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
                ? ['#4ade80', '#22c55e']
                : [SLIDES[currentIndex].accentColor, SLIDES[currentIndex].accentColor + 'cc']
            }
            style={styles.nextButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? 'Começar agora 🚀' : 'Próximo →'}
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
    backgroundColor: '#060b14',
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
    backgroundColor: '#0d1422',
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
    color: '#060b14',
    letterSpacing: 0.3,
  },
  brandingText: {
    fontSize: 11,
    color: '#1e3050',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
