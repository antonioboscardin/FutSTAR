// FutStar — Root Layout
// Envolve toda a app com AppProvider (store global)
// Gerencia splash screen, carregamento e navegação condicional

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import * as Sentry from '@sentry/react-native';

import { AppProvider, useAppContext } from '../store/progress';
import { initNotifications } from '../services/notifications';
import { initAds } from '../services/ads';
import { initI18n } from '../i18n';
import { initUsageTracking } from '../services/usageTracking';
import { initPremium } from '../services/premium';
import AsyncStorage from '@react-native-async-storage/async-storage';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: !__DEV__,
  tracesSampleRate: 0.2,
});

export {
  ErrorBoundary,
} from 'expo-router';

// Previne auto-hide do splash antes de carregar dados
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

export default Sentry.wrap(RootLayout);

function RootNavigator() {
  const { isLoaded, theme } = useAppContext();

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
      initPremium().then(async () => {
        // AdMob só inicializa se consentimento foi aceito (LGPD)
        const consent = await AsyncStorage.getItem('futstar_consent_accepted');
        if (consent === 'true') {
          initAds();
        }
      });
      initNotifications();
      initI18n();
      initUsageTracking();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: '#06100a' }]}>
        <ActivityIndicator size="large" color="#2aff9e" />
      </View>
    );
  }

  const isDark = theme.mode === 'pro';

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bgPrimary },
          animation: 'slide_from_right',
        }}
      >
        {/* 
          index.tsx decide o redirecionamento:
          - 1ª vez → onboarding → cadastro → quiz → tabs
          - Retorno → tabs direto
        */}
        <Stack.Screen name="index" />
        <Stack.Screen
          name="onboarding"
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="cadastro"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="quiz-posicao"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="area-pais"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="edit-perfil"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="premium"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="consent"
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="privacy-policy"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="terms-of-use"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="workout-complete"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="referral"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="report-bug"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
