// FutStar — Aba Nutrição

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../../store/progress';
import { NUTRITION_BLOCKS, NUTRITION_GOLDEN_RULE } from '../../data/nutrition';
import { withOpacity } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function NutricaoScreen() {
  const { theme } = useAppContext();
  const c = theme.colors;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🥗</Text>
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>Nutrição Básica</Text>
            <Text style={[styles.headerSub, { color: c.textSecondary }]}>Comida simples e acessível — sem complicar</Text>
          </View>

          {NUTRITION_BLOCKS.map((block, i) => (
            <View key={i} style={[styles.blockCard, { backgroundColor: c.bgCard, borderColor: withOpacity(block.color, 0.1), borderLeftColor: block.color }]}>
              <Text style={[styles.blockTitle, { color: block.color }]}>{block.icon} {block.title}</Text>
              <View style={styles.recList}>
                {block.recommended.map((item, j) => (
                  <View key={j} style={styles.recRow}>
                    <Text style={[styles.recCheck, { color: block.color }]}>✓</Text>
                    <Text style={[styles.recText, { color: c.textSecondary }]}>{item}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.avoidBox, { backgroundColor: theme.mode === 'pro' ? '#1a0a0a' : '#FFF5F5', borderColor: withOpacity(c.accentRed, 0.09) }]}>
                <Text style={[styles.avoidLabel, { color: c.accentRed }]}>✗ EVITA:</Text>
                {block.avoid.map((item, j) => (
                  <Text key={j} style={[styles.avoidText, { color: withOpacity(c.accentRed, 0.7) }]}>• {item}</Text>
                ))}
              </View>
            </View>
          ))}

          <LinearGradient colors={c.successGradient} style={[styles.goldenCard, { borderColor: withOpacity(c.accentGreen, 0.13) }]}>
            <Text style={[styles.goldenTitle, { color: c.accentGreen }]}>🏆 Regra de Ouro</Text>
            <Text style={[styles.goldenText, { color: withOpacity(c.accentGreen, 0.6) }]}>
              {NUTRITION_GOLDEN_RULE}
            </Text>
          </LinearGradient>
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
  blockCard: { borderWidth: 1, borderLeftWidth: 3, borderRadius: 12, padding: 12, marginBottom: 10 },
  blockTitle: { fontSize: 13, fontWeight: '800', marginBottom: 8 },
  recList: { marginBottom: 8 },
  recRow: { flexDirection: 'row', gap: 6, paddingVertical: 3 },
  recCheck: { fontSize: 11, flexShrink: 0 },
  recText: { fontSize: 11 },
  avoidBox: { borderWidth: 1, borderRadius: 8, padding: 7 },
  avoidLabel: { fontSize: 9, fontWeight: '700', marginBottom: 4 },
  avoidText: { fontSize: 11, paddingVertical: 1 },
  goldenCard: { borderWidth: 1, borderRadius: 12, padding: 13 },
  goldenTitle: { fontSize: 11, fontWeight: '800', marginBottom: 7 },
  goldenText: { fontSize: 11, lineHeight: 20 },
});
