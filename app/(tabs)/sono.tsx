// FutStar — Aba Sono
// Tracking real de sono + conteúdo educacional
// Registro diário, gráfico semanal, dicas personalizadas

import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../../store/progress';
import { SLEEP_PHASES, SLEEP_ROUTINE, SLEEP_FACTS } from '../../data/sleep';
import { withOpacity } from '../../constants/theme';
import { t } from '../../i18n';
import SleepLogger from '../../components/SleepLogger';
import SleepChart from '../../components/SleepChart';
import {
  getTodaySleep, getWeeklySleep,
  type SleepRecord, type WeeklySleep,
} from '../../services/sleep';

export default function SonoScreen() {
  const { theme } = useAppContext();
  const c = theme.colors;

  const [todayRecord, setTodayRecord] = useState<SleepRecord | null>(null);
  const [weeklySleep, setWeeklySleep] = useState<WeeklySleep | null>(null);

  const loadSleepData = useCallback(async () => {
    const [today, weekly] = await Promise.all([
      getTodaySleep(),
      getWeeklySleep(),
    ]);
    setTodayRecord(today);
    setWeeklySleep(weekly);
  }, []);

  useEffect(() => {
    loadSleepData();
  }, [loadSleepData]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🌙</Text>
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>{t('sono_title')}</Text>
            <Text style={[styles.headerSub, { color: c.textSecondary }]}>{t('sono_sub')}</Text>
          </View>

          {/* Sleep Logger — register today's sleep */}
          <SleepLogger
            todayRecord={todayRecord}
            onRecordSaved={loadSleepData}
          />

          {/* Weekly Chart */}
          {weeklySleep && weeklySleep.daysLogged > 0 && (
            <SleepChart
              records={weeklySleep.records}
              averageMinutes={weeklySleep.averageMinutes}
              daysLogged={weeklySleep.daysLogged}
            />
          )}

          {/* Facts */}
          <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <Text style={[styles.cardTitle, { color: c.accentBlue }]}>{t('sono_why')}</Text>
            {SLEEP_FACTS.map((fact, i) => (
              <View key={i} style={[styles.factRow, { borderBottomColor: i < SLEEP_FACTS.length - 1 ? c.borderDefault : 'transparent' }]}>
                <Text style={[styles.factArrow, { color: c.accentBlue }]}>→</Text>
                <Text style={[styles.factText, { color: c.textSecondary }]}>{fact}</Text>
              </View>
            ))}
          </View>

          {/* Gradual phone weaning */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t('sono_weaning')}</Text>
          {SLEEP_PHASES.map((sp, i) => (
            <View key={i} style={[styles.sleepPhaseCard, { backgroundColor: c.bgCard, borderColor: withOpacity(sp.color, 0.13), borderLeftColor: sp.color }]}>
              <View style={styles.sleepPhaseRow}>
                <Text style={[styles.sleepPhaseLabel, { color: sp.color }]}>{sp.label}</Text>
                <View style={styles.sleepPhaseRight}>
                  <Text style={[styles.sleepPhaseInfo, { color: c.textDim }]}>📵 Celular: <Text style={{ color: sp.color, fontWeight: '700' }}>{sp.phoneOff}</Text></Text>
                  <Text style={[styles.sleepPhaseInfo, { color: c.textDim }]}>🌙 Dormir: <Text style={{ color: sp.color, fontWeight: '700' }}>{sp.sleepTime}</Text></Text>
                </View>
              </View>
              <Text style={[styles.sleepPhaseDesc, { color: c.textSecondary }]}>{sp.description}</Text>
            </View>
          ))}

          {/* Night routine */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t('sono_routine')}</Text>
          <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            {SLEEP_ROUTINE.map((step, i) => (
              <View key={i} style={[styles.routineRow, { borderBottomColor: i < SLEEP_ROUTINE.length - 1 ? c.borderDefault : 'transparent' }]}>
                <Text style={styles.routineIcon}>{step.icon}</Text>
                <View style={styles.routineInfo}>
                  <Text style={[styles.routineTime, { color: c.accentBlue }]}>{step.time}</Text>
                  <Text style={[styles.routineAction, { color: c.textSecondary }]}>{step.action}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Important action */}
          <View style={[styles.importantCard, { borderColor: withOpacity(c.accentRed, 0.13), backgroundColor: theme.mode === 'pro' ? '#1a0014' : '#FFF5F5' }]}>
            <Text style={[styles.importantTitle, { color: c.accentRed }]}>{t('sono_important')}</Text>
            <Text style={[styles.importantText, { color: c.textSecondary }]}>
              Coloca o carregador do celular <Text style={{ color: c.accentPink, fontWeight: '700' }}>fora do quarto</Text>. Se o celular não está no quarto, não tem tentação. Usa despertador de verdade no começo.
            </Text>
          </View>
          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },
  content: { padding: 14, paddingTop: 50 },
  header: { alignItems: 'center', marginBottom: 14 },
  headerEmoji: { fontSize: 28, marginBottom: 4 },
  headerTitle: { fontSize: 16, fontWeight: '900' },
  headerSub: { fontSize: 11, marginTop: 2 },
  card: { borderWidth: 1, borderRadius: 12, padding: 13, marginBottom: 12 },
  cardTitle: { fontSize: 11, fontWeight: '800', marginBottom: 8 },
  factRow: { flexDirection: 'row', gap: 7, paddingVertical: 6, borderBottomWidth: 1 },
  factArrow: { fontSize: 11, flexShrink: 0 },
  factText: { fontSize: 11, lineHeight: 18, flex: 1 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 7, marginTop: 8 },
  sleepPhaseCard: { borderWidth: 1, borderLeftWidth: 3, borderRadius: 10, padding: 10, marginBottom: 6 },
  sleepPhaseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sleepPhaseLabel: { fontSize: 12, fontWeight: '800' },
  sleepPhaseRight: { alignItems: 'flex-end' },
  sleepPhaseInfo: { fontSize: 10 },
  sleepPhaseDesc: { fontSize: 11 },
  routineRow: { flexDirection: 'row', gap: 10, paddingVertical: 7, borderBottomWidth: 1, alignItems: 'flex-start' },
  routineIcon: { fontSize: 14, flexShrink: 0 },
  routineInfo: {},
  routineTime: { fontSize: 11, fontWeight: '700' },
  routineAction: { fontSize: 11, marginTop: 2 },
  importantCard: { borderWidth: 1, borderRadius: 12, padding: 13 },
  importantTitle: { fontSize: 11, fontWeight: '800', marginBottom: 7 },
  importantText: { fontSize: 11, lineHeight: 20 },
});
