// FutStar — Tela de Consentimento
// Exibida UMA VEZ na primeira abertura do app
// Obrigatório para LGPD/COPPA (app para crianças 6-16 anos)

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAppContext } from '../store/progress';
import { withOpacity } from '../constants/theme';
import { t } from '../i18n';

const CONSENT_KEY = 'futstar_consent_accepted';

export async function hasConsent(): Promise<boolean> {
  const val = await AsyncStorage.getItem(CONSENT_KEY);
  return val === 'true';
}

export async function saveConsent(): Promise<void> {
  await AsyncStorage.setItem(CONSENT_KEY, 'true');
}

export default function ConsentScreen() {
  const { theme } = useAppContext();
  const c = theme.colors;
  const router = useRouter();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAge, setAcceptedAge] = useState(false);

  const canContinue = acceptedTerms && acceptedAge;

  const handleAccept = async () => {
    if (!canContinue) return;
    await saveConsent();
    router.replace('/onboarding' as any);
  };

  const points = [
    { icon: '🎮', key: 'consent_point_1' },
    { icon: '📊', key: 'consent_point_2' },
    { icon: '📺', key: 'consent_point_3' },
    { icon: '🔒', key: 'consent_point_4' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🛡️</Text>
          <Text style={[styles.title, { color: c.textPrimary }]}>
            {t('consent_title')}
          </Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            {t('consent_subtitle')}
          </Text>
        </View>

        {/* 4 Points */}
        <View style={[styles.pointsCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
          {points.map((p, i) => (
            <View key={i} style={[styles.pointRow, i < points.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.borderDefault }]}>
              <Text style={styles.pointIcon}>{p.icon}</Text>
              <Text style={[styles.pointText, { color: c.textSecondary }]}>
                {t(p.key)}
              </Text>
            </View>
          ))}
        </View>

        {/* Checkboxes */}
        <View style={styles.checkboxSection}>
          <TouchableOpacity
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            style={[styles.checkboxRow, {
              backgroundColor: acceptedTerms ? withOpacity(c.accentGreen, 0.06) : c.bgCard,
              borderColor: acceptedTerms ? withOpacity(c.accentGreen, 0.3) : c.borderDefault,
            }]}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, {
              borderColor: acceptedTerms ? c.accentGreen : c.textDim,
              backgroundColor: acceptedTerms ? c.accentGreen : 'transparent',
            }]}>
              {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxText, { color: c.textSecondary }]}>
              {t('consent_accept_terms_prefix')}{' '}
              <Text
                style={{ color: c.accentBlue, textDecorationLine: 'underline' }}
                onPress={() => router.push('/terms-of-use' as any)}
              >
                {t('consent_terms_link')}
              </Text>
              {' '}{t('consent_and')}{' '}
              <Text
                style={{ color: c.accentBlue, textDecorationLine: 'underline' }}
                onPress={() => router.push('/privacy-policy' as any)}
              >
                {t('consent_privacy_link')}
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAcceptedAge(!acceptedAge)}
            style={[styles.checkboxRow, {
              backgroundColor: acceptedAge ? withOpacity(c.accentGreen, 0.06) : c.bgCard,
              borderColor: acceptedAge ? withOpacity(c.accentGreen, 0.3) : c.borderDefault,
            }]}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, {
              borderColor: acceptedAge ? c.accentGreen : c.textDim,
              backgroundColor: acceptedAge ? c.accentGreen : 'transparent',
            }]}>
              {acceptedAge && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxText, { color: c.textSecondary }]}>
              {t('consent_accept_age')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Accept Button */}
        <TouchableOpacity
          onPress={handleAccept}
          disabled={!canContinue}
          activeOpacity={0.7}
          style={[styles.acceptBtn, {
            backgroundColor: canContinue ? c.accentGreen : withOpacity(c.accentGreen, 0.15),
          }]}
        >
          <Text style={[styles.acceptBtnText, {
            color: canContinue ? c.textInverse : withOpacity(c.accentGreen, 0.4),
          }]}>
            {t('consent_accept_btn')}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.footerNote, { color: c.textDim }]}>
          {t('consent_footer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 30, marginBottom: 24 },
  headerEmoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  pointsCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  pointRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  pointIcon: { fontSize: 22 },
  pointText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 20 },

  checkboxSection: { gap: 10, marginBottom: 24 },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '900' },
  checkboxText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 20 },

  acceptBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  acceptBtnText: { fontSize: 16, fontWeight: '900' },

  footerNote: { fontSize: 10, textAlign: 'center', lineHeight: 16 },
});
