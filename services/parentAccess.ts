// FutStar — Serviço de Área dos Pais
// Gera código de acesso para o pai ver o progresso do filho (read-only)

import AsyncStorage from '@react-native-async-storage/async-storage';

const PARENT_KEY = 'futstar_parent_code';

export interface ParentAccess {
  code: string;
  createdAt: string;
}

function generateCode(): string {
  // Código de 6 dígitos
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function getOrCreateParentCode(): Promise<ParentAccess> {
  try {
    const raw = await AsyncStorage.getItem(PARENT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  const access: ParentAccess = {
    code: generateCode(),
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(PARENT_KEY, JSON.stringify(access));
  return access;
}

export async function regenerateParentCode(): Promise<ParentAccess> {
  const access: ParentAccess = {
    code: generateCode(),
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(PARENT_KEY, JSON.stringify(access));
  return access;
}
