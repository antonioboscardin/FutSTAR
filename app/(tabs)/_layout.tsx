// FutStar — Tab Navigator
// 6 abas: Treinos, Progresso, Ranking, Perfil, Sono, Nutrição
// Tema visual aplicado automaticamente (Kids claro / PRO escuro)

import { Tabs } from 'expo-router';
import { Text, StyleSheet, View, type ColorValue } from 'react-native';
import { useAppContext } from '../../store/progress';
import { withOpacity } from '../../constants/theme';
import AdBanner from '../../components/AdBanner';

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
  color: ColorValue;
}

function TabIcon({ emoji, label, focused, color }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.5 }]}>{emoji}</Text>
      <Text
        style={[
          styles.tabLabel,
          {
            color,
            fontWeight: focused ? '800' : '500',
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { theme } = useAppContext();
  const c = theme.colors;

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.tabBarBg,
          borderTopColor: c.tabBarBorder,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 8,
          paddingTop: 6,
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
            <TabIcon emoji="⚽" label="Treinos" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progresso"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="📊" label="Progresso" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏆" label="Ranking" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" label="Perfil" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sono"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🌙" label="Sono" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutricao"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🥗" label="Nutrição" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
    <AdBanner />
    </>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 48,
  },
  tabEmoji: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: 0.3,
  },
});
