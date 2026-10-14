// FutStar — Tela de Indicação
// Código, progresso, lista de indicados e compartilhamento

import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useAppContext } from '../store/progress';
import { withOpacity } from '../constants/theme';
import ProgressBar from '../components/ProgressBar';
import PressableScale from '../components/PressableScale';
import { t } from '../i18n';
import {
  getReferralCode,
  saveReferralCode,
  getMyReferrals,
  checkReferralReward,
  type Referral,
} from '../services/referral';

export default function ReferralScreen() {
  const { theme, profile } = useAppContext();
  const c = theme.colors;
  const router = useRouter();

  const [code, setCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [rewardInfo, setRewardInfo] = useState<{
    confirmed: number;
    rewardEarned: boolean;
    alreadyClaimed: boolean;
  }>({ confirmed: 0, rewardEarned: false, alreadyClaimed: false });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Ensure code exists
    let myCode = await getReferralCode();
    if (!myCode && profile?.name) {
      myCode = await saveReferralCode(profile.name);
    }
    setCode(myCode);

    const refs = await getMyReferrals();
    setReferrals(refs);

    const reward = await checkReferralReward();
    setRewardInfo(reward);
  };

  const handleCopy = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!code) return;
    try {
      await Share.share({
        message: t('referral_share_msg', { code }),
      });
    } catch {}
  };

  const confirmedCount = rewardInfo.confirmed;
  const progressPct = Math.round((confirmedCount / 5) * 100);
  const remaining = 5 - confirmedCount;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: c.textSecondary }]}>← {t('back')}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: c.textPrimary }]}>
            🎯 {t('referral_title')}
          </Text>
          <Text style={[styles.subtitle, { color: c.textDim }]}>
            {t('referral_subtitle')}
          </Text>
        </View>

        {/* Code Card */}
        <View style={[styles.codeCard, {
          backgroundColor: withOpacity(c.accentGreen, 0.06),
          borderColor: withOpacity(c.accentGreen, 0.2),
        }]}>
          <Text style={[styles.codeLabel, { color: c.textMuted }]}>
            {t('referral_your_code')}
          </Text>
          <Text style={[styles.codeText, { color: c.accentGreen }]}>
            {code || '...'}
          </Text>
          <View style={styles.codeActions}>
            <PressableScale
              onPress={handleCopy}
              style={[styles.codeBtn, { backgroundColor: withOpacity(c.accentGreen, 0.12) }]}
            >
              <Text style={[styles.codeBtnText, { color: c.accentGreen }]}>
                {copied ? '✅ ' + t('referral_copied') : '📋 ' + t('referral_copy')}
              </Text>
            </PressableScale>
            <PressableScale
              onPress={handleShare}
              style={[styles.codeBtn, { backgroundColor: c.accentGreen }]}
            >
              <Text style={[styles.codeBtnText, { color: c.textInverse }]}>
                📤 {t('referral_invite')}
              </Text>
            </PressableScale>
          </View>
        </View>

        {/* Progress */}
        <View style={[styles.progressCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: c.textPrimary }]}>
              {t('referral_progress')}
            </Text>
            <Text style={[styles.progressCount, { color: c.accentGreen }]}>
              {confirmedCount}/5
            </Text>
          </View>
          <ProgressBar progress={progressPct} color={c.accentGreen} height={8} showLabel />

          {/* Reward status */}
          {rewardInfo.rewardEarned ? (
            <View style={[styles.rewardBadge, {
              backgroundColor: withOpacity(c.accentPurple, 0.08),
              borderColor: withOpacity(c.accentPurple, 0.2),
            }]}>
              <Text style={styles.rewardEmoji}>💎</Text>
              <Text style={[styles.rewardText, { color: c.accentPurple }]}>
                {t('referral_reward_earned')}
              </Text>
            </View>
          ) : confirmedCount >= 3 ? (
            <View style={[styles.rewardBadge, {
              backgroundColor: withOpacity(c.accentOrange, 0.08),
              borderColor: withOpacity(c.accentOrange, 0.2),
            }]}>
              <Text style={styles.rewardEmoji}>🔥</Text>
              <Text style={[styles.rewardText, { color: c.accentOrange }]}>
                {t('referral_almost', { remaining })}
              </Text>
            </View>
          ) : null}
        </View>

        {/* How it works */}
        <View style={[styles.howCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
          <Text style={[styles.howTitle, { color: c.textPrimary }]}>
            {t('referral_how_title')}
          </Text>
          {[
            { emoji: '1️⃣', text: t('referral_step_1') },
            { emoji: '2️⃣', text: t('referral_step_2') },
            { emoji: '3️⃣', text: t('referral_step_3') },
            { emoji: '4️⃣', text: t('referral_step_4') },
          ].map((step, i) => (
            <View key={i} style={styles.howRow}>
              <Text style={styles.howEmoji}>{step.emoji}</Text>
              <Text style={[styles.howText, { color: c.textSecondary }]}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* Referral list */}
        {referrals.length > 0 && (
          <View style={[styles.listCard, { backgroundColor: c.bgCard, borderColor: c.borderDefault }]}>
            <Text style={[styles.listTitle, { color: c.textPrimary }]}>
              {t('referral_friends')}
            </Text>
            {referrals.map((ref, i) => (
              <View key={i} style={[styles.listItem, {
                borderBottomColor: i < referrals.length - 1 ? c.borderDefault : 'transparent',
              }]}>
                <View style={styles.listItemLeft}>
                  <Text style={styles.listItemEmoji}>
                    {ref.confirmed ? '✅' : '⏳'}
                  </Text>
                  <View>
                    <Text style={[styles.listItemName, { color: c.textPrimary }]}>
                      {ref.name}
                    </Text>
                    <Text style={[styles.listItemStatus, { color: c.textDim }]}>
                      {ref.confirmed
                        ? t('referral_status_confirmed')
                        : t('referral_status_pending', { count: ref.trainingsCompleted })}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.listItemXP, { color: ref.confirmed ? c.accentGreen : c.textDim }]}>
                  {ref.confirmed ? '+50 XP' : `${ref.trainingsCompleted}/3`}
                </Text>
              </View>
            ))}
          </View>
        )}
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

  codeCard: {
    margin: 16,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  codeLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  codeText: { fontSize: 36, fontWeight: '900', letterSpacing: 3, marginVertical: 12 },
  codeActions: { flexDirection: 'row', gap: 10, width: '100%' },
  codeBtn: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  codeBtnText: { fontSize: 13, fontWeight: '800' },

  progressCard: {
    margin: 16,
    marginTop: 0,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { fontSize: 14, fontWeight: '800' },
  progressCount: { fontSize: 18, fontWeight: '900' },

  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  rewardEmoji: { fontSize: 20 },
  rewardText: { fontSize: 13, fontWeight: '700', flex: 1 },

  howCard: {
    margin: 16,
    marginTop: 0,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  howTitle: { fontSize: 14, fontWeight: '800', marginBottom: 12 },
  howRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  howEmoji: { fontSize: 16 },
  howText: { fontSize: 12, lineHeight: 18, flex: 1 },

  listCard: {
    margin: 16,
    marginTop: 0,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  listTitle: { fontSize: 14, fontWeight: '800', marginBottom: 12 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listItemEmoji: { fontSize: 18 },
  listItemName: { fontSize: 13, fontWeight: '700' },
  listItemStatus: { fontSize: 11, marginTop: 1 },
  listItemXP: { fontSize: 12, fontWeight: '800' },
});
