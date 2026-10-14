// FutStar — Tela Premium (Upgrade)
// Visual impactante com gradient, animações, planos mensal/anual
// 💎 pulse, stagger benefits, PressableScale buttons

import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Linking, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppContext } from '../store/progress';
import { withOpacity } from '../constants/theme';
import { usePremium } from '../hooks/usePremium';
import { PREMIUM_PLANS, PREMIUM_BENEFITS } from '../services/premium';
import { t } from '../i18n';
import PressableScale from '../components/PressableScale';

// Links — trocar em produção
const TERMS_URL = 'https://futstar.app/terms';
const PRIVACY_URL = 'https://futstar.app/privacy';

export default function PremiumScreen() {
  const router = useRouter();
  const { theme } = useAppContext();
  const c = theme.colors;
  const { isPremium, purchase, restore } = usePremium();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  // 💎 Pulsating animation
  const gemPulse = useRef(new Animated.Value(1)).current;
  // Stagger fade-in for benefits
  const benefitAnims = useRef(
    PREMIUM_BENEFITS.map(() => new Animated.Value(0))
  ).current;
  // Plans slide-up
  const plansSlide = useRef(new Animated.Value(30)).current;
  const plansOpacity = useRef(new Animated.Value(0)).current;
  // Hero entry
  const heroScale = useRef(new Animated.Value(0.8)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Hero entry
    Animated.parallel([
      Animated.spring(heroScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. 💎 Pulse loop
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(gemPulse, {
          toValue: 1.18,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(gemPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // 3. Stagger benefits
    const benefitAnimations = benefitAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: 400 + i * 80,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, benefitAnimations).start();

    // 4. Plans slide-up
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(plansSlide, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(plansOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 600);

    return () => pulse.stop();
  }, []);

  const handlePurchase = async (planId: string) => {
    setPurchasing(planId);
    try {
      const result = await purchase(planId);
      if (result.success) {
        Alert.alert(t('premium_success_title'), t('premium_success_msg'));
        router.back();
      } else if (result.error && result.error !== 'cancelled') {
        Alert.alert(t('premium_error_title'), result.error);
      }
    } catch {
      Alert.alert(t('premium_error_title'), t('premium_error_generic'));
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const result = await restore();
      if (result.success) {
        Alert.alert(t('premium_restore_success'), t('premium_restore_success_msg'));
        router.back();
      } else {
        Alert.alert(t('premium_restore_fail'), t('premium_restore_fail_msg'));
      }
    } catch {
      Alert.alert(t('premium_error_title'), t('premium_error_generic'));
    } finally {
      setRestoring(false);
    }
  };

  // Já é premium — mostrar status
  if (isPremium) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
        <View style={styles.premiumActive}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: c.textMuted }]}>← {t('back')}</Text>
          </TouchableOpacity>
          <Animated.Text style={[styles.activeEmoji, { transform: [{ scale: gemPulse }] }]}>
            💎
          </Animated.Text>
          <Text style={[styles.activeTitle, { color: c.accentPurple }]}>
            {t('premium_active_title')}
          </Text>
          <Text style={[styles.activeSub, { color: c.textSecondary }]}>
            {t('premium_active_sub')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: c.textMuted }]}>← {t('back')}</Text>
        </TouchableOpacity>

        {/* Hero gradient */}
        <Animated.View style={{
          transform: [{ scale: heroScale }],
          opacity: heroOpacity,
        }}>
          <LinearGradient
            colors={[
              withOpacity(c.accentPurple, 0.15),
              withOpacity(c.accentYellow, 0.08),
              c.bgPrimary,
            ]}
            style={styles.hero}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
          >
            <Animated.Text style={[styles.heroEmoji, { transform: [{ scale: gemPulse }] }]}>
              💎
            </Animated.Text>
            <Text style={[styles.heroTitle, { color: c.textPrimary }]}>
              {t('premium_title')}
            </Text>
            <Text style={[styles.heroSub, { color: c.textSecondary }]}>
              {t('premium_sub')}
            </Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.content}>
          {/* Benefits */}
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
            {t('premium_benefits_title')}
          </Text>

          {PREMIUM_BENEFITS.map((b, i) => (
            <Animated.View
              key={i}
              style={{
                opacity: benefitAnims[i],
                transform: [{
                  translateY: benefitAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                }],
              }}
            >
              <View
                style={[styles.benefitRow, {
                  backgroundColor: c.bgCard,
                  borderColor: c.borderDefault,
                }]}
              >
                <Text style={styles.benefitIcon}>{b.icon}</Text>
                <Text style={[styles.benefitText, { color: c.textPrimary }]}>
                  {t(b.labelKey)}
                </Text>
                <Text style={[styles.benefitCheck, { color: c.accentGreen }]}>✓</Text>
              </View>
            </Animated.View>
          ))}

          {/* Plans */}
          <Animated.View style={{
            opacity: plansOpacity,
            transform: [{ translateY: plansSlide }],
          }}>
            <Text style={[styles.sectionLabel, { color: c.textMuted, marginTop: 16 }]}>
              {t('premium_choose_plan')}
            </Text>

            {PREMIUM_PLANS.map((plan) => (
              <PressableScale
                key={plan.id}
                disabled={purchasing !== null}
                onPress={() => handlePurchase(plan.id)}
                scaleDown={0.97}
                style={[styles.planCard, {
                  backgroundColor: plan.popular
                    ? withOpacity(c.accentPurple, 0.08)
                    : c.bgCard,
                  borderColor: plan.popular
                    ? withOpacity(c.accentPurple, 0.3)
                    : c.borderDefault,
                  borderWidth: plan.popular ? 2 : 1,
                }]}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: c.accentPurple }]}>
                    <Text style={styles.popularBadgeText}>⭐ {t('premium_most_popular')}</Text>
                  </View>
                )}

                <View style={styles.planRow}>
                  <View style={styles.planInfo}>
                    <Text style={[styles.planType, { color: plan.popular ? c.accentPurple : c.textPrimary }]}>
                      {plan.type === 'annual' ? t('premium_plan_annual') : t('premium_plan_monthly')}
                    </Text>
                    <Text style={[styles.planPrice, { color: c.textPrimary }]}>
                      {plan.priceLabel}
                    </Text>
                    <Text style={[styles.planPerMonth, { color: c.textDim }]}>
                      {plan.pricePerMonth}/{t('premium_per_month')}
                    </Text>
                  </View>

                  <View style={styles.planAction}>
                    {plan.savings && (
                      <View style={[styles.savingsBadge, { backgroundColor: withOpacity(c.accentGreen, 0.12) }]}>
                        <Text style={[styles.savingsText, { color: c.accentGreen }]}>
                          -{plan.savings}
                        </Text>
                      </View>
                    )}
                    <View style={[styles.selectBtn, {
                      backgroundColor: plan.popular ? c.accentPurple : withOpacity(c.accentGreen, 0.12),
                    }]}>
                      <Text style={[styles.selectBtnText, {
                        color: plan.popular ? c.textInverse : c.accentGreen,
                      }]}>
                        {purchasing === plan.id ? t('loading') : t('premium_select')}
                      </Text>
                    </View>
                  </View>
                </View>
              </PressableScale>
            ))}
          </Animated.View>

          {/* Restore */}
          <TouchableOpacity
            onPress={handleRestore}
            disabled={restoring}
            style={styles.restoreBtn}
          >
            <Text style={[styles.restoreText, { color: c.textDim }]}>
              {restoring ? t('loading') : t('premium_restore')}
            </Text>
          </TouchableOpacity>

          {/* Legal links */}
          <View style={styles.legalRow}>
            <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
              <Text style={[styles.legalText, { color: c.textDim }]}>
                {t('premium_terms')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.legalDot, { color: c.textDim }]}>·</Text>
            <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
              <Text style={[styles.legalText, { color: c.textDim }]}>
                {t('premium_privacy')}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.disclaimer, { color: c.textDim }]}>
            {t('premium_disclaimer')}
          </Text>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },
  backBtn: { padding: 16, paddingBottom: 0 },
  backText: { fontSize: 13, fontWeight: '600' },
  // Hero
  hero: { alignItems: 'center', padding: 28, paddingTop: 16 },
  heroEmoji: { fontSize: 56, marginBottom: 8 },
  heroTitle: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  heroSub: { fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 22 },
  // Content
  content: { padding: 16 },
  sectionLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  // Benefits
  benefitRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 6, gap: 10 },
  benefitIcon: { fontSize: 18 },
  benefitText: { flex: 1, fontSize: 13, fontWeight: '600' },
  benefitCheck: { fontSize: 16, fontWeight: '900' },
  // Plans
  planCard: { borderRadius: 16, padding: 16, marginBottom: 10, overflow: 'hidden' },
  popularBadge: { position: 'absolute', top: 0, right: 0, borderBottomLeftRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  popularBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planInfo: { flex: 1 },
  planType: { fontSize: 14, fontWeight: '800' },
  planPrice: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  planPerMonth: { fontSize: 10, marginTop: 2 },
  planAction: { alignItems: 'flex-end', gap: 6 },
  savingsBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  savingsText: { fontSize: 11, fontWeight: '900' },
  selectBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  selectBtnText: { fontSize: 12, fontWeight: '800' },
  // Restore
  restoreBtn: { alignItems: 'center', padding: 16 },
  restoreText: { fontSize: 12, fontWeight: '600' },
  // Legal
  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 4 },
  legalText: { fontSize: 10, textDecorationLine: 'underline' },
  legalDot: { fontSize: 10 },
  disclaimer: { fontSize: 9, textAlign: 'center', marginTop: 12, lineHeight: 15 },
  // Premium active
  premiumActive: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  activeEmoji: { fontSize: 56, marginBottom: 12 },
  activeTitle: { fontSize: 22, fontWeight: '900' },
  activeSub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 22 },
});
