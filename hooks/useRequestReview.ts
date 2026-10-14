// FutStar — Hook useRequestReview
// Solicita avaliação na Play Store com cooldown de 30 dias

import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_REVIEW_KEY = '@futstar_last_review_request';
const COOLDOWN_DAYS = 30;

export function useRequestReview() {
  const requestReview = async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) return;
      const last = await AsyncStorage.getItem(LAST_REVIEW_KEY);
      if (last) {
        const days = (Date.now() - parseInt(last)) / 86400000;
        if (days < COOLDOWN_DAYS) return;
      }
      await StoreReview.requestReview();
      await AsyncStorage.setItem(LAST_REVIEW_KEY, Date.now().toString());
    } catch {}
  };
  return { requestReview };
}
