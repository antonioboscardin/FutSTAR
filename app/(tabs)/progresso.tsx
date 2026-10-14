// FutStar — Aba Progresso v3 (Banco Unificado)
// Nível atual, semana, treinos concluídos, XP, streak, conquistas, histórico

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppContext } from '../../store/progress';
import { ACHIEVEMENTS } from '../../data/achievements';
import { withOpacity } from '../../constants/theme';
import ProgressBar from '../../components/ProgressBar';
import { usePremium } from '../../hooks/usePremium';
import { showRewarded } from '../../services/ads';
import { getCurrentLocale } from '../../i18n';
import {
  WORKOUT_LEVELS, LEVEL_ORDER, DAY_LABELS,
  i18nText, type WorkoutLevel,
} from '../../data/workoutsData';

type Lang = 'pt' | 'es' | 'en';

export default function ProgressoScreen() {
  const {
    theme, streak, xp,
    playerLevel, levelProgress, unlockedAchievements, addBonusXP,
    nivelAtual, semanaAtual, diaAtual, treinosConcluidos, workoutHistory,
    getWorkoutProgress,
  } = useAppContext();
  const router = useRouter();
  const { isPremium } = usePremium();
  const c = theme.colors;
  const lang = (getCurrentLocale() || 'pt') as Lang;

  const progress = getWorkoutProgress();
  const levelInfo = WORKOUT_LEVELS.find(l => l.key === nivelAtual);
  const levelIdx = LEVEL_ORDER.indexOf(nivelAtual);
  const dayLabel = DAY_LABELS[(diaAtual - 1)] || DAY_LABELS[0];

  // Last 10 history items reversed
  const recentHistory = [...workoutHistory].reverse().slice(0, 10);

  const handleWatchAd = async () => {
    await showRewarded();
    await addBonusXP(50);
    Alert.alert('🎉 +50 XP!', 'Bônus XP adicionado!');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* ---- Header ---- */}
          <Text style={[styles.title, { color: c.textPrimary }]}>📊 Progresso</Text>

          {/* ---- Nível atual ---- */}
          <LinearGradient
            colors={[
              withOpacity(levelInfo?.color || c.accentGreen, 0.12),
              withOpacity(c.bgCard, 0.95),
            ]}
            style={[styles.levelCard, { borderColor: withOpacity(levelInfo?.color || c.accentGreen, 0.25) }]}
          >
            <View style={styles.levelRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.levelLabel, { color: c.textMuted }]}>NÍVEL ATUAL</Text>
                <Text style={[styles.levelName, { color: levelInfo?.color || c.accentGreen }]}>
                  {i18nText(levelInfo?.label || { pt: nivelAtual, es: nivelAtual, en: nivelAtual }, lang)}
                </Text>
                <Text style={[styles.levelSub, { color: c.textDim }]}>
                  Nível {levelIdx + 1} de {LEVEL_ORDER.length}
                </Text>
              </View>
              <View style={styles.levelRight}>
                <Text style={[styles.bigStat, { color: c.accentYellow }]}>⚡ {xp}</Text>
                <Text style={[styles.statLabel, { color: c.textDim }]}>XP Total</Text>
              </View>
            </View>
          </LinearGradient>

          {/* ---- Stats row ---- */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>📅</Text>
              <Text style={[styles.statNum, { color: c.textPrimary }]}>S{semanaAtual}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>Semana</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>🏋️</Text>
              <Text style={[styles.statNum, { color: c.accentGreen }]}>{progress.done}/{progress.total}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>Treinos</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[styles.statNum, { color: c.accentOrange }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>Streak</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>📆</Text>
              <Text style={[styles.statNum, { color: c.textPrimary }]}>D{diaAtual}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>{i18nText(dayLabel, lang)}</Text>
            </View>
          </View>

          {/* ---- Progresso no nível ---- */}
          <View style={[styles.progressCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <Text style={[styles.sectionLabel, { color: c.textMuted }]}>PROGRESSO NO NÍVEL</Text>
            <ProgressBar
              progress={progress.pct}
              color={levelInfo?.color || c.accentGreen}
              height={8}
              showLabel
            />
            <Text style={[styles.progressSub, { color: c.textDim }]}>
              {progress.pct}% concluído · {progress.total - progress.done} treinos restantes
            </Text>
          </View>

          {/* ---- Roadmap de níveis ---- */}
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>ROADMAP</Text>
          <View style={styles.roadmap}>
            {WORKOUT_LEVELS.map((level, idx) => {
              const isCurrent = level.key === nivelAtual;
              const isPast = idx < levelIdx;
              const opacity = isCurrent ? 1 : isPast ? 0.7 : 0.3;
              return (
                <View key={level.key} style={[styles.roadmapItem, { opacity }]}>
                  <View style={[styles.roadmapDot, {
                    backgroundColor: isPast || isCurrent ? level.color : c.bgCard,
                    borderColor: level.color,
                  }]}>
                    {isPast && <Text style={styles.roadmapCheck}>✓</Text>}
                    {isCurrent && <Text style={styles.roadmapCheck}>●</Text>}
                  </View>
                  <Text style={[styles.roadmapLabel, {
                    color: isCurrent ? level.color : c.textSecondary,
                    fontWeight: isCurrent ? '900' : '600',
                  }]}>
                    {i18nText(level.label, lang)}
                  </Text>
                  <Text style={[styles.roadmapXP, { color: c.textDim }]}>+{level.xp} XP</Text>
                </View>
              );
            })}
          </View>

          {/* ---- Conquistas ---- */}
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>
            CONQUISTAS ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
          </Text>
          <View style={styles.badgeGrid}>
            {ACHIEVEMENTS.map(ach => {
              const unlocked = unlockedAchievements.includes(ach.key);
              return (
                <View key={ach.key} style={[styles.badge, { opacity: unlocked ? 1 : 0.25 }]}>
                  <Text style={styles.badgeIcon}>{ach.icon}</Text>
                  <Text style={[styles.badgeName, { color: unlocked ? c.textPrimary : c.textDim }]}>
                    {ach.name}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* ---- Bônus XP ---- */}
          {!isPremium && (
            <TouchableOpacity
              onPress={handleWatchAd}
              style={[styles.bonusBtn, { backgroundColor: withOpacity(c.accentYellow, 0.1), borderColor: withOpacity(c.accentYellow, 0.2) }]}
            >
              <Text style={[styles.bonusBtnText, { color: c.accentYellow }]}>🎬 Assistir anúncio → +50 XP</Text>
            </TouchableOpacity>
          )}

          {/* ---- Histórico ---- */}
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>ÚLTIMOS TREINOS</Text>
          {recentHistory.length === 0 ? (
            <View style={[styles.emptyHistory, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.emptyHistoryEmoji}>🏃‍♂️</Text>
              <Text style={[styles.emptyText, { color: c.textDim }]}>
                Nenhum treino concluído ainda — comece hoje!
              </Text>
            </View>
          ) : (
            recentHistory.map((h, i) => (
              <View key={i} style={[styles.historyItem, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.historyId, { color: c.textSecondary }]} numberOfLines={1}>
                    {h.title || h.id.replace(/treino_|geral_|goleiro_/g, '').replace(/_/g, ' ')}
                  </Text>
                  <Text style={[styles.historyDate, { color: c.textDim }]}>
                    {new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <Text style={[styles.historyXP, { color: c.accentYellow }]}>+{h.xp} XP</Text>
              </View>
            ))
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },
  content: { padding: 16, paddingTop: 50 },

  title: { fontSize: 20, fontWeight: '900', marginBottom: 16 },

  // Level card
  levelCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  levelRow: { flexDirection: 'row', alignItems: 'center' },
  levelLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  levelName: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  levelSub: { fontSize: 10, marginTop: 2 },
  levelRight: { alignItems: 'flex-end' },
  bigStat: { fontSize: 18, fontWeight: '900' },

  // Stats row
  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 16 },
  statNum: { fontSize: 14, fontWeight: '900' },
  statLabel: { fontSize: 8, textTransform: 'uppercase' },

  // Progress card
  progressCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 14, gap: 8 },
  progressSub: { fontSize: 10 },

  // Section
  sectionTitle: { fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, marginTop: 8 },
  sectionLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },

  // Roadmap
  roadmap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, paddingHorizontal: 8 },
  roadmapItem: { alignItems: 'center', gap: 4 },
  roadmapDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  roadmapCheck: { fontSize: 10, color: '#fff', fontWeight: '900' },
  roadmapLabel: { fontSize: 9 },
  roadmapXP: { fontSize: 8 },

  // Badges
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  badge: { alignItems: 'center', width: 56 },
  badgeIcon: { fontSize: 22, marginBottom: 2 },
  badgeName: { fontSize: 8, textAlign: 'center', fontWeight: '600' },

  // Bonus
  bonusBtn: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 14 },
  bonusBtnText: { fontSize: 13, fontWeight: '700' },

  // History
  historyItem: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 4, flexDirection: 'row', alignItems: 'center' },
  historyId: { fontSize: 11, fontWeight: '700' },
  historyDate: { fontSize: 9, marginTop: 1 },
  historyXP: { fontSize: 12, fontWeight: '900' },

  emptyText: { fontSize: 12, textAlign: 'center', padding: 16 },
  emptyHistory: { borderWidth: 1, borderRadius: 14, padding: 20, alignItems: 'center', gap: 6, marginBottom: 8 },
  emptyHistoryEmoji: { fontSize: 28 },
});
