// FutStar — Dados de Sono
// Protocolo de sono para jovens atletas

export interface SleepPhase {
  label: string;
  color: string;
  phoneOff: string;
  sleepTime: string;
  description: string;
}

export interface SleepRoutineStep {
  time: string;
  action: string;
  icon: string;
}

export const SLEEP_PHASES: SleepPhase[] = [
  {
    label: 'Sem. 1-2',
    color: '#4ade80',
    phoneOff: '22h30',
    sleepTime: '23h00',
    description: 'Começa suave. Celular no carregador fora do quarto às 22h30.',
  },
  {
    label: 'Sem. 3-4',
    color: '#60a5fa',
    phoneOff: '22h00',
    sleepTime: '22h30',
    description: 'Avança 30 min. Celular fora do quarto às 22h.',
  },
  {
    label: 'Sem. 5-6',
    color: '#fb923c',
    phoneOff: '21h30',
    sleepTime: '22h00',
    description: 'Meta intermediária. Celular fora do quarto às 21h30.',
  },
  {
    label: 'Sem. 7-8',
    color: '#f43f5e',
    phoneOff: '21h00',
    sleepTime: '21h30',
    description: 'Meta final. Dorme às 21h30 e acorda às 7h = 9h30 de sono.',
  },
];

export const SLEEP_ROUTINE: SleepRoutineStep[] = [
  { time: '21h00', action: 'Para no celular — coloca pra carregar FORA do quarto', icon: '📵' },
  { time: '21h00-21h30', action: 'Banho quente (ajuda o corpo a relaxar) + escovação', icon: '🚿' },
  { time: '21h30', action: 'Deita no quarto. Pode ouvir música calma ou ler algo', icon: '📖' },
  { time: '22h00', action: 'Apaga a luz e fecha os olhos (nas sem. 1-2 pode ser 22h30)', icon: '🌙' },
  { time: '7h00', action: 'Acorda descansado — treino e foco muito melhores', icon: '☀️' },
];

export const SLEEP_FACTS: string[] = [
  'Hormônio do crescimento é liberado no sono profundo — ele cresce dormindo, não treinando',
  'Tempo de reação em campo melhora 10-15% com 1h a mais de sono',
  'Músculos se recuperam e ficam mais fortes durante a noite, não durante o treino',
  'Foco e tomada de decisão dependem diretamente do sono — quem dorme mal joga mal',
];
