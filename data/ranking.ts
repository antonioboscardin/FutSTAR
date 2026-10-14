// FutStar — Sistema de Ranking e Ligas (Pessoal + Leaderboard)
// Ligas baseadas em XP, pontuação composta, milestones pessoais
// Perfis seed para leaderboard inicial

import { type AchievementKey } from './achievements';

// ============================================================
// Ligas
// ============================================================

export interface League {
  key: string;
  name: string;
  icon: string;
  color: string;
  minXP: number;
  maxXP: number;
}

export const LEAGUES: League[] = [
  { key: 'bronze',  name: 'Bronze',  icon: '🥉', color: '#cd7f32', minXP: 0,    maxXP: 499 },
  { key: 'prata',   name: 'Prata',   icon: '🥈', color: '#a0c4b0', minXP: 500,  maxXP: 1799 },
  { key: 'ouro',    name: 'Ouro',    icon: '🥇', color: '#FFD700', minXP: 1800, maxXP: 3499 },
  { key: 'elite',   name: 'Elite',   icon: '💎', color: '#2aff9e', minXP: 3500, maxXP: Infinity },
];

export function getLeague(xp: number): League {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (xp >= LEAGUES[i].minXP) return LEAGUES[i];
  }
  return LEAGUES[0];
}

export function getNextLeague(xp: number): League | null {
  const current = getLeague(xp);
  const idx = LEAGUES.indexOf(current);
  if (idx < LEAGUES.length - 1) return LEAGUES[idx + 1];
  return null;
}

export function getLeagueProgress(xp: number): number {
  const league = getLeague(xp);
  if (league.maxXP === Infinity) return 100;
  const range = league.maxXP - league.minXP + 1;
  const progress = xp - league.minXP;
  return Math.min(Math.round((progress / range) * 100), 100);
}

// ============================================================
// Pontuação composta
// ============================================================

export function calculateCompositeScore(
  xp: number,
  streak: number,
  achievementCount: number
): number {
  return xp + (streak * 50) + (achievementCount * 100);
}

// ============================================================
// Milestones pessoais (ranking evolutivo)
// ============================================================

export interface Milestone {
  xp: number;
  icon: string;
  labelKey: string; // chave i18n
  color: string;
}

export const MILESTONES: Milestone[] = [
  { xp: 50,    icon: '🌱', labelKey: 'ranking_milestone_first_step',   color: '#4ade80' },
  { xp: 150,   icon: '⚡', labelKey: 'ranking_milestone_warming_up',   color: '#60a5fa' },
  { xp: 300,   icon: '🔥', labelKey: 'ranking_milestone_on_fire',      color: '#fb923c' },
  { xp: 500,   icon: '🥈', labelKey: 'ranking_milestone_silver',       color: '#94a3b8' },
  { xp: 800,   icon: '⭐', labelKey: 'ranking_milestone_talent',       color: '#fbbf24' },
  { xp: 1200,  icon: '💪', labelKey: 'ranking_milestone_dedicated',    color: '#f472b6' },
  { xp: 1800,  icon: '🥇', labelKey: 'ranking_milestone_gold',         color: '#fbbf24' },
  { xp: 2500,  icon: '🏆', labelKey: 'ranking_milestone_champion',     color: '#fb923c' },
  { xp: 3500,  icon: '💎', labelKey: 'ranking_milestone_elite',        color: '#a78bfa' },
  { xp: 5000,  icon: '👑', labelKey: 'ranking_milestone_legend',       color: '#f43f5e' },
  { xp: 7500,  icon: '🌟', labelKey: 'ranking_milestone_superstar',    color: '#22d3ee' },
  { xp: 10000, icon: '🐐', labelKey: 'ranking_milestone_goat',         color: '#4ade80' },
];

/**
 * Retorna milestones alcançados e o próximo.
 */
export function getMilestoneStatus(xp: number): {
  reached: Milestone[];
  next: Milestone | null;
  nextProgress: number;
} {
  const reached = MILESTONES.filter(m => xp >= m.xp);
  const next = MILESTONES.find(m => xp < m.xp) || null;

  let nextProgress = 100;
  if (next) {
    const prevXP = reached.length > 0 ? reached[reached.length - 1].xp : 0;
    const range = next.xp - prevXP;
    const progress = xp - prevXP;
    nextProgress = range > 0 ? Math.min(Math.round((progress / range) * 100), 100) : 0;
  }

  return { reached, next, nextProgress };
}

// ============================================================
// Estatísticas pessoais
// ============================================================

export interface PersonalStats {
  totalTrainings: number;
  daysSinceStart: number;
  trainingsPerWeek: number;
  bestStreak: number;
}

/**
 * Calcula estatísticas pessoais baseado nos dados reais.
 */
export function calculatePersonalStats(
  completedTrainings: Record<string, { date: string }>,
  streak: number,
  createdAt: string | undefined
): PersonalStats {
  const totalTrainings = Object.keys(completedTrainings).length;

  let daysSinceStart = 1;
  if (createdAt) {
    const start = new Date(createdAt);
    if (!isNaN(start.getTime())) {
      const now = new Date();
      daysSinceStart = Math.max(1, Math.floor(
        (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1);
    }
  }

  const weeks = Math.max(1, daysSinceStart / 7);
  const trainingsPerWeek = Math.round((totalTrainings / weeks) * 10) / 10;

  // Best streak: we use current streak as we don't persist historical max
  // In a future version this could be tracked separately
  const bestStreak = streak;

  return {
    totalTrainings,
    daysSinceStart,
    trainingsPerWeek,
    bestStreak,
  };
}

// ============================================================
// Seed Players (leaderboard fictício para novos usuários)
// ============================================================

export interface SeedPlayer {
  id: string;
  nickname: string;
  position: string;
  xp: number;
  streak: number;
  isSeed: true;
}

export const SEED_PLAYERS: SeedPlayer[] = [
  { id: 'seed_1',  nickname: 'Gabi_CR7',       position: 'Atacante',     xp: 4820, streak: 14, isSeed: true },
  { id: 'seed_2',  nickname: 'Pedrinho10',     position: 'Meia',         xp: 3240, streak: 8,  isSeed: true },
  { id: 'seed_3',  nickname: 'Rafa_Goleiro',   position: 'Goleiro',      xp: 2100, streak: 5,  isSeed: true },
  { id: 'seed_4',  nickname: 'Duda_Volante',   position: 'Volante',      xp: 1850, streak: 6,  isSeed: true },
  { id: 'seed_5',  nickname: 'Biel_Flash',     position: 'Ponta Direita',xp: 1520, streak: 4,  isSeed: true },
  { id: 'seed_6',  nickname: 'Lari_Fut',       position: 'Lateral',      xp: 1200, streak: 3,  isSeed: true },
  { id: 'seed_7',  nickname: 'Kaio_Zaga',      position: 'Zagueiro',     xp: 980,  streak: 7,  isSeed: true },
  { id: 'seed_8',  nickname: 'Vitinho_10',     position: 'Meia',         xp: 760,  streak: 2,  isSeed: true },
  { id: 'seed_9',  nickname: 'Tata_Speed',     position: 'Ponta Esquerda', xp: 540, streak: 3, isSeed: true },
  { id: 'seed_10', nickname: 'JoJo_Gol',       position: 'Centroavante', xp: 380,  streak: 1,  isSeed: true },
  { id: 'seed_11', nickname: 'Madu_Defense',   position: 'Zagueiro',     xp: 240,  streak: 2,  isSeed: true },
  { id: 'seed_12', nickname: 'Léo_Paredão',    position: 'Goleiro',      xp: 120,  streak: 1,  isSeed: true },
];
