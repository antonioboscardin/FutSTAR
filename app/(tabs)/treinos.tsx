// FutStar — Aba Treinos (Completa v2)
// Tela principal do app com:
// - Header com nome + streak
// - Card "Treino de Hoje" (mostra treino do dia atual ou descanso)
// - Mini barra de progresso geral (animada, baseada em dias)
// - Seletor de fase (4 botões grid)
// - Objetivo da fase
// - Seletor de dia (scroll horizontal, hoje destacado)
// - Card do dia (nome, foco, duração, parceiro)
// - Sistema de marcação per-day com semana 1 e semana 2
// - Regras de Ouro
// - Confetti e Toast ao completar treinos

import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext, type TrainingResult } from '../../store/progress';
import { PHASES, TRAINING_DAY_INDICES } from '../../data/phases';
import { withOpacity } from '../../constants/theme';
import PhaseSelector from '../../components/PhaseSelector';
import DaySelector from '../../components/DaySelector';
import ExerciseCard from '../../components/ExerciseCard';
import WeekMark from '../../components/WeekMark';
import StreakBadge from '../../components/StreakBadge';
import ProgressBar from '../../components/ProgressBar';
import Toast, { type ToastData } from '../../components/Toast';
import ConfettiOverlay from '../../components/ConfettiOverlay';
import GolAnimation from '../../components/GolAnimation';

const GOLDEN_RULES = [
  '🥤 Hidrata sempre — antes, durante e depois',
  '🛑 Dor real não é cansaço. Para se doer de verdade',
  '🦶 Pé esquerdo todo dia — o hábito cria o ambidestro',
  '✅ Qualidade acima de Quantidade — executa certo',
  '📺 Assiste Vini Jr., Neymar, Salah — copia os movimentos',
];

