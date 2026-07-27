// FutStar — Aba Progresso
// Progresso total, por fase, histórico, streak e conquistas

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../../store/progress';
import { PHASES, TRAINING_DAY_INDICES } from '../../data/phases';
import { ACHIEVEMENTS } from '../../data/achievements';
import { withOpacity } from '../../constants/theme';
import ProgressBar from '../../components/ProgressBar';

export default function ProgressoScreen() {
  const {
    theme, getTotalProgress, getPhaseProgress, isTrainingDone,
    getTrainingDate, completedTrainings, streak, xp,
    playerLevel, levelProgress, unlockedAchievements,
  } = useAppContext();
  const c = theme.colors;
  const total = getTotalProgress();
  const pct = total.total > 0 ? Math.round((total.done / total.total) * 100) : 0;

  // Build history
  const sessions: { phase: string; cor: string; week: string; day: string; foco: string; date: string }[] = [];
  PHASES.forEach((p, pi) => {
    [0, 1].forEach(wi => {
      TRAINING_DAY_INDICES.forEach(di => {
        const dt = getTrainingDate(pi, wi, di);
        if (dt) {
          sessions.push({
            phase: p.label, cor: p.color,
            week: wi === 0 ? '1ª Semana' : '2ª Semana',
            day: p.days[di].label, foco: p.days[di].focus, date: dt,
          });
        }
      });
    });
  });
  sessions.reverse();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Total progress hero */}
        <LinearGradient colors={c.successGradient} style={styles.hero}>
          <Text style={[styles.heroLabel, { color: c.accentGreen }]}>Progresso Total</Text>
          <Text style={[styles.heroNumber, { color: c.accentGreen }]}>{total.done}</Text>
          <Text style={[styles.heroSub, { color: withOpacity(c.accentGreen, 0.5) }]}>de {total.total} treinos em casa</Text>
          <View style={styles.heroBar}>
            <ProgressBar progress={pct} color={c.accentGreen} height={8} />
          </View>
          <Text style={[styles.heroPct, { color: withOpacity(c.accentGreen, 0.5) }]}>{pct}% do plano concluído</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Level + XP + Streak row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>{playerLevel.icon}</Text>
              <Text style={[styles.statValue, { color: playerLevel.color }]}>{playerLevel.name}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>Nível {playerLevel.level}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>⚡</Text>
              <Text style={[styles.statValue, { color: c.accentYellow }]}>{xp}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>XP Total</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[styles.statValue, { color: c.accentOrange }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>Streak</Text>
            </View>
          </View>

          {/* Level progress */}
          <View style={[styles.levelCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <View style={styles.levelRow}>
              <Text style={[styles.levelText, { color: c.textSecondary }]}>
                {playerLevel.icon} {playerLevel.name}
              </Text>
              <Text style={[styles.levelPct, { color: playerLevel.color }]}>{levelProgress}%</Text>
            </View>
            <ProgressBar progress={levelProgress} color={playerLevel.color} height={5} />
          </View>

          {/* Per phase */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>Por Fase — 6 treinos cada</Text>
          {PHASES.map((p, pi) => {
            const pp = getPhaseProgress(pi);
            const ppct = pp.total > 0 ? Math.round((pp.done / pp.total) * 100) : 0;
            return (
              <View key={pi} style={[styles.phaseCard, { backgroundColor: c.bgCard, borderColor: withOpacity(p.color, 0.13), borderLeftColor: p.color }]}>
                <View style={styles.phaseRow}>
                  <View>
                    <Text style={[styles.phaseLabel, { color: p.color }]}>{p.label} <Text style={[styles.phaseSub, { color: c.textDim }]}>{p.subtitle}</Text></Text>
                  </View>
                  <Text style={[styles.phaseCount, { color: p.color }]}>{pp.done} de {pp.total}</Text>
                </View>
                <ProgressBar progress={ppct} color={p.color} height={5} />
                <View style={styles.weeksContainer}>
                  {[0, 1].map(wi => (
                    <View key={wi} style={styles.weekDotsRow}>
                      <Text style={[styles.weekDotLabel, { color: c.textMuted }]}>{wi === 0 ? 'Sem. 1' : 'Sem. 2'}</Text>
                      {TRAINING_DAY_INDICES.map(di => {
                        const done = isTrainingDone(pi, wi, di);
                        return (
                          <View key={di} style={styles.weekDotItem}>
                            <View style={[styles.weekDot, { borderColor: done ? p.color : c.textDim, backgroundColor: done ? p.color : 'transparent' }]} />
                            <Text style={[styles.weekDotDay, { color: done ? p.color : c.textDim }]}>{PHASES[pi].days[di].shortName}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          {/* Achievements */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>Conquistas</Text>
          <View style={styles.achieveGrid}>
            {ACHIEVEMENTS.map(ach => {
              const unlocked = unlockedAchievements.includes(ach.key);
              return (
                <View key={ach.key} style={[styles.achieveCard, { backgroundColor: unlocked ? withOpacity(c.accentGreen, 0.06) : c.bgCard, borderColor: unlocked ? withOpacity(c.accentGreen, 0.2) : c.borderDefault, opacity: unlocked ? 1 : 0.5 }]}>
                  <Text style={styles.achieveIcon}>{ach.icon}</Text>
                  <Text style={[styles.achieveName, { color: unlocked ? c.textPrimary : c.textDim }]}>{ach.name}</Text>
                  <Text style={[styles.achieveXP, { color: unlocked ? c.accentGreen : c.textDim }]}>+{ach.xp} XP</Text>
                </View>
              );
            })}
          </View>

          {/* History */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>Histórico</Text>
          {sessions.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={[styles.emptyText, { color: c.textDim }]}>Nenhum treino marcado ainda.</Text>
            </View>
          ) : (
            sessions.slice(0, 20).map((s, i) => (
              <View key={i} style={[styles.historyItem, { backgroundColor: c.bgCard, borderColor: withOpacity(s.cor, 0.13), borderLeftColor: s.cor }]}>
                <View style={styles.historyLeft}>
                  <Text style={[styles.historyDay, { color: c.textPrimary }]}>{s.day} <Text style={[styles.historyPhase, { color: s.cor }]}>· {s.phase}</Text></Text>
                  <Text style={[styles.historyFoco, { color: c.textDim }]}>{s.week} · {s.foco}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyCheck}>✅</Text>
                  <Text style={[styles.historyDate, { color: c.textDim }]}>{s.date}</Text>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },
  hero: { padding: 18, alignItems: 'center', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  heroLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', marginTop: 40, marginBottom: 6 },
  heroNumber: { fontSize: 44, fontWeight: '900', lineHeight: 48 },
  heroSub: { fontSize: 13, marginTop: 2 },
  heroBar: { width: '80%', marginTop: 12 },
  heroPct: { fontSize: 10, marginTop: 5 },
  content: { padding: 14 },
  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 18 },
  statValue: { fontSize: 16, fontWeight: '900' },
  statLabel: { fontSize: 9 },
  levelCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 14, gap: 8 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelText: { fontSize: 12, fontWeight: '700' },
  levelPct: { fontSize: 12, fontWeight: '800' },
  sectionLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 8 },
  phaseCard: { borderWidth: 1, borderLeftWidth: 3, borderRadius: 11, padding: 10, marginBottom: 7, gap: 7 },
  phaseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  phaseLabel: { fontSize: 12, fontWeight: '800' },
  phaseSub: { fontSize: 10, fontWeight: '400' },
  phaseCount: { fontSize: 12, fontWeight: '700' },
  weeksContainer: { gap: 5, marginTop: 4 },
  weekDotsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weekDotLabel: { fontSize: 9, minWidth: 44 },
  weekDotItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  weekDot: { width: 9, height: 9, borderRadius: 5, borderWidth: 1 },
  weekDotDay: { fontSize: 9, fontWeight: '700' },
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  achieveCard: { width: '31%', borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', gap: 4, flexGrow: 1 },
  achieveIcon: { fontSize: 22 },
  achieveName: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  achieveXP: { fontSize: 9, fontWeight: '600' },
  emptyCard: { borderWidth: 1, borderRadius: 12, padding: 22, alignItems: 'center' },
  emptyEmoji: { fontSize: 26, marginBottom: 8 },
  emptyText: { fontSize: 13 },
  historyItem: { borderWidth: 1, borderLeftWidth: 3, borderRadius: 10, padding: 9, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyLeft: { flex: 1 },
  historyDay: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  historyPhase: { fontSize: 11 },
  historyFoco: { fontSize: 10 },
  historyRight: { alignItems: 'flex-end', marginLeft: 8 },
  historyCheck: { fontSize: 10 },
  historyDate: { fontSize: 9, marginTop: 1 },
});
