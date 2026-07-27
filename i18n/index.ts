// FutStar — i18n (Internacionalização)
// 3 idiomas: PT (padrão), ES, EN
// Detecção automática do dispositivo

import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import pt from './translations/pt';
import es from './translations/es';
import en from './translations/en';

const i18n = new I18n({ pt, es, en });

// Detecta idioma do dispositivo
const deviceLocale = Localization.getLocales()[0]?.languageCode || 'pt';
const supportedLocales = ['pt', 'es', 'en'];

i18n.locale = supportedLocales.includes(deviceLocale) ? deviceLocale : 'pt';
i18n.enableFallback = true;
i18n.defaultLocale = 'pt';

export default i18n;

const I18N_LANG_KEY = 'futstar_lang';

export async function getSavedLanguage(): Promise<string | null> {
  return AsyncStorage.getItem(I18N_LANG_KEY);
}

export async function setLanguage(lang: string): Promise<void> {
  i18n.locale = lang;
  await AsyncStorage.setItem(I18N_LANG_KEY, lang);
}

export async function initI18n(): Promise<void> {
  const saved = await getSavedLanguage();
  if (saved && supportedLocales.includes(saved)) {
    i18n.locale = saved;
  }
}

export function t(key: string, options?: Record<string, any>): string {
  return i18n.t(key, options);
}

export function getCurrentLocale(): string {
  return i18n.locale;
}

export const AVAILABLE_LANGUAGES = [
  { code: 'pt', label: '🇧🇷 Português', name: 'Português' },
  { code: 'es', label: '🇪🇸 Español', name: 'Español' },
  { code: 'en', label: '🇬🇧 English', name: 'English' },
];
