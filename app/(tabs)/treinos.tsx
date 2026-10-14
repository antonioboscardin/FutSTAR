// FutStar — Aba Treinos v3 (Banco Unificado)
// Mostra o treino do dia do jogador com fases expansíveis

import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppContext } from '../../store/progress';
import { withOpacity } from '../../constants/theme';
import { getCurrentLocale } from '../../i18n';
import {
  type Workout, type WorkoutPhase, type WorkoutExercise,
  i18nText, getPhaseIcon, getPhaseColor,
  WORKOUT_LEVELS, LEVEL_ORDER, DAY_LABELS,
} from '../../data/workoutsData';
import ProgressBar from '../../components/ProgressBar';
import StreakFlame from '../../components/StreakFlame';
import AnimatedEntrance from '../../components/AnimatedEntrance';

type Lang = 'pt' | 'es' | 'en';

export default function TreinosScreen() {
  const {
    theme, profile, streak, xp, playerLevel,
    getCurrentWorkout, completeWorkout, getWorkoutProgress,
    nivelAtual, semanaAtual, diaAtual, treinosConcluidos,
  } = useAppContext();
  const c = theme.colors;
  const router = useRouter();
  const lang = (getCurrentLocale() || 'pt') as Lang;

  const workout = getCurrentWorkout();
  const progress = getWorkoutProgress();
  const levelInfo = WORKOUT_LEVELS.find(l => l.key === nivelAtual);
  const dayLabel = DAY_LABELS[(diaAtual - 1)] || DAY_LABELS[0];

  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);
  const [openedPhases, setOpenedPhases] = useState<Set<number>>(new Set([0])); // phase 0 starts expanded
  const [completing, setCompleting] = useState(false);
  const isCompleted = workout ? treinosConcluidos.includes(workout.id) : false;

  const totalPhases = workout ? workout.fases.length : 0;
  const allPhasesViewed = totalPhases > 0 && openedPhases.size >= totalPhases;

  const handleTogglePhase = useCallback((phaseIdx: number) => {
    setExpandedPhase(prev => prev === phaseIdx ? null : phaseIdx);
    setOpenedPhases(prev => {
      if (prev.has(phaseIdx)) return prev;
      const next = new Set(prev);
      next.add(phaseIdx);
      return next;
    });
  }, []);

  const handleComplete = useCallback(async () => {
    if (!workout || completing || isCompleted) return;
    setCompleting(true);
    try {
      const result = await completeWorkout(workout.id);
      // Navega para tela de conclusão
      router.push({
        pathname: '/workout-complete' as any,
        params: {
          xp: String(result.xpGained),
          levelUp: String(result.levelUp),
          workoutTitle: i18nText(workout.titulo, lang),
        },
      });
    } finally {
      setCompleting(false);
    }
  }, [workout, completing, isCompleted, completeWorkout, router, lang]);

  // ---- Sem treino disponível ----
  if (!workout) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <Text style={[styles.greeting, { color: c.textPrimary }]}>
              E aí, {profile?.name || 'Jogador'}! 👋
            </Text>
            <View style={[styles.emptyCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.emptyEmoji}>🏆</Text>
              <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>
                Todos os treinos concluídos!
              </Text>
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                Você completou todos os treinos disponíveis neste nível. Parabéns!
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* ---- Header ---- */}
          <AnimatedEntrance delay={0}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.greeting, { color: c.textPrimary }]}>
                  E aí, {profile?.name || 'Jogador'}! 👋
                </Text>
                <Text style={[styles.greetingSub, { color: c.textSecondary }]}>
                  {i18nText(dayLabel, lang)} · Semana {semanaAtual}
                </Text>
              </View>
              <StreakFlame size="sm" />
            </View>
          </AnimatedEntrance>

          {/* ---- Nível + Progresso ---- */}
          <AnimatedEntrance delay={80}>
            <View style={[styles.levelCard, {
              backgroundColor: c.bgCard,
              borderColor: withOpacity(levelInfo?.color || c.accentGreen, 0.2),
            }]}>
              <View style={styles.levelRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.levelLabel, { color: c.textMuted }]}>NÍVEL</Text>
                  <Text style={[styles.levelName, { color: levelInfo?.color || c.accentGreen }]}>
                    {i18nText(levelInfo?.label || { pt: nivelAtual, es: nivelAtual, en: nivelAtual }, lang)}
                  </Text>
                </View>
                <View style={styles.levelStats}>
                  <Text style={[styles.levelXP, { color: c.accentYellow }]}>⚡ {xp} XP</Text>
                  <Text style={[styles.levelCount, { color: c.textDim }]}>
                    {progress.done}/{progress.total} treinos
                  </Text>
                </View>
              </View>
              <ProgressBar
                progress={progress.pct}
                color={levelInfo?.color || c.accentGreen}
                height={6}
                showLabel
              />
            </View>
          </AnimatedEntrance>

          {/* ---- Treino do Dia ---- */}
          <AnimatedEntrance delay={160}>
            <LinearGradient
              colors={[
                withOpacity(levelInfo?.color || c.accentGreen, 0.12),
                withOpacity(c.bgCard, 0.95),
              ]}
              style={[styles.workoutCard, { borderColor: withOpacity(levelInfo?.color || c.accentGreen, 0.25) }]}
            >
              <Text style={[styles.workoutLabel, { color: c.textMuted }]}>
                TREINO DO DIA
              </Text>
              <Text style={[styles.workoutTitle, { color: c.textPrimary }]}>
                {i18nText(workout.titulo, lang)}
              </Text>
              <View style={styles.workoutMeta}>
                <Text style={[styles.metaItem, { color: c.textSecondary }]}>
                  ⏱ {workout.duracao_minutos} min
                </Text>
                <Text style={[styles.metaItem, { color: c.accentYellow }]}>
                  ⚡ +{workout.xp_recompensa} XP
                </Text>
                <Text style={[styles.metaItem, { color: c.textSecondary }]}>
                  📍 {workout.local}
                </Text>
              </View>

              {/* Frase de início */}
              <View style={[styles.quoteBox, { backgroundColor: withOpacity(c.bgPrimary, 0.5) }]}>
                <Text style={[styles.quoteText, { color: c.textSecondary }]}>
                  {i18nText(workout.frase_inicio, lang)}
                </Text>
              </View>

              {/* Equipamentos */}
              {workout.equipamentos.length > 0 && (
                <View style={styles.equipRow}>
                  <Text style={[styles.equipLabel, { color: c.textMuted }]}>🎒 </Text>
                  <Text style={[styles.equipText, { color: c.textDim }]}>
                    {workout.equipamentos.join(' · ')}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </AnimatedEntrance>

          {/* ---- Fases do Treino ---- */}
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>
            FASES DO TREINO
          </Text>

          {workout.fases.map((phase, phaseIdx) => (
            <AnimatedEntrance key={phaseIdx} delay={240 + phaseIdx * 80}>
              <PhaseCard
                phase={phase}
                index={phaseIdx}
                isExpanded={expandedPhase === phaseIdx}
                onToggle={() => handleTogglePhase(phaseIdx)}
                colors={c}
                lang={lang}
              />
            </AnimatedEntrance>
          ))}

          {/* ---- Botão Concluir ---- */}
          <AnimatedEntrance delay={500}>
            <TouchableOpacity
              onPress={handleComplete}
              disabled={completing || isCompleted || !allPhasesViewed}
              activeOpacity={0.8}
              style={[styles.completeBtn, {
                backgroundColor: isCompleted
                  ? withOpacity(c.accentGreen, 0.15)
                  : allPhasesViewed
                    ? c.accentGreen
                    : withOpacity(c.textDim, 0.25),
                opacity: completing ? 0.6 : 1,
              }]}
            >
              <Text style={[styles.completeBtnText, {
                color: isCompleted
                  ? c.accentGreen
                  : allPhasesViewed
                    ? '#06100a'
                    : c.textDim,
              }]}>
                {isCompleted
                  ? '✅ Treino Concluído!'
                  : completing
                    ? 'Salvando...'
                    : '🚀 Concluir Treino'}
              </Text>
            </TouchableOpacity>
            {!allPhasesViewed && !isCompleted && (
              <Text style={[styles.lockHint, { color: c.textDim }]}>
                🔒 Veja todas as fases do treino para concluir ({openedPhases.size}/{totalPhases})
              </Text>
            )}
          </AnimatedEntrance>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==============================================================
// Phase Card (expandível)
// ==============================================================

interface PhaseCardProps {
  phase: WorkoutPhase;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  colors: any;
  lang: Lang;
}

function PhaseCard({ phase, index, isExpanded, onToggle, colors: c, lang }: PhaseCardProps) {
  const phaseColor = getPhaseColor(phase.tipo);
  const phaseIcon = getPhaseIcon(phase.tipo);

  return (
    <View style={[styles.phaseCard, {
      backgroundColor: c.bgCard,
      borderColor: withOpacity(phaseColor, 0.2),
      borderLeftColor: phaseColor,
    }]}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7} style={styles.phaseHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.phaseHeaderRow}>
            <Text style={[styles.phaseIcon]}>{phaseIcon}</Text>
            <Text style={[styles.phaseName, { color: phaseColor }]}>
              {i18nText(phase.nome, lang)}
            </Text>
          </View>
          <Text style={[styles.phaseMeta, { color: c.textDim }]}>
            {phase.duracao_minutos} min · {phase.exercicios.length} exercícios
          </Text>
        </View>
        <Text style={[styles.phaseChevron, { color: c.textDim }]}>
          {isExpanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.exerciseList}>
          {phase.exercicios.map((ex, exIdx) => (
            <ExerciseItem key={exIdx} exercise={ex} index={exIdx} colors={c} lang={lang} phaseColor={phaseColor} />
          ))}
        </View>
      )}
    </View>
  );
}

