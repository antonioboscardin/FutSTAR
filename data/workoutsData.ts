// FutStar — Tipos e acesso ao banco de treinos unificado (480 treinos)

// ---- Tipos i18n ----
export interface I18nText {
  pt: string;
  es: string;
  en: string;
}

// ---- Exercício ----
export interface WorkoutExercise {
  nome: I18nText;
  descricao: I18nText;
  duracao_segundos: number | null;
  repeticoes: number | string | null;
  series: number | null;
  descanso_segundos: number | null;
  dica: I18nText | null;
  erro_comum: I18nText | null;
}

// ---- Fase do treino ----
export type WorkoutPhaseType = 'aquecimento' | 'principal' | 'volta_calma';

export interface WorkoutPhase {
  tipo: WorkoutPhaseType;
  nome: I18nText;
  duracao_minutos: number;
  exercicios: WorkoutExercise[];
}

// ---- Posição pode ser string ou objeto i18n ----
export type WorkoutPosition = string | I18nText;

// ---- Treino completo ----
export interface Workout {
  id: string;
  titulo: I18nText;
  faixa_etaria: string;
  posicao: WorkoutPosition;
  nivel: WorkoutLevel;
  duracao_minutos: number;
  xp_recompensa: number;
  local: string;
  equipamentos: string[];
  frase_inicio: I18nText;
  frase_fim: I18nText;
  fases: WorkoutPhase[];
}

// ---- Níveis e faixas ----
export type WorkoutLevel = 'Base' | 'Desenvolvimento' | 'Especialização' | 'Elite';
export type AgeGroup = 'Sub-8' | 'Sub-10' | 'Sub-12' | 'Sub-14' | 'Sub-16';

export const AGE_GROUPS: AgeGroup[] = ['Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16'];

export const WORKOUT_LEVELS: { key: WorkoutLevel; label: I18nText; xp: number; color: string }[] = [
  { key: 'Base', label: { pt: 'Base', es: 'Base', en: 'Foundation' }, xp: 80, color: '#2aff9e' },
  { key: 'Desenvolvimento', label: { pt: 'Desenvolvimento', es: 'Desarrollo', en: 'Development' }, xp: 120, color: '#38bdf8' },
  { key: 'Especialização', label: { pt: 'Especialização', es: 'Especialización', en: 'Specialization' }, xp: 160, color: '#a78bfa' },
  { key: 'Elite', label: { pt: 'Elite', es: 'Élite', en: 'Elite' }, xp: 200, color: '#FFD700' },
];

export const LEVEL_ORDER: WorkoutLevel[] = ['Base', 'Desenvolvimento', 'Especialização', 'Elite'];

export const TREINOS_PER_LEVEL = 12; // 4 semanas × 3 dias
export const DAYS_PER_WEEK = 3;      // Seg, Qua, Sex
export const WEEKS_PER_LEVEL = 4;

export const DAY_LABELS: I18nText[] = [
  { pt: 'Segunda', es: 'Lunes', en: 'Monday' },
  { pt: 'Quarta', es: 'Miércoles', en: 'Wednesday' },
  { pt: 'Sexta', es: 'Viernes', en: 'Friday' },
];

// ---- Banco de dados ----
import rawData from './futstar_banco_unificado.json';

const banco = rawData as { _meta: any; treinos: Workout[] };
export const ALL_WORKOUTS: Workout[] = banco.treinos;

// ---- Helpers ----

/** Resolve posição: pode ser string ou I18nText */
export function getPositionString(pos: WorkoutPosition, lang: 'pt' | 'es' | 'en' = 'pt'): string {
  if (typeof pos === 'string') return pos;
  return pos[lang] || pos.pt;
}

/** Filtra treinos por faixa + posição + nível */
export function getWorkoutsForPlayer(
  faixaEtaria: AgeGroup,
  posicao: string, // "Todos" ou "Goleiro" para N1; posição específica para N2+
  nivel: WorkoutLevel,
): Workout[] {
  return ALL_WORKOUTS.filter(w => {
    if (w.faixa_etaria !== faixaEtaria) return false;
    if (w.nivel !== nivel) return false;

    const wPos = getPositionString(w.posicao);
    // Para N1 (Base), tudo é "Todos" ou "Goleiro"
    if (nivel === 'Base') {
      if (posicao === 'Goleiro') return wPos === 'Goleiro';
      return wPos === 'Todos';
    }
    // Para N2+, busca posição específica ou fallback para "Todos"
    if (wPos === posicao) return true;
    if (wPos === 'Todos') return true;
    return false;
  }).sort((a, b) => {
    // Ordena por ID (s1d1, s1d2, s1d3, s2d1, ...)
    return a.id.localeCompare(b.id);
  });
}

/** Pega treino específico por semana (1-based) e dia (1-based) */
export function getWorkoutByWeekDay(
  faixaEtaria: AgeGroup,
  posicao: string,
  nivel: WorkoutLevel,
  semana: number, // 1-4
  dia: number,    // 1-3
): Workout | null {
  const all = getWorkoutsForPlayer(faixaEtaria, posicao, nivel);
  const index = (semana - 1) * DAYS_PER_WEEK + (dia - 1);
  return all[index] || null;
}

/** Pega XP de um nível */
export function getXPForLevel(nivel: WorkoutLevel): number {
  return WORKOUT_LEVELS.find(l => l.key === nivel)?.xp || 80;
}

/** Mapeia idade numérica para faixa etária */
export function ageToAgeGroup(age: number): AgeGroup {
  if (age <= 8) return 'Sub-8';
  if (age <= 10) return 'Sub-10';
  if (age <= 12) return 'Sub-12';
  if (age <= 14) return 'Sub-14';
  return 'Sub-16';
}

/** Resolve texto i18n pelo idioma atual */
export function i18nText(text: I18nText | null | undefined, lang: 'pt' | 'es' | 'en' = 'pt'): string {
  if (!text) return '';
  return text[lang] || text.pt || '';
}

/** Ícone da fase */
export function getPhaseIcon(tipo: WorkoutPhaseType): string {
  switch (tipo) {
    case 'aquecimento': return '🔥';
    case 'principal': return '⚽';
    case 'volta_calma': return '🧘';
    default: return '📋';
  }
}

/** Cor da fase */
export function getPhaseColor(tipo: WorkoutPhaseType): string {
  switch (tipo) {
    case 'aquecimento': return '#FF6B35';
    case 'principal': return '#2aff9e';
    case 'volta_calma': return '#38bdf8';
    default: return '#4a7a5a';
  }
}
