// FutStar — PressableScale
// Botão com micro-animação de scale ao pressionar
// Substituição premium do TouchableOpacity para botões importantes

import { useRef, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  type ViewStyle,
  type StyleProp,
} from 'react-native';

interface PressableScaleProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  scaleDown?: number;    // default 0.96
  disabled?: boolean;
  activeOpacity?: number; // default 0.9
}

export default function PressableScale({
  onPress,
  style,
  children,
  scaleDown = 0.96,
  disabled = false,
  activeOpacity = 0.9,
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: scaleDown,
      friction: 8,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
