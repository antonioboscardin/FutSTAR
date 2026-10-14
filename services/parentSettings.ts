// FutStar — Configurações Parentais
// PIN de 4 dígitos, limite de tempo, modo KIDS lock

import AsyncStorage from '@react-native-async-storage/async-storage';

const PARENT_SETTINGS_KEY = 'futstar_parent_settings';

export interface ParentSettings {
  pin: string | null;            // PIN de 4 dígitos (null = não configurado)
  dailyTimeLimitMinutes: number | null; // null = ilimitado
  kidsModeLocked: boolean;       // Se true, filho não pode trocar tema
  createdAt: string;
}

const DEFAULT_SETTINGS: ParentSettings = {
  pin: null,
  dailyTimeLimitMinutes: null,
  kidsModeLocked: false,
  createdAt: new Date().toISOString(),
};

export async function getParentSettings(): Promise<ParentSettings> {
  try {
    const raw = await AsyncStorage.getItem(PARENT_SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export async function saveParentSettings(settings: ParentSettings): Promise<void> {
  await AsyncStorage.setItem(PARENT_SETTINGS_KEY, JSON.stringify(settings));
}

export async function verifyPin(enteredPin: string): Promise<boolean> {
  const settings = await getParentSettings();
  if (!settings.pin) return true; // No PIN set = always valid
  return settings.pin === enteredPin;
}

export async function setPin(pin: string): Promise<void> {
  const settings = await getParentSettings();
  settings.pin = pin;
  await saveParentSettings(settings);
}

export async function clearPin(): Promise<void> {
  const settings = await getParentSettings();
  settings.pin = null;
  await saveParentSettings(settings);
}

export const TIME_LIMIT_OPTIONS = [
  { value: null, label: 'Ilimitado' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
] as const;