// Map JS Date.getDay() (0=Sun,1=Mon...6=Sat) to our day index (0=SEG...6=DOM)
function getTodayDayIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default function TreinosScreen() {
  const {
    theme,
    profile,
    getTotalProgress,
    getPhaseProgress,
  } = useAppContext();
  const c = theme.colors;

  const todayIndex = getTodayDayIndex();
  const [selectedPhase, setSelectedPhase] = useState(0);
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const toastCounter = useRef(0);

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPhaseConfetti, setIsPhaseConfetti] = useState(false);

  // GOL animation state (kids only)
  const [showGol, setShowGol] = useState(false);
  const isKids = profile ? profile.age <= 12 : false;
  const pendingResult = useRef<{ result: TrainingResult } | null>(null);

  const phase = PHASES[selectedPhase];
  const day = phase.days[selectedDay];
  const totalProgress = getTotalProgress();
  const phaseProgress = getPhaseProgress(selectedPhase);
  const phasePct = phaseProgress.total > 0
    ? Math.round((phaseProgress.done / phaseProgress.total) * 100)
    : 0;

  // Today's training info
  const todayDay = phase.days[todayIndex];
  const isTodayTraining = todayDay?.type === 'treino';

  const handleSelectPhase = useCallback((index: number) => {
    setSelectedPhase(index);
    setSelectedDay(todayIndex);
    setExpandedExercise(null);
  }, [todayIndex]);

  const handleSelectDay = useCallback((index: number) => {
    setSelectedDay(index);
    setExpandedExercise(null);
  }, []);

  const handleToggleExercise = useCallback((index: number) => {
    setExpandedExercise(prev => (prev === index ? null : index));
  }, []);

  const addToast = useCallback((message: string, emoji: string, color: string, type: ToastData['type'] = 'normal', duration?: number) => {
    const id = `toast_${++toastCounter.current}`;
    setToasts(prev => [...prev, { id, message, emoji, color, type, duration }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showFeedback = useCallback((result: TrainingResult) => {
    // Show confetti (for PRO) or after GOL animation (for kids)
    setIsPhaseConfetti(result.phaseComplete);
    setShowConfetti(true);

    // Show appropriate toast
    if (result.phaseComplete) {
      addToast('FASE COMPLETA! Você evoluiu!', '⭐', '#a78bfa', 'phase', 4000);
    } else if (result.weekComplete) {
      addToast(`Semana completa! +200 XP bônus!`, '🏆', '#fbbf24', 'celebration', 3500);
    } else {
      addToast(`+${result.xpGained} XP — Continue assim!`, '🔥', '#4ade80', 'normal', 2500);
    }
  }, [addToast]);

  const handleTrainingComplete = useCallback((result: TrainingResult, weekIndex: number) => {
    if (!result.marked) return;

    if (isKids) {
      // Kids: show GOL animation first, then confetti/toast after
      pendingResult.current = { result };
      setShowGol(true);
    } else {
      // PRO: show confetti + toast directly
      showFeedback(result);
    }
  }, [isKids, showFeedback]);

  const handleGolComplete = useCallback(() => {
    setShowGol(false);
    if (pendingResult.current) {
      showFeedback(pendingResult.current.result);
      pendingResult.current = null;
    }
  }, [showFeedback]);

  const isTrainingDay = day.type === 'treino';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.bgPrimary }]}>
      {/* GOL animation (kids only) */}
      <GolAnimation visible={showGol} onComplete={handleGolComplete} />

      {/* Confetti overlay */}
      <ConfettiOverlay
        visible={showConfetti}
        isPhaseComplete={isPhaseConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Toast stack */}
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <LinearGradient
          colors={c.headerGradient}
          style={styles.header}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        >
          {/* Top badge */}
          <View style={styles.topBadge}>
            <View
              style={[
                styles.badgePill,
                {
                  backgroundColor: withOpacity(c.accentGreen, 0.08),
                  borderColor: withOpacity(c.accentGreen, 0.17),
                },
              ]}
            >
              <Text style={[styles.badgePillText, { color: c.accentGreen }]}>
                ⚽ FutStar {theme.mode === 'pro' ? 'PRO' : 'KIDS'}
              </Text>
            </View>
          </View>

          {/* Name + Streak row */}
          <View style={styles.nameRow}>
            <View style={styles.nameInfo}>
              <Text style={[styles.greeting, { color: c.textPrimary }]}>
                E aí, {profile?.name || 'Jogador'}! 👋
              </Text>
              <Text style={[styles.greetingSub, { color: c.textDim }]}>
                Bora treinar hoje?
              </Text>
            </View>
            <StreakBadge size="sm" />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* ============================================================ */}
          {/* TREINO DE HOJE CARD */}
          {/* ============================================================ */}
          <View
            style={[
              styles.todayCard,
              {
                backgroundColor: isTodayTraining
                  ? withOpacity(todayDay.color, 0.06)
                  : withOpacity('#60a5fa', 0.05),
                borderColor: isTodayTraining
                  ? withOpacity(todayDay.color, 0.2)
                  : withOpacity('#60a5fa', 0.12),
              },
            ]}
          >
            <View style={styles.todayCardHeader}>
              <Text style={[styles.todayCardLabel, { color: c.textMuted }]}>
                TREINO DE HOJE
              </Text>
              <Text style={[styles.todayCardDay, { color: c.textDim }]}>
                {todayDay?.label}
              </Text>
            </View>
            {isTodayTraining ? (
              <View>
                <Text style={[styles.todayCardFocus, { color: todayDay.color }]}>
                  {todayDay.icon} {todayDay.focus}
                </Text>
                <Text style={[styles.todayCardDuration, { color: c.textDim }]}>
                  ⏱ {todayDay.duration}
                </Text>
                {selectedDay !== todayIndex && (
                  <TouchableOpacity
                    onPress={() => setSelectedDay(todayIndex)}
                    activeOpacity={0.7}
                    style={[
                      styles.goTodayBtn,
                      {
                        backgroundColor: withOpacity(todayDay.color, 0.12),
                        borderColor: withOpacity(todayDay.color, 0.25),
                      },
                    ]}
                  >
                    <Text style={[styles.goTodayBtnText, { color: todayDay.color }]}>
                      Iniciar treino de hoje →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View>
                <Text style={[styles.todayCardFocus, { color: '#60a5fa' }]}>
                  💤 Dia de Descanso Ativo
                </Text>
                <Text style={[styles.todayCardDuration, { color: c.textDim }]}>
                  Alongue 10 min · Assista jogos e analise movimentos
                </Text>
              </View>
            )}
          </View>

          {/* ============================================================ */}
          {/* PROGRESS CARD (baseado em dias, não semanas) */}
          {/* ============================================================ */}
          <View
            style={[
              styles.progressCard,
              {
                backgroundColor: c.bgCard,
                borderColor: c.borderDefault,
              },
            ]}
          >
            <View style={styles.progressCardRow}>
              <View>
                <Text style={[styles.progressLabel, { color: c.textMuted }]}>
                  Progresso Geral
                </Text>
                <View style={styles.progressNumbers}>
                  <Text style={[styles.progressBig, { color: c.accentGreen }]}>
                    {totalProgress.done}
                  </Text>
                  <Text style={[styles.progressSmall, { color: c.textDim }]}>
                    {' '}/ {totalProgress.total} treinos feitos
                  </Text>
                </View>
              </View>
              <View style={styles.progressRight}>
                <Text style={[styles.progressRightLabel, { color: c.textDim }]}>
                  Esta fase
                </Text>
                <Text style={[styles.progressRightValue, { color: phase.color }]}>
                  {phaseProgress.done} de {phaseProgress.total}
                </Text>
              </View>
            </View>
            {/* Animated phase progress bar */}
            <View style={{ marginTop: 8 }}>
              <ProgressBar
                progress={phasePct}
                color={phase.color}
                height={6}
                showLabel
              />
            </View>
          </View>

          {/* ============================================================ */}
          {/* PHASE SELECTOR */}
          {/* ============================================================ */}
          <PhaseSelector
            selectedPhase={selectedPhase}
            onSelectPhase={handleSelectPhase}
          />

          {/* Phase objective */}
          <View
            style={[
              styles.objectiveCard,
              {
                backgroundColor: withOpacity(phase.color, 0.06),
                borderColor: withOpacity(phase.color, 0.13),
              },
            ]}
          >
            <Text style={styles.objectiveText}>
              <Text style={[styles.objectiveLabel, { color: phase.color }]}>
                Objetivo:{' '}
              </Text>
              <Text style={{ color: c.textSecondary }}>{phase.description}</Text>
            </Text>
          </View>

          {/* ============================================================ */}
          {/* DAY SELECTOR */}
          {/* ============================================================ */}
          <DaySelector
            days={phase.days}
            selectedDay={selectedDay}
            phaseIndex={selectedPhase}
            onSelectDay={handleSelectDay}
          />

          {/* ============================================================ */}
          {/* DAY CARD */}
          {/* ============================================================ */}
          <View
            style={[
              styles.dayCard,
              {
                backgroundColor: withOpacity(day.color, 0.06),
                borderColor: withOpacity(day.color, 0.13),
              },
            ]}
          >
            <View style={styles.dayCardRow}>
              <View style={styles.dayCardLeft}>
                <Text style={[styles.dayCardTitle, { color: c.textPrimary }]}>
                  {day.label}
                </Text>
                <Text style={[styles.dayCardFocus, { color: day.color }]}>
                  {day.focus}
                </Text>
                {day.needsPartner && (
                  <View
                    style={[
                      styles.partnerBadge,
                      {
                        backgroundColor: '#1a140a',
                        borderColor: withOpacity('#fbbf24', 0.16),
                      },
                    ]}
                  >
                    <Text style={styles.partnerBadgeText}>
                      👥 Ótimo com parceiro
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.dayCardRight}>
                {day.duration !== '-' ? (
                  <>
                    <Text style={[styles.dayCardDuration, { color: day.color }]}>
                      {day.duration.split(' ')[0]}
                    </Text>
                    <Text style={[styles.dayCardDurationUnit, { color: c.textDim }]}>
                      minutos
                    </Text>
                  </>
                ) : (
                  <View
                    style={[
                      styles.restIcon,
                      { backgroundColor: withOpacity(day.color, 0.1) },
                    ]}
                  >
                    <Text style={styles.restIconText}>{day.icon}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ============================================================ */}
          {/* WEEK MARK — per-day completion system */}
          {/* ============================================================ */}
          <WeekMark
            phaseIndex={selectedPhase}
            dayColor={day.color}
            onTrainingComplete={handleTrainingComplete}
          />

          {/* ============================================================ */}
          {/* EXERCISE LIST */}
          {/* ============================================================ */}
          {day.exercises.map((exercise, i) => (
            <ExerciseCard
              key={`${selectedPhase}-${selectedDay}-${i}`}
              exercise={exercise}
              dayColor={day.color}
              isExpanded={expandedExercise === i}
              onToggle={() => handleToggleExercise(i)}
            />
          ))}

          {/* ============================================================ */}
          {/* GOLDEN RULES */}
          {/* ============================================================ */}
          <View
            style={[
              styles.rulesCard,
              {
                backgroundColor: c.bgCard,
                borderColor: c.borderDefault,
              },
            ]}
          >
            <Text style={[styles.rulesTitle, { color: '#fbbf24' }]}>
              🏆 Regras de Ouro
            </Text>
            {GOLDEN_RULES.map((rule, i) => (
              <View
                key={i}
                style={[
                  styles.ruleRow,
                  {
                    borderBottomColor:
                      i < GOLDEN_RULES.length - 1 ? c.borderDefault : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.ruleText, { color: c.textDim }]}>
                  {rule}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header
  header: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2840',
  },
  topBadge: {
    alignItems: 'center',
    marginBottom: 14,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameInfo: {},
  greeting: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  greetingSub: {
    fontSize: 12,
    marginTop: 2,
  },

  // Content
  content: {
    padding: 14,
  },

  // Today card
  todayCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  todayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  todayCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  todayCardDay: {
    fontSize: 10,
  },
  todayCardFocus: {
    fontSize: 13,
    fontWeight: '800',
  },
  todayCardDuration: {
    fontSize: 11,
    marginTop: 3,
  },
  goTodayBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  goTodayBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Progress card
  progressCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  progressCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  progressBig: {
    fontSize: 20,
    fontWeight: '900',
  },
  progressSmall: {
    fontSize: 11,
    fontWeight: '400',
  },
  progressRight: {
    alignItems: 'flex-end',
  },
  progressRightLabel: {
    fontSize: 10,
  },
  progressRightValue: {
    fontSize: 14,
    fontWeight: '800',
  },

  // Objective
  objectiveCard: {
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 12,
  },
  objectiveText: {
    fontSize: 11,
    lineHeight: 18,
  },
  objectiveLabel: {
    fontWeight: '700',
  },

  // Day card
  dayCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  dayCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dayCardLeft: {
    flex: 1,
  },
  dayCardTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  dayCardFocus: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  partnerBadgeText: {
    fontSize: 9,
    color: '#fbbf24',
  },
  dayCardRight: {
    alignItems: 'flex-end',
  },
  dayCardDuration: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  dayCardDurationUnit: {
    fontSize: 10,
  },
  restIcon: {
    borderRadius: 10,
    padding: 7,
  },
  restIconText: {
    fontSize: 20,
  },

  // Rules
  rulesCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  rulesTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 9,
  },
  ruleRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  ruleText: {
    fontSize: 11,
  },
});
