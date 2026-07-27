// FutStar — Aba Ranking (simulado/motivacional)

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../../store/progress';
import { POSITIONS } from '../../data/positions';
import { withOpacity } from '../../constants/theme';

// Jogadores simulados para o ranking motivacional
const FAKE_PLAYERS = [
  { name: 'Pedro H.', xp: 4200, level: 'Craque', pos: 'ponta_esq' as const, streak: 21 },
  { name: 'Lucas M.', xp: 3800, level: 'Craque', pos: 'centroavante' as const, streak: 14 },
  { name: 'Gabriel S.', xp: 3100, level: 'Talento', pos: 'meia_armador' as const, streak: 9 },
  { name: 'Matheus R.', xp: 2600, level: 'Talento', pos: 'volante' as const, streak: 7 },
  { name: 'João V.', xp: 2100, level: 'Talento', pos: 'lateral_dir' as const, streak: 12 },
  { name: 'Enzo F.', xp: 1800, level: 'Promessa', pos: 'ponta_dir' as const, streak: 5 },
  { name: 'Davi L.', xp: 1400, level: 'Promessa', pos: 'zagueiro_dir' as const, streak: 3 },
  { name: 'Arthur C.', xp: 900, level: 'Promessa', pos: 'meia_atacante' as const, streak: 4 },
  { name: 'Theo B.', xp: 500, level: 'Iniciante', pos: 'goleiro' as const, streak: 2 },
];

export default function RankingScreen() {
  const { theme, profile, xp, streak, playerLevel } = useAppContext();
  const c = theme.colors;

  // Insert player into ranking
  const playerEntry = {
    name: profile?.name || 'Você',
    xp,
    level: playerLevel.name,
    pos: profile?.position || ('centroavante' as const),
    streak,
    isMe: true,
  };

  const allPlayers = [...FAKE_PLAYERS.map(p => ({ ...p, isMe: false })), playerEntry]
    .sort((a, b) => b.xp - a.xp);

  const myRank = allPlayers.findIndex(p => p.isMe) + 1;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🏆</Text>
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>Ranking</Text>
            <Text style={[styles.headerSub, { color: c.textSecondary }]}>Sua posição entre os jogadores</Text>
          </View>

          {/* My rank card */}
          <LinearGradient
            colors={[withOpacity(playerLevel.color, 0.12), c.bgCard]}
            style={[styles.myRankCard, { borderColor: withOpacity(playerLevel.color, 0.25) }]}
          >
            <View style={styles.myRankTop}>
              <Text style={[styles.myRankPos, { color: playerLevel.color }]}>#{myRank}</Text>
              <View style={styles.myRankInfo}>
                <Text style={[styles.myRankName, { color: c.textPrimary }]}>{profile?.name || 'Você'}</Text>
                <Text style={[styles.myRankLevel, { color: playerLevel.color }]}>{playerLevel.icon} {playerLevel.name}</Text>
              </View>
              <View style={styles.myRankRight}>
                <Text style={[styles.myRankXP, { color: c.accentYellow }]}>{xp} XP</Text>
                <Text style={[styles.myRankStreak, { color: c.accentOrange }]}>🔥 {streak}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Ranking list */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>Top Jogadores</Text>
          {allPlayers.map((player, i) => {
            const pos = POSITIONS[player.pos];
            const isMe = player.isMe;
            return (
              <View
                key={i}
                style={[
                  styles.rankItem,
                  {
                    backgroundColor: isMe ? withOpacity(c.accentGreen, 0.06) : c.bgCard,
                    borderColor: isMe ? withOpacity(c.accentGreen, 0.2) : c.borderDefault,
                    borderLeftColor: isMe ? c.accentGreen : c.borderDefault,
                  },
                ]}
              >
                {/* Rank number */}
                <View style={styles.rankNumContainer}>
                  {i < 3 ? (
                    <Text style={styles.rankMedal}>{medals[i]}</Text>
                  ) : (
                    <Text style={[styles.rankNum, { color: c.textMuted }]}>{i + 1}</Text>
                  )}
                </View>

                {/* Player info */}
                <View style={styles.rankInfo}>
                  <Text style={[styles.rankName, { color: isMe ? c.accentGreen : c.textPrimary }]}>
                    {player.name} {isMe ? '(você)' : ''}
                  </Text>
                  <Text style={[styles.rankMeta, { color: c.textDim }]}>
                    {pos?.icon} {pos?.shortLabel} · {player.level}
                  </Text>
                </View>

                {/* XP + streak */}
                <View style={styles.rankRight}>
                  <Text style={[styles.rankXP, { color: c.accentYellow }]}>{player.xp}</Text>
                  <Text style={[styles.rankStreakText, { color: c.textDim }]}>🔥 {player.streak}</Text>
                </View>
              </View>
            );
          })}

          {/* Disclaimer */}
          <View style={[styles.disclaimerCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <Text style={[styles.disclaimerText, { color: c.textDim }]}>
              🌍 Ranking simulado para motivação. Em breve: ranking real entre jogadores!
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
  myRankCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 14 },
  myRankTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  myRankPos: { fontSize: 28, fontWeight: '900' },
  myRankInfo: { flex: 1 },
  myRankName: { fontSize: 16, fontWeight: '900' },
  myRankLevel: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  myRankRight: { alignItems: 'flex-end' },
  myRankXP: { fontSize: 14, fontWeight: '900' },
  myRankStreak: { fontSize: 11, marginTop: 2 },
  sectionLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  rankItem: { borderWidth: 1, borderLeftWidth: 3, borderRadius: 11, padding: 10, marginBottom: 5, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankNumContainer: { width: 28, alignItems: 'center' },
  rankMedal: { fontSize: 18 },
  rankNum: { fontSize: 14, fontWeight: '800' },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 13, fontWeight: '700' },
  rankMeta: { fontSize: 10, marginTop: 1 },
  rankRight: { alignItems: 'flex-end' },
  rankXP: { fontSize: 13, fontWeight: '800' },
  rankStreakText: { fontSize: 9, marginTop: 1 },
  disclaimerCard: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 8 },
  disclaimerText: { fontSize: 10, textAlign: 'center' },
});
