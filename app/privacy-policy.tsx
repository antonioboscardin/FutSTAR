// FutStar — Política de Privacidade
// Tela legal obrigatória para Play Store (app para crianças 6-16)
// Linguagem simples, sem juridiquês

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppContext } from '../store/progress';
import { withOpacity } from '../constants/theme';
import { t } from '../i18n';

export default function PrivacyPolicyScreen() {
  const { theme } = useAppContext();
  const c = theme.colors;
  const router = useRouter();

  const sections = [
    {
      icon: '📋',
      titleKey: 'privacy_section_1_title',
      bodyKey: 'privacy_section_1_body',
    },
    {
      icon: '🎯',
      titleKey: 'privacy_section_2_title',
      bodyKey: 'privacy_section_2_body',
    },
    {
      icon: '📺',
      titleKey: 'privacy_section_3_title',
      bodyKey: 'privacy_section_3_body',
    },
    {
      icon: '👶',
      titleKey: 'privacy_section_4_title',
      bodyKey: 'privacy_section_4_body',
    },
    {
      icon: '✊',
      titleKey: 'privacy_section_5_title',
      bodyKey: 'privacy_section_5_body',
    },
    {
      icon: '📧',
      titleKey: 'privacy_section_6_title',
      bodyKey: 'privacy_section_6_body',
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.borderDefault }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <Text style={[styles.backText, { color: c.accentGreen }]}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.textPrimary }]}>{t('privacy_title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Last updated */}
        <Text style={[styles.updated, { color: c.textDim }]}>{t('privacy_updated')}</Text>

        {sections.map((s, i) => (
          <View key={i} style={[styles.sectionCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{s.icon}</Text>
              <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>{t(s.titleKey)}</Text>
            </View>
            <Text style={[styles.sectionBody, { color: c.textSecondary }]}>{t(s.bodyKey)}</Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 80 },
  backText: { fontSize: 14, fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '900', textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  updated: { fontSize: 10, textAlign: 'center', marginBottom: 16 },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sectionIcon: { fontSize: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  sectionBody: { fontSize: 13, lineHeight: 20 },
});
