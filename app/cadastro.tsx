// FutStar — Tela de Cadastro
// Nome + Idade + Foto (opcional)
// Idade define o tema automaticamente: <=12 KIDS, >=13 PRO

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../store/progress';
import type { UserProfile } from '../store/progress';
import { t } from '../i18n';
import { ageToAgeGroup } from '../data/workoutsData';
import {
  isValidReferralCode,
  registerReferral,
  saveReferralCode,
} from '../services/referral';

const AGES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

export default function CadastroScreen() {
  const router = useRouter();
  const { saveProfile } = useAppContext();

  const [name, setName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [saving, setSaving] = useState(false);

  // Determina tema em tempo real conforme seleciona idade
  const isKids = age !== null && age <= 12;
  const isPro = age !== null && age >= 13;

  // Cores dinâmicas
  const bgPrimary = isPro ? '#06100a' : isKids ? '#F0F4FF' : '#06100a';
  const bgCard = isPro ? '#0d1f17' : isKids ? '#FFFFFF' : '#0d1f17';
  const bgInput = isPro ? '#142a1c' : isKids ? '#EEF2FF' : '#142a1c';
  const textPrimary = isPro ? '#f1f5f0' : isKids ? '#1E293B' : '#f1f5f0';
  const textSecondary = isPro ? '#a0c4b0' : isKids ? '#475569' : '#a0c4b0';
  const textMuted = isPro ? '#4a7a5a' : isKids ? '#94A3B8' : '#4a7a5a';
  const borderColor = isPro ? 'rgba(1,135,95,0.2)' : isKids ? '#E2E8F0' : 'rgba(1,135,95,0.2)';
  const accent = isPro ? '#01875f' : isKids ? '#00C853' : '#01875f';
  const accentBg = isPro ? '#0b2218' : isKids ? '#E8F5E9' : '#0b2218';

  const canSubmit = name.trim().length >= 2 && age !== null;

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;

    setSaving(true);
    try {
      const profile: UserProfile = {
        name: name.trim(),
        age: age!,
        position: 'centroavante', // será definido no quiz
        photoUri,
        themeOverride: null, // auto por idade
        onboardingDone: false, // será true após quiz
        createdAt: new Date().toISOString(),
        faixaEtaria: ageToAgeGroup(age!),
        trilha: 'Todos', // será atualizado se escolher goleiro no quiz
      };

      await saveProfile(profile);

      // Generate referral code for this new user
      await saveReferralCode(name.trim());

      // Register referral if code was entered
      const trimmedCode = referralCode.trim().toUpperCase();
      if (trimmedCode && isValidReferralCode(trimmedCode)) {
        await registerReferral(trimmedCode, name.trim());
      }

      router.replace('/quiz-posicao' as any);
    } catch (e) {
      Alert.alert(t('cadastro_error_title'), t('cadastro_error_msg'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>⚽</Text>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>
            {t('cadastro_title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: textMuted }]}>
            {t('cadastro_sub')}
          </Text>
        </View>

        {/* Avatar */}
        <TouchableOpacity
          onPress={handlePickPhoto}
          activeOpacity={0.7}
          style={styles.avatarContainer}
        >
          <View style={[styles.avatarRing, { borderColor: accent + '33' }]}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: bgCard }]}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
            )}
            <View style={[styles.avatarBadge, { backgroundColor: accent }]}>
              <Text style={styles.avatarBadgeText}>📷</Text>
            </View>
          </View>
          <Text style={[styles.avatarHint, { color: textMuted }]}>
            {t('cadastro_photo_hint')}
          </Text>
        </TouchableOpacity>

        {/* Nome */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: textSecondary }]}>
            ⚡ {t('cadastro_name')}
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: bgInput,
                color: textPrimary,
                borderColor: name.trim().length >= 2 ? accent + '44' : borderColor,
              },
            ]}
            placeholder={t('cadastro_name_placeholder')}
            placeholderTextColor={textMuted}
            value={name}
            onChangeText={setName}
            maxLength={24}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {name.trim().length > 0 && name.trim().length < 2 && (
            <Text style={styles.fieldError}>{t('cadastro_name_min')}</Text>
          )}
        </View>

        {/* Idade */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: textSecondary }]}>
            🎂 {t('cadastro_age')}
          </Text>
          <View style={styles.ageGrid}>
            {AGES.map((a) => {
              const selected = age === a;
              const ageIsKids = a <= 12;
              const buttonAccent = ageIsKids
                ? (selected ? '#00C853' : '#E2E8F0')
                : (selected ? '#01875f' : borderColor);

              return (
                <TouchableOpacity
                  key={a}
                  onPress={() => setAge(a)}
                  activeOpacity={0.7}
                  style={[
                    styles.ageButton,
                    {
                      backgroundColor: selected ? accentBg : bgCard,
                      borderColor: selected ? accent + '55' : borderColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.ageText,
                      {
                        color: selected ? accent : textSecondary,
                        fontWeight: selected ? '900' : '600',
                      },
                    ]}
                  >
                    {a}
                  </Text>
                  {selected && (
                    <Text style={styles.ageCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Theme indicator */}
          {age !== null && (
            <View
              style={[
                styles.themeIndicator,
                {
                  backgroundColor: accentBg,
                  borderColor: accent + '22',
                },
              ]}
            >
              <Text style={styles.themeIndicatorEmoji}>
                {isKids ? '⚽' : '🌙'}
              </Text>
              <Text style={[styles.themeIndicatorText, { color: accent }]}>
                {isKids
                  ? t('cadastro_theme_kids')
                  : t('cadastro_theme_pro')}
              </Text>
            </View>
          )}
        </View>

        {/* Código de indicação (opcional) */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: textSecondary }]}>
            🎯 {t('cadastro_referral')}
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: bgInput,
                color: textPrimary,
                borderColor: referralCode.trim().length > 0
                  ? (isValidReferralCode(referralCode.trim()) ? accent + '44' : '#EF4444' + '44')
                  : borderColor,
              },
            ]}
            placeholder={t('cadastro_referral_placeholder')}
            placeholderTextColor={textMuted}
            value={referralCode}
            onChangeText={(text) => setReferralCode(text.toUpperCase())}
            maxLength={8}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {referralCode.trim().length > 0 && !isValidReferralCode(referralCode.trim()) && (
            <Text style={styles.fieldError}>{t('cadastro_referral_invalid')}</Text>
          )}
          {referralCode.trim().length > 0 && isValidReferralCode(referralCode.trim()) && (
            <Text style={[styles.fieldSuccess, { color: accent }]}>
              ✅ {t('cadastro_referral_valid')}
            </Text>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || saving}
          activeOpacity={0.8}
          style={styles.submitOuter}
        >
          <LinearGradient
            colors={
              canSubmit
                ? [accent, accent + 'cc']
                : ['#1a2840', '#1a2840']
            }
            style={[
              styles.submitButton,
              { opacity: canSubmit ? 1 : 0.4 },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text
              style={[
                styles.submitText,
                { color: canSubmit ? '#06100a' : '#4a7a5a' },
              ]}
            >
              {saving ? t('cadastro_saving') : t('cadastro_submit')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headerEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  avatarPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#06100a',
  },
  avatarBadgeText: {
    fontSize: 14,
  },
  avatarHint: {
    fontSize: 11,
    marginTop: 8,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  fieldError: {
    fontSize: 11,
    color: '#f43f5e',
    marginTop: 6,
    marginLeft: 4,
  },
  fieldSuccess: {
    fontSize: 11,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '600',
  },
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ageButton: {
    width: '18.5%',
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minWidth: 56,
    flexGrow: 1,
  },
  ageText: {
    fontSize: 18,
  },
  ageCheckmark: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 10,
    color: '#2aff9e',
    fontWeight: '900',
  },
  themeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  themeIndicatorEmoji: {
    fontSize: 16,
  },
  themeIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  submitOuter: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 20,
  },
});
