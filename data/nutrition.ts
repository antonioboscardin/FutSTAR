// FutStar — Dados de Nutrição
// Guia nutricional para jovens atletas

export interface NutritionBlock {
  title: string;
  color: string;
  icon: string;
  recommended: string[];
  avoid: string[];
}

export const NUTRITION_BLOCKS: NutritionBlock[] = [
  {
    title: 'Antes do Treino (1-2h antes)',
    color: '#4ade80',
    icon: '⚡',
    recommended: [
      'Arroz + ovo mexido',
      'Pão + banana + suco natural',
      'Fruta + iogurte + aveia',
    ],
    avoid: [
      'Frito e gorduroso',
      'Refrigerante',
      'Comida pesada',
    ],
  },
  {
    title: 'Durante o Treino',
    color: '#60a5fa',
    icon: '💧',
    recommended: [
      'Água a cada 15-20 min',
      'Se passar de 1h: água de coco também ajuda',
    ],
    avoid: [
      'Energético (prejudica o crescimento)',
      'Refrigerante',
      'Suco industrializado',
    ],
  },
  {
    title: 'Após o Treino (até 30 min depois)',
    color: '#fb923c',
    icon: '💪',
    recommended: [
      'Ovo + fruta',
      'Iogurte natural + banana',
      'Frango + arroz (no almoço ou jantar)',
    ],
    avoid: [
      'Ficar sem comer — pior erro possível',
      'Ultra-processados logo após o treino',
    ],
  },
  {
    title: 'Todo Dia',
    color: '#c084fc',
    icon: '📅',
    recommended: [
      '6 a 8 copos de água por dia',
      'Frutas e verduras em pelo menos 2 refeições',
      'Café da manhã sempre — nunca sai de casa sem comer',
    ],
    avoid: [
      'Pular refeições',
      'Excesso de salgadinho e doce diário',
    ],
  },
];

export const NUTRITION_GOLDEN_RULE =
  'Com 13-16 anos o corpo ainda está crescendo. Comida de verdade (arroz, feijão, ovo, fruta, frango) supera qualquer suplemento.';
