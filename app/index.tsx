// FutStar — Index Router
// Redireciona para onboarding (1ª vez) ou tabs (retorno)

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppContext } from '../store/progress';

export default function IndexRouter() {
  const { profile, isLoaded } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Pequeno delay para garantir que a navegação está pronta
    const timer = setTimeout(() => {
      if (!profile || !profile.onboardingDone) {
        // Primeira vez — vai para onboarding
        router.replace('/onboarding' as any);
      } else {
        // Já tem perfil — vai direto para as tabs
        router.replace('/(tabs)/treinos' as any);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoaded, profile]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4ade80" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060b14',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
