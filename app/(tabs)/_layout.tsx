// FutStar — Tab Navigator (Visual Overhaul)
// 6 abas com ícones maiores, underline animado, badge pulsante
// TikTok + Duolingo style

import { useState, useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet, View, Animated as RNAnimated, type ColorValue } from 'react-native';
import { useAppContext } from '../../store/progress';
import { withOpacity } from '../../constants/theme';
import { AdBanner } from '../../components/AdBanner';
import { t } from '../../i18n';
import { getParentSettings } from '../../services/parentSettings';
import { isTimeLimitReached } from '../../services/usageTracking';
import { usePremium } from '../../hooks/usePremium';

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
  color: ColorValue;
  showBadge?: boolean;
}

function TabIcon({ emoji, label, focused, color, showBadge = false }: TabIconProps) {
  // Pulse animation for badge
  const badgeScale = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    if (showBadge) {
      const pulse = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(badgeScale, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          RNAnimated.timing(badgeScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [showBadge]);

  return (
    <View style={styles.tabIconContainer}>
      <View style={styles.emojiWrapper}>
        <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.45 }]}>{emoji}</Text>
        {showBadge && (
          <RNAnimated.View
            style={[
              styles.badge,
              { transform: [{ scale: badgeScale }] },
            ]}
          />
        )}
      </View>
      <Text
        style={[
          styles.tabLabel,
          {
            color,
            fontWeight: focused ? '800' : '500',
            opacity: focused ? 1 : 0.6,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {/* Active underline indicator */}
      {focused && (
        <View
          style={[
            styles.activeIndicator,
            { backgroundColor: color as string },
          ]}
        />
      )}
    </View>
  );
}

// ---- Time Limit Overlay ----

function TimeLimitOverlay() {
  const { theme } = useAppContext();
  const c = theme.colors;

  return (
    <View style={[overlayStyles.container, { backgroundColor: c.bgPrimary }]}>
      <View style={overlayStyles.content}>
        <Text style={overlayStyles.emoji}>⏰</Text>
        <Text style={[overlayStyles.title, { color: c.textPrimary }]}>
          {t('time_limit_title')}
        </Text>
        <Text style={[overlayStyles.subtitle, { color: c.textSecondary }]}>
          {t('time_limit_msg')}
        </Text>
        <View style={[overlayStyles.card, {
          backgroundColor: withOpacity(c.accentBlue, 0.06),
          borderColor: withOpacity(c.accentBlue, 0.15),
        }]}>
          <Text style={[overlayStyles.cardText, { color: c.accentBlue }]}>
            {t('time_limit_parent_note')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const overlayStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill as object,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  cardText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
});

// ---- Main Tab Layout ----

export default function TabLayout() {
  const { theme, locale } = useAppContext();
  const c = theme.colors;
  const [timeLimitBlocked, setTimeLimitBlocked] = useState(false);
  const { isPremium } = usePremium();

  // Check time limit every 60 seconds
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const checkTimeLimit = async () => {
      try {
        const settings = await getParentSettings();
        if (settings.dailyTimeLimitMinutes !== null) {
          const reached = await isTimeLimitReached(settings.dailyTimeLimitMinutes);
          setTimeLimitBlocked(reached);
        } else {
          setTimeLimitBlocked(false);
        }
      } catch {
        setTimeLimitBlocked(false);
      }
    };

    checkTimeLimit();
    intervalId = setInterval(checkTimeLimit, 60000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <>
    {timeLimitBlocked && <TimeLimitOverlay />}
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.tabBarBg,
          borderTopColor: c.tabBarBorder,
          borderTopWidth: 1,
          height: 78,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: c.tabActive,
        tabBarInactiveTintColor: c.tabInactive,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="treinos"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="⚽" label={t('tab_treinos')} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progresso"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="📊" label={t('tab_progresso')} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏆" label={t('tab_ranking')} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" label={t('tab_perfil')} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sono"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🌙" label={t('tab_sono')} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutricao"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🥗" label={t('tab_nutricao')} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
    <AdBanner isPremium={isPremium} />
    </>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 52,
    position: 'relative',
  },
  emojiWrapper: {
    position: 'relative',
  },
  tabEmoji: {
    fontSize: 26,
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: 0.3,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#06100a',
  },
});
