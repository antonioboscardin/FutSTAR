// FutStar — Sistema de Gamificação
// Conquistas, Níveis e XP

export type AchievementKey =
  | 'primeiro_treino'
  | 'semana_completa'
  | 'fase_conquistada'
  | 'ambidestro'
  | 'maquina'
  | 'streak_3'
  | 'streak_14'
  | 'streak_30'
  | 'todas_fases';

export interface Achievement {
  key: AchievementKey;
  name: string;
  description: string;
  icon: string;
  xp: number;
  condition: string; // Descrição da condição
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    key: 'primeiro_treino',
    name: 'Primeiro Passo',
    description: 'Completou seu primeiro treino',
    icon: '🔥',
    xp: 50,
    condition: 'Completar 1 treino',
  },
  {
    key: 'streak_3',
    name: 'Consistente',
    description: 'Treinou 3 dias seguidos',
    icon: '📅',
    xp: 100,
    condition: 'Streak de 3 dias',
  },
  {
    key: 'semana_completa',
    name: 'Semana Perfeita',
    description: 'Completou todos os treinos de 1 semana',
    icon: '⭐',
    xp: 200,
    condition: 'Completar todos os treinos de 1 semana',
  },
  {
    key: 'ambidestro',
    name: 'Ambidestro',
    description: 'Completou 10 treinos com foco no pé esquerdo',
    icon: '🦶',
    xp: 300,
    condition: '10 treinos de pé esquerdo',
  },
  {
    key: 'maquina',
    name: 'Máquina',
    description: 'Streak de 7 dias consecutivos',
    icon: '💪',
    xp: 400,
    condition: 'Streak de 7 dias',
  },
  {
    key: 'fase_conquistada',
    name: 'Fase Conquistada',
    description: 'Completou todos os treinos de 1 fase',
    icon: '🏆',
    xp: 500,
    condition: 'Completar todos os treinos de 1 fase',
  },
  {
    key: 'streak_14',
    name: 'Disciplinado',
    description: '14 dias seguidos treinando',
    icon: '🎖️',
    xp: 600,
    condition: 'Streak de 14 dias',
  },
  {
    key: 'streak_30',
    name: 'Imparável',
    description: '30 dias seguidos sem falhar',
    icon: '👑',
    xp: 1000,
    condition: 'Streak de 30 dias',
  },
  {
    key: 'todas_fases',
    name: 'FutStar',
    description: 'Completou TODAS as 4 fases do plano',
    icon: '⭐',
    xp: 2000,
    condition: 'Completar todas as 4 fases',
  },
];

// ============================================================
// Sistema de Níveis
// ============================================================
export interface PlayerLevel {
  level: number;
  name: string;
  icon: string;
  minXP: number;
  maxXP: number;
  color: string;
}

export const PLAYER_LEVELS: PlayerLevel[] = [
  { level: 1, name: 'Iniciante', icon: '🌱', minXP: 0, maxXP: 299, color: '#4a7a5a' },
  { level: 2, name: 'Promessa', icon: '🌟', minXP: 300, maxXP: 799, color: '#2aff9e' },
  { level: 3, name: 'Talento', icon: '⚡', minXP: 800, maxXP: 1799, color: '#38bdf8' },
  { level: 4, name: 'Craque', icon: '🔥', minXP: 1800, maxXP: 3499, color: '#FF6B35' },
  { level: 5, name: 'Estrela', icon: '💎', minXP: 3500, maxXP: 5999, color: '#a78bfa' },
  { level: 6, name: 'Lenda', icon: '👑', minXP: 6000, maxXP: Infinity, color: '#FFD700' },
];

export const XP_PER_TRAINING = 100;

/**
 * Retorna o nível do jogador baseado no XP total.
 */
export function getPlayerLevel(xp: number): PlayerLevel {
  for (let i = PLAYER_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= PLAYER_LEVELS[i].minXP) {
      return PLAYER_LEVELS[i];
    }
  }
  return PLAYER_LEVELS[0];
}

/**
 * Retorna a porcentagem de progresso dentro do nível atual.
 */
export function getLevelProgress(xp: number): number {
  const level = getPlayerLevel(xp);
  if (level.maxXP === Infinity) return 100;
  const range = level.maxXP - level.minXP;
  const progress = xp - level.minXP;
  return Math.min(Math.round((progress / range) * 100), 100);
}
