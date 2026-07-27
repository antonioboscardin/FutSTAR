// FutStar — Tags de categorias de exercícios
// Tags de exercícios para categorização visual

export type TagKey = 'aq' | 'tec' | 'pe' | 'rec' | 'fis' | 'cab' | 'fin' | 'esc' | 'desc';

export interface Tag {
  key: TagKey;
  label: string;
  bgPro: string;    // Background no tema PRO
  bgKids: string;   // Background no tema KIDS
  color: string;     // Cor do texto/ícone
  icon: string;      // Emoji
}

export const TAGS: Record<TagKey, Tag> = {
  aq: {
    key: 'aq',
    label: 'Aquecimento',
    bgPro: '#1a140a',
    bgKids: '#FFF8E1',
    color: '#fbbf24',
    icon: '🔥',
  },
  tec: {
    key: 'tec',
    label: 'Técnica',
    bgPro: '#052e16',
    bgKids: '#E8F5E9',
    color: '#4ade80',
    icon: '⚽',
  },
  pe: {
    key: 'pe',
    label: 'Pé Esquerdo',
    bgPro: '#1e1b4b',
    bgKids: '#EDE7F6',
    color: '#a78bfa',
    icon: '🦶',
  },
  rec: {
    key: 'rec',
    label: '1º Toque',
    bgPro: '#0c2a3a',
    bgKids: '#E3F2FD',
    color: '#38bdf8',
    icon: '🎯',
  },
  fis: {
    key: 'fis',
    label: 'Físico',
    bgPro: '#431407',
    bgKids: '#FFF3E0',
    color: '#fb923c',
    icon: '💪',
  },
  cab: {
    key: 'cab',
    label: 'Cabeçada',
    bgPro: '#2a1505',
    bgKids: '#FFF3E0',
    color: '#fdba74',
    icon: '🗣️',
  },
  fin: {
    key: 'fin',
    label: 'Finalização',
    bgPro: '#3b0014',
    bgKids: '#FCE4EC',
    color: '#fb7185',
    icon: '🥅',
  },
  esc: {
    key: 'esc',
    label: 'Escolinha',
    bgPro: '#052e20',
    bgKids: '#E0F2F1',
    color: '#34d399',
    icon: '🟢',
  },
  desc: {
    key: 'desc',
    label: 'Descanso',
    bgPro: '#0f172a',
    bgKids: '#F5F5F5',
    color: '#94a3b8',
    icon: '😴',
  },
};
