// FutStar — Quiz de Posição
// 5 perguntas visuais, uma por vez, com resultado e confirmação
// Usa o sistema de scoring de data/positions.ts

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { useAppContext } from '../store/progress';
import {
  QUIZ_QUESTIONS,
  calculatePosition,
  POSITIONS,
  type PositionKey,
} from '../data/positions';
import { t } from '../i18n';

const { width } = Dimensions.get('window');

type QuizStage = 'questions' | 'result' | 'choose';

export default function QuizPosicaoScreen() {
  const router = useRouter();
  const { profile, saveProfile, theme } = useAppContext();

  const [stage, setStage] = useState<QuizStage>('questions');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [suggestedPosition, setSuggestedPosition] = useState<PositionKey | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<PositionKey | null>(null);
  const [saving, setSaving] = useState(false);

  // Tema dinâmico pelo perfil já salvo
  const c = theme.colors;
  const isKids = theme.mode === 'kids';

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calcular resultado
      const result = calculatePosition(newAnswers);
      setSuggestedPosition(result.position);
      setSelectedPosition(result.position);
      setStage('result');
    }
  };

  const handleConfirm = async () => {
    if (!selectedPosition || !profile || saving) return;
    setSaving(true);

    try {
      // Determina trilha baseado na posição
      const trilha = selectedPosition === 'goleiro' ? 'Goleiro' : 'Todos';

      await saveProfile({
        ...profile,
        position: selectedPosition,
        trilha,
        onboardingDone: true,
      });
      router.replace('/(tabs)/treinos' as any);
    } catch {
      setSaving(false);
    }
  };

  const handleChooseOther = () => {
    setStage('choose');
  };

  const handleSelectFromList = (posKey: PositionKey) => {
    setSelectedPosition(posKey);
    setStage('result');
  };

  // ============================================================
  // RENDER: Perguntas
  // ============================================================
  if (stage === 'questions') {
    const question = QUIZ_QUESTIONS[currentQ];
    const progress = ((currentQ + 1) / QUIZ_QUESTIONS.length) * 100;

    return (
      <View style={[styles.container, { backgroundColor: c.bgPrimary }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress bar */}
          <View style={styles.progressSection}>
            <Text style={[styles.progressLabel, { color: c.textMuted }]}>
              {t('quiz_question_of', { current: currentQ + 1, total: QUIZ_QUESTIONS.length })}
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: c.borderDefault }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: c.accentGreen,
                  },
                ]}
              />
            </View>
          </View>

          {/* Question */}
          <Animated.View
            key={`q-${currentQ}`}
            entering={SlideInRight.duration(300)}
            style={styles.questionSection}
          >
            <Text style={[styles.questionEmoji]}>
              {currentQ === 0 ? '⚽' : currentQ === 1 ? '💪' : currentQ === 2 ? '🏟️' : currentQ === 3 ? '🎯' : '⭐'}
            </Text>
            <Text style={[styles.questionText, { color: c.textPrimary }]}>
              {question.question}
            </Text>
          </Animated.View>

          {/* Options */}
          <Animated.View
            key={`opts-${currentQ}`}
            entering={FadeInDown.delay(150).duration(400)}
            style={styles.optionsContainer}
          >
            {question.options.map((option, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleAnswer(i)}
                activeOpacity={0.7}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: c.bgCard,
                    borderColor: c.borderDefault,
                  },
                ]}
              >
                <View style={[styles.optionIconContainer, { backgroundColor: c.bgElevated }]}>
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    { color: c.textPrimary },
                  ]}
                >
                  {option.text}
                </Text>
                <Text style={[styles.optionArrow, { color: c.textDim }]}>›</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // ============================================================
  // RENDER: Escolher outra posição
  // ============================================================
  if (stage === 'choose') {
    const positionKeys = Object.keys(POSITIONS) as PositionKey[];

    return (
      <View style={[styles.container, { backgroundColor: c.bgPrimary }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.chooseHeader}>
            <Text style={[styles.chooseTitle, { color: c.textPrimary }]}>
              {t('quiz_choose_title')}
            </Text>
            <Text style={[styles.chooseSubtitle, { color: c.textMuted }]}>
              {t('quiz_choose_sub')}
            </Text>
          </View>

          {/* Position list */}
          {positionKeys.map((key, i) => {
            const pos = POSITIONS[key];
            const isSuggested = key === suggestedPosition;

            return (
              <Animated.View
                key={key}
                entering={FadeInDown.delay(i * 50).duration(300)}
              >
                <TouchableOpacity
                  onPress={() => handleSelectFromList(key)}
                  activeOpacity={0.7}
                  style={[
                    styles.positionListItem,
                    {
                      backgroundColor: isSuggested
                        ? c.accentGreen + '10'
                        : c.bgCard,
                      borderColor: isSuggested
                        ? c.accentGreen + '33'
                        : c.borderDefault,
                      borderLeftColor: pos.color,
                    },
                  ]}
                >
                  <Text style={styles.positionListIcon}>{pos.icon}</Text>
                  <View style={styles.positionListInfo}>
                    <View style={styles.positionListNameRow}>
                      <Text style={[styles.positionListName, { color: c.textPrimary }]}>
                        {pos.label}
                      </Text>
                      {isSuggested && (
                        <View style={[styles.suggestedBadge, { backgroundColor: c.accentGreen + '22' }]}>
                          <Text style={[styles.suggestedBadgeText, { color: c.accentGreen }]}>
                            {t('quiz_suggested_badge')}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[styles.positionListDesc, { color: c.textMuted }]}
                      numberOfLines={1}
                    >
                      {pos.famousPlayers.join(' · ')}
                    </Text>
                  </View>
                  <Text style={[styles.positionListArrow, { color: pos.color }]}>›</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          {/* Back button */}
          <TouchableOpacity
            onPress={() => setStage('result')}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, { color: c.textMuted }]}>
              ← {t('pais_back')}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  // ============================================================
  // RENDER: Resultado
  // ============================================================
  const position = selectedPosition ? POSITIONS[selectedPosition] : null;
  if (!position) return null;

  const isOriginalSuggestion = selectedPosition === suggestedPosition;

  return (
    <View style={[styles.container, { backgroundColor: c.bgPrimary }]}>
      <ScrollView
        contentContainerStyle={styles.resultScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration header */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.resultHeader}
        >
          <LinearGradient
            colors={[position.color + '15', c.bgPrimary]}
            style={styles.resultGradient}
          >
            <Animated.Text
              entering={FadeInDown.delay(200).duration(500)}
              style={styles.resultSubLabel}
            >
              {isOriginalSuggestion ? t('quiz_result_suggested') : t('quiz_result_chosen')}
            </Animated.Text>

            {/* Position icon - large */}
            <Animated.View
              entering={FadeInDown.delay(350).duration(500)}
              style={[styles.resultIconContainer, { borderColor: position.color + '33' }]}
            >
              <View style={[styles.resultIconInner, { backgroundColor: position.color + '15' }]}>
                <Text style={styles.resultIconEmoji}>{position.icon}</Text>
              </View>
            </Animated.View>

            <Animated.Text
              entering={FadeInDown.delay(500).duration(500)}
              style={[styles.resultPositionName, { color: position.color }]}
            >
              {position.label}
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(600).duration(500)}
              style={[styles.resultShortLabel, { color: c.textMuted }]}
            >
              {position.shortLabel}
            </Animated.Text>
          </LinearGradient>
        </Animated.View>

        {/* Description card */}
        <Animated.View
          entering={FadeInUp.delay(700).duration(500)}
          style={[
            styles.resultDescCard,
            {
              backgroundColor: c.bgCard,
              borderColor: position.color + '22',
              borderLeftColor: position.color,
            },
          ]}
        >
          <Text style={[styles.resultDescText, { color: c.textSecondary }]}>
            {position.description}
          </Text>
        </Animated.View>

        {/* Famous players */}
        <Animated.View
          entering={FadeInUp.delay(850).duration(500)}
          style={[
            styles.playersCard,
            {
              backgroundColor: c.bgCard,
              borderColor: c.borderDefault,
            },
          ]}
        >
          <Text style={[styles.playersLabel, { color: c.textMuted }]}>
            {t('quiz_famous_players')}
          </Text>
          <View style={styles.playersRow}>
            {position.famousPlayers.map((player, i) => (
              <View
                key={player}
                style={[
                  styles.playerChip,
                  {
                    backgroundColor: position.color + '12',
                    borderColor: position.color + '22',
                  },
                ]}
              >
                <Text style={[styles.playerChipText, { color: position.color }]}>
                  {player}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          entering={FadeInUp.delay(1000).duration(500)}
          style={styles.resultActions}
        >
          {/* Primary: Confirm */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={saving}
            activeOpacity={0.8}
            style={styles.confirmOuter}
          >
            <LinearGradient
              colors={[position.color, position.color + 'cc']}
              style={styles.confirmButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.confirmText}>
                {saving ? t('cadastro_saving') : t('quiz_accept')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary: Choose other */}
          <TouchableOpacity
            onPress={handleChooseOther}
            activeOpacity={0.7}
            style={[
              styles.chooseOtherButton,
              { borderColor: c.borderDefault },
            ]}
          >
            <Text style={[styles.chooseOtherText, { color: c.textMuted }]}>
              {t('quiz_choose_other')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  resultScrollContent: {
    paddingBottom: 40,
  },

  // ---- Progress ----
  progressSection: {
    marginBottom: 32,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // ---- Question ----
  questionSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  questionEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.3,
  },

  // ---- Options ----
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 24,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  optionArrow: {
    fontSize: 24,
    fontWeight: '300',
  },

  // ---- Choose position list ----
  chooseHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chooseTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  chooseSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  positionListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 8,
  },
  positionListIcon: {
    fontSize: 22,
  },
  positionListInfo: {
    flex: 1,
  },
  positionListNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  positionListName: {
    fontSize: 14,
    fontWeight: '800',
  },
  suggestedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  suggestedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  positionListDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  positionListArrow: {
    fontSize: 20,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ---- Result ----
  resultHeader: {
    marginBottom: 16,
  },
  resultGradient: {
    paddingTop: 60,
    paddingBottom: 28,
    alignItems: 'center',
  },
  resultSubLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  resultIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultIconInner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultIconEmoji: {
    fontSize: 52,
  },
  resultPositionName: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  resultShortLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  resultDescCard: {
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  resultDescText: {
    fontSize: 14,
    lineHeight: 22,
  },
  playersCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  playersLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
  },
  playersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  playerChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  resultActions: {
    paddingHorizontal: 24,
    gap: 10,
  },
  confirmOuter: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  confirmButton: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#06100a',
    letterSpacing: 0.3,
  },
  chooseOtherButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
  chooseOtherText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
