// FutStar — Serviço Premium (RevenueCat + Fallback)
// Gerencia status de assinatura premium
// Usa RevenueCat em build nativo, AsyncStorage como fallback/mock no Expo Go
//
// ============================================================
// 🔑 CONFIGURAÇÃO DE PRODUÇÃO
// ============================================================
// 1. Crie uma conta em https://app.revenuecat.com
// 2. Configure os produtos no Google Play Console / App Store Connect
// 3. Substitua REVENUECAT_API_KEY pela sua chave real
// 4. Configure os product IDs no dashboard do RevenueCat
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// Constantes — Trocar em produção
// ============================================================

/**
 * 🔑 Chave do RevenueCat via variável de ambiente (.env)
 * Nunca commite a chave real no código-fonte
 */
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY || '';

const PREMIUM_STORAGE_KEY = 'futstar_premium_status';
const PREMIUM_OVERRIDE_KEY = 'futstar_premium_override'; // Para testes __DEV__

// ============================================================
// Planos de assinatura
// ============================================================

export interface PremiumPlan {
  id: string;
  type: 'monthly' | 'annual';
  priceLabel: string;
  pricePerMonth: string;
  savings: string | null;
  popular: boolean;
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'futstar_premium_monthly',
    type: 'monthly',
    priceLabel: 'R$ 9,90/mês',
    pricePerMonth: 'R$ 9,90',
    savings: null,
    popular: false,
  },
  {
    id: 'futstar_premium_annual',
    type: 'annual',
    priceLabel: 'R$ 69,90/ano',
    pricePerMonth: 'R$ 5,82',
    savings: '40%',
    popular: true,
  },
];

// ============================================================
// Premium benefits (para tela de upgrade)
// ============================================================

export const PREMIUM_BENEFITS = [
  { icon: '🚫', labelKey: 'premium_benefit_no_ads' },
  { icon: '📊', labelKey: 'premium_benefit_stats' },
  { icon: '🏆', labelKey: 'premium_benefit_elite' },
  { icon: '⚡', labelKey: 'premium_benefit_support' },
  { icon: '🎯', labelKey: 'premium_benefit_exclusive' },
  { icon: '🔓', labelKey: 'premium_benefit_all_features' },
];

// ============================================================
// Estado interno
// ============================================================

let _isPremium = false;
let _isInitialized = false;
let _revenueCatAvailable = false;

// ============================================================
// Inicialização
// ============================================================

/**
 * Inicializa o serviço premium.
 * Tenta usar RevenueCat; se não disponível (Expo Go), usa fallback.
 */
export async function initPremium(): Promise<void> {
  if (_isInitialized) return;

  // 1. Verificar override de dev (__DEV__)
  try {
    const override = await AsyncStorage.getItem(PREMIUM_OVERRIDE_KEY);
    if (override !== null) {
      _isPremium = override === 'true';
      _isInitialized = true;
      await cachePremiumStatus(_isPremium);
      return;
    }
  } catch {}

  // 2. Tentar inicializar RevenueCat
  try {
    const Purchases = require('react-native-purchases').default;
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    _revenueCatAvailable = true;

    // Verificar status do subscriber
    const customerInfo = await Purchases.getCustomerInfo();
    _isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    await cachePremiumStatus(_isPremium);
  } catch (e) {
    console.log('[Premium] RevenueCat não disponível, usando fallback:', e);
    _revenueCatAvailable = false;
    // Carregar do cache
    _isPremium = await getCachedPremiumStatus();
  }

  _isInitialized = true;
}

// ============================================================
// Status
// ============================================================

/**
 * Retorna se o usuário é premium.
 */
export function getIsPremium(): boolean {
  return _isPremium;
}

/**
 * Verifica o status premium (revalida com RevenueCat se disponível).
 */
export async function checkPremiumStatus(): Promise<boolean> {
  // Verificar override primeiro
  try {
    const override = await AsyncStorage.getItem(PREMIUM_OVERRIDE_KEY);
    if (override !== null) {
      _isPremium = override === 'true';
      return _isPremium;
    }
  } catch {}

  if (_revenueCatAvailable) {
    try {
      const Purchases = require('react-native-purchases').default;
      const customerInfo = await Purchases.getCustomerInfo();
      _isPremium = customerInfo.entitlements.active['premium'] !== undefined;
      await cachePremiumStatus(_isPremium);
    } catch {
      _isPremium = await getCachedPremiumStatus();
    }
  } else {
    _isPremium = await getCachedPremiumStatus();
  }

  return _isPremium;
}

// ============================================================
// Compra e Restauração
// ============================================================

export interface PurchaseResult {
  success: boolean;
  error?: string;
}

/**
 * Inicia a compra de um plano.
 */
export async function purchasePlan(planId: string): Promise<PurchaseResult> {
  if (!_revenueCatAvailable) {
    return {
      success: false,
      error: 'RevenueCat não disponível. Use o build nativo para compras reais.',
    };
  }

  try {
    const Purchases = require('react-native-purchases').default;
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) {
      return { success: false, error: 'Nenhuma oferta disponível.' };
    }

    const pkg = current.availablePackages.find(
      (p: any) => p.identifier === planId || p.product?.identifier === planId
    );
    if (!pkg) {
      return { success: false, error: 'Plano não encontrado.' };
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    _isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    await cachePremiumStatus(_isPremium);

    return { success: _isPremium };
  } catch (e: any) {
    if (e.userCancelled) {
      return { success: false, error: 'cancelled' };
    }
    return { success: false, error: e.message || 'Erro ao processar compra.' };
  }
}

/**
 * Restaura compras anteriores.
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (!_revenueCatAvailable) {
    return {
      success: false,
      error: 'RevenueCat não disponível. Use o build nativo para restaurar.',
    };
  }

  try {
    const Purchases = require('react-native-purchases').default;
    const customerInfo = await Purchases.restorePurchases();
    _isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    await cachePremiumStatus(_isPremium);

    return { success: _isPremium };
  } catch (e: any) {
    return { success: false, error: e.message || 'Erro ao restaurar compras.' };
  }
}

// ============================================================
// Override para testes (__DEV__)
// ============================================================

/**
 * Define override de premium (para testes).
 * Passar null para remover override.
 */
export async function setPremiumOverride(value: boolean | null): Promise<void> {
  if (value === null) {
    await AsyncStorage.removeItem(PREMIUM_OVERRIDE_KEY);
    _isPremium = await getCachedPremiumStatus();
  } else {
    await AsyncStorage.setItem(PREMIUM_OVERRIDE_KEY, value.toString());
    _isPremium = value;
  }
  await cachePremiumStatus(_isPremium);
}

/**
 * Retorna se o RevenueCat está disponível.
 */
export function isRevenueCatAvailable(): boolean {
  return _revenueCatAvailable;
}

// ============================================================
// Cache (AsyncStorage fallback)
// ============================================================

async function cachePremiumStatus(isPremium: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify({
      isPremium,
      updatedAt: new Date().toISOString(),
    }));
  } catch {}
}

async function getCachedPremiumStatus(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return data.isPremium === true;
    }
  } catch {}
  return false;
}