// ==============================================================
// Exercise Item
// ==============================================================

interface ExerciseItemProps {
  exercise: WorkoutExercise;
  index: number;
  colors: any;
  lang: Lang;
  phaseColor: string;
}

function ExerciseItem({ exercise, index, colors: c, lang, phaseColor }: ExerciseItemProps) {
  const [expanded, setExpanded] = useState(false);

  // Format duration/reps
  let durationText = '';
  if (exercise.duracao_segundos) {
    const mins = Math.floor(exercise.duracao_segundos / 60);
    const secs = exercise.duracao_segundos % 60;
    durationText = mins > 0 ? `${mins}min${secs > 0 ? ` ${secs}s` : ''}` : `${secs}s`;
  }

  let repsText = '';
  if (exercise.repeticoes) {
    repsText = `${exercise.repeticoes}${exercise.series ? ` × ${exercise.series} séries` : ' reps'}`;
  }

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
      style={[styles.exerciseItem, {
        backgroundColor: withOpacity(c.bgPrimary, 0.3),
        borderColor: withOpacity(phaseColor, 0.1),
      }]}
    >
      <View style={styles.exerciseRow}>
        <Text style={[styles.exerciseNum, { color: phaseColor }]}>{index + 1}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.exerciseName, { color: c.textPrimary }]}>
            {i18nText(exercise.nome, lang)}
          </Text>
          <View style={styles.exerciseMetaRow}>
            {durationText ? (
              <Text style={[styles.exerciseMetaItem, { color: c.textDim }]}>⏱ {durationText}</Text>
            ) : null}
            {repsText ? (
              <Text style={[styles.exerciseMetaItem, { color: c.textDim }]}>🔄 {repsText}</Text>
            ) : null}
            {exercise.descanso_segundos ? (
              <Text style={[styles.exerciseMetaItem, { color: c.textDim }]}>😮‍💨 {exercise.descanso_segundos}s desc.</Text>
            ) : null}
          </View>
        </View>
        <Text style={[styles.exerciseChevron, { color: c.textDim }]}>
          {expanded ? '▼' : '▶'}
        </Text>
      </View>

      {expanded && (
        <View style={styles.exerciseDetails}>
          <Text style={[styles.exerciseDesc, { color: c.textSecondary }]}>
            {i18nText(exercise.descricao, lang)}
          </Text>

          {exercise.dica && (
            <View style={[styles.tipBox, { backgroundColor: withOpacity('#2aff9e', 0.08) }]}>
              <Text style={[styles.tipLabel, { color: '#2aff9e' }]}>💡 Dica</Text>
              <Text style={[styles.tipText, { color: c.textSecondary }]}>
                {i18nText(exercise.dica, lang)}
              </Text>
            </View>
          )}

          {exercise.erro_comum && (
            <View style={[styles.tipBox, { backgroundColor: withOpacity('#f43f5e', 0.08) }]}>
              <Text style={[styles.tipLabel, { color: '#f43f5e' }]}>⚠️ Erro comum</Text>
              <Text style={[styles.tipText, { color: c.textSecondary }]}>
                {i18nText(exercise.erro_comum, lang)}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ==============================================================
// Styles
// ==============================================================

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },
  content: { padding: 16, paddingTop: 50 },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 20, fontWeight: '900' },
  greetingSub: { fontSize: 12, marginTop: 2 },

  // Level card
  levelCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 14, gap: 8 },
  levelRow: { flexDirection: 'row', alignItems: 'center' },
  levelLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  levelName: { fontSize: 16, fontWeight: '900', marginTop: 2 },
  levelStats: { alignItems: 'flex-end' },
  levelXP: { fontSize: 13, fontWeight: '800' },
  levelCount: { fontSize: 10, marginTop: 2 },

  // Workout card
  workoutCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
  workoutLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  workoutTitle: { fontSize: 18, fontWeight: '900', marginBottom: 8 },
  workoutMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  metaItem: { fontSize: 11, fontWeight: '600' },
  quoteBox: { borderRadius: 10, padding: 10, marginBottom: 8 },
  quoteText: { fontSize: 12, fontStyle: 'italic', lineHeight: 18 },
  equipRow: { flexDirection: 'row', alignItems: 'flex-start' },
  equipLabel: { fontSize: 12 },
  equipText: { fontSize: 10, flex: 1, lineHeight: 16 },

  // Section
  sectionTitle: { fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },

  // Phase card
  phaseCard: { borderWidth: 1, borderLeftWidth: 3, borderRadius: 12, marginBottom: 8, overflow: 'hidden' },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  phaseHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phaseIcon: { fontSize: 16 },
  phaseName: { fontSize: 14, fontWeight: '800' },
  phaseMeta: { fontSize: 10, marginTop: 2, marginLeft: 22 },
  phaseChevron: { fontSize: 10 },

  // Exercise list
  exerciseList: { paddingHorizontal: 10, paddingBottom: 10, gap: 6 },
  exerciseItem: { borderWidth: 1, borderRadius: 10, padding: 10 },
  exerciseRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  exerciseNum: { fontSize: 13, fontWeight: '900', width: 20, textAlign: 'center', marginTop: 1 },
  exerciseName: { fontSize: 13, fontWeight: '700' },
  exerciseMetaRow: { flexDirection: 'row', gap: 10, marginTop: 3 },
  exerciseMetaItem: { fontSize: 9 },
  exerciseChevron: { fontSize: 9, marginTop: 3 },

  // Exercise details
  exerciseDetails: { marginTop: 8, marginLeft: 28, gap: 6 },
  exerciseDesc: { fontSize: 12, lineHeight: 18 },
  tipBox: { borderRadius: 8, padding: 8, gap: 3 },
  tipLabel: { fontSize: 10, fontWeight: '800' },
  tipText: { fontSize: 11, lineHeight: 16 },

  // Complete button
  completeBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 10 },
  completeBtnText: { fontSize: 16, fontWeight: '900' },
  lockHint: { fontSize: 11, textAlign: 'center', marginTop: 8, fontStyle: 'italic' },

  // Empty state
  emptyCard: { borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '900' },
  emptyText: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
