// FutStar — WeekMark (v2)
// Per-day training completion system:
// - Each training day (SEG, QUI, SAB) gets its own "Treino concluído ✅" button
// - Rest days show 💤 icon only, no button
// - Today is highlighted with colored border
// - Future days are dimmed (opacity 0.5) but still clickable
// - Week auto-completes ✅ when all training days are marked
// - Phase progress bar recalculates based on individual days marked

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppContext, type TrainingResult } from '../store/progress';
import { PHASES, TRAINING_DAY_INDICES } from '../data/phases';
import { withOpacity } from '../constants/theme';

interface WeekMarkProps {
  phaseIndex: number;
  dayColor: string;
  onTrainingComplete?: (result: TrainingResult, weekIndex: number) => void;
}

// Map JS Date.getDay() (0=Sun,1=Mon...6=Sat) to our day index in the week array (0=SEG...6=DOM)
function getTodayDayIndex(): number {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon...6=Sat
  // Our array: 0=SEG, 1=TER, 2=QUA, 3=QUI, 4=SEX, 5=SAB, 6=DOM
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default function WeekMark({
  phaseIndex,
  dayColor,
  onTrainingComplete,
}: WeekMarkProps) {
  const {
    theme,
    isTrainingDone,
    getTrainingDate,
    toggleTraining,
    isWeekFullyComplete,
  } = useAppContext();
  const c = theme.colors;
  const phase = PHASES[phaseIndex];
  const todayIndex = getTodayDayIndex();

  const weeks = [
    { label: '1ª Semana', weekIndex: 0 },
    { label: '2ª Semana', weekIndex: 1 },
  ];

  return (
    <View style={styles.container}>
      {weeks.map((week) => {
        const weekComplete = isWeekFullyComplete(phaseIndex, week.weekIndex);

        return (
          <View key={week.weekIndex} style={styles.weekSection}>
            {/* Week header */}
            <View
              style={[
                styles.weekHeader,
                {
                  backgroundColor: weekComplete ? '#052e16' : c.bgElevated,
                  borderColor: weekComplete
                    ? withOpacity('#4ade80', 0.3)
                    : c.borderDefault,
                },
              ]}
            >
              <Text
                style={[
                  styles.weekHeaderText,
                  { color: weekComplete ? '#4ade80' : c.textSecondary },
                ]}
              >
                {weekComplete ? `✅ ${week.label} Completa!` : week.label}
              </Text>
              {weekComplete && (
                <Text style={styles.weekBonusText}>+200 XP 🏆</Text>
              )}
            </View>

            {/* Days grid */}
            <View style={[styles.daysGrid, { borderColor: c.borderDefault }]}>
              {phase.days.map((day, dayIdx) => {
                const isTraining = day.type === 'treino';
                const isToday = dayIdx === todayIndex;
                const isFuture = dayIdx > todayIndex;
                const done = isTraining && isTrainingDone(phaseIndex, week.weekIndex, dayIdx);
                const date = isTraining ? getTrainingDate(phaseIndex, week.weekIndex, dayIdx) : null;

                return (
                  <View
                    key={dayIdx}
                    style={[
                      styles.dayItem,
                      {
                        backgroundColor: done
                          ? '#061a0f'
                          : isToday
                            ? withOpacity(dayColor, 0.06)
                            : c.bgCard,
                        borderColor: isToday
                          ? dayColor
                          : done
                            ? withOpacity('#4ade80', 0.2)
                            : c.borderDefault,
                        borderWidth: isToday ? 2 : 1,
                        opacity: isFuture && !done ? 0.5 : 1,
                      },
                      dayIdx === phase.days.length - 1 && styles.dayItemLast,
                    ]}
                  >
                    <View style={styles.dayInfo}>
                      <Text style={[styles.dayShortName, { color: done ? '#4ade80' : isToday ? dayColor : c.textSecondary }]}>
                        {day.shortName}
                      </Text>
                      {isToday && (
                        <View style={[styles.todayBadge, { backgroundColor: withOpacity(dayColor, 0.15) }]}>
                          <Text style={[styles.todayBadgeText, { color: dayColor }]}>HOJE</Text>
                        </View>
                      )}
                    </View>

                    {isTraining ? (
                      done ? (
                        <View style={styles.doneRow}>
                          <Text style={styles.doneIcon}>✅</Text>
                          <Text style={[styles.doneDate, { color: withOpacity('#4ade80', 0.5) }]}>
                            {date}
                          </Text>
                          <TouchableOpacity
                            onPress={() => toggleTraining(phaseIndex, week.weekIndex, dayIdx)}
                            activeOpacity={0.5}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Text style={[styles.undoText, { color: withOpacity('#4ade80', 0.25) }]}>
                              desfazer
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={async () => {
                            const result = await toggleTraining(phaseIndex, week.weekIndex, dayIdx);
                            onTrainingComplete?.(result, week.weekIndex);
                          }}
                          activeOpacity={0.7}
                          style={[
                            styles.completeBtn,
                            {
                              backgroundColor: withOpacity(day.color, 0.12),
                              borderColor: withOpacity(day.color, 0.25),
                            },
                          ]}
                        >
                          <Text style={[styles.completeBtnText, { color: day.color }]}>
                            Treino concluído ✅
                          </Text>
                        </TouchableOpacity>
                      )
                    ) : (
                      <View style={styles.restRow}>
                        <Text style={styles.restEmoji}>💤</Text>
                        <Text style={[styles.restText, { color: c.textDim }]}>
                          {day.focus}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    gap: 12,
  },
  weekSection: {},
  weekHeader: {
    borderWidth: 1,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekHeaderText: {
    fontSize: 12,
    fontWeight: '800',
  },
  weekBonusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fbbf24',
  },
  daysGrid: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  dayItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  dayItemLast: {
    borderBottomWidth: 0,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 70,
  },
  dayShortName: {
    fontSize: 12,
    fontWeight: '800',
    minWidth: 32,
  },
  todayBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  doneIcon: {
    fontSize: 14,
  },
  doneDate: {
    fontSize: 9,
  },
  undoText: {
    fontSize: 9,
  },
  completeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  completeBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  restEmoji: {
    fontSize: 14,
  },
  restText: {
    fontSize: 10,
  },
});
