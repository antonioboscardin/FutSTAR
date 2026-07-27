// FutStar — Tela Área dos Pais
// Read-only: mostra progresso, streak, badges do filho
// Protegida por código de acesso

import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppContext } from '../store/progress';
import { PHASES } from '../data/phases';
import { ACHIEVEMENTS } from '../data/achievements';
import { withOpacity } from '../constants/theme';
import ProgressBar from '../components/ProgressBar';
import { getOrCreateParentCode, regenerateParentCode, type ParentAccess } from '../services/parentAccess';

type Stage = 'code-display' | 'code-entry' | 'dashboard';

export default function AreaPaisScreen() {
  const router = useRouter();
  const {
    theme, profile, xp, streak, playerLevel, levelProgress,
    getTotalProgress, getPhaseProgress, unlockedAchievements,
  } = useAppContext();
  const c = theme.colors;

  const [stage, setStage] = useState<Stage>('code-display');
  const [parentAccess, setParentAccess] = useState<ParentAccess | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setExpandedSection(prev => prev === key ? null : key);
  };

  useEffect(() => {
    getOrCreateParentCode().then(setParentAccess);
  }, []);

  const handleVerifyCode = () => {
    if (enteredCode === parentAccess?.code) {
      setStage('dashboard');
    } else {
      Alert.alert('Código incorreto', 'Peça o código pro seu filho(a).');
    }
  };

  const handleRegenerate = async () => {
    const newAccess = await regenerateParentCode();
    setParentAccess(newAccess);
    Alert.alert('Novo código gerado!', `O novo código é: ${newAccess.code}`);
  };

  const total = getTotalProgress();
  const totalPct = total.total > 0 ? Math.round((total.done / total.total) * 100) : 0;

  // ---- Tela: Código para o filho mostrar ----
  if (stage === 'code-display') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={[styles.backText, { color: c.textMuted }]}>← Voltar</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.headerEmoji}>👨‍👩‍👦</Text>
              <Text style={[styles.headerTitle, { color: c.textPrimary }]}>Área dos Pais</Text>
              <Text style={[styles.headerSub, { color: c.textSecondary }]}>
                Mostra este código para seu pai/mãe{'\n'}acompanhar seu progresso
              </Text>
            </View>

            <View style={[styles.codeCard, { backgroundColor: c.bgCard, borderColor: withOpacity(c.accentGreen, 0.2) }]}>
              <Text style={[styles.codeLabel, { color: c.textMuted }]}>CÓDIGO DE ACESSO</Text>
              <Text style={[styles.codeNumber, { color: c.accentGreen }]}>
                {parentAccess?.code || '------'}
              </Text>
              <Text style={[styles.codeSub, { color: c.textDim }]}>
                O pai/mãe digita este código para ver seu progresso
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setStage('code-entry')}
              style={[styles.enterBtn, { backgroundColor: withOpacity(c.accentGreen, 0.08), borderColor: withOpacity(c.accentGreen, 0.2) }]}
            >
              <Text style={[styles.enterBtnText, { color: c.accentGreen }]}>🔑 Sou pai/mãe — digitar código</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRegenerate} style={styles.regenBtn}>
              <Text style={[styles.regenText, { color: c.textDim }]}>🔄 Gerar novo código</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---- Tela: Digitação do código ----
  if (stage === 'code-entry') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => setStage('code-display')} style={styles.backBtn}>
            <Text style={[styles.backText, { color: c.textMuted }]}>← Voltar</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🔑</Text>
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>Digite o código</Text>
            <Text style={[styles.headerSub, { color: c.textSecondary }]}>
              Peça o código de 6 dígitos pro seu filho(a)
            </Text>
          </View>

          <TextInput
            style={[styles.codeInput, { backgroundColor: c.bgInput, color: c.textPrimary, borderColor: c.borderDefault }]}
            placeholder="000000"
            placeholderTextColor={c.textDim}
            value={enteredCode}
            onChangeText={setEnteredCode}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />

          <TouchableOpacity
            onPress={handleVerifyCode}
            disabled={enteredCode.length !== 6}
            style={[styles.verifyBtn, {
              backgroundColor: enteredCode.length === 6 ? c.accentGreen : c.bgCard,
              opacity: enteredCode.length === 6 ? 1 : 0.4,
            }]}
          >
            <Text style={[styles.verifyBtnText, { color: enteredCode.length === 6 ? '#060b14' : c.textDim }]}>
              Verificar →
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Tela: Dashboard read-only ----
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => setStage('code-display')} style={styles.backBtn}>
            <Text style={[styles.backText, { color: c.textMuted }]}>← Voltar</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerEmoji}>👨‍👩‍👦</Text>
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>
              Progresso de {profile?.name || 'Jogador'}
            </Text>
            <Text style={[styles.headerSub, { color: c.textSecondary }]}>
              {profile?.age} anos · Visualização para pais (somente leitura)
            </Text>
          </View>

          {/* Stats overview */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={[styles.statNum, { color: c.accentGreen }]}>{total.done}/{total.total}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>Treinos</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[styles.statNum, { color: c.accentOrange }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>Dias seguidos</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>⚡</Text>
              <Text style={[styles.statNum, { color: c.accentYellow }]}>{xp}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>XP</Text>
            </View>
          </View>

          {/* Level */}
          <View style={[styles.levelCard, { backgroundColor: c.bgCard, borderColor: withOpacity(playerLevel.color, 0.2) }]}>
            <Text style={[styles.levelText, { color: playerLevel.color }]}>
              {playerLevel.icon} Nível: {playerLevel.name} ({playerLevel.level}/6)
            </Text>
            <ProgressBar progress={levelProgress} color={playerLevel.color} height={6} showLabel />
          </View>

          {/* Overall progress */}
          <View style={[styles.overallCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <Text style={[styles.overallLabel, { color: c.textSecondary }]}>Progresso geral do plano</Text>
            <ProgressBar progress={totalPct} color={c.accentGreen} height={8} showLabel />
          </View>

          {/* Per phase */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>Por Fase</Text>
          {PHASES.map((p, pi) => {
            const pp = getPhaseProgress(pi);
            const ppct = pp.total > 0 ? Math.round((pp.done / pp.total) * 100) : 0;
            return (
              <View key={pi} style={[styles.phaseItem, { backgroundColor: c.bgCard, borderColor: withOpacity(p.color, 0.13), borderLeftColor: p.color }]}>
                <View style={styles.phaseRow}>
                  <Text style={[styles.phaseName, { color: p.color }]}>{p.label}</Text>
                  <Text style={[styles.phaseCount, { color: c.textDim }]}>{pp.done}/{pp.total}</Text>
                </View>
                <ProgressBar progress={ppct} color={p.color} height={4} />
              </View>
            );
          })}

          {/* Badges */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>Conquistas ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</Text>
          <View style={styles.badgeRow}>
            {ACHIEVEMENTS.map(ach => {
              const unlocked = unlockedAchievements.includes(ach.key);
              return (
                <View key={ach.key} style={[styles.badgeItem, { opacity: unlocked ? 1 : 0.3 }]}>
                  <Text style={styles.badgeIcon}>{ach.icon}</Text>
                  <Text style={[styles.badgeName, { color: unlocked ? c.textPrimary : c.textDim }]}>{ach.name}</Text>
                </View>
              );
            })}
          </View>

          {/* Note for parents */}
          <View style={[styles.noteCard, { backgroundColor: withOpacity(c.accentBlue, 0.06), borderColor: withOpacity(c.accentBlue, 0.13) }]}>
            <Text style={[styles.noteTitle, { color: c.accentBlue }]}>💡 Dica para os pais</Text>
            <Text style={[styles.noteText, { color: c.textSecondary }]}>
              Incentive o streak diário! O hábito de treinar 15-30 minutos por dia é mais eficaz que longas sessões esporádicas. Elogie o esforço, não só o resultado.
            </Text>
          </View>

          {/* SEÇÃO A — Por que este exercício faz bem? */}
          <TouchableOpacity
            onPress={() => toggleSection('science')}
            activeOpacity={0.7}
            style={[styles.collapsibleHeader, { backgroundColor: withOpacity(c.accentGreen, 0.06), borderColor: withOpacity(c.accentGreen, 0.15) }]}
          >
            <Text style={[styles.collapsibleTitle, { color: c.accentGreen }]}>
              🧬 Por que este exercício faz bem?
            </Text>
            <Text style={[styles.collapsibleArrow, { color: c.accentGreen }]}>
              {expandedSection === 'science' ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedSection === 'science' && (
            <View style={[styles.collapsibleBody, { borderColor: withOpacity(c.accentGreen, 0.1) }]}>
              <View style={styles.scienceItem}>
                <Text style={[styles.sciencePhase, { color: c.accentGreen }]}>Fase 1 — Base</Text>
                <Text style={[styles.scienceText, { color: c.textSecondary }]}>
                  O treino de pé esquerdo ativa os dois hemisférios cerebrais simultaneamente, melhorando coordenação e tomada de decisão — comprovado por estudos de neurociência esportiva da UEFA.
                </Text>
              </View>
              <View style={styles.scienceItem}>
                <Text style={[styles.sciencePhase, { color: c.accentGreen }]}>Memória Muscular</Text>
                <Text style={[styles.scienceText, { color: c.textSecondary }]}>
                  Exercícios de toque repetitivo criam memória muscular (engramas motores) que ficam para sempre. Quanto mais cedo na vida, mais rápido o cérebro aprende o movimento.
                </Text>
              </View>
              <View style={styles.scienceItem}>
                <Text style={[styles.sciencePhase, { color: c.accentGreen }]}>Recuperação</Text>
                <Text style={[styles.scienceText, { color: c.textSecondary }]}>
                  O alongamento pós-treino reduz o cortisol (hormônio do estresse) e melhora o sono em até 23% segundo a Revista Brasileira de Medicina do Esporte.
                </Text>
              </View>
              <View style={styles.scienceItem}>
                <Text style={[styles.sciencePhase, { color: c.accentGreen }]}>Fase 2 — Finalização</Text>
                <Text style={[styles.scienceText, { color: c.textSecondary }]}>
                  O treino de finalização com ambos os pés desenvolve novas conexões neurais. Estudos da FIFA mostram que jogadores ambidestros têm 37% mais chances de atuar em clubes profissionais.
                </Text>
              </View>
              <View style={styles.scienceItem}>
                <Text style={[styles.sciencePhase, { color: c.accentGreen }]}>Fase 3 e 4 — Jogo Real</Text>
                <Text style={[styles.scienceText, { color: c.textSecondary }]}>
                  Exercícios de tomada de decisão sob pressão (1v1, 2v2) ativam o córtex pré-frontal, acelerando a "velocidade de jogo" — a capacidade de pensar e agir rápido em campo.
                </Text>
              </View>
            </View>
          )}

          {/* SEÇÃO B — Como você pode ajudar */}
          <TouchableOpacity
            onPress={() => toggleSection('tips')}
            activeOpacity={0.7}
            style={[styles.collapsibleHeader, { backgroundColor: withOpacity(c.accentYellow, 0.06), borderColor: withOpacity(c.accentYellow, 0.15), marginTop: 8 }]}
          >
            <Text style={[styles.collapsibleTitle, { color: c.accentYellow }]}>
              🧑‍🏫 Como você pode ajudar
            </Text>
            <Text style={[styles.collapsibleArrow, { color: c.accentYellow }]}>
              {expandedSection === 'tips' ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedSection === 'tips' && (
            <View style={[styles.collapsibleBody, { borderColor: withOpacity(c.accentYellow, 0.1) }]}>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>⚽</Text>
                <Text style={[styles.tipText, { color: c.textSecondary }]}>
                  Pergunte sobre o treino do dia, não sobre o resultado. "Como foi o exercício de hoje?" cria mais engajamento que "Você treinou?"
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>🥗</Text>
                <Text style={[styles.tipText, { color: c.textSecondary }]}>
                  Uma banana 30 minutos antes do treino fornece energia de queima lenta ideal para exercícios técnicos de futebol.
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>📱</Text>
                <Text style={[styles.tipText, { color: c.textSecondary }]}>
                  Coloque o celular longe do quarto 60 min antes de dormir. O sono profundo é quando o cérebro consolida os movimentos aprendidos.
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>💬</Text>
                <Text style={[styles.tipText, { color: c.textSecondary }]}>
                  Elogie o esforço, não o talento. "Você se dedicou hoje" é mais eficaz que "Você é bom nisso" para motivação de longo prazo (Carol Dweck, Stanford).
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>🎯</Text>
                <Text style={[styles.tipText, { color: c.textSecondary }]}>
                  Assista junto aos vídeos de referência (Vini Jr., Pedri) — cria conexão emocional com o treino e aumenta a motivação em 40%.
                </Text>
              </View>
            </View>
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
  backBtn: { marginBottom: 14 },
  backText: { fontSize: 13, fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: 20 },
  headerEmoji: { fontSize: 30, marginBottom: 4 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  headerSub: { fontSize: 12, marginTop: 4, textAlign: 'center', lineHeight: 18 },
  codeCard: { borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 14 },
  codeLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  codeNumber: { fontSize: 38, fontWeight: '900', letterSpacing: 8 },
  codeSub: { fontSize: 11, marginTop: 8, textAlign: 'center' },
  enterBtn: { borderWidth: 1, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10 },
  enterBtnText: { fontSize: 14, fontWeight: '700' },
  regenBtn: { alignItems: 'center', padding: 12 },
  regenText: { fontSize: 12 },
  codeInput: { borderWidth: 1, borderRadius: 14, padding: 18, fontSize: 28, fontWeight: '900', letterSpacing: 10, marginBottom: 16 },
  verifyBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  verifyBtnText: { fontSize: 15, fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', gap: 3 },
  statEmoji: { fontSize: 16 },
  statNum: { fontSize: 16, fontWeight: '900' },
  statLabel: { fontSize: 8 },
  levelCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10, gap: 6 },
  levelText: { fontSize: 13, fontWeight: '800' },
  overallCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 14, gap: 6 },
  overallLabel: { fontSize: 11, fontWeight: '700' },
  sectionLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7, marginTop: 4 },
  phaseItem: { borderWidth: 1, borderLeftWidth: 3, borderRadius: 10, padding: 10, marginBottom: 6, gap: 5 },
  phaseRow: { flexDirection: 'row', justifyContent: 'space-between' },
  phaseName: { fontSize: 12, fontWeight: '800' },
  phaseCount: { fontSize: 11 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  badgeItem: { alignItems: 'center', width: 56 },
  badgeIcon: { fontSize: 20, marginBottom: 2 },
  badgeName: { fontSize: 8, textAlign: 'center', fontWeight: '600' },
  noteCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 8 },
  noteTitle: { fontSize: 11, fontWeight: '800', marginBottom: 6 },
  noteText: { fontSize: 11, lineHeight: 18 },
  collapsibleHeader: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  collapsibleTitle: { fontSize: 13, fontWeight: '800', flex: 1 },
  collapsibleArrow: { fontSize: 12, fontWeight: '700' },
  collapsibleBody: { borderWidth: 1, borderTopWidth: 0, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, padding: 14, gap: 12, marginTop: -1 },
  scienceItem: { gap: 4 },
  sciencePhase: { fontSize: 11, fontWeight: '800' },
  scienceText: { fontSize: 11, lineHeight: 18 },
  tipItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  tipEmoji: { fontSize: 16, marginTop: 1 },
  tipText: { fontSize: 11, lineHeight: 18, flex: 1 },
});
