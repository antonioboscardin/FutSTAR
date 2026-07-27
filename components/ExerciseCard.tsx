// FutStar — ExerciseCard
// Card expandível de exercício com border-left colorida pela tag
// Mostra: nome, tag badge, duração, séries (collapsed)
// Expandido: descrição detalhada + dica técnica

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAppContext } from '../store/progress';
import { TAGS } from '../constants/tags';
import { withOpacity } from '../constants/theme';
import type { Exercise } from '../data/phases';

interface ExerciseCardProps {
  exercise: Exercise;
  dayColor: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ExerciseCard({
  exercise,
  dayColor,
  isExpanded,
  onToggle,
}: ExerciseCardProps) {
  const { theme } = useAppContext();
  const c = theme.colors;
  const tag = TAGS[exercise.tag];
  const tagBg = theme.mode === 'pro' ? tag.bgPro : tag.bgKids;

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: c.bgCard,
          borderColor: isExpanded
            ? withOpacity(dayColor, 0.22)
            : c.borderDefault,
          borderLeftColor: tag.color,
        },
      ]}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={[styles.exerciseName, { color: c.textPrimary }]}>
            {exercise.name}
          </Text>
          <View style={styles.metaRow}>
            {/* Tag badge */}
            <View
              style={[
                styles.tagBadge,
                {
                  backgroundColor: tagBg,
                  borderColor: withOpacity(tag.color, 0.16),
                },
              ]}
            >
              <Text style={[styles.tagText, { color: tag.color }]}>
                {tag.label}
              </Text>
            </View>

            {/* Duration */}
            {exercise.duration && exercise.duration !== '-' && (
              <Text style={[styles.metaText, { color: c.textDim }]}>
                ⏱ {exercise.duration}
              </Text>
            )}

            {/* Sets */}
            {exercise.sets && (
              <Text
                style={[
                  styles.metaText,
                  { color: dayColor, fontWeight: '700' },
                ]}
              >
                📋 {exercise.sets}
              </Text>
            )}
          </View>
        </View>

        {/* Expand indicator */}
        <Text style={[styles.expandArrow, { color: isExpanded ? dayColor : c.textDim }]}>
          {isExpanded ? '▲' : '▼'}
        </Text>
      </View>

      {/* Expanded content */}
      {isExpanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.expandedContent, { borderTopColor: c.borderDefault }]}
        >
          <Text style={[styles.description, { color: c.textSecondary }]}>
            {exercise.description}
          </Text>

          {exercise.tip && (
            <View
              style={[
                styles.tipBox,
                {
                  backgroundColor: theme.mode === 'pro' ? '#110f00' : '#FFFDE7',
                  borderColor: withOpacity('#fbbf24', 0.09),
                },
              ]}
            >
              <Text style={styles.tipIcon}>💡</Text>
              <Text
                style={[
                  styles.tipText,
                  { color: '#fbbf24' },
                ]}
              >
                {exercise.tip}
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: 11,
    padding: 11,
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  exerciseName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 5,
  },
  tagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 10,
  },
  expandArrow: {
    fontSize: 11,
    flexShrink: 0,
    marginTop: 2,
  },
  expandedContent: {
    marginTop: 11,
    borderTopWidth: 1,
    paddingTop: 11,
  },
  description: {
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 9,
  },
  tipBox: {
    flexDirection: 'row',
    gap: 7,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
  },
  tipIcon: {
    fontSize: 12,
    flexShrink: 0,
  },
  tipText: {
    fontSize: 11,
    lineHeight: 18,
    flex: 1,
  },
});
