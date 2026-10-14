// FutStar — Sleep Chart Component
// Gráfico semanal de barras horizontais (7 dias) usando View puro

import { View, Text, StyleSheet } from 'react-native';
import { useAppContext } from '../store/progress';
import { withOpacity } from '../constants/theme';
import { type SleepRecord, formatDuration, getSleepBarColor } from '../services/sleep';
import { t } from '../i18n';

const GOAL_MINUTES = 480; // 8h
const MAX_MINUTES = 660;  // 11h (escala máxima)
const DAY_LABELS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LABELS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface SleepChartProps {
  records: SleepRecord[];
  averageMinutes: number;
  daysLogged: number;
}

function getDayLabels(locale: string): string[] {
  if (locale === 'en') return DAY_LABELS_EN;
  if (locale === 'es') return DAY_LABELS_ES;
  return DAY_LABELS_PT;
}

export default function SleepChart({ records, averageMinutes, daysLogged }: SleepChartProps) {
  const { theme, locale } = useAppContext();
  const c = theme.colors;
  const dayLabels = getDayLabels(locale);

  // Build 7-day array (today → 6 days ago)
  const days: { label: string; record: SleepRecord | null; isToday: boolean }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    days.push({
      label: dayLabels[dayOfWeek],
      record: records.find(r => r.date === dateStr) || null,
      isToday: i === 0,
    });
  }

  const goalPct = (GOAL_MINUTES / MAX_MINUTES) * 100;

  return (
    <View style={[styles.container, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
      <Text style={[styles.title, { color: c.accentBlue }]}>
        {t('sono_weekly')}
      </Text>

      {/* Summary row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: c.accentBlue }]}>
            {daysLogged > 0 ? formatDuration(averageMinutes) : '—'}
          </Text>
          <Text style={[styles.summaryLabel, { color: c.textDim }]}>
            {t('sono_avg')}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: c.textSecondary }]}>
            {daysLogged}/7
          </Text>
          <Text style={[styles.summaryLabel, { color: c.textDim }]}>
            {t('sono_days_logged')}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: c.accentGreen }]}>
            8h
          </Text>
          <Text style={[styles.summaryLabel, { color: c.textDim }]}>
            {t('sono_goal')}
          </Text>
        </View>
      </View>

      {/* Bar chart */}
      <View style={styles.chartArea}>
        {/* Goal line */}
        <View style={[styles.goalLine, { left: `${goalPct}%`, borderColor: withOpacity(c.accentGreen, 0.3) }]}>
          <Text style={[styles.goalLabel, { color: withOpacity(c.accentGreen, 0.5) }]}>8h</Text>
        </View>

        {days.map((day, i) => {
          const minutes = day.record?.durationMinutes || 0;
          const pct = minutes > 0 ? Math.min((minutes / MAX_MINUTES) * 100, 100) : 0;
          const barColor = minutes > 0
            ? getSleepBarColor(minutes, c.accentGreen, c.accentYellow, c.accentRed)
            : c.borderDefault;

          return (
            <View key={i} style={styles.barRow}>
              <Text style={[
                styles.barLabel,
                {
                  color: day.isToday ? c.accentBlue : c.textDim,
                  fontWeight: day.isToday ? '800' : '600',
                },
              ]}>
                {day.label}
              </Text>
              <View style={[styles.barTrack, { backgroundColor: withOpacity(c.borderDefault, 0.3) }]}>
                {minutes > 0 && (
                  <View style={[
                    styles.barFill,
                    {
                      width: `${pct}%`,
                      backgroundColor: withOpacity(barColor, 0.7),
                      borderColor: withOpacity(barColor, 0.3),
                    },
                  ]} />
                )}
              </View>
              <Text style={[styles.barValue, { color: minutes > 0 ? c.textSecondary : c.textDim }]}>
                {minutes > 0 ? formatDuration(minutes) : '—'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  chartArea: {
    position: 'relative',
  },
  goalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    zIndex: 1,
  },
  goalLabel: {
    position: 'absolute',
    top: -12,
    left: -6,
    fontSize: 7,
    fontWeight: '700',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  barLabel: {
    width: 28,
    fontSize: 9,
    textAlign: 'right',
  },
  barTrack: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 7,
    borderWidth: 1,
    minWidth: 4,
  },
  barValue: {
    width: 34,
    fontSize: 9,
    fontWeight: '700',
  },
});
