import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useAppContext } from '../store/progress';

export default function NotFoundScreen() {
  const { theme } = useAppContext();
  const c = theme.colors;

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: c.bgPrimary }]}>
        <Text style={styles.emoji}>🤔</Text>
        <Text style={[styles.title, { color: c.textPrimary }]}>Tela não encontrada</Text>
        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: c.accentGreen }]}>Voltar ao início</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emoji: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  link: { marginTop: 15, paddingVertical: 15 },
  linkText: { fontSize: 14 },
});
