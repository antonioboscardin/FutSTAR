// FutStar — Tela de Edição de Perfil
// Permite editar nome, posição, time do coração

import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppContext } from '../store/progress';
import { POSITIONS, type PositionKey } from '../data/positions';
import { withOpacity } from '../constants/theme';
import { t } from '../i18n';

const POSITION_KEYS = Object.keys(POSITIONS) as PositionKey[];

export default function EditPerfilScreen() {
  const router = useRouter();
  const { theme, profile, updateProfileField } = useAppContext();
  const c = theme.colors;

  const [name, setName] = useState(profile?.name || '');
  const [position, setPosition] = useState<PositionKey>(profile?.position || 'centroavante');
  const [favoriteTeam, setFavoriteTeam] = useState(profile?.favoriteTeam || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('perfil_edit_error'), t('perfil_edit_name_required'));
      return;
    }
    setSaving(true);
    try {
      if (name !== profile?.name) await updateProfileField('name', name.trim());
      if (position !== profile?.position) await updateProfileField('position', position);
      if (favoriteTeam !== (profile?.favoriteTeam || '')) {
        await updateProfileField('favoriteTeam', favoriteTeam.trim() || undefined);
      }
      router.back();
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
    setSaving(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bgPrimary }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: c.textMuted }]}>← {t('pais_back')}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerEmoji}>✏️</Text>
            <Text style={[styles.headerTitle, { color: c.textPrimary }]}>{t('perfil_edit_title')}</Text>
          </View>

          {/* Name */}
          <Text style={[styles.fieldLabel, { color: c.textMuted }]}>{t('perfil_edit_name')}</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: c.bgInput, color: c.textPrimary, borderColor: c.borderDefault }]}
            value={name}
            onChangeText={setName}
            placeholder={t('perfil_edit_name')}
            placeholderTextColor={c.textDim}
            maxLength={30}
          />

          {/* Favorite Team */}
          <Text style={[styles.fieldLabel, { color: c.textMuted }]}>{t('perfil_favorite_team')}</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: c.bgInput, color: c.textPrimary, borderColor: c.borderDefault }]}
            value={favoriteTeam}
            onChangeText={setFavoriteTeam}
            placeholder={t('perfil_favorite_team_placeholder')}
            placeholderTextColor={c.textDim}
            maxLength={30}
          />

          {/* Position */}
          <Text style={[styles.fieldLabel, { color: c.textMuted }]}>{t('perfil_edit_position')}</Text>
          <View style={styles.posGrid}>
            {POSITION_KEYS.map(key => {
              const pos = POSITIONS[key];
              const isSelected = position === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setPosition(key)}
                  activeOpacity={0.7}
                  style={[
                    styles.posItem,
                    {
                      backgroundColor: isSelected ? withOpacity(pos.color, 0.12) : c.bgCard,
                      borderColor: isSelected ? withOpacity(pos.color, 0.4) : c.borderDefault,
                    },
                  ]}
                >
                  <Text style={styles.posIcon}>{pos.icon}</Text>
                  <Text style={[
                    styles.posLabel,
                    {
                      color: isSelected ? pos.color : c.textDim,
                      fontWeight: isSelected ? '800' : '500',
                    },
                  ]}>
                    {pos.shortLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.7}
            style={[styles.saveBtn, {
              backgroundColor: withOpacity(c.accentGreen, 0.12),
              borderColor: withOpacity(c.accentGreen, 0.3),
              opacity: saving ? 0.5 : 1,
            }]}
          >
            <Text style={[styles.saveBtnText, { color: c.accentGreen }]}>
              {saving ? '...' : t('perfil_edit_save')}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },
  content: { padding: 16, paddingTop: 50 },
  backBtn: { marginBottom: 14 },
  backText: { fontSize: 13, fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: 20 },
  headerEmoji: { fontSize: 28, marginBottom: 4 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
  },
  posGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  posItem: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  posIcon: { fontSize: 14 },
  posLabel: { fontSize: 11 },
  saveBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '900',
  },
});
