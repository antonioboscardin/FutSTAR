// FutStar — Sleep Tracking Service
// Persistência de registros de sono via AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';

const SLEEP_STORAGE_KEY = 'futstar_sleep_records';

export interface SleepRecord {
  id: string;
  date: string;          // YYYY-MM-DD
  bedtime: string;       // HH:MM (24h)
  wakeTime: string;      // HH:MM (24h)
  durationMinutes: number;
  createdAt: string;     // ISO string
}

export interface WeeklySleep {
  records: SleepRecord[];
  averageMinutes: number;
  daysLogged: number;
}

/**
 * Calcula duração em minutos entre bedtime e wakeTime.
 * Suporta dormir depois da meia-noite (ex: 23:00 → 07:00 = 8h).
 */
export function calculateDuration(bedtime: string, wakeTime: string): number {
  const [bH, bM] = bedtime.split(':').map(Number);
  const [wH, wM] = wakeTime.split(':').map(Number);

  let bedMinutes = bH * 60 + bM;
  let wakeMinutes = wH * 60 + wM;

  // Se wakeTime < bedtime, dormiu depois da meia-noite
  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }

  return wakeMinutes - bedMinutes;
}

/**
 * Formata minutos para exibição (ex: 480 → "8h00").
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

/**
 * Retorna uma dica personalizada baseada na duração do sono.
 */
export function getSleepTipKey(durationMinutes: number): string {
  if (durationMinutes >= 540) return 'sono_tip_excellent';  // ≥9h
  if (durationMinutes >= 480) return 'sono_tip_great';      // 8-9h
  if (durationMinutes >= 420) return 'sono_tip_ok';         // 7-8h
  if (durationMinutes >= 360) return 'sono_tip_low';        // 6-7h
  return 'sono_tip_critical';                                // <6h
}

/**
 * Retorna a cor para a barra do gráfico.
 */
export function getSleepBarColor(durationMinutes: number, accentGreen: string, accentYellow: string, accentRed: string): string {
  if (durationMinutes >= 480) return accentGreen;   // ≥8h
  if (durationMinutes >= 360) return accentYellow;  // 6-8h
  return accentRed;                                  // <6h
}

// ---- Persistência ----

async function loadRecords(): Promise<SleepRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(SLEEP_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

async function saveRecords(records: SleepRecord[]): Promise<void> {
  await AsyncStorage.setItem(SLEEP_STORAGE_KEY, JSON.stringify(records));
}

/**
 * Salva um novo registro de sono.
 */
export async function saveSleepRecord(bedtime: string, wakeTime: string): Promise<SleepRecord> {
  const records = await loadRecords();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const duration = calculateDuration(bedtime, wakeTime);

  const record: SleepRecord = {
    id: `${today}_${Date.now()}`,
    date: today,
    bedtime,
    wakeTime,
    durationMinutes: duration,
    createdAt: new Date().toISOString(),
  };

  // Remove registro existente do mesmo dia (substitui)
  const filtered = records.filter(r => r.date !== today);
  filtered.push(record);

  // Manter apenas últimos 90 dias
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const trimmed = filtered.filter(r => r.date >= cutoffStr);

  await saveRecords(trimmed);
  return record;
}

/**
 * Retorna todos os registros de sono.
 */
export async function getSleepRecords(): Promise<SleepRecord[]> {
  return loadRecords();
}

/**
 * Retorna o registro de sono de hoje, se existir.
 */
export async function getTodaySleep(): Promise<SleepRecord | null> {
  const records = await loadRecords();
  const today = new Date().toISOString().split('T')[0];
  return records.find(r => r.date === today) || null;
}

/**
 * Retorna dados de sono dos últimos 7 dias.
 */
export async function getWeeklySleep(): Promise<WeeklySleep> {
  const records = await loadRecords();
  const now = new Date();
  const weekRecords: SleepRecord[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const record = records.find(r => r.date === dateStr);
    if (record) weekRecords.push(record);
  }

  const totalMinutes = weekRecords.reduce((sum, r) => sum + r.durationMinutes, 0);
  const averageMinutes = weekRecords.length > 0
    ? Math.round(totalMinutes / weekRecords.length)
    : 0;

  return {
    records: weekRecords,
    averageMinutes,
    daysLogged: weekRecords.length,
  };
}

/**
 * Remove todos os registros de sono (para reset).
 */
export async function clearSleepRecords(): Promise<void> {
  await AsyncStorage.removeItem(SLEEP_STORAGE_KEY);
}
