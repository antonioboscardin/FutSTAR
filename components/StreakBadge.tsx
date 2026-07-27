// FutStar — StreakBadge
// Exibe o streak de dias consecutivos com visual de fogo

import { View, Text, StyleSheet } from 'react-native';
import { useAppContext } from '../store/progress';

interface StreakBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function StreakBadge({ size = 'md' }: StreakBadgeProps) {
  const { streak, theme } = useAppContext();
  const c = theme.colors;

  const isActive = streak > 0;
  const bgColor = isActive ? '#431407' : c.bgCard;
  const borderCol = isActive ? '#fb923c33' : c.borderDefault;
  const textColor = isActive ? '#fb923c' : c.textDim;

  const sizeConfig = {
    sm: { pad: 6, gap: 3, emoji: 12, text: 10, num: 12 },
    md: { pad: 8, gap: 5, emoji: 14, text: 11, num: 16 },
    lg: { pad: 10, gap: 6, emoji: 18, text: 12, num: 20 },
  }[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderColor: borderCol,
          paddingHorizontal: sizeConfig.pad + 4,
          paddingVertical: sizeConfig.pad,
          gap: sizeConfig.gap,
        },
      ]}
    >
      <Text style={{ fontSize: sizeConfig.emoji }}>🔥</Text>
      <Text
        style={[
          styles.number,
          {
            color: textColor,
            fontSize: sizeConfig.num,
          },
        ]}
      >
        {streak}
      </Text>
      {size !== 'sm' && (
        <Text
          style={[
            styles.label,
            {
              color: textColor,
              fontSize: sizeConfig.text,
            },
          ]}
        >
          {streak === 1 ? 'dia' : 'dias'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },
  number: {
    fontWeight: '900',
  },
  label: {
    fontWeight: '600',
  },
});
