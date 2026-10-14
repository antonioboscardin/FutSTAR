// FutStar — Store Global
// Context API + AsyncStorage para persistência
// Gerencia: perfil, progresso, XP, streak, conquistas, tema

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, Theme, getThemeByAge, PRO_THEME, KIDS_THEME } from '../constants/theme';
import { PositionKey } from '../data/positions';
import { TRAINING_DAY_INDICES, PHASES } from '../data/phases';
import { XP_PER_TRAINING, getPlayerLevel, getLevelProgress, type PlayerLevel, type AchievementKey, ACHIEVEMENTS } from '../data/achievements';
import { cancelTodayStreakAlert, sendAchievementNotification } from '../services/notifications';
import { onTrainingCompleted } from '../services/ads';
import { TagKey } from '../constants/tags';
import { initI18n, setLanguage as setI18nLanguage, getCurrentLocale } from '../i18n';
import {
  type Workout, type WorkoutLevel, type AgeGroup,
  getWorkoutByWeekDay, getWorkoutsForPlayer, getXPForLevel,
  ageToAgeGroup, LEVEL_ORDER, TREINOS_PER_LEVEL, DAYS_PER_WEEK, WEEKS_PER_LEVEL,
  ALL_WORKOUTS,
} from '../data/workoutsData';

// ============================================================
// Types
// ============================================================

export interface UserProfile {
  name: string;
  age: number;
  position: PositionKey;
  photoUri: string | null;
  themeOverride: ThemeMode | null; // null = auto por idade
  onboardingDone: boolean;
  createdAt: string;
  favoriteTeam?: string;       // Time do coração (Feature 4)
  birthDate?: string;          // Data de nascimento ISO (Feature 4)
  objective?: string;          // Objetivo: tecnica|velocidade|forca|coletivo (Feature 5)
  // Banco unificado v2
  faixaEtaria?: AgeGroup;      // Sub-8 a Sub-16 (derivado da idade)
  trilha?: string;             // "Todos" ou "Goleiro"
}

export interface ProgressRecord {
  date: string; // dd/mm/yyyy
}

export interface AppState {
  // Perfil
  profile: UserProfile | null;

  // Progresso de treinos: chave = "fase_semana_dia" (legacy)
  completedTrainings: Record<string, ProgressRecord>;

  // Progressão do banco unificado v2
  nivelAtual: WorkoutLevel;   // Base → Desenvolvimento → Especialização → Elite
  semanaAtual: number;        // 1-4 dentro do nível
  diaAtual: number;           // 1-3 (Seg, Qua, Sex)
  treinosConcluidos: string[]; // IDs dos treinos concluídos
  workoutHistory: { id: string; date: string; xp: number; title?: string }[];

  // Gamificação
  xp: number;
  streak: number;
  lastTrainingDate: string | null; // ISO string
  unlockedAchievements: AchievementKey[];

  // UI state
  isLoaded: boolean;
}

export interface TrainingResult {
  marked: boolean;
  weekComplete: boolean;   // all training days in this week done?
  phaseComplete: boolean;  // all training days in this phase done?
  xpGained: number;
}

export interface AppContextType extends AppState {
  // Tema ativo
  theme: Theme;

  // Ações de perfil
  saveProfile: (profile: UserProfile) => Promise<void>;
  updateProfileField: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => Promise<void>;
  logoutProfile: () => Promise<void>;

  // Ações de progresso
  toggleTraining: (phaseId: number, weekIndex: number, dayIndex: number) => Promise<TrainingResult>;
  isTrainingDone: (phaseId: number, weekIndex: number, dayIndex: number) => boolean;
  getTrainingDate: (phaseId: number, weekIndex: number, dayIndex: number) => string | null;
  getPhaseProgress: (phaseId: number) => { done: number; total: number };
  getTotalProgress: () => { done: number; total: number };
  getWeekStatus: (phaseId: number, dayIndex: number) => 'both' | 'one' | 'none';
  isWeekFullyComplete: (phaseId: number, weekIndex: number) => boolean;
  isPhaseFullyComplete: (phaseId: number) => boolean;

  // Gamificação
  playerLevel: PlayerLevel;
  levelProgress: number;

  // i18n
  locale: string;
  changeLocale: (lang: string) => Promise<void>;

  // Reset
  resetAllData: () => Promise<void>;

  // Premium / Bonus
  addBonusXP: (amount: number) => Promise<void>;

