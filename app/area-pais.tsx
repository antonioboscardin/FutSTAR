// FutStar — Tela Área dos Pais (Completa v2)
// PIN de acesso (4 dígitos) OU código de 6 dígitos
// Dashboard com relatório de uso real, controles parentais
// Protegida por PIN + código de acesso

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
import {
  getParentSettings, saveParentSettings, verifyPin, setPin, clearPin,
  type ParentSettings, TIME_LIMIT_OPTIONS,
} from '../services/parentSettings';
import { getWeeklySleep, formatDuration, type WeeklySleep } from '../services/sleep';
import { getWeeklyUsageReport, type DailyUsage } from '../services/usageTracking';
import { t } from '../i18n';

type Stage = 'auth' | 'code-entry' | 'pin-entry' | 'dashboard' | 'pin-setup';

export default function AreaPaisScreen() {
  const router = useRouter();
  const {
    theme, profile, xp, streak, playerLevel, levelProgress,
    getTotalProgress, getPhaseProgress, unlockedAchievements,
    updateProfileField,
  } = useAppContext();
  const c = theme.colors;

  const [stage, setStage] = useState<Stage>('auth');
  const [parentAccess, setParentAccess] = useState<ParentAccess | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [parentSettings, setParentSettings] = useState<ParentSettings | null>(null);
  const [weeklySleep, setWeeklySleep] = useState<WeeklySleep | null>(null);
  const [usageReport, setUsageReport] = useState<{
    records: DailyUsage[];
    averageMinutes: number;
    totalMinutes: number;
    daysActive: number;
  } | null>(null);

  const toggleSection = (key: string) => {
    setExpandedSection(prev => prev === key ? null : key);
  };

  useEffect(() => {
    getOrCreateParentCode().then(setParentAccess);
    getParentSettings().then(setParentSettings);
    getWeeklySleep().then(setWeeklySleep);
    getWeeklyUsageReport().then(setUsageReport);
  }, []);

  const hasPin = !!parentSettings?.pin;

  const handleVerifyCode = () => {
    if (enteredCode === parentAccess?.code) {
      setStage('dashboard');
      setEnteredCode('');
    } else {
      Alert.alert(t('pais_wrong_code'), t('pais_ask_code'));
    }
  };

  const handleVerifyPin = async () => {
    const valid = await verifyPin(enteredPin);
    if (valid) {
      setStage('dashboard');
      setEnteredPin('');
    } else {
      Alert.alert(t('pais_wrong_pin'), t('pais_wrong_pin_msg'));
      setEnteredPin('');
    }
  };

  const handleRegenerate = async () => {
    const newAccess = await regenerateParentCode();
    setParentAccess(newAccess);
    Alert.alert(t('pais_new_code'), `${t('pais_new_code_msg')}: ${newAccess.code}`);
  };

  const handleToggleKidsLock = async () => {
    if (!parentSettings) return;
    const updated = { ...parentSettings, kidsModeLocked: !parentSettings.kidsModeLocked };
    setParentSettings(updated);
    await saveParentSettings(updated);
    if (updated.kidsModeLocked && profile) {
      await updateProfileField('themeOverride', 'kids');
    }
  };

  const handleCycleTimeLimit = async () => {
    if (!parentSettings) return;
    const currentIdx = TIME_LIMIT_OPTIONS.findIndex(
      opt => opt.value === parentSettings.dailyTimeLimitMinutes
    );
    const nextIdx = (currentIdx + 1) % TIME_LIMIT_OPTIONS.length;
    const updated = {
      ...parentSettings,
      dailyTimeLimitMinutes: TIME_LIMIT_OPTIONS[nextIdx].value,
    };
    setParentSettings(updated);
    await saveParentSettings(updated);
  };

  const handleSetupPin = async () => {
    if (newPin.length !== 4) {
      Alert.alert(t('pais_pin_error'), t('pais_pin_4_digits'));
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert(t('pais_pin_error'), t('pais_pin_mismatch'));
      return;
    }
    await setPin(newPin);
    const updated = await getParentSettings();
    setParentSettings(updated);
    setNewPin('');
    setConfirmPin('');
    setStage('dashboard');
    Alert.alert(t('pais_pin_set'), t('pais_pin_set_msg'));
  };

  const handleRemovePin = () => {
    Alert.alert(
      t('pais_pin_remove_title'),
      t('pais_pin_remove_msg'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          style: 'destructive',
          onPress: async () => {
            await clearPin();
            const updated = await getParentSettings();
            setParentSettings(updated);
          },
        },
      ]
    );
  };

  const total = getTotalProgress();
  const totalPct = total.total > 0 ? Math.round((total.done / total.total) * 100) : 0;

  const currentTimeLimitLabel = TIME_LIMIT_OPTIONS.find(
    opt => opt.value === parentSettings?.dailyTimeLimitMinutes
  )?.label || 'Ilimitado';

  const formatUsageMinutes = (min: number): string => {
    if (min < 60) return `${min}min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  };

  // ---- Tela: Autenticação (código ou PIN) ----
  if (stage === 'auth') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={[styles.backText, { color: c.textMuted }]}>← {t('pais_back')}</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.headerEmoji}>👨‍👩‍👦</Text>
              <Text style={[styles.headerTitle, { color: c.textPrimary }]}>{t('pais_title')}</Text>
              <Text style={[styles.headerSub, { color: c.textSecondary }]}>
                {t('pais_show_code')}
              </Text>
            </View>

            <View style={[styles.codeCard, { backgroundColor: c.bgCard, borderColor: withOpacity(c.accentGreen, 0.2) }]}>
              <Text style={[styles.codeLabel, { color: c.textMuted }]}>{t('pais_access_code')}</Text>
              <Text style={[styles.codeNumber, { color: c.accentGreen }]}>
                {parentAccess?.code || '------'}
              </Text>
              <Text style={[styles.codeSub, { color: c.textDim }]}>
                {t('pais_code_explain')}
              </Text>
            </View>

            {/* Enter with PIN (if configured) */}
            {hasPin && (
              <TouchableOpacity
                onPress={() => setStage('pin-entry')}
                style={[styles.enterBtn, {
                  backgroundColor: withOpacity(c.accentPurple, 0.08),
                  borderColor: withOpacity(c.accentPurple, 0.2),
                }]}
              >
                <Text style={[styles.enterBtnText, { color: c.accentPurple }]}>
                  🔐 {t('pais_enter_pin')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Enter with code */}
            <TouchableOpacity
              onPress={() => setStage('code-entry')}
              style={[styles.enterBtn, {
                backgroundColor: withOpacity(c.accentGreen, 0.08),
                borderColor: withOpacity(c.accentGreen, 0.2),
              }]}
            >
              <Text style={[styles.enterBtnText, { color: c.accentGreen }]}>{t('pais_enter_code')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRegenerate} style={styles.regenBtn}>
              <Text style={[styles.regenText, { color: c.textDim }]}>{t('pais_regen')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---- Tela: Digitação do código de 6 dígitos ----
  if (stage === 'code-entry') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => setStage('auth')} style={styles.backBtn}>
            <Text style={[styles.backText, { color: c.textMuted }]}>← {t('pais_back')}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🔑</Text>
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>{t('pais_enter_title')}</Text>
            <Text style={[styles.headerSub, { color: c.textSecondary }]}>
              {t('pais_enter_sub')}
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
            <Text style={[styles.verifyBtnText, { color: enteredCode.length === 6 ? '#06100a' : c.textDim }]}>
              {t('pais_verify')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Tela: Digitação do PIN de 4 dígitos ----
  if (stage === 'pin-entry') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => setStage('auth')} style={styles.backBtn}>
            <Text style={[styles.backText, { color: c.textMuted }]}>← {t('pais_back')}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🔐</Text>
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>{t('pais_pin_title')}</Text>
            <Text style={[styles.headerSub, { color: c.textSecondary }]}>
              {t('pais_pin_sub')}
            </Text>
          </View>

          {/* PIN dots */}
          <View style={styles.pinDotsRow}>
            {[0, 1, 2, 3].map(i => (
              <View
                key={i}
                style={[styles.pinDot, {
                  backgroundColor: i < enteredPin.length ? c.accentPurple : 'transparent',
                  borderColor: i < enteredPin.length ? c.accentPurple : c.borderDefault,
                }]}
              />
            ))}
          </View>

          <TextInput
            style={[styles.pinInput, { backgroundColor: c.bgInput, color: c.textPrimary, borderColor: c.borderDefault }]}
            placeholder="••••"
            placeholderTextColor={c.textDim}
            value={enteredPin}
            onChangeText={setEnteredPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            textAlign="center"
            autoFocus
          />

          <TouchableOpacity
            onPress={handleVerifyPin}
            disabled={enteredPin.length !== 4}
            style={[styles.verifyBtn, {
              backgroundColor: enteredPin.length === 4 ? c.accentPurple : c.bgCard,
              opacity: enteredPin.length === 4 ? 1 : 0.4,
            }]}
          >
            <Text style={[styles.verifyBtnText, { color: enteredPin.length === 4 ? '#fff' : c.textDim }]}>
              {t('pais_verify')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Tela: Configuração de PIN ----
  if (stage === 'pin-setup') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <TouchableOpacity onPress={() => setStage('dashboard')} style={styles.backBtn}>
              <Text style={[styles.backText, { color: c.textMuted }]}>← {t('pais_back')}</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.headerEmoji}>🔐</Text>
              <Text style={[styles.headerTitle, { color: c.textPrimary }]}>{t('pais_pin_setup_title')}</Text>
              <Text style={[styles.headerSub, { color: c.textSecondary }]}>
                {t('pais_pin_setup_sub')}
              </Text>
            </View>

            <Text style={[styles.fieldLabel, { color: c.textMuted }]}>{t('pais_pin_new')}</Text>
            <TextInput
              style={[styles.pinSetupInput, { backgroundColor: c.bgInput, color: c.textPrimary, borderColor: c.borderDefault }]}
              placeholder="••••"
              placeholderTextColor={c.textDim}
              value={newPin}
              onChangeText={setNewPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              textAlign="center"
            />

            <Text style={[styles.fieldLabel, { color: c.textMuted }]}>{t('pais_pin_confirm')}</Text>
            <TextInput
              style={[styles.pinSetupInput, { backgroundColor: c.bgInput, color: c.textPrimary, borderColor: c.borderDefault }]}
              placeholder="••••"
              placeholderTextColor={c.textDim}
              value={confirmPin}
              onChangeText={setConfirmPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              textAlign="center"
            />

            <TouchableOpacity
              onPress={handleSetupPin}
              disabled={newPin.length !== 4 || confirmPin.length !== 4}
              style={[styles.verifyBtn, {
                backgroundColor: newPin.length === 4 && confirmPin.length === 4
                  ? c.accentPurple : c.bgCard,
                opacity: newPin.length === 4 && confirmPin.length === 4 ? 1 : 0.4,
                marginTop: 16,
              }]}
            >
              <Text style={[styles.verifyBtnText, {
                color: newPin.length === 4 && confirmPin.length === 4 ? '#fff' : c.textDim,
              }]}>
                {t('pais_pin_save')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---- Tela: Dashboard completo ----
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => setStage('auth')} style={styles.backBtn}>
            <Text style={[styles.backText, { color: c.textMuted }]}>← {t('pais_back')}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerEmoji}>👨‍👩‍👦</Text>
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>
              {t('pais_progress', { name: profile?.name || t('perfil_player') })}
            </Text>
            <Text style={[styles.headerSub, { color: c.textSecondary }]}>
              {profile?.age} {t('perfil_years', { age: '' }).replace(/ $/, '')} · {t('pais_readonly')}
            </Text>
          </View>

          {/* Weekly Summary */}
          <View style={[styles.summaryCard, { backgroundColor: withOpacity(c.accentBlue, 0.06), borderColor: withOpacity(c.accentBlue, 0.15) }]}>
            <Text style={[styles.summaryTitle, { color: c.accentBlue }]}>📊 {t('pais_weekly_summary')}</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: c.accentGreen }]}>{Math.min(streak, 7)}</Text>
                <Text style={[styles.summaryLabel, { color: c.textDim }]}>{t('pais_days_trained')}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: c.accentOrange }]}>{streak}</Text>
                <Text style={[styles.summaryLabel, { color: c.textDim }]}>{t('pais_streak')}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: c.accentBlue }]}>
                  {weeklySleep && weeklySleep.daysLogged > 0
                    ? formatDuration(weeklySleep.averageMinutes)
                    : '—'}
                </Text>
                <Text style={[styles.summaryLabel, { color: c.textDim }]}>{t('pais_avg_sleep')}</Text>
              </View>
            </View>
          </View>

          {/* Usage Report */}
          <View style={[styles.summaryCard, {
            backgroundColor: withOpacity(c.accentPurple, 0.06),
            borderColor: withOpacity(c.accentPurple, 0.15),
          }]}>
            <Text style={[styles.summaryTitle, { color: c.accentPurple }]}>
              📱 {t('pais_usage_report')}
            </Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: c.accentPurple }]}>
                  {usageReport ? formatUsageMinutes(usageReport.averageMinutes) : '—'}
                </Text>
                <Text style={[styles.summaryLabel, { color: c.textDim }]}>{t('pais_avg_usage')}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: c.accentBlue }]}>
                  {usageReport ? `${usageReport.daysActive}/7` : '—'}
                </Text>
                <Text style={[styles.summaryLabel, { color: c.textDim }]}>{t('pais_days_active')}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: c.accentGreen }]}>
                  {usageReport ? formatUsageMinutes(usageReport.totalMinutes) : '—'}
                </Text>
                <Text style={[styles.summaryLabel, { color: c.textDim }]}>{t('pais_total_usage')}</Text>
              </View>
            </View>
          </View>

          {/* Stats overview */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={[styles.statNum, { color: c.accentGreen }]}>{total.done}/{total.total}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>{t('perfil_trainings')}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[styles.statNum, { color: c.accentOrange }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>{t('pais_streak')}</Text>
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
              {playerLevel.icon} {t('common_level')}: {playerLevel.name} ({playerLevel.level}/6)
            </Text>
            <ProgressBar progress={levelProgress} color={playerLevel.color} height={6} showLabel />
          </View>

          {/* Overall progress */}
          <View style={[styles.overallCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <Text style={[styles.overallLabel, { color: c.textSecondary }]}>{t('pais_overall')}</Text>
            <ProgressBar progress={totalPct} color={c.accentGreen} height={8} showLabel />
          </View>

          {/* Per phase */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t('pais_per_phase')}</Text>
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
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t('perfil_achievements')} ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</Text>
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

          {/* ---- Controles Parentais ---- */}
          <Text style={[styles.sectionLabel, { color: c.accentPurple }]}>🎛️ {t('pais_controls')}</Text>

          {/* PIN management */}
          <TouchableOpacity
            onPress={() => hasPin ? handleRemovePin() : setStage('pin-setup')}
            activeOpacity={0.7}
            style={[styles.controlRow, {
              backgroundColor: c.bgCard,
              borderColor: hasPin
                ? withOpacity(c.accentPurple, 0.2)
                : c.borderDefault,
            }]}
          >
            <Text style={[styles.controlText, { color: c.textSecondary }]}>
              {hasPin
                ? `🔐 ${t('pais_pin_configured')}`
                : `🔓 ${t('pais_pin_not_set')}`}
            </Text>
            <Text style={[styles.controlArrow, { color: c.textDim }]}>›</Text>
          </TouchableOpacity>

          {/* Kids Mode Lock */}
          <TouchableOpacity
            onPress={handleToggleKidsLock}
            activeOpacity={0.7}
            style={[styles.controlRow, {
              backgroundColor: c.bgCard,
              borderColor: parentSettings?.kidsModeLocked
                ? withOpacity(c.accentGreen, 0.2)
                : c.borderDefault,
            }]}
          >
            <Text style={[styles.controlText, { color: c.textSecondary }]}>
              {parentSettings?.kidsModeLocked
                ? `🔒 ${t('pais_kids_locked')}`
                : `🔓 ${t('pais_kids_unlocked')}`}
            </Text>
            <Text style={[styles.controlArrow, { color: c.textDim }]}>›</Text>
          </TouchableOpacity>

          {/* Time Limit */}
          <TouchableOpacity
            onPress={handleCycleTimeLimit}
            activeOpacity={0.7}
            style={[styles.controlRow, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}
          >
            <Text style={[styles.controlText, { color: c.textSecondary }]}>
              ⏱️ {t('pais_time_limit')}: {currentTimeLimitLabel}
            </Text>
            <Text style={[styles.controlArrow, { color: c.textDim }]}>›</Text>
          </TouchableOpacity>

          {/* Note for parents */}
          <View style={[styles.noteCard, { backgroundColor: withOpacity(c.accentBlue, 0.06), borderColor: withOpacity(c.accentBlue, 0.13) }]}>
            <Text style={[styles.noteTitle, { color: c.accentBlue }]}>{t('pais_tip_title')}</Text>
            <Text style={[styles.noteText, { color: c.textSecondary }]}>
              {t('pais_tip_text')}
            </Text>
          </View>

          {/* SEÇÃO A — Por que este exercício faz bem? */}
          <TouchableOpacity
            onPress={() => toggleSection('science')}
            activeOpacity={0.7}
            style={[styles.collapsibleHeader, { backgroundColor: withOpacity(c.accentGreen, 0.06), borderColor: withOpacity(c.accentGreen, 0.15) }]}
          >
            <Text style={[styles.collapsibleTitle, { color: c.accentGreen }]}>
              🧬 {t('pais_science_title')}
            </Text>
            <Text style={[styles.collapsibleArrow, { color: c.accentGreen }]}>
              {expandedSection === 'science' ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedSection === 'science' && (
            <View style={[styles.collapsibleBody, { borderColor: withOpacity(c.accentGreen, 0.1) }]}>
              <View style={styles.scienceItem}>
                <Text style={[styles.sciencePhase, { color: c.accentGreen }]}>{t('pais_science_phase1')}</Text>
                <Text style={[styles.scienceText, { color: c.textSecondary }]}>
                  {t('pais_science_phase1_text')}
                </Text>
              </View>
              <View style={styles.scienceItem}>
                <Text style={[styles.sciencePhase, { color: c.accentGreen }]}>{t('pais_science_memory')}</Text>
                <Text style={[styles.scienceText, { color: c.textSecondary }]}>
                  {t('pais_science_memory_text')}
                </Text>
              </View>
              <View style={styles.scienceItem}>
                <Text style={[styles.sciencePhase, { color: c.accentGreen }]}>{t('pais_science_recovery')}</Text>
                <Text style={[styles.scienceText, { color: c.textSecondary }]}>
                  {t('pais_science_recovery_text')}
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
              🧑‍🏫 {t('pais_tips_title')}
            </Text>
            <Text style={[styles.collapsibleArrow, { color: c.accentYellow }]}>
              {expandedSection === 'tips' ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedSection === 'tips' && (
            <View style={[styles.collapsibleBody, { borderColor: withOpacity(c.accentYellow, 0.1) }]}>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>⚽</Text>
                <Text style={[styles.tipText, { color: c.textSecondary }]}>{t('pais_tips_ask')}</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>🥗</Text>
                <Text style={[styles.tipText, { color: c.textSecondary }]}>{t('pais_tips_food')}</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>📱</Text>
                <Text style={[styles.tipText, { color: c.textSecondary }]}>{t('pais_tips_phone')}</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>💬</Text>
                <Text style={[styles.tipText, { color: c.textSecondary }]}>{t('pais_tips_praise')}</Text>
              </View>
            </View>
          )}

          {/* Contact */}
          <View style={[styles.contactCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <Text style={[styles.contactText, { color: c.textDim }]}>
              {t('pais_support')}
            </Text>
          </View>

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
  pinInput: { borderWidth: 1, borderRadius: 14, padding: 18, fontSize: 28, fontWeight: '900', letterSpacing: 12, marginBottom: 16 },
  pinDotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 },
  pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  verifyBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  verifyBtnText: { fontSize: 15, fontWeight: '900' },
  // PIN setup
  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6, marginTop: 12 },
  pinSetupInput: { borderWidth: 1, borderRadius: 14, padding: 16, fontSize: 24, fontWeight: '900', letterSpacing: 12 },
  // Summary
  summaryCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  summaryTitle: { fontSize: 12, fontWeight: '800', marginBottom: 10 },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center', gap: 2 },
  summaryValue: { fontSize: 18, fontWeight: '900' },
  summaryLabel: { fontSize: 9, fontWeight: '600' },
  // Stats
  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', gap: 3 },
  statEmoji: { fontSize: 16 },
  statNum: { fontSize: 16, fontWeight: '900' },
  statLabel: { fontSize: 8 },
  // Level
  levelCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10, gap: 6 },
  levelText: { fontSize: 13, fontWeight: '800' },
  // Overall
  overallCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 14, gap: 6 },
  overallLabel: { fontSize: 11, fontWeight: '700' },
  // Section
  sectionLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7, marginTop: 4 },
  // Phase
  phaseItem: { borderWidth: 1, borderLeftWidth: 3, borderRadius: 10, padding: 10, marginBottom: 6, gap: 5 },
  phaseRow: { flexDirection: 'row', justifyContent: 'space-between' },
  phaseName: { fontSize: 12, fontWeight: '800' },
  phaseCount: { fontSize: 11 },
  // Badges
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  badgeItem: { alignItems: 'center', width: 56 },
  badgeIcon: { fontSize: 20, marginBottom: 2 },
  badgeName: { fontSize: 8, textAlign: 'center', fontWeight: '600' },
  // Controls
  controlRow: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  controlText: { fontSize: 13, fontWeight: '600' },
  controlArrow: { fontSize: 18 },
  // Note
  noteCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 8 },
  noteTitle: { fontSize: 11, fontWeight: '800', marginBottom: 6 },
  noteText: { fontSize: 11, lineHeight: 18 },
  // Collapsible
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
  // Contact
  contactCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 12, alignItems: 'center' },
  contactText: { fontSize: 10, textAlign: 'center' },
});
