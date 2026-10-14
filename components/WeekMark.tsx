// FutStar — WeekMark (v2)
// Per-day training completion system:
// - Each training day (SEG, QUI, SAB) gets its own "Treino concluído ✅" button
// - Rest days show 💤 icon only, no button
// - Today is highlighted with colored border
// - Future days are dimmed and NOT clickable
// - Week auto-completes ✅ when all training days are marked
// - Phase progress bar recalculates based on individual days marked

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppContext, type TrainingResult } from '../store/progress';
import { PHASES, TRAINING_DAY_INDICES } from '../data/phases';
import { withOpacity } from '../constants/theme';
import { t } from '../i18n';

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
    { label: t('treinos_week1'), weekIndex: 0 },
    { label: t('treinos_week2'), weekIndex: 1 },
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
                  backgroundColor: weekComplete
                    ? withOpacity(c.accentGreen, theme.mode === 'pro' ? 0.08 : 0.06)
                    : c.bgElevated,
                  borderColor: weekComplete
                    ? withOpacity(c.accentGreen, 0.3)
                    : c.borderDefault,
                },
              ]}
            >
              <Text
                style={[
                  styles.weekHeaderText,
                  { color: weekComplete ? c.accentGreen : c.textSecondary },
                ]}
              >
                {weekComplete ? t('treinos_week_complete', { label: week.label }) : week.label}
              </Text>
              {weekComplete && (
                <Text style={[styles.weekBonusText, { color: c.accentYellow }]}>{t('treinos_week_star')}</Text>
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
                          ? withOpacity(c.accentGreen, theme.mode === 'pro' ? 0.06 : 0.04)
                          : isToday
                            ? withOpacity(dayColor, 0.06)
                            : c.bgCard,
                        borderColor: isToday
                          ? dayColor
                          : done
                            ? withOpacity(c.accentGreen, 0.2)
                            : c.borderDefault,
                        borderWidth: isToday ? 2 : 1,
                        opacity: isFuture && !done ? 0.4 : 1,
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
                          <Text style={[styles.todayBadgeText, { color: dayColor }]}>{t('treinos_today')}</Text>
                        </View>
                      )}
                    </View>

                    {isTraining ? (
                      done ? (
                        <View style={styles.doneRow}>
                          <Text style={styles.doneIcon}>✅</Text>
                          <Text style={[styles.doneDate, { color: withOpacity(c.accentGreen, 0.5) }]}>
                            {date}
                          </Text>
                          <TouchableOpacity
                            onPress={() => toggleTraining(phaseIndex, week.weekIndex, dayIdx)}
                            activeOpacity={0.5}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Text style={[styles.undoText, { color: withOpacity(c.accentGreen, 0.25) }]}>
                              {t('treinos_undo')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        isFuture ? (
                          <Text style={[styles.futureText, { color: c.textDim }]}>—</Text>
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
                              {t('treinos_training_done')}
                            </Text>
                          </TouchableOpacity>
                        )
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
  },
  futureText: {
    fontSize: 11,
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
