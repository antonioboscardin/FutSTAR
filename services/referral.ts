// FutStar — Serviço de Indicação
// Gerencia código de referência, indicações e recompensa Premium
// Tudo salvo no AsyncStorage (sem backend)

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  myCode: 'futstar_referral_code',
  referrals: 'futstar_referrals',      // pessoas que usaram meu código
  usedCode: 'futstar_used_ref_code',   // código que EU usei ao cadastrar
  rewardClaimed: 'futstar_ref_reward',
};

export interface Referral {
  name: string;
  date: string;           // ISO
  trainingsCompleted: number;
  confirmed: boolean;     // true quando completou >= 3 treinos
}

/**
 * Gera código único: 4 primeiras letras do nome (uppercase) + 4 dígitos aleatórios
 */
export function generateReferralCode(name: string): string {
  const prefix = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove acentos
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, 'X');
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `${prefix}${suffix}`;
}

/**
 * Salva código de referência do usuário (se ainda não tem)
 */
export async function saveReferralCode(name: string): Promise<string> {
  const existing = await AsyncStorage.getItem(KEYS.myCode);
  if (existing) return existing;

  const code = generateReferralCode(name);
  await AsyncStorage.setItem(KEYS.myCode, code);
  return code;
}

/**
 * Retorna o código de referência do usuário
 */
export async function getReferralCode(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.myCode);
}

/**
 * Registra que um novo amigo usou o código ao se cadastrar
 */
export async function registerReferral(referrerCode: string, friendName: string): Promise<void> {
  // Salva qual código o novo usuário usou
  await AsyncStorage.setItem(KEYS.usedCode, referrerCode);

  // Adiciona na lista de indicados do dono do código
  const raw = await AsyncStorage.getItem(KEYS.referrals);
  const referrals: Referral[] = raw ? JSON.parse(raw) : [];

  referrals.push({
    name: friendName,
    date: new Date().toISOString(),
    trainingsCompleted: 0,
    confirmed: false,
  });

  await AsyncStorage.setItem(KEYS.referrals, JSON.stringify(referrals));
}

/**
 * Retorna lista de indicados
 */
export async function getMyReferrals(): Promise<Referral[]> {
  const raw = await AsyncStorage.getItem(KEYS.referrals);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Retorna o código que o usuário usou ao cadastrar (se usou)
 */
export async function getUsedReferralCode(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.usedCode);
}

/**
 * Incrementa treinos completados de um indicado (simulação local)
 * Na prática, sem backend, isso é simulado localmente
 */
export async function incrementReferralTraining(friendName: string): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.referrals);
  const referrals: Referral[] = raw ? JSON.parse(raw) : [];

  const friend = referrals.find(r => r.name === friendName);
  if (friend) {
    friend.trainingsCompleted += 1;
    if (friend.trainingsCompleted >= 3) {
      friend.confirmed = true;
    }
    await AsyncStorage.setItem(KEYS.referrals, JSON.stringify(referrals));
  }
}

/**
 * Verifica se atingiu a meta de 5 indicados confirmados
 */
export async function checkReferralReward(): Promise<{
  total: number;
  confirmed: number;
  rewardEarned: boolean;
  alreadyClaimed: boolean;
}> {
  const referrals = await getMyReferrals();
  const confirmed = referrals.filter(r => r.confirmed).length;
  const alreadyClaimed = (await AsyncStorage.getItem(KEYS.rewardClaimed)) === 'true';
  const rewardEarned = confirmed >= 5;

  return { total: referrals.length, confirmed, rewardEarned, alreadyClaimed };
}

/**
 * Marca a recompensa como resgatada
 */
export async function claimReferralReward(): Promise<void> {
  await AsyncStorage.setItem(KEYS.rewardClaimed, 'true');
}

/**
 * Verifica se um código de indicação é válido (formato correto)
 */
export function isValidReferralCode(code: string): boolean {
  return /^[A-Z]{4}\d{4}$/.test(code.toUpperCase().trim());
}
