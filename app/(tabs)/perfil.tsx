// FutStar — Aba Perfil
// Foto + nome + posição + nível + badges + estatísticas + config

import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert,
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
import { markAdsRemoved } from '../../services/ads';
import { getCurrentLocale, setLanguage, AVAILABLE_LANGUAGES } from '../../i18n';

export default function PerfilScreen() {
  const {
    theme, profile, xp, streak,
    playerLevel, levelProgress,
    getTotalProgress, unlockedAchievements,
    updateProfileField, resetAllData, logoutProfile,
  } = useAppContext();
  const router = useRouter();
  const c = theme.colors;
  const [switching, setSwitching] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotifSettings | null>(null);
  const [currentLang, setCurrentLang] = useState(getCurrentLocale());

  useEffect(() => {
    getNotifSettings().then(setNotifSettings);
  }, []);

  const handleToggleNotif = async () => {
    if (!notifSettings) return;
    const newEnabled = !notifSettings.enabled;
    if (newEnabled) {
      const ok = await requestNotifPermission();
      if (!ok) {
        Alert.alert('Permissão negada', 'Ativa as notificações nas configurações do celular.');
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
      'Resetar tudo?',
      'Isso apaga TODO o progresso, conquistas e perfil. Não tem volta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar tudo', style: 'destructive', onPress: () => resetAllData() },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta?',
      'Tem certeza? Seu progresso local será mantido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
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

          <Text style={[styles.heroName, { color: c.textPrimary }]}>{profile?.name || 'Jogador'}</Text>
          {pos && (
            <Text style={[styles.heroPos, { color: pos.color }]}>{pos.icon} {pos.label}</Text>
          )}
          <Text style={[styles.heroAge, { color: c.textDim }]}>{profile?.age} anos · Tema {theme.mode === 'pro' ? 'PRO' : 'KIDS'}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Level card */}
          <View style={[styles.levelCard, { backgroundColor: c.bgCard, borderColor: withOpacity(playerLevel.color, 0.2) }]}>
            <View style={styles.levelRow}>
              <View style={styles.levelLeft}>
                <Text style={[styles.levelIcon, { color: playerLevel.color }]}>{playerLevel.icon}</Text>
                <View>
                  <Text style={[styles.levelName, { color: playerLevel.color }]}>{playerLevel.name}</Text>
                  <Text style={[styles.levelLabel, { color: c.textDim }]}>Nível {playerLevel.level}</Text>
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
              <Text style={[styles.statLabel, { color: c.textDim }]}>Streak</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={[styles.statNum, { color: c.accentGreen }]}>{total.done}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>Treinos</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>📊</Text>
              <Text style={[styles.statNum, { color: c.accentBlue }]}>{totalPct}%</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>Completo</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={styles.statEmoji}>🏆</Text>
              <Text style={[styles.statNum, { color: c.accentPink }]}>{unlockedAchievements.length}</Text>
              <Text style={[styles.statLabel, { color: c.textDim }]}>Badges</Text>
            </View>
          </View>

          {/* Badges */}
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Conquistas</Text>
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
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Configurações</Text>

          <TouchableOpacity onPress={handleToggleTheme} style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <Text style={[styles.settingText, { color: c.textSecondary }]}>
              {theme.mode === 'pro' ? '⚽ Trocar para tema KIDS' : '🌙 Trocar para tema PRO'}
            </Text>
            <Text style={[styles.settingArrow, { color: c.textDim }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleToggleNotif} style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <Text style={[styles.settingText, { color: c.textSecondary }]}>
              {notifSettings?.enabled ? '🔔 Notificações: ATIVADAS' : '🔕 Notificações: DESATIVADAS'}
            </Text>
            <Text style={[styles.settingArrow, { color: c.textDim }]}>›</Text>
          </TouchableOpacity>

          {notifSettings?.enabled && (
            <TouchableOpacity onPress={handleCycleTime} style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
              <Text style={[styles.settingText, { color: c.textSecondary }]}>
                ⏰ Lembrete diário: {notifSettings.reminderHour}h
              </Text>
              <Text style={[styles.settingArrow, { color: c.textDim }]}>›</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.push('/area-pais' as any)}
            style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: withOpacity(c.accentBlue, 0.13) }]}
          >
            <Text style={[styles.settingText, { color: c.accentBlue }]}>👨‍👩‍👦 Área dos Pais</Text>
            <Text style={[styles.settingArrow, { color: c.accentBlue }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Alert.alert('Remover anúncios', 'Em breve! Compra in-app será adicionada.', [
                { text: 'OK' },
                { text: 'Simular remoção (teste)', onPress: () => markAdsRemoved() },
              ]);
            }}
            style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: withOpacity(c.accentYellow, 0.13) }]}
          >
            <Text style={[styles.settingText, { color: c.accentYellow }]}>💎 Remover anúncios</Text>
            <Text style={[styles.settingArrow, { color: c.accentYellow }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              const idx = AVAILABLE_LANGUAGES.findIndex(l => l.code === currentLang);
              const next = AVAILABLE_LANGUAGES[(idx + 1) % AVAILABLE_LANGUAGES.length];
              await setLanguage(next.code);
              setCurrentLang(next.code);
            }}
            style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}
          >
            <Text style={[styles.settingText, { color: c.textSecondary }]}>
              🌐 Idioma: {AVAILABLE_LANGUAGES.find(l => l.code === currentLang)?.label || currentLang}
            </Text>
            <Text style={[styles.settingArrow, { color: c.textDim }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleReset} style={[styles.settingRow, { backgroundColor: c.bgCard, borderColor: withOpacity(c.accentRed, 0.13) }]}>
            <Text style={[styles.settingText, { color: c.accentRed }]}>🗑 Resetar todos os dados</Text>
            <Text style={[styles.settingArrow, { color: c.accentRed }]}>›</Text>
          </TouchableOpacity>

          {/* Logout */}
          <View style={{ marginTop: 16 }}>
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.7}
              style={[styles.logoutBtn, { borderColor: withOpacity(c.accentRed, 0.18) }]}
            >
              <Text style={[styles.logoutBtnText, { color: c.accentRed }]}>
                🚪 Sair da conta
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 30 }} />
        </View>
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
  cameraBadge: { position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#060b14' },
  cameraBadgeText: { fontSize: 12 },
  heroName: { fontSize: 20, fontWeight: '900' },
  heroPos: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  heroAge: { fontSize: 10, marginTop: 2 },
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
});
