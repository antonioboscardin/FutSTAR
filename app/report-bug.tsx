// FutStar — Reporte de Bug via Google Forms + Avaliar App
// Formulário via Google Forms e botão para avaliar na Play Store

import { useState } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, ScrollView, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppContext } from '../store/progress';
import { withOpacity } from '../constants/theme';
import PressableScale from '../components/PressableScale';
import { t } from '../i18n';

const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfM1vqpR-GWbz_B9I8J_JTLaEBqusKP-OlAk7cDnwgvOjMpvg/viewform';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.antonioboscardin.futstar';

interface BugCategory {
  key: string;
  emoji: string;
  label: string;
  color: string;
}

const CATEGORIES: BugCategory[] = [
  { key: 'crash', emoji: '🔴', label: 'bug_cat_crash', color: '#EF4444' },
  { key: 'broken', emoji: '🟡', label: 'bug_cat_broken', color: '#F59E0B' },
  { key: 'suggestion', emoji: '🟢', label: 'bug_cat_suggestion', color: '#22C55E' },
  { key: 'progress', emoji: '📊', label: 'bug_cat_progress', color: '#3B82F6' },
];

export default function ReportBugScreen() {
  const { theme } = useAppContext();
  const c = theme.colors;
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleOpenForm = async () => {
    try {
      await Linking.openURL(FORM_URL);
    } catch {
      Alert.alert(
        t('bug_whatsapp_error_title'),
        t('bug_whatsapp_error_msg')
      );
    }
  };

  const handleRateApp = async () => {
    try {
      await Linking.openURL(PLAY_STORE_URL);
    } catch {}
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: c.textSecondary }]}>← {t('back')}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: c.textPrimary }]}>
            🐛 {t('bug_title')}
          </Text>
          <Text style={[styles.subtitle, { color: c.textDim }]}>
            {t('bug_subtitle')}
          </Text>
        </View>

        {/* Category selector */}
        <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
          {t('bug_category')}
        </Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.7}
                style={[
                  styles.categoryBtn,
                  {
                    backgroundColor: isSelected
                      ? withOpacity(cat.color, 0.12)
                      : c.bgCard,
                    borderColor: isSelected
                      ? withOpacity(cat.color, 0.3)
                      : c.borderDefault,
                  },
                ]}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[
                  styles.categoryLabel,
                  { color: isSelected ? cat.color : c.textSecondary },
                ]}>
                  {t(cat.label)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Submit button — abre Google Forms */}
        <PressableScale
          onPress={handleOpenForm}
          style={[
            styles.submitBtn,
            { backgroundColor: '#4285F4' },
          ]}
        >
          <Text style={styles.submitBtnText}>
            📋 {t('bug_send_whatsapp')}
          </Text>
        </PressableScale>

        {/* Avaliar o App */}
        <PressableScale
          onPress={handleRateApp}
          style={[
            styles.rateBtn,
            {
              backgroundColor: withOpacity(c.accentYellow, 0.1),
              borderColor: withOpacity(c.accentYellow, 0.25),
            },
          ]}
        >
          <Text style={[styles.rateBtnText, { color: c.accentYellow }]}>
            Avaliar o app ⭐
          </Text>
        </PressableScale>

        {/* Info */}
        <View style={[styles.infoCard, {
          backgroundColor: withOpacity(c.accentBlue, 0.06),
          borderColor: withOpacity(c.accentBlue, 0.15),
        }]}>
          <Text style={[styles.infoText, { color: c.accentBlue }]}>
            {t('bug_info')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },
  header: { padding: 16, paddingTop: 8 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 14, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  subtitle: { fontSize: 13, lineHeight: 20 },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  categoryBtn: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  categoryEmoji: { fontSize: 22 },
  categoryLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  submitBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },

  rateBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  rateBtnText: {
    fontSize: 16,
    fontWeight: '900',
  },

  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  infoText: {
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
  },
});

