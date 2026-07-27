// AdMob desativado no Expo Go
// Funciona apenas no build de produção (Play Store / App Store)

export const AD_UNIT_IDS = {
  banner: 'test',
  interstitial: 'test',
};

export interface AdsState {
  adsRemoved: boolean;
  trainingsCompleted: number;
}

export async function getAdsState(): Promise<AdsState> {
  return { adsRemoved: false, trainingsCompleted: 0 };
}

export async function markAdsRemoved(): Promise<void> {
  console.log('[Ads] Expo Go - ignorado');
}

export function initAds(): void {
  console.log('[Ads] Expo Go - ignorado');
}

export async function onTrainingCompleted(): Promise<boolean> {
  console.log('[Ads] Expo Go - ignorado');
  return false;
}
