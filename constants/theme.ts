// FutStar — Design System
// Dois temas visuais baseados na idade do jogador:
// KIDS (8-12 anos): claro, vibrante, divertido
// PRO (13-17 anos): escuro, profissional, premium

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
// TEMA PRO (13-17 anos) — Escuro Premium
// ============================================================
const PRO_COLORS: ThemeColors = {
  bgPrimary: '#06100a',
  bgCard: '#0d1f17',
  bgElevated: '#091e12',
  bgInput: '#142a1c',
  bgOverlay: 'rgba(6, 16, 10, 0.88)',

  borderDefault: 'rgba(1, 135, 95, 0.2)',
  borderActive: 'rgba(1, 135, 95, 0.45)',

  textPrimary: '#f1f5f0',
  textSecondary: '#a0c4b0',
  textMuted: '#4a7a5a',
  textDim: '#2a4a36',
  textInverse: '#06100a',

  accentGreen: '#01875f',
  accentBlue: '#38bdf8',
  accentOrange: '#FF6B35',
  accentRed: '#f43f5e',
  accentYellow: '#FFD700',
  accentPurple: '#a78bfa',
  accentCyan: '#2aff9e',
  accentPink: '#fb7185',

  phase1: '#01875f',
  phase2: '#38bdf8',
  phase3: '#FF6B35',
  phase4: '#f43f5e',

  success: '#2aff9e',
  warning: '#FFD700',
  error: '#f43f5e',
  info: '#38bdf8',

  tabBarBg: '#030f08',
  tabBarBorder: 'rgba(1, 135, 95, 0.2)',
  tabActive: '#2aff9e',
  tabInactive: '#2a4a36',

  headerGradient: ['#0b2218', '#06100a'],
  cardGradient: ['#0d1f17', '#091e12'],
  successGradient: ['#0b2218', '#0d1f17'],
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
