// FutStar — Posições e Quiz de Posição

export type PositionKey =
  | 'goleiro'
  | 'lateral_dir'
  | 'lateral_esq'
  | 'zagueiro_dir'
  | 'zagueiro_esq'
  | 'volante'
  | 'meia_armador'
  | 'meia_atacante'
  | 'ponta_dir'
  | 'ponta_esq'
  | 'centroavante';

export interface Position {
  key: PositionKey;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  description: string;
  famousPlayers: string[];
}

export const POSITIONS: Record<PositionKey, Position> = {
  goleiro: {
    key: 'goleiro',
    label: 'Goleiro',
    shortLabel: 'GOL',
    icon: '🧤',
    color: '#fbbf24',
    description: 'Último defensor. Reflexos rápidos, coragem e domínio da área.',
    famousPlayers: ['Alisson', 'Courtois', 'Ederson'],
  },
  lateral_dir: {
    key: 'lateral_dir',
    label: 'Lateral Direito',
    shortLabel: 'LD',
    icon: '🏃',
    color: '#4ade80',
    description: 'Sobe e desce o campo todo. Velocidade, cruzamento e marcação.',
    famousPlayers: ['Cafu', 'Daniel Alves', 'TAA'],
  },
  lateral_esq: {
    key: 'lateral_esq',
    label: 'Lateral Esquerdo',
    shortLabel: 'LE',
    icon: '🏃',
    color: '#4ade80',
    description: 'Faz o corredor esquerdo. Ofensivo, cruza bem e marca com intensidade.',
    famousPlayers: ['Marcelo', 'Roberto Carlos', 'Alba'],
  },
  zagueiro_dir: {
    key: 'zagueiro_dir',
    label: 'Zagueiro Direito',
    shortLabel: 'ZD',
    icon: '🛡️',
    color: '#60a5fa',
    description: 'Robusto e inteligente. Lê o jogo, antecipa jogadas e sai jogando.',
    famousPlayers: ['Thiago Silva', 'Ramos', 'Marquinhos'],
  },
  zagueiro_esq: {
    key: 'zagueiro_esq',
    label: 'Zagueiro Esquerdo',
    shortLabel: 'ZE',
    icon: '🛡️',
    color: '#60a5fa',
    description: 'Forte no duelo e bom com a bola no pé esquerdo.',
    famousPlayers: ['Van Dijk', 'Rúben Dias', 'Araujo'],
  },
  volante: {
    key: 'volante',
    label: 'Volante',
    shortLabel: 'VOL',
    icon: '⚙️',
    color: '#94a3b8',
    description: 'Motor do time. Protege a defesa, distribui o jogo e não para nunca.',
    famousPlayers: ['Casemiro', 'Kanté', 'Busquets'],
  },
  meia_armador: {
    key: 'meia_armador',
    label: 'Meia Armador',
    shortLabel: 'MA',
    icon: '🎩',
    color: '#a78bfa',
    description: 'Cérebro do time. Visão de jogo, passes decisivos e controle de ritmo.',
    famousPlayers: ['De Bruyne', 'Modric', 'Iniesta'],
  },
  meia_atacante: {
    key: 'meia_atacante',
    label: 'Meia Atacante',
    shortLabel: 'MEI',
    icon: '✨',
    color: '#c084fc',
    description: 'Joga entre as linhas. Finaliza, dribla e cria jogadas de gol.',
    famousPlayers: ['Messi', 'Neymar', 'Bellingham'],
  },
  ponta_dir: {
    key: 'ponta_dir',
    label: 'Ponta Direita',
    shortLabel: 'PD',
    icon: '⚡',
    color: '#fb923c',
    description: 'Velocidade pura no 1x1. Dribla, corta pra dentro e finaliza.',
    famousPlayers: ['Salah', 'Raphinha', 'Saka'],
  },
  ponta_esq: {
    key: 'ponta_esq',
    label: 'Ponta Esquerda',
    shortLabel: 'PE',
    icon: '⚡',
    color: '#fb923c',
    description: 'Explosivo na ponta. Arrancadas, dribles e assistências.',
    famousPlayers: ['Vini Jr.', 'Mbappé', 'Son'],
  },
  centroavante: {
    key: 'centroavante',
    label: 'Centroavante',
    shortLabel: 'CA',
    icon: '🎯',
    color: '#f43f5e',
    description: 'Matador de área. Finalização precisa, posicionamento e cabeçada.',
    famousPlayers: ['Haaland', 'Lewandowski', 'Endrick'],
  },
};

