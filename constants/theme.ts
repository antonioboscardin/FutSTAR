// FutStar — Design System
// Dois temas visuais baseados na idade do jogador:
// KIDS (8-12 anos): claro, vibrante, divertido
// PRO (13-16 anos): escuro, profissional, premium

export type ThemeMode = 'kids' | 'pro';

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string;
  bgCard: string;
  bgElevated: string;
  bgInput: string;
  bgOverlay: string;

  // Borders
  borderDefault: string;
  borderActive: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDim: string;
  textInverse: string;

  // Accents
  accentGreen: string;
  accentBlue: string;
  accentOrange: string;
  accentRed: string;
  accentYellow: string;
  accentPurple: string;
  accentCyan: string;
  accentPink: string;

  // Phase colors
  phase1: string;
  phase2: string;
  phase3: string;
  phase4: string;

  // Semantic
  success: string;
  warning: string;
  error: string;
  info: string;

  // Tab bar
  tabBarBg: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;

  // Gradients (start, end)
  headerGradient: [string, string];
  cardGradient: [string, string];
  successGradient: [string, string];
}

export interface ThemeTypography {
  fontFamily: string;
  fontFamilyBold: string;
  sizes: {
    xs: number;   // 9
    sm: number;   // 11
    md: number;   // 13
    lg: number;   // 16
    xl: number;   // 20
    xxl: number;  // 28
    hero: number; // 44
  };
}

export interface ThemeSpacing {
  xs: number;   // 4
  sm: number;   // 8
  md: number;   // 12
  lg: number;   // 16
  xl: number;   // 20
  xxl: number;  // 28
}

export interface ThemeRadii {
  sm: number;   // 8
  md: number;   // 11
  lg: number;   // 14
  xl: number;   // 20
  full: number; // 50
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  voiceTone: 'fun' | 'serious'; // Tom de voz
}

// ============================================================
// TEMA PRO (13-16 anos) — Escuro Premium
// Extraído do treino-bufalo-1.html
// ============================================================
const PRO_COLORS: ThemeColors = {
  bgPrimary: '#060b14',
  bgCard: '#0d1422',
  bgElevated: '#0a111e',
  bgInput: '#111827',
  bgOverlay: 'rgba(6, 11, 20, 0.85)',

  borderDefault: '#1a2840',
  borderActive: '#2d4060',

  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#475569',
  textDim: '#2d4060',
  textInverse: '#060b14',

  accentGreen: '#4ade80',
  accentBlue: '#60a5fa',
  accentOrange: '#fb923c',
  accentRed: '#f43f5e',
  accentYellow: '#fbbf24',
  accentPurple: '#a78bfa',
  accentCyan: '#38bdf8',
  accentPink: '#fb7185',

  phase1: '#4ade80',
  phase2: '#60a5fa',
  phase3: '#fb923c',
  phase4: '#f43f5e',

  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f43f5e',
  info: '#60a5fa',

  tabBarBg: '#080e18',
  tabBarBorder: '#1a2840',
  tabActive: '#4ade80',
  tabInactive: '#2d4060',

  headerGradient: ['#0d1f12', '#091624'],
  cardGradient: ['#0d1422', '#0a111e'],
  successGradient: ['#052e16', '#0d1422'],
};

// ============================================================
// TEMA KIDS (8-12 anos) — Claro Vibrante
// ============================================================
const KIDS_COLORS: ThemeColors = {
  bgPrimary: '#F0F4FF',
  bgCard: '#FFFFFF',
  bgElevated: '#F8FAFF',
  bgInput: '#EEF2FF',
  bgOverlay: 'rgba(240, 244, 255, 0.92)',

  borderDefault: '#E2E8F0',
  borderActive: '#CBD5E1',

  textPrimary: '#1E293B',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textDim: '#CBD5E1',
  textInverse: '#FFFFFF',

  accentGreen: '#00C853',
  accentBlue: '#2979FF',
  accentOrange: '#FF9100',
  accentRed: '#FF5252',
  accentYellow: '#FFD600',
  accentPurple: '#7C4DFF',
  accentCyan: '#00B0FF',
  accentPink: '#FF4081',

  phase1: '#00C853',
  phase2: '#2979FF',
  phase3: '#FF9100',
  phase4: '#FF5252',

  success: '#00C853',
  warning: '#FFD600',
  error: '#FF5252',
  info: '#2979FF',

  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabActive: '#00C853',
  tabInactive: '#94A3B8',

  headerGradient: ['#E8F5E9', '#E3F2FD'],
  cardGradient: ['#FFFFFF', '#F8FAFF'],
  successGradient: ['#E8F5E9', '#FFFFFF'],
};

// ============================================================
// Typography & Spacing (compartilhados com ajuste de tamanho)
// ============================================================
const PRO_TYPOGRAPHY: ThemeTypography = {
  fontFamily: 'System',
  fontFamilyBold: 'System',
  sizes: {
    xs: 9,
    sm: 11,
    md: 13,
    lg: 16,
    xl: 20,
    xxl: 28,
    hero: 44,
  },
};

const KIDS_TYPOGRAPHY: ThemeTypography = {
  fontFamily: 'System',
  fontFamilyBold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 24,
    xxl: 32,
    hero: 48,
  },
};

const SPACING: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

const RADII: ThemeRadii = {
  sm: 8,
  md: 11,
  lg: 14,
  xl: 20,
  full: 50,
};

// ============================================================
// Temas completos
// ============================================================
export const PRO_THEME: Theme = {
  mode: 'pro',
  colors: PRO_COLORS,
  typography: PRO_TYPOGRAPHY,
  spacing: SPACING,
  radii: RADII,
  voiceTone: 'serious',
};

export const KIDS_THEME: Theme = {
  mode: 'kids',
  colors: KIDS_COLORS,
  typography: KIDS_TYPOGRAPHY,
  spacing: SPACING,
  radii: RADII,
  voiceTone: 'fun',
};

/**
 * Seleciona o tema baseado na idade do jogador.
 * <= 12 anos → KIDS
 * >= 13 anos → PRO
 */
export function getThemeByAge(age: number): Theme {
  return age <= 12 ? KIDS_THEME : PRO_THEME;
}

/**
 * Gera cor com opacidade a partir de um hex.
 * Exemplo: withOpacity('#4ade80', 0.1) → 'rgba(74, 222, 128, 0.1)'
 */
export function withOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
