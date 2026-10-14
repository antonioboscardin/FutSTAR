// FutStar — Banner de Anúncio (Google AdMob)
// Escondido automaticamente para assinantes premium

import React from 'react';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const AD_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || TestIds.BANNER;

export function AdBanner({ isPremium }: { isPremium: boolean }) {
  if (isPremium) return null;
  return (
    <BannerAd
      unitId={AD_UNIT_ID}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: true }}
    />
  );
}

// Default export para manter compatibilidade com o import existente em _layout.tsx
export default function AdBannerLegacy() {
  return null;
}