  // Banco unificado v2
  getCurrentWorkout: () => Workout | null;
  completeWorkout: (workoutId: string) => Promise<{ xpGained: number; levelUp: boolean }>;
  getWorkoutProgress: () => { done: number; total: number; pct: number };
  nivelAtual: WorkoutLevel;
  semanaAtual: number;
  diaAtual: number;
  treinosConcluidos: string[];
  workoutHistory: { id: string; date: string; xp: number; title?: string }[];
}

const STORAGE_KEY = 'futstar_app_state_v1';

const defaultState: AppState = {
  profile: null,
  completedTrainings: {},
  nivelAtual: 'Base',
  semanaAtual: 1,
  diaAtual: 1,
  treinosConcluidos: [],
  workoutHistory: [],
  xp: 0,
  streak: 0,
  lastTrainingDate: null,
  unlockedAchievements: [],
  isLoaded: false,
};

// ============================================================
// Context
// ============================================================

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

// ============================================================
// Provider
// ============================================================

function makeTrainingKey(phaseId: number, weekIndex: number, dayIndex: number): string {
  return `${phaseId}_${weekIndex}_${dayIndex}`;
}

function parseDateSafe(dateStr: string): Date | null {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const d = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

function calculateStreak(
  completedTrainings: Record<string, ProgressRecord>,
  lastDate: string | null
): number {
  if (!lastDate) return 0;

  const last = new Date(lastDate);
  if (isNaN(last.getTime())) return 0;

  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Se passou mais de 1 dia sem treinar, streak reseta
  if (diffDays > 1) return 0;

  // Conta dias consecutivos retroativamente
  const dates = Object.values(completedTrainings)
    .map(r => parseDateSafe(r.date))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime());

  if (dates.length === 0) return 0;

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const diff = Math.floor(
      (dates[i].getTime() - dates[i + 1].getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
    // diff === 0 means same day, continue
  }

  return streak;
}

/**
 * Conta quantos treinos concluídos têm exercícios com tag 'pe' (pé esquerdo).
 */
function countLeftFootTrainings(
  completedTrainings: Record<string, ProgressRecord>
): number {
  let count = 0;
  const keys = Object.keys(completedTrainings);
  for (const key of keys) {
    const parts = key.split('_');
    if (parts.length !== 3) continue;
    const [phaseId, , dayIndex] = parts.map(Number);
    const phase = PHASES[phaseId];
    if (!phase) continue;
    const day = phase.days[dayIndex];
    if (!day) continue;
    // Se o dia tem exercícios com tag 'pe', conta
    if (day.exercises.some(ex => ex.tag === ('pe' as TagKey))) {
      count++;
    }
  }
  return count;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [locale, setLocale] = useState<string>(getCurrentLocale());

  // ---- Carregar dados do AsyncStorage ----
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AppState>;
          setState(prev => ({
            ...prev,
            ...parsed,
            isLoaded: true,
          }));
        } else {
          setState(prev => ({ ...prev, isLoaded: true }));
        }
      } catch {
        setState(prev => ({ ...prev, isLoaded: true }));
      }
      // Inicializa i18n (carrega idioma salvo)
      await initI18n();
      setLocale(getCurrentLocale());
    })();
  }, []);

  // ---- Persistir mudanças ----
  const persist = useCallback(async (newState: AppState) => {
    try {
      const { isLoaded, ...data } = newState;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('FutStar: falha ao salvar', e);
    }
  }, []);

  // ---- Tema ativo ----
  const theme = React.useMemo<Theme>(() => {
    if (!state.profile) return PRO_THEME;
    if (state.profile.themeOverride) {
      return state.profile.themeOverride === 'kids' ? KIDS_THEME : PRO_THEME;
    }
    return getThemeByAge(state.profile.age);
  }, [state.profile]);

  // ---- Ações de perfil ----
  const saveProfile = useCallback(async (profile: UserProfile) => {
    const newState = { ...state, profile };
    setState(newState);
    await persist(newState);
  }, [state, persist]);

  const updateProfileField = useCallback(async <K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K]
  ) => {
    if (!state.profile) return;
    const newProfile = { ...state.profile, [key]: value };
    const newState = { ...state, profile: newProfile };
    setState(newState);
    await persist(newState);
  }, [state, persist]);

  // ---- Checagens de progresso ----
  const isTrainingDone = useCallback((phaseId: number, weekIndex: number, dayIndex: number): boolean => {
    return !!state.completedTrainings[makeTrainingKey(phaseId, weekIndex, dayIndex)];
  }, [state.completedTrainings]);

  const getTrainingDate = useCallback((phaseId: number, weekIndex: number, dayIndex: number): string | null => {
    const record = state.completedTrainings[makeTrainingKey(phaseId, weekIndex, dayIndex)];
    return record ? record.date : null;
  }, [state.completedTrainings]);

  const getWeekStatus = useCallback((phaseId: number, dayIndex: number): 'both' | 'one' | 'none' => {
    const w1 = isTrainingDone(phaseId, 0, dayIndex);
    const w2 = isTrainingDone(phaseId, 1, dayIndex);
    if (w1 && w2) return 'both';
    if (w1 || w2) return 'one';
    return 'none';
  }, [isTrainingDone]);

  const getPhaseProgress = useCallback((phaseId: number): { done: number; total: number } => {
    let total = 0;
    let done = 0;
    TRAINING_DAY_INDICES.forEach(dayIndex => {
      [0, 1].forEach(weekIndex => {
        total++;
        if (isTrainingDone(phaseId, weekIndex, dayIndex)) done++;
      });
    });
    return { done, total };
  }, [isTrainingDone]);

  const getTotalProgress = useCallback((): { done: number; total: number } => {
    let total = 0;
    let done = 0;
    PHASES.forEach((_, phaseId) => {
      const p = getPhaseProgress(phaseId);
      total += p.total;
      done += p.done;
    });
    return { done, total };
  }, [getPhaseProgress]);

  // ---- Week/Phase complete checkers ----
  const isWeekFullyComplete = useCallback((phaseId: number, weekIndex: number): boolean => {
    return TRAINING_DAY_INDICES.every(di => isTrainingDone(phaseId, weekIndex, di));
  }, [isTrainingDone]);

  const isPhaseFullyComplete = useCallback((phaseId: number): boolean => {
    return [0, 1].every(wi => isWeekFullyComplete(phaseId, wi));
  }, [isWeekFullyComplete]);

  // ---- Toggle treino ----
  const toggleTraining = useCallback(async (phaseId: number, weekIndex: number, dayIndex: number): Promise<TrainingResult> => {
    const key = makeTrainingKey(phaseId, weekIndex, dayIndex);
    const wasCompleted = !!state.completedTrainings[key];
    const newTrainings = { ...state.completedTrainings };
    let newXP = state.xp;
    let newStreak = state.streak;
    let newLastDate = state.lastTrainingDate;
    let newAchievements = [...state.unlockedAchievements];
    let xpGained = 0;

    if (wasCompleted) {
      // Desmarcar
      delete newTrainings[key];
      newXP = Math.max(0, newXP - XP_PER_TRAINING);
    } else {
      // Marcar como feito
      const now = new Date();
      newTrainings[key] = {
        date: now.toLocaleDateString('pt-BR'),
      };
      newXP += XP_PER_TRAINING;
      xpGained += XP_PER_TRAINING;
      newLastDate = now.toISOString();
      newStreak = calculateStreak(newTrainings, newLastDate);

      // Cancela alerta de streak do dia (já treinou)
      cancelTodayStreakAlert().catch(() => {});

      // Intersticial a cada 3 treinos
      onTrainingCompleted().catch(() => {});

      // Verificar conquistas
      const totalDone = Object.keys(newTrainings).length;

      // Primeiro Treino
      if (totalDone >= 1 && !newAchievements.includes('primeiro_treino')) {
        newAchievements.push('primeiro_treino');
        const ach = ACHIEVEMENTS.find(a => a.key === 'primeiro_treino');
        if (ach) { newXP += ach.xp; xpGained += ach.xp; }
      }

      // Streak 3
      if (newStreak >= 3 && !newAchievements.includes('streak_3')) {
        newAchievements.push('streak_3');
        const ach = ACHIEVEMENTS.find(a => a.key === 'streak_3');
        if (ach) { newXP += ach.xp; xpGained += ach.xp; }
      }

      // Máquina (streak 7)
      if (newStreak >= 7 && !newAchievements.includes('maquina')) {
        newAchievements.push('maquina');
        const ach = ACHIEVEMENTS.find(a => a.key === 'maquina');
        if (ach) { newXP += ach.xp; xpGained += ach.xp; }
      }

      // Streak 14
      if (newStreak >= 14 && !newAchievements.includes('streak_14')) {
        newAchievements.push('streak_14');
        const ach = ACHIEVEMENTS.find(a => a.key === 'streak_14');
        if (ach) { newXP += ach.xp; xpGained += ach.xp; }
      }

      // Streak 30
      if (newStreak >= 30 && !newAchievements.includes('streak_30')) {
        newAchievements.push('streak_30');
        const ach = ACHIEVEMENTS.find(a => a.key === 'streak_30');
        if (ach) { newXP += ach.xp; xpGained += ach.xp; }
      }

      // Semana completa — check if marking this day completed a week
      const weekNowComplete = TRAINING_DAY_INDICES.every(di =>
        !!newTrainings[makeTrainingKey(phaseId, weekIndex, di)]
      );
      if (weekNowComplete && !newAchievements.includes('semana_completa')) {
        newAchievements.push('semana_completa');
        const ach = ACHIEVEMENTS.find(a => a.key === 'semana_completa');
        if (ach) { newXP += ach.xp; xpGained += ach.xp; }
      }

      // Fase Conquistada — verificar cada fase
      PHASES.forEach((_, pid) => {
        let allDone = true;
        TRAINING_DAY_INDICES.forEach(di => {
          [0, 1].forEach(wi => {
            if (!newTrainings[makeTrainingKey(pid, wi, di)]) allDone = false;
          });
        });
        if (allDone && !newAchievements.includes('fase_conquistada')) {
          newAchievements.push('fase_conquistada');
          const ach = ACHIEVEMENTS.find(a => a.key === 'fase_conquistada');
          if (ach) { newXP += ach.xp; xpGained += ach.xp; }
        }
      });

      // Todas as fases
      let allPhasesComplete = true;
      PHASES.forEach((_, pid) => {
        TRAINING_DAY_INDICES.forEach(di => {
          [0, 1].forEach(wi => {
            if (!newTrainings[makeTrainingKey(pid, wi, di)]) allPhasesComplete = false;
          });
        });
      });
      if (allPhasesComplete && !newAchievements.includes('todas_fases')) {
        newAchievements.push('todas_fases');
        const ach = ACHIEVEMENTS.find(a => a.key === 'todas_fases');
        if (ach) { newXP += ach.xp; xpGained += ach.xp; }
      }

      // Ambidestro — 10 treinos com exercícios de pé esquerdo
      const leftFootCount = countLeftFootTrainings(newTrainings);
      if (leftFootCount >= 10 && !newAchievements.includes('ambidestro')) {
        newAchievements.push('ambidestro');
        const ach = ACHIEVEMENTS.find(a => a.key === 'ambidestro');
        if (ach) { newXP += ach.xp; xpGained += ach.xp; }
      }
    }

    // Notify newly unlocked achievements
    const previousAchievements = state.unlockedAchievements;
    const newlyUnlocked = newAchievements.filter(a => !previousAchievements.includes(a));
    for (const achKey of newlyUnlocked) {
      const ach = ACHIEVEMENTS.find(a => a.key === achKey);
      if (ach) {
        sendAchievementNotification(ach.name, ach.icon, ach.xp).catch(() => {});
      }
    }

    const newState: AppState = {
      ...state,
      completedTrainings: newTrainings,
      xp: newXP,
      streak: newStreak,
      lastTrainingDate: newLastDate,
      unlockedAchievements: newAchievements,
    };

    setState(newState);
    await persist(newState);

    // Check if this action completed the week or phase
    const weekComplete = !wasCompleted && TRAINING_DAY_INDICES.every(di =>
      !!newTrainings[makeTrainingKey(phaseId, weekIndex, di)]
    );
    const phaseComplete = !wasCompleted && [0, 1].every(wi =>
      TRAINING_DAY_INDICES.every(di =>
        !!newTrainings[makeTrainingKey(phaseId, wi, di)]
      )
    );

    return { marked: !wasCompleted, weekComplete, phaseComplete, xpGained };
  }, [state, persist]);

  // ---- Gamificação computada ----
  const playerLevel = getPlayerLevel(state.xp);
  const levelProgress = getLevelProgress(state.xp);

  // ---- Logout (preserva treinos e limpa perfil mas mantém dados de progresso) ----
  const logoutProfile = useCallback(async () => {
    const newState: AppState = {
      ...state,
      profile: null,
    };
    setState(newState);
    await persist(newState);
  }, [state, persist]);

  // ---- Reset ----
  const resetAllData = useCallback(async () => {
    const freshState = { ...defaultState, isLoaded: true };
    setState(freshState);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  // ---- Trocar idioma ----
  const changeLocale = useCallback(async (lang: string) => {
    await setI18nLanguage(lang);
    setLocale(lang);
  }, []);

  // ---- Bonus XP (rewarded ads) ----
  const addBonusXP = useCallback(async (amount: number) => {
    const newXP = state.xp + amount;
    const newState: AppState = { ...state, xp: newXP };
    setState(newState);
    await persist(newState);
  }, [state, persist]);

  // ---- Banco Unificado v2 ----
  const getCurrentWorkout = useCallback((): Workout | null => {
    if (!state.profile) return null;
    const faixa = state.profile.faixaEtaria || ageToAgeGroup(state.profile.age);
    const trilha = state.profile.trilha || 'Todos';
    return getWorkoutByWeekDay(faixa, trilha, state.nivelAtual, state.semanaAtual, state.diaAtual);
  }, [state]);

  const completeWorkout = useCallback(async (workoutId: string): Promise<{ xpGained: number; levelUp: boolean }> => {
    if (state.treinosConcluidos.includes(workoutId)) return { xpGained: 0, levelUp: false };

    const xpGained = getXPForLevel(state.nivelAtual);
    const newXP = state.xp + xpGained;
    const newConcluidos = [...state.treinosConcluidos, workoutId];

    // Resolve workout title for history
    const currentWorkout = ALL_WORKOUTS.find(w => w.id === workoutId);
    const workoutTitle = currentWorkout ? currentWorkout.titulo.pt : workoutId;

    const newHistory = [...state.workoutHistory, { id: workoutId, date: new Date().toISOString(), xp: xpGained, title: workoutTitle }];
    const newLastDate = new Date().toISOString();

    // Avançar dia/semana/nível
    let newDia = state.diaAtual;
    let newSemana = state.semanaAtual;
    let newNivel = state.nivelAtual;
    let levelUp = false;

    newDia++;
    if (newDia > DAYS_PER_WEEK) {
      newDia = 1;
      newSemana++;
      if (newSemana > WEEKS_PER_LEVEL) {
        newSemana = 1;
        // Avançar nível
        const nivelIdx = LEVEL_ORDER.indexOf(newNivel);
        if (nivelIdx < LEVEL_ORDER.length - 1) {
          newNivel = LEVEL_ORDER[nivelIdx + 1];
          levelUp = true;
        }
        // Se já é Elite, mantém (completou tudo)
      }
    }

    // Streak
    const newTrainings = { ...state.completedTrainings };
    newTrainings[`v2_${workoutId}`] = { date: new Date().toLocaleDateString('pt-BR') };
    const newStreak = calculateStreak(newTrainings, newLastDate);

    // Conquistas
    let newAchievements = [...state.unlockedAchievements];
    if (newConcluidos.length >= 1 && !newAchievements.includes('primeiro_treino')) {
      newAchievements.push('primeiro_treino');
    }
    if (newStreak >= 3 && !newAchievements.includes('streak_3')) {
      newAchievements.push('streak_3');
    }
    if (newStreak >= 7 && !newAchievements.includes('maquina')) {
      newAchievements.push('maquina');
    }
    if (levelUp && !newAchievements.includes('fase_conquistada')) {
      newAchievements.push('fase_conquistada');
    }

    cancelTodayStreakAlert().catch(() => {});
    onTrainingCompleted().catch(() => {});

    const newState: AppState = {
      ...state,
      completedTrainings: newTrainings,
      nivelAtual: newNivel,
      semanaAtual: newSemana,
      diaAtual: newDia,
      treinosConcluidos: newConcluidos,
      workoutHistory: newHistory,
      xp: newXP,
      streak: newStreak,
      lastTrainingDate: newLastDate,
      unlockedAchievements: newAchievements,
    };

    setState(newState);
    await persist(newState);
    return { xpGained, levelUp };
  }, [state, persist]);

  const getWorkoutProgress = useCallback((): { done: number; total: number; pct: number } => {
    // Treinos feitos neste nível
    if (!state.profile) return { done: 0, total: TREINOS_PER_LEVEL, pct: 0 };
    const faixa = state.profile.faixaEtaria || ageToAgeGroup(state.profile.age);
    const trilha = state.profile.trilha || 'Todos';
    const levelWorkouts = getWorkoutsForPlayer(faixa, trilha, state.nivelAtual);
    const done = levelWorkouts.filter(w => state.treinosConcluidos.includes(w.id)).length;
    const total = levelWorkouts.length || TREINOS_PER_LEVEL;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [state]);

  const contextValue: AppContextType = {
    ...state,
    theme,
    saveProfile,
    updateProfileField,
    logoutProfile,
    toggleTraining,
    isTrainingDone,
    getTrainingDate,
    getPhaseProgress,
    getTotalProgress,
    getWeekStatus,
    isWeekFullyComplete,
    isPhaseFullyComplete,
    playerLevel,
    levelProgress,
    locale,
    changeLocale,
    resetAllData,
    addBonusXP,
    getCurrentWorkout,
    completeWorkout,
    getWorkoutProgress,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
