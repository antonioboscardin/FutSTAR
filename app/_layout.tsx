// FutStar — Root Layout
// Envolve toda a app com AppProvider (store global)
// Gerencia splash screen, carregamento e navegação condicional

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { AppProvider, useAppContext } from '../store/progress';
import { initNotifications } from '../services/notifications';
import { initAds } from '../services/ads';
import { initI18n } from '../i18n';

export {
  ErrorBoundary,
} from 'expo-router';

// Previne auto-hide do splash antes de carregar dados
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

function RootNavigator() {
  const { isLoaded, theme } = useAppContext();

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
      initNotifications();
      initAds();
      initI18n();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: '#060b14' }]}>
        <ActivityIndicator size="large" color="#4ade80" />
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
