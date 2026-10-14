// FutStar — Aba Perfil
// Foto + nome + posição + nível + badges + estatísticas + config

import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppContext } from '../../store/progress';
import { POSITIONS } from '../../data/positions';
import { ACHIEVEMENTS } from '../../data/achievements';
import { withOpacity } from '../../constants/theme';
import ProgressBar from '../../components/ProgressBar';
import {
  getNotifSettings, saveNotifSettings,
  requestNotifPermission, type NotifSettings,
} from '../../services/notifications';
import { AVAILABLE_LANGUAGES } from '../../i18n';
import { t } from '../../i18n';
import { usePremium } from '../../hooks/usePremium';
import {
  getReferralCode,
  saveReferralCode,
  checkReferralReward,
} from '../../services/referral';

export default function PerfilScreen() {
  const {
    theme, profile, xp, streak,
    playerLevel, levelProgress,
    getTotalProgress, unlockedAchievements,
    updateProfileField, resetAllData, logoutProfile,
    locale, changeLocale,
  } = useAppContext();
  const router = useRouter();
  const c = theme.colors;
  const [switching, setSwitching] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotifSettings | null>(null);
  const { isPremium, toggleDevOverride } = usePremium();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralConfirmed, setReferralConfirmed] = useState(0);

  useEffect(() => {
    getNotifSettings().then(setNotifSettings);
    // Load referral data
    (async () => {
      let code = await getReferralCode();
      if (!code && profile?.name) {
        code = await saveReferralCode(profile.name);
      }
      setReferralCode(code);
      const reward = await checkReferralReward();
      setReferralConfirmed(reward.confirmed);
    })();
  }, []);

  const handleToggleNotif = async () => {
    if (!notifSettings) return;
    const newEnabled = !notifSettings.enabled;
    if (newEnabled) {
      const ok = await requestNotifPermission();
      if (!ok) {
        Alert.alert(t('perfil_notif_denied_title'), t('perfil_notif_denied_msg'));
        return;
      }
    }
    const updated = { ...notifSettings, enabled: newEnabled };
    setNotifSettings(updated);
    await saveNotifSettings(updated);
  };

  const handleCycleTime = async () => {
    if (!notifSettings) return;
    // Cicla entre 7h, 8h, 9h, 15h, 16h, 17h, 18h, 19h, 20h
    const times = [7, 8, 9, 15, 16, 17, 18, 19, 20];
    const idx = times.indexOf(notifSettings.reminderHour);
    const next = times[(idx + 1) % times.length];
    const updated = { ...notifSettings, reminderHour: next, reminderMinute: 0 };
    setNotifSettings(updated);
    await saveNotifSettings(updated);
  };

  const pos = profile ? POSITIONS[profile.position] : null;
  const total = getTotalProgress();
  const totalPct = total.total > 0 ? Math.round((total.done / total.total) * 100) : 0;

  const handleChangePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      await updateProfileField('photoUri', result.assets[0].uri);
    }
  };

  const handleToggleTheme = async () => {
    if (!profile) return;
    const newOverride = profile.themeOverride
      ? null // reset to auto
      : theme.mode === 'pro' ? 'kids' : 'pro';
    await updateProfileField('themeOverride', newOverride as any);
  };

  const handleReset = () => {
    Alert.alert(
      t('perfil_reset_title'),
      t('perfil_reset_msg'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('perfil_reset_confirm'), style: 'destructive', onPress: () => resetAllData() },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t('perfil_logout_title'),
      t('perfil_logout_msg'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('perfil_logout_confirm'),
          style: 'destructive',
          onPress: async () => {
            await logoutProfile();
            router.replace('/cadastro' as any);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={c.headerGradient}
          style={styles.hero}
        >
          {/* Avatar */}
          <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.7}>
            <View style={[styles.avatarRing, { borderColor: playerLevel.color + '44' }]}>
              {profile?.photoUri ? (
                <Image source={{ uri: profile.photoUri }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: c.bgCard }]}>
                  <Text style={styles.avatarEmoji}>👤</Text>
                </View>
              )}
              <View style={[styles.cameraBadge, { backgroundColor: playerLevel.color }]}>
                <Text style={styles.cameraBadgeText}>📷</Text>
              </View>
            </View>
          </TouchableOpacity>

          <Text style={[styles.heroName, { color: c.textPrimary }]}>{profile?.name || t('perfil_player')}</Text>
          {pos && (
            <Text style={[styles.heroPos, { color: pos.color }]}>{pos.icon} {pos.label}</Text>
          )}
          <Text style={[styles.heroAge, { color: c.textDim }]}>{profile?.age} {t('perfil_years', { age: '' }).replace(/ $/, '')} · {t('perfil_theme_label', { mode: theme.mode === 'pro' ? 'PRO' : 'KIDS' })}</Text>
          {profile?.favoriteTeam ? (
            <Text style={[styles.heroTeam, { color: c.accentYellow }]}>⚽ {profile.favoriteTeam}</Text>
          ) : null}
          <TouchableOpacity
            onPress={() => router.push('/edit-perfil' as any)}
            activeOpacity={0.7}
            style={[styles.editBtn, { borderColor: withOpacity(c.accentGreen, 0.2) }]}
          >
            <Text style={[styles.editBtnText, { color: c.accentGreen }]}>✏️ {t('perfil_edit')}</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.content}>
          {/* Level card */}
          <View style={[styles.levelCard, { backgroundColor: c.bgCard, borderColor: withOpacity(playerLevel.color, 0.2) }]}>
            <View style={styles.levelRow}>
              <View style={styles.levelLeft}>
                <Text style={[styles.levelIcon, { color: playerLevel.color }]}>{playerLevel.icon}</Text>
                <View>
                  <Text style={[styles.levelName, { color: playerLevel.color }]}>{playerLevel.name}</Text>
                <Text style={[styles.levelLabel, { color: c.textDim }]}>{t('perfil_level', { level: playerLevel.level })}</Text>
                </View>
              </View>
              <Text style={[styles.xpText, { color: c.accentYellow }]}>⚡ {xp} XP</Text>
            </View>
            <ProgressBar progress={levelProgress} color={playerLevel.color} height={6} showLabel />
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[styles.statNum, { color: c.accentOrange }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>{t('perfil_streak')}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={[styles.statNum, { color: c.accentGreen }]}>{total.done}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>{t('perfil_trainings')}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>📊</Text>
              <Text style={[styles.statNum, { color: c.accentBlue }]}>{totalPct}%</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>{t('perfil_complete')}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>🏆</Text>
              <Text style={[styles.statNum, { color: c.accentPink }]}>{unlockedAchievements.length}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>{t('perfil_badges')}</Text>
            </View>
          </View>

          {/* Badges */}
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>{t('perfil_achievements')}</Text>
          <View style={styles.badgeGrid}>
            {ACHIEVEMENTS.map(ach => {
              const unlocked = unlockedAchievements.includes(ach.key);
              return (
                <View key={ach.key} style={[styles.badgeItem, { backgroundColor: unlocked ? withOpacity(c.accentGreen, 0.06) : c.bgCard, borderColor: unlocked ? withOpacity(c.accentGreen, 0.2) : c.borderDefault, opacity: unlocked ? 1 : 0.4 }]}>
                  <Text style={styles.badgeIcon}>{ach.icon}</Text>
                  <Text style={[styles.badgeName, { color: unlocked ? c.textPrimary : c.textDim }]}>{ach.name}</Text>
                </View>
              );
            })}
          </View>

          {/* Settings */}
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>{t('perfil_settings')}</Text>

          <TouchableOpacity onPress={handleToggleTheme} style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <Text style={[styles.settingText, { color: c.textSecondary }]}>
              {theme.mode === 'pro' ? t('perfil_theme_to_kids') : t('perfil_theme_to_pro')}
            </Text>
            <Text style={[styles.settingArrow, { color: c.textDim }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleToggleNotif} style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <Text style={[styles.settingText, { color: c.textSecondary }]}>
              {notifSettings?.enabled ? t('perfil_notif_on') : t('perfil_notif_off')}
            </Text>
            <Text style={[styles.settingArrow, { color: c.textDim }]}>›</Text>
          </TouchableOpacity>

          {notifSettings?.enabled && (
            <TouchableOpacity onPress={handleCycleTime} style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={[styles.settingText, { color: c.textSecondary }]}>
              ⏰ {t('perfil_daily_reminder', { hour: notifSettings.reminderHour })}
              </Text>
              <Text style={[styles.settingArrow, { color: c.textDim }]}>›</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.push('/area-pais' as any)}
            style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: withOpacity(c.accentBlue, 0.13) }]}
          >
            <Text style={[styles.settingText, { color: c.accentBlue }]}>{t('perfil_parent_area')}</Text>
            <Text style={[styles.settingArrow, { color: c.accentBlue }]}>›</Text>
          </TouchableOpacity>

          {/* Premium button */}
          <TouchableOpacity
            onPress={() => {
              if (isPremium) {
                router.push('/premium' as any);
              } else {
                router.push('/premium' as any);
              }
            }}
            style={[styles.settingRow, {
              backgroundColor: isPremium
                ? withOpacity(c.accentPurple, 0.06)
                : c.bgCard,
              borderColor: withOpacity(c.accentPurple, 0.2),
            }]}
          >
            <Text style={[styles.settingText, { color: c.accentPurple }]}>
              {isPremium ? '💎 FutStar Premium — ativo' : '💎 FutStar Premium'}
            </Text>
            <Text style={[styles.settingArrow, { color: c.accentPurple }]}>›</Text>
          </TouchableOpacity>

          {/* __DEV__ Premium Simulator */}
          {__DEV__ && (
            <TouchableOpacity
              onPress={toggleDevOverride}
              style={[styles.settingRow, {
                backgroundColor: isPremium
                  ? withOpacity(c.accentGreen, 0.06)
                  : withOpacity(c.accentRed, 0.06),
                borderColor: isPremium
                  ? withOpacity(c.accentGreen, 0.2)
                  : withOpacity(c.accentRed, 0.2),
              }]}
            >
              <Text style={[styles.settingText, { color: isPremium ? c.accentGreen : c.accentRed }]}>
                {isPremium ? '🧪 Premium: ON (DEV)' : '🧪 Premium: OFF (DEV)'}
              </Text>
              <Text style={[styles.settingArrow, { color: c.textDim }]}>›</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={async () => {
              const idx = AVAILABLE_LANGUAGES.findIndex(l => l.code === locale);
              const next = AVAILABLE_LANGUAGES[(idx + 1) % AVAILABLE_LANGUAGES.length];
              await changeLocale(next.code);
            }}
            style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}
          >
            <Text style={[styles.settingText, { color: c.textSecondary }]}>
              {t('perfil_language', { lang: AVAILABLE_LANGUAGES.find(l => l.code === locale)?.label || locale })}
            </Text>
            <Text style={[styles.settingArrow, { color: c.textDim }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleReset} style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: withOpacity(c.accentRed, 0.13) }]}>
            <Text style={[styles.settingText, { color: c.accentRed }]}>{t('perfil_reset')}</Text>
            <Text style={[styles.settingArrow, { color: c.accentRed }]}>›</Text>
          </TouchableOpacity>

          {/* Referral */}
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>{t('perfil_referral_section')}</Text>

          <TouchableOpacity
            onPress={() => router.push('/referral' as any)}
            style={[styles.settingRow, {
              backgroundColor: withOpacity(c.accentGreen, 0.06),
              borderColor: withOpacity(c.accentGreen, 0.2),
            }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingText, { color: c.accentGreen }]}>
                🎯 {t('perfil_referral_title')}
              </Text>
              {referralCode && (
                <Text style={[{ fontSize: 10, color: c.textDim, marginTop: 2 }]}>
                  {t('perfil_referral_code', { code: referralCode })} · {referralConfirmed}/5
                </Text>
              )}
            </View>
            <Text style={[styles.settingArrow, { color: c.accentGreen }]}>›</Text>
          </TouchableOpacity>

          {/* Support */}
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>{t('perfil_support_section')}</Text>

          <TouchableOpacity
            onPress={() => router.push('/report-bug' as any)}
            style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}
          >
            <Text style={[styles.settingText, { color: c.textSecondary }]}>{t('perfil_report_bug')}</Text>
            <Text style={[styles.settingArrow, { color: c.textDim }]}>›</Text>
          </TouchableOpacity>

          {/* Legal */}
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>{t('perfil_legal')}</Text>

          <TouchableOpacity
            onPress={() => router.push('/privacy-policy' as any)}
            style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}
          >
            <Text style={[styles.settingText, { color: c.textSecondary }]}>{t('perfil_privacy_policy')}</Text>
            <Text style={[styles.settingArrow, { color: c.textDim }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/terms-of-use' as any)}
            style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}
          >
            <Text style={[styles.settingText, { color: c.textSecondary }]}>{t('perfil_terms_of_use')}</Text>
            <Text style={[styles.settingArrow, { color: c.textDim }]}>›</Text>
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            style={[styles.settingRow, {
              backgroundColor: withOpacity(c.accentRed, 0.06),
              borderColor: withOpacity(c.accentRed, 0.2),
              marginTop: 10,
            }]}
          >
            <Text style={[styles.settingText, { color: c.accentRed }]}>{t('perfil_delete_account')}</Text>
            <Text style={[styles.settingArrow, { color: c.accentRed }]}>›</Text>
          </TouchableOpacity>

          {/* Logout */}
          <View style={{ marginTop: 16 }}>
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.7}
              style={[styles.logoutBtn, { borderColor: withOpacity(c.accentRed, 0.18) }]}
            >
              <Text style={[styles.logoutBtnText, { color: c.accentRed }]}
              >
                {t('perfil_logout')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 30 }} />
        </View>

        {/* Delete Account Modal */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: c.bgOverlay }]}>
            <View style={[styles.modalContent, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.modalEmoji}>⚠️</Text>
              <Text style={[styles.modalTitle, { color: c.accentRed }]}>{t('perfil_delete_title')}</Text>
              <Text style={[styles.modalBody, { color: c.textSecondary }]}>{t('perfil_delete_msg')}</Text>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  style={[styles.modalBtn, { backgroundColor: c.bgElevated, borderColor: c.borderDefault }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalBtnText, { color: c.textSecondary }]}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    // Confirmação extra (2º passo LGPD)
                    Alert.alert(
                      '⚠️ Última confirmação',
                      'Isso apagará TODOS os seus dados permanentemente. Tem certeza?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Sim, apagar tudo',
                          style: 'destructive',
                          onPress: async () => {
                            setShowDeleteModal(false);
                            // Apaga TODOS os dados do AsyncStorage (LGPD)
                            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
                            await AsyncStorage.clear();
                            await resetAllData();
                            router.replace('/cadastro' as any);
                          },
                        },
                      ]
                    );
                  }}
                  style={[styles.modalBtn, { backgroundColor: c.accentRed }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t('perfil_delete_confirm')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },
  hero: { alignItems: 'center', paddingTop: 50, paddingBottom: 18 },
  avatarRing: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 32 },
  cameraBadge: { position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#06100a' },
  cameraBadgeText: { fontSize: 12 },
  heroName: { fontSize: 20, fontWeight: '900' },
  heroPos: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  heroAge: { fontSize: 10, marginTop: 2 },
  heroTeam: { fontSize: 11, fontWeight: '700', marginTop: 3 },
  editBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, marginTop: 8 },
  editBtnText: { fontSize: 11, fontWeight: '700' },
  content: { padding: 14 },
  levelCard: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10, gap: 8 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelIcon: { fontSize: 22 },
  levelName: { fontSize: 14, fontWeight: '900' },
  levelLabel: { fontSize: 9 },
  xpText: { fontSize: 14, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 8, alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 14 },
  statNum: { fontSize: 16, fontWeight: '900' },
  statLabel: { fontSize: 8 },
  sectionTitle: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  badgeItem: { width: '31%', borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center', gap: 4, flexGrow: 1 },
  badgeIcon: { fontSize: 20 },
  badgeName: { fontSize: 9, fontWeight: '700', textAlign: 'center' },
  settingRow: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingText: { fontSize: 13, fontWeight: '600' },
  settingArrow: { fontSize: 18 },
  logoutBtn: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  logoutBtnText: { fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { borderWidth: 1, borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' },
  modalEmoji: { fontSize: 40, marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '900', marginBottom: 8 },
  modalBody: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  modalBtnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  modalBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  modalBtnText: { fontSize: 14, fontWeight: '800' },
});
