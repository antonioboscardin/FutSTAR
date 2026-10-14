// FutStar — AnimatedEntrance
// Wrapper para micro-animações de entrada em listas e cards
// Suporta: fade-in, slide-in-right, slide-in-up, scale-in
// Com suporte a stagger delay para listas

import { type ReactNode } from 'react';
import Animated, {
  FadeIn,
  FadeInRight,
  FadeInDown,
  ZoomIn,
  type AnimatedProps,
} from 'react-native-reanimated';
import { type ViewStyle, type StyleProp } from 'react-native';

type AnimationType = 'fade' | 'slide-right' | 'slide-up' | 'scale';

interface AnimatedEntranceProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;         // ms delay before animation
  index?: number;         // for stagger: auto-calculates delay
  staggerMs?: number;     // ms between each item in stagger (default 80)
  duration?: number;      // animation duration in ms (default 400)
  style?: StyleProp<ViewStyle>;
}

export default function AnimatedEntrance({
  children,
  animation = 'fade',
  delay = 0,
  index,
  staggerMs = 80,
  duration = 400,
  style,
}: AnimatedEntranceProps) {
  const totalDelay = delay + (index !== undefined ? index * staggerMs : 0);

  const getEntering = () => {
    switch (animation) {
      case 'slide-right':
        return FadeInRight.delay(totalDelay).duration(duration).springify().damping(15);
      case 'slide-up':
        return FadeInDown.delay(totalDelay).duration(duration).springify().damping(15);
      case 'scale':
        return ZoomIn.delay(totalDelay).duration(duration).springify().damping(12);
      case 'fade':
      default:
        return FadeIn.delay(totalDelay).duration(duration);
    }
  };

  return (
    <Animated.View entering={getEntering()} style={style}>
      {children}
    </Animated.View>
  );
}
