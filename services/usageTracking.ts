// FutStar — Serviço de Tracking de Uso
// Rastreia tempo de uso do app por dia via AsyncStorage
// Usado pela Área dos Pais para enforcement de limite de tempo

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type NativeEventSubscription } from 'react-native';

const USAGE_STORAGE_KEY = 'futstar_usage_tracking';
const SESSION_KEY = 'futstar_current_session';

// ============================================================
// Types
// ============================================================

export interface DailyUsage {
  date: string;          // YYYY-MM-DD
  totalMinutes: number;  // minutos acumulados
  sessions: number;      // quantas sessões naquele dia
}

interface UsageData {
  records: DailyUsage[];
}

interface SessionData {
  startedAt: string; // ISO timestamp
  date: string;      // YYYY-MM-DD
}

// ============================================================
// Helpers
// ============================================================

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

async function loadUsageData(): Promise<UsageData> {
  try {
    const raw = await AsyncStorage.getItem(USAGE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { records: [] };
}

async function saveUsageData(data: UsageData): Promise<void> {
  // Manter apenas últimos 90 dias
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  data.records = data.records.filter(r => r.date >= cutoffStr);

  await AsyncStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(data));
}

// ============================================================
// Session management
// ============================================================

/**
 * Inicia uma sessão de uso. Chamado quando o app fica ativo.
 */
export async function startSession(): Promise<void> {
  const session: SessionData = {
    startedAt: new Date().toISOString(),
    date: getTodayStr(),
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Encerra a sessão atual e registra o tempo de uso.
 * Chamado quando o app vai para background ou é fechado.
 */
export async function endSession(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return;

    const session: SessionData = JSON.parse(raw);
    const startTime = new Date(session.startedAt);
    const endTime = new Date();

    // Calcular minutos da sessão
    const diffMs = endTime.getTime() - startTime.getTime();
    const minutes = Math.max(1, Math.round(diffMs / (1000 * 60))); // mínimo 1 minuto

    // Registrar no dia correto
    const data = await loadUsageData();
    const today = getTodayStr();
    const existing = data.records.find(r => r.date === today);

    if (existing) {
      existing.totalMinutes += minutes;
      existing.sessions += 1;
    } else {
      data.records.push({
        date: today,
        totalMinutes: minutes,
        sessions: 1,
      });
    }

    await saveUsageData(data);
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.warn('[UsageTracking] Failed to end session:', e);
  }
}

// ============================================================
// Queries
// ============================================================

/**
 * Retorna os minutos de uso de hoje.
 */
export async function getTodayUsageMinutes(): Promise<number> {
  const data = await loadUsageData();
  const today = getTodayStr();
  const record = data.records.find(r => r.date === today);

  // Somar sessão ativa (se existe)
  let activeMinutes = 0;
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (raw) {
      const session: SessionData = JSON.parse(raw);
      const diff = Date.now() - new Date(session.startedAt).getTime();
      activeMinutes = Math.round(diff / (1000 * 60));
    }
  } catch {}

  return (record?.totalMinutes || 0) + activeMinutes;
}

/**
 * Verifica se o limite de tempo diário foi atingido.
 */
export async function isTimeLimitReached(limitMinutes: number | null): Promise<boolean> {
  if (limitMinutes === null) return false; // Ilimitado
  const used = await getTodayUsageMinutes();
  return used >= limitMinutes;
}

/**
 * Retorna relatório de uso semanal (7 dias).
 */
export async function getWeeklyUsageReport(): Promise<{
  records: DailyUsage[];
  averageMinutes: number;
  totalMinutes: number;
  daysActive: number;
}> {
  const data = await loadUsageData();
  const now = new Date();
  const weekRecords: DailyUsage[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const record = data.records.find(r => r.date === dateStr);
    if (record) weekRecords.push(record);
  }

  const totalMinutes = weekRecords.reduce((sum, r) => sum + r.totalMinutes, 0);
  const daysActive = weekRecords.length;
  const averageMinutes = daysActive > 0
    ? Math.round(totalMinutes / daysActive)
    : 0;

  return {
    records: weekRecords,
    averageMinutes,
    totalMinutes,
    daysActive,
  };
}

// ============================================================
// AppState Listener (inicia/encerra sessões automaticamente)
// ============================================================

let appStateSubscription: NativeEventSubscription | null = null;

/**
 * Inicializa o tracking de uso com listeners de AppState.
 * Deve ser chamado uma vez no _layout.tsx.
 */
export function initUsageTracking(): void {
  // Inicia sessão imediatamente
  startSession().catch(() => {});

  // Ouve mudanças de estado do app
  if (appStateSubscription) {
    appStateSubscription.remove();
  }

  let lastState = AppState.currentState;

  appStateSubscription = AppState.addEventListener('change', (nextState) => {
    if (lastState.match(/inactive|background/) && nextState === 'active') {
      // App voltou ao foreground
      startSession().catch(() => {});
    } else if (lastState === 'active' && nextState.match(/inactive|background/)) {
      // App foi para background
      endSession().catch(() => {});
    }
    lastState = nextState;
  });
}

/**
 * Remove o listener (cleanup).
 */
export function stopUsageTracking(): void {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  endSession().catch(() => {});
}

/**
 * Remove todos os registros de uso (para reset).
 */
export async function clearUsageData(): Promise<void> {
  await AsyncStorage.removeItem(USAGE_STORAGE_KEY);
  await AsyncStorage.removeItem(SESSION_KEY);
}
