// FutStar — Aba Ranking (Pessoal Evolutivo + Leaderboard)
// Liga atual, milestones, evolução pessoal, estatísticas reais
// Leaderboard com seed players + jogador real

import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../../store/progress';
import { withOpacity } from '../../constants/theme';
import { t } from '../../i18n';
import ProgressBar from '../../components/ProgressBar';
import { ACHIEVEMENTS } from '../../data/achievements';
import {
  getLeague, getNextLeague, getLeagueProgress,
  calculateCompositeScore, getMilestoneStatus,
  calculatePersonalStats, LEAGUES,
  SEED_PLAYERS, type SeedPlayer,
} from '../../data/ranking';
import { POSITIONS, type PositionKey } from '../../data/positions';

export default function RankingScreen() {
  const {
    theme, profile, xp, streak, playerLevel,
    unlockedAchievements, completedTrainings,
  } = useAppContext();
  const c = theme.colors;

  const league = getLeague(xp);
  const nextLeague = getNextLeague(xp);
  const leaguePct = getLeagueProgress(xp);
  const myScore = calculateCompositeScore(xp, streak, unlockedAchievements.length);

  const milestoneStatus = useMemo(
    () => getMilestoneStatus(xp),
    [xp]
  );

  const stats = useMemo(
    () => calculatePersonalStats(completedTrainings, streak, profile?.createdAt),
    [completedTrainings, streak, profile?.createdAt]
  );

  // ---- Leaderboard: merge user + seed players ----
  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    const seedEntries: LeaderboardEntry[] = SEED_PLAYERS.map(s => ({
      ...s,
      isMe: false,
      league: getLeague(s.xp),
    }));

    const posLabel = profile?.position
      ? (POSITIONS[profile.position as PositionKey]?.label || profile.position)
      : '';

    const meEntry: LeaderboardEntry = {
      id: 'me',
      nickname: profile?.name || 'Jogador',
      position: posLabel,
      xp,
      streak,
      isSeed: false,
      isMe: true,
      league: getLeague(xp),
    };

    return [...seedEntries, meEntry].sort((a, b) => b.xp - a.xp);
  }, [xp, streak, profile]);

  // ---- Modal state ----
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🏆</Text>
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>{t('ranking_title')}</Text>
            <Text style={[styles.headerSub, { color: c.textSecondary }]}>{t('ranking_sub_personal')}</Text>
          </View>

          {/* League badge */}
          <LinearGradient
            colors={[withOpacity(league.color, 0.15), c.bgCard]}
            style={[styles.leagueCard, { borderColor: withOpacity(league.color, 0.3) }]}
          >
            <View style={styles.leagueTop}>
              <Text style={styles.leagueIcon}>{league.icon}</Text>
              <View style={styles.leagueInfo}>
                <Text style={[styles.leagueName, { color: league.color }]}>
                  {t('ranking_league')} {league.name}
                </Text>
                <Text style={[styles.leagueScore, { color: c.textSecondary }]}>
                  {t('ranking_score')}: {myScore}
                </Text>
              </View>
              <View style={styles.leagueXPBadge}>
                <Text style={[styles.leagueXPText, { color: c.accentYellow }]}>⚡ {xp} XP</Text>
              </View>
            </View>

            {nextLeague && (
              <View style={styles.nextLeagueSection}>
                <View style={styles.nextLeagueRow}>
                  <Text style={[styles.nextLeagueLabel, { color: c.textDim }]}>
                    {t('ranking_next_league')}: {nextLeague.icon} {nextLeague.name}
                  </Text>
                  <Text style={[styles.nextLeagueXP, { color: nextLeague.color }]}>
                    {nextLeague.minXP - xp} XP
                  </Text>
                </View>
                <ProgressBar progress={leaguePct} color={league.color} height={5} />
              </View>
            )}
          </LinearGradient>

          {/* ---- Leaderboard ---- */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>RANKING GERAL</Text>
          <View style={styles.leaderboard}>
            {leaderboard.map((entry, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const medalEmojis = ['🥇', '🥈', '🥉'];
              return (
                <TouchableOpacity
                  key={entry.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedPlayer(entry)}
                  style={[
                    styles.lbItem,
                    {
                      backgroundColor: entry.isMe
                        ? withOpacity(league.color, 0.10)
                        : c.bgCard,
                      borderColor: entry.isMe
                        ? withOpacity(league.color, 0.35)
                        : c.borderDefault,
                    },
                  ]}
                >
                  <Text style={[styles.lbRank, {
                    color: isTop3 ? entry.league.color : c.textDim,
                  }]}>
                    {isTop3 ? medalEmojis[rank - 1] : `#${rank}`}
                  </Text>
                  <View style={styles.lbInfo}>
                    <Text
                      style={[styles.lbName, {
                        color: entry.isMe ? league.color : c.textPrimary,
                      }]}
                      numberOfLines={1}
                    >
                      {entry.nickname}{entry.isMe ? ' (você)' : ''}
                    </Text>
                    <Text style={[styles.lbPosition, { color: c.textDim }]}>
                      {entry.position}
                    </Text>
                  </View>
                  <View style={styles.lbRight}>
                    <Text style={[styles.lbXP, { color: c.accentYellow }]}>⚡ {entry.xp}</Text>
                    {entry.streak > 0 && (
                      <Text style={[styles.lbStreak, { color: c.accentOrange }]}>🔥 {entry.streak}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Personal stats */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t('ranking_personal_stats')}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={[styles.statNum, { color: c.accentGreen }]}>{stats.totalTrainings}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>{t('ranking_stat_trainings')}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[styles.statNum, { color: c.accentOrange }]}>{stats.bestStreak}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>{t('ranking_stat_best_streak')}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>📅</Text>
              <Text style={[styles.statNum, { color: c.accentBlue }]}>{stats.daysSinceStart}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>{t('ranking_stat_days')}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>📊</Text>
              <Text style={[styles.statNum, { color: c.accentPurple }]}>{stats.trainingsPerWeek}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>{t('ranking_stat_per_week')}</Text>
            </View>
          </View>

          {/* Leagues overview */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t('ranking_leagues_overview')}</Text>
          {LEAGUES.map((l) => {
            const isCurrentLeague = l.key === league.key;
            const isReached = xp >= l.minXP;
            return (
              <View
                key={l.key}
                style={[
                  styles.leagueItem,
                  {
                    backgroundColor: isCurrentLeague
                      ? withOpacity(l.color, 0.08)
                      : c.bgCard,
                    borderColor: isCurrentLeague
                      ? withOpacity(l.color, 0.3)
                      : c.borderDefault,
                    borderLeftColor: l.color,
                    opacity: isReached ? 1 : 0.45,
                  },
                ]}
              >
                <Text style={styles.leagueItemIcon}>{l.icon}</Text>
                <View style={styles.leagueItemInfo}>
                  <Text style={[styles.leagueItemName, { color: isReached ? l.color : c.textDim }]}>
                    {l.name}
                  </Text>
                  <Text style={[styles.leagueItemXP, { color: c.textDim }]}>
                    {l.maxXP === Infinity
                      ? `${l.minXP}+ XP`
                      : `${l.minXP} — ${l.maxXP} XP`}
                  </Text>
                </View>
                {isCurrentLeague && (
                  <View style={[styles.currentBadge, { backgroundColor: withOpacity(l.color, 0.15) }]}>
                    <Text style={[styles.currentBadgeText, { color: l.color }]}>
                      {t('ranking_current')}
                    </Text>
                  </View>
                )}
                {isReached && !isCurrentLeague && (
                  <Text style={[styles.leagueCheckmark, { color: c.accentGreen }]}>✓</Text>
                )}
              </View>
            );
          })}

          {/* Milestones timeline */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t('ranking_milestones')}</Text>

          {/* Next milestone card */}
          {milestoneStatus.next && (
            <View style={[styles.nextMilestoneCard, {
              backgroundColor: withOpacity(milestoneStatus.next.color, 0.06),
              borderColor: withOpacity(milestoneStatus.next.color, 0.2),
            }]}>
              <View style={styles.nextMilestoneRow}>
                <Text style={styles.nextMilestoneIcon}>{milestoneStatus.next.icon}</Text>
                <View style={styles.nextMilestoneInfo}>
                  <Text style={[styles.nextMilestoneLabel, { color: milestoneStatus.next.color }]}>
                    {t(milestoneStatus.next.labelKey)}
                  </Text>
                  <Text style={[styles.nextMilestoneXP, { color: c.textDim }]}>
                    {milestoneStatus.next.xp - xp} XP {t('ranking_to_unlock')}
                  </Text>
                </View>
              </View>
              <ProgressBar
                progress={milestoneStatus.nextProgress}
                color={milestoneStatus.next.color}
                height={5}
              />
            </View>
          )}

          {/* Milestone list */}
          <View style={styles.milestoneList}>
            {[...milestoneStatus.reached].reverse().map((m, i) => (
              <View
                key={m.xp}
                style={[styles.milestoneItem, {
                  backgroundColor: c.bgCard,
                  borderColor: withOpacity(m.color, 0.2),
                  borderLeftColor: m.color,
                }]}
              >
                <Text style={styles.milestoneIcon}>{m.icon}</Text>
                <View style={styles.milestoneInfo}>
                  <Text style={[styles.milestoneName, { color: m.color }]}>
                    {t(m.labelKey)}
                  </Text>
                  <Text style={[styles.milestoneXP, { color: c.textDim }]}>
                    {m.xp} XP
                  </Text>
                </View>
                <Text style={[styles.milestoneCheck, { color: c.accentGreen }]}>✓</Text>
              </View>
            ))}

            {milestoneStatus.reached.length === 0 && (
              <View style={[styles.emptyMilestone, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
                <Text style={styles.emptyMilestoneEmoji}>🌱</Text>
                <Text style={[styles.emptyMilestoneText, { color: c.textSecondary }]}>
                  {t('ranking_empty_milestones')}
                </Text>
              </View>
            )}
          </View>

          {/* Scoring explanation */}
          <View style={[styles.scoringCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <Text style={[styles.scoringTitle, { color: c.textMuted }]}>{t('ranking_scoring_title')}</Text>
            <Text style={[styles.scoringText, { color: c.textDim }]}>{t('ranking_scoring_desc')}</Text>
          </View>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>

      {/* ---- Player Profile Modal ---- */}
      <PlayerProfileModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        colors={c}
        realAchievements={unlockedAchievements}
      />
    </SafeAreaView>
  );
}

// ==============================================================
// Types
// ==============================================================

type LeaderboardEntry = {
  id: string;
  nickname: string;
  position: string;
  xp: number;
  streak: number;
  isSeed: boolean;
  isMe: boolean;
  league: ReturnType<typeof getLeague>;
};

// ==============================================================
// Seed achievement generator
// ==============================================================

const GENERIC_ACHIEVEMENTS = [
  { icon: '🔥', name: 'Primeiro Passo' },
  { icon: '📅', name: 'Consistente' },
  { icon: '⭐', name: 'Semana Perfeita' },
  { icon: '🦶', name: 'Ambidestro' },
  { icon: '💪', name: 'Máquina' },
  { icon: '🏆', name: 'Fase Conquistada' },
  { icon: '🎖️', name: 'Disciplinado' },
  { icon: '👑', name: 'Imparável' },
  { icon: '⭐', name: 'FutStar' },
];

function getSeedAchievementCount(xpAmount: number): number {
  if (xpAmount >= 4000) return 7;
  if (xpAmount >= 3000) return 6;
  if (xpAmount >= 2000) return 5;
  if (xpAmount >= 1500) return 4;
  if (xpAmount >= 1000) return 3;
  if (xpAmount >= 500) return 2;
  if (xpAmount >= 100) return 1;
  return 0;
}

// ==============================================================
// Player Profile Modal
// ==============================================================

interface ProfileModalProps {
  player: LeaderboardEntry | null;
  onClose: () => void;
  colors: any;
  realAchievements: string[];
}

function PlayerProfileModal({ player, onClose, colors: c, realAchievements }: ProfileModalProps) {
  if (!player) return null;

  const initial = player.nickname.charAt(0).toUpperCase();
  const leagueData = player.league;

  // Build achievement grid (9 slots)
  let achievementSlots: { icon: string; name: string; unlocked: boolean }[];

  if (player.isMe) {
    // Real user: show actual achievements
    achievementSlots = ACHIEVEMENTS.map(ach => ({
      icon: ach.icon,
      name: ach.name,
      unlocked: realAchievements.includes(ach.key),
    }));
  } else {
    // Seed player: generate based on XP
    const unlockedCount = getSeedAchievementCount(player.xp);
    achievementSlots = GENERIC_ACHIEVEMENTS.map((ga, idx) => ({
      icon: ga.icon,
      name: ga.name,
      unlocked: idx < unlockedCount,
    }));
  }

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={[styles.modalCard, {
            borderColor: withOpacity(leagueData.color, 0.3),
          }]}
        >
          {/* Avatar */}
          <View style={[styles.modalAvatar, { backgroundColor: withOpacity(leagueData.color, 0.2), borderColor: leagueData.color }]}>
            <Text style={[styles.modalAvatarText, { color: leagueData.color }]}>{initial}</Text>
          </View>

          {/* Nickname & position */}
          <Text style={[styles.modalNickname, { color: c.textPrimary }]}>
            {player.nickname}{player.isMe ? ' (você)' : ''}
          </Text>
          <Text style={[styles.modalPosition, { color: c.textSecondary }]}>
            {player.position}
          </Text>

          {/* League badge */}
          <View style={[styles.modalLeagueBadge, { backgroundColor: withOpacity(leagueData.color, 0.12), borderColor: withOpacity(leagueData.color, 0.25) }]}>
            <Text style={styles.modalLeagueIcon}>{leagueData.icon}</Text>
            <Text style={[styles.modalLeagueName, { color: leagueData.color }]}>
              Liga {leagueData.name}
            </Text>
          </View>

          {/* Stats row */}
          <View style={styles.modalStatsRow}>
            <View style={[styles.modalStatBox, { backgroundColor: withOpacity(c.accentYellow, 0.08) }]}>
              <Text style={[styles.modalStatValue, { color: c.accentYellow }]}>⚡ {player.xp}</Text>
              <Text style={[styles.modalStatLabel, { color: c.textDim }]}>XP Total</Text>
            </View>
            <View style={[styles.modalStatBox, { backgroundColor: withOpacity(c.accentOrange, 0.08) }]}>
              <Text style={[styles.modalStatValue, { color: c.accentOrange }]}>🔥 {player.streak}</Text>
              <Text style={[styles.modalStatLabel, { color: c.textDim }]}>Streak</Text>
            </View>
          </View>

          {/* Achievements grid */}
          <Text style={[styles.modalAchTitle, { color: c.textMuted }]}>CONQUISTAS</Text>
          <View style={styles.modalAchGrid}>
            {achievementSlots.map((slot, i) => (
              <View key={i} style={[styles.modalAchSlot, { opacity: slot.unlocked ? 1 : 0.2 }]}>
                <Text style={styles.modalAchIcon}>{slot.icon}</Text>
                <Text style={[styles.modalAchName, { color: slot.unlocked ? c.textSecondary : c.textDim }]} numberOfLines={1}>
                  {slot.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={[styles.modalCloseBtn, { borderColor: withOpacity(leagueData.color, 0.3) }]}
          >
            <Text style={[styles.modalCloseBtnText, { color: c.textSecondary }]}>Fechar</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
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
  // League card
  leagueCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  leagueTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  leagueIcon: { fontSize: 30 },
  leagueInfo: { flex: 1 },
  leagueName: { fontSize: 16, fontWeight: '900' },
  leagueScore: { fontSize: 11, marginTop: 2 },
  leagueXPBadge: { alignItems: 'flex-end' },
  leagueXPText: { fontSize: 14, fontWeight: '900' },
  nextLeagueSection: { marginTop: 10, gap: 4 },
  nextLeagueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextLeagueLabel: { fontSize: 10 },
  nextLeagueXP: { fontSize: 11, fontWeight: '800' },
  // Stats
  sectionLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 12 },
  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 8, alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 14 },
  statNum: { fontSize: 16, fontWeight: '900' },
  statLabel: { fontSize: 8, textAlign: 'center' },
  // League items
  leagueItem: { borderWidth: 1, borderLeftWidth: 3, borderRadius: 11, padding: 10, marginBottom: 5, flexDirection: 'row', alignItems: 'center', gap: 10 },
  leagueItemIcon: { fontSize: 22 },
  leagueItemInfo: { flex: 1 },
  leagueItemName: { fontSize: 14, fontWeight: '800' },
  leagueItemXP: { fontSize: 10, marginTop: 1 },
  currentBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  currentBadgeText: { fontSize: 9, fontWeight: '800' },
  leagueCheckmark: { fontSize: 16, fontWeight: '900' },
  // Next milestone
  nextMilestoneCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10, gap: 8 },
  nextMilestoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nextMilestoneIcon: { fontSize: 26 },
  nextMilestoneInfo: { flex: 1 },
  nextMilestoneLabel: { fontSize: 14, fontWeight: '800' },
  nextMilestoneXP: { fontSize: 10, marginTop: 2 },
  // Milestone list
  milestoneList: { gap: 5, marginBottom: 8 },
  milestoneItem: { borderWidth: 1, borderLeftWidth: 3, borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  milestoneIcon: { fontSize: 18 },
  milestoneInfo: { flex: 1 },
  milestoneName: { fontSize: 12, fontWeight: '700' },
  milestoneXP: { fontSize: 10 },
  milestoneCheck: { fontSize: 14, fontWeight: '900' },
  // Empty state
  emptyMilestone: { borderWidth: 1, borderRadius: 14, padding: 20, alignItems: 'center', gap: 6 },
  emptyMilestoneEmoji: { fontSize: 28 },
  emptyMilestoneText: { fontSize: 12, textAlign: 'center' },
  // Scoring
  scoringCard: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 4 },
  scoringTitle: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  scoringText: { fontSize: 10, lineHeight: 16 },
  // Leaderboard
  leaderboard: { gap: 4, marginBottom: 8 },
  lbItem: { borderWidth: 1, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  lbRank: { fontSize: 16, fontWeight: '900', width: 32, textAlign: 'center' },
  lbInfo: { flex: 1 },
  lbName: { fontSize: 13, fontWeight: '800' },
  lbPosition: { fontSize: 9, marginTop: 1 },
  lbRight: { alignItems: 'flex-end', gap: 2 },
  lbXP: { fontSize: 12, fontWeight: '900' },
  lbStreak: { fontSize: 9, fontWeight: '700' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#0d1f17', borderWidth: 1, borderRadius: 20, padding: 24, width: '100%', maxWidth: 360, alignItems: 'center', gap: 8 },
  modalAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  modalAvatarText: { fontSize: 26, fontWeight: '900' },
  modalNickname: { fontSize: 18, fontWeight: '900' },
  modalPosition: { fontSize: 11, marginTop: -2, marginBottom: 4 },
  modalLeagueBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 4 },
  modalLeagueIcon: { fontSize: 18 },
  modalLeagueName: { fontSize: 12, fontWeight: '800' },
  modalStatsRow: { flexDirection: 'row', gap: 10, width: '100%', marginVertical: 6 },
  modalStatBox: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center', gap: 2 },
  modalStatValue: { fontSize: 16, fontWeight: '900' },
  modalStatLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 },
  modalAchTitle: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4, alignSelf: 'flex-start' },
  modalAchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, width: '100%', marginTop: 6 },
  modalAchSlot: { width: (Dimensions.get('window').width - 48 - 48 - 12) / 3, alignItems: 'center', paddingVertical: 6, gap: 2 },
  modalAchIcon: { fontSize: 22 },
  modalAchName: { fontSize: 8, textAlign: 'center', fontWeight: '600' },
  modalCloseBtn: { marginTop: 10, borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  modalCloseBtnText: { fontSize: 14, fontWeight: '700' },
});
