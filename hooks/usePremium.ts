// FutStar — Hook usePremium
// Provê status premium reativo para componentes React

import { useState, useEffect, useCallback } from 'react';
import {
  checkPremiumStatus,
  getIsPremium,
  purchasePlan,
  restorePurchases,
  setPremiumOverride,
  type PurchaseResult,
} from '../services/premium';

export interface UsePremiumReturn {
  isPremium: boolean;
  isLoading: boolean;
  purchase: (planId: string) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  toggleDevOverride: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePremium(): UsePremiumReturn {
  const [isPremium, setIsPremium] = useState<boolean>(getIsPremium());
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await checkPremiumStatus();
      setIsPremium(status);
    } catch {
      setIsPremium(getIsPremium());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const purchase = useCallback(async (planId: string): Promise<PurchaseResult> => {
    const result = await purchasePlan(planId);
    if (result.success) {
      setIsPremium(true);
    }
    return result;
  }, []);

  const restore = useCallback(async (): Promise<PurchaseResult> => {
    const result = await restorePurchases();
    setIsPremium(getIsPremium());
    return result;
  }, []);

  const toggleDevOverride = useCallback(async () => {
    const newValue = !isPremium;
    await setPremiumOverride(newValue);
    setIsPremium(newValue);
  }, [isPremium]);

  return {
    isPremium,
    isLoading,
    purchase,
    restore,
    toggleDevOverride,
    refresh,
  };
}