// ============================================================
// Quiz de Posição — 5 perguntas
// ============================================================
export interface QuizOption {
  text: string;
  icon: string;
  // Pontos para cada grupo de posição
  scores: Partial<Record<PositionKey, number>>;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'O que você mais gosta no futebol?',
    options: [
      {
        text: 'Defender e proteger o gol',
        icon: '🛡️',
        scores: {
          goleiro: 3,
          zagueiro_dir: 3,
          zagueiro_esq: 3,
          volante: 2,
          lateral_dir: 1,
          lateral_esq: 1,
        },
      },
      {
        text: 'Distribuir o jogo e criar jogadas',
        icon: '🎩',
        scores: {
          meia_armador: 3,
          meia_atacante: 2,
          volante: 2,
          lateral_dir: 1,
          lateral_esq: 1,
        },
      },
      {
        text: 'Finalizar e fazer gols',
        icon: '🥅',
        scores: {
          centroavante: 3,
          ponta_dir: 2,
          ponta_esq: 2,
          meia_atacante: 2,
        },
      },
    ],
  },
  {
    question: 'Como é o seu estilo de jogo?',
    options: [
      {
        text: 'Muito rápido e explosivo',
        icon: '⚡',
        scores: {
          ponta_dir: 3,
          ponta_esq: 3,
          lateral_dir: 2,
          lateral_esq: 2,
          meia_atacante: 1,
        },
      },
      {
        text: 'Forte e resistente',
        icon: '💪',
        scores: {
          zagueiro_dir: 3,
          zagueiro_esq: 3,
          volante: 3,
          centroavante: 2,
          goleiro: 1,
        },
      },
      {
        text: 'Leio bem o jogo e penso rápido',
        icon: '🧠',
        scores: {
          meia_armador: 3,
          volante: 2,
          meia_atacante: 2,
          goleiro: 2,
          zagueiro_dir: 1,
          zagueiro_esq: 1,
        },
      },
    ],
  },
  {
    question: 'Onde você se sente melhor em campo?',
    options: [
      {
        text: 'Perto do meu gol — defendo',
        icon: '🏠',
        scores: {
          goleiro: 3,
          zagueiro_dir: 3,
          zagueiro_esq: 3,
          lateral_dir: 1,
          lateral_esq: 1,
        },
      },
      {
        text: 'No meio — controlo tudo',
        icon: '⚙️',
        scores: {
          volante: 3,
          meia_armador: 3,
          meia_atacante: 2,
          lateral_dir: 1,
          lateral_esq: 1,
        },
      },
      {
        text: 'Perto do gol adversário — ataco',
        icon: '🎯',
        scores: {
          centroavante: 3,
          ponta_dir: 3,
          ponta_esq: 3,
          meia_atacante: 2,
        },
      },
    ],
  },
  {
    question: 'Sua preferência com a bola?',
    options: [
      {
        text: 'Toque no chão e passes',
        icon: '👟',
        scores: {
          meia_armador: 3,
          volante: 2,
          lateral_dir: 2,
          lateral_esq: 2,
          meia_atacante: 1,
        },
      },
      {
        text: 'Bola aérea e cabeçada',
        icon: '🗣️',
        scores: {
          centroavante: 3,
          zagueiro_dir: 3,
          zagueiro_esq: 3,
          goleiro: 2,
        },
      },
      {
        text: 'Driblar e criar no 1x1',
        icon: '✨',
        scores: {
          ponta_dir: 3,
          ponta_esq: 3,
          meia_atacante: 3,
          lateral_dir: 1,
          lateral_esq: 1,
        },
      },
    ],
  },
  {
    question: 'Que tipo de jogador você admira?',
    options: [
      {
        text: 'Goleiros — Alisson, Courtois',
        icon: '🧤',
        scores: { goleiro: 4 },
      },
      {
        text: 'Defensores — Thiago Silva, Van Dijk',
        icon: '🛡️',
        scores: {
          zagueiro_dir: 3,
          zagueiro_esq: 3,
          lateral_dir: 2,
          lateral_esq: 2,
          volante: 1,
        },
      },
      {
        text: 'Meias — De Bruyne, Modric',
        icon: '🎩',
        scores: {
          meia_armador: 3,
          volante: 2,
          meia_atacante: 2,
        },
      },
      {
        text: 'Atacantes — Vini Jr., Haaland, Mbappé',
        icon: '⚡',
        scores: {
          ponta_dir: 3,
          ponta_esq: 3,
          centroavante: 3,
          meia_atacante: 1,
        },
      },
    ],
  },
];

/**
 * Calcula a posição recomendada baseada nas respostas do quiz.
 * @param answers Array de índices das opções selecionadas (um por pergunta)
 * @returns A posição com maior pontuação e a explicação
 */
export function calculatePosition(
  answers: number[]
): { position: PositionKey; reason: string } {
  const scores: Partial<Record<PositionKey, number>> = {};

  answers.forEach((answerIndex, questionIndex) => {
    const question = QUIZ_QUESTIONS[questionIndex];
    if (!question || answerIndex < 0 || answerIndex >= question.options.length) return;
    
    const option = question.options[answerIndex];
    Object.entries(option.scores).forEach(([key, value]) => {
      const posKey = key as PositionKey;
      scores[posKey] = (scores[posKey] || 0) + value;
    });
  });

  // Encontra a posição com maior pontuação
  let bestPosition: PositionKey = 'centroavante';
  let bestScore = 0;

  Object.entries(scores).forEach(([key, value]) => {
    if (value > bestScore) {
      bestScore = value;
      bestPosition = key as PositionKey;
    }
  });

  const pos = POSITIONS[bestPosition];
  const reason = `Suas respostas mostram perfil de ${pos.label}. ${pos.description} Inspiração: ${pos.famousPlayers.join(', ')}.`;

  return { position: bestPosition, reason };
}
