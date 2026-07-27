// FutStar — DaySelector
// Scroll horizontal com os 7 dias da semana
// Indicadores: ● verde = completo, ● amarelo = parcial
// Destaque do dia de hoje com borda colorida

import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAppContext } from '../store/progress';
import { withOpacity } from '../constants/theme';
import type { TrainingDay } from '../data/phases';

interface DaySelectorProps {
  days: TrainingDay[];
  selectedDay: number;
  phaseIndex: number;
  onSelectDay: (index: number) => void;
}

// Map JS Date.getDay() (0=Sun,1=Mon...6=Sat) to our day index (0=SEG...6=DOM)
function getTodayDayIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default function DaySelector({
  days,
  selectedDay,
  phaseIndex,
  onSelectDay,
}: DaySelectorProps) {
  const { theme, getWeekStatus } = useAppContext();
  const c = theme.colors;
  const scrollRef = useRef<ScrollView>(null);
  const todayIndex = getTodayDayIndex();

  // Auto-scroll to selected day
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: selectedDay * 52, animated: true });
    }
  }, [selectedDay]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {days.map((day, i) => {
        const selected = i === selectedDay;
        const isToday = i === todayIndex;
        const isFuture = i > todayIndex;
        const status =
          day.type === 'treino' ? getWeekStatus(phaseIndex, i) : 'none';

        return (
          <TouchableOpacity
            key={i}
            onPress={() => onSelectDay(i)}
            activeOpacity={0.7}
            style={[
              styles.dayButton,
              {
                backgroundColor: selected ? c.bgPrimary : 'transparent',
                borderBottomColor: selected ? day.color : 'transparent',
                borderColor: isToday
                  ? day.color
                  : 'transparent',
                borderWidth: isToday ? 1.5 : 0,
                borderBottomWidth: selected ? 2 : isToday ? 1.5 : 0,
                opacity: isFuture && status === 'none' ? 0.5 : 1,
              },
            ]}
          >
            <Text style={[styles.dayIcon, { opacity: selected ? 1 : 0.5 }]}>
              {day.icon}
            </Text>
            <Text
              style={[
                styles.dayLabel,
                {
                  color: selected ? day.color : isToday ? day.color : c.textDim,
                  fontWeight: selected ? '800' : isToday ? '700' : '500',
                },
              ]}
            >
              {day.shortName}
            </Text>

            {/* Today dot */}
            {isToday && !selected && (
              <View
                style={[
                  styles.todayDot,
                  { backgroundColor: day.color },
                ]}
              />
            )}

            {/* Status dot */}
            {status !== 'none' && (
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      status === 'both' ? '#4ade80' : '#fbbf24',
                    borderColor: c.bgPrimary,
                  },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 3,
    paddingRight: 8,
    marginBottom: 12,
  },
  dayButton: {
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 9,
    alignItems: 'center',
    gap: 2,
    minWidth: 42,
    position: 'relative',
  },
  dayIcon: {
    fontSize: 14,
  },
  dayLabel: {
    fontSize: 9,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
  },
  statusDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});
