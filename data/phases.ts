// FutStar — Dados de Treino: 4 Fases completas
// Dados de Treino: 4 Fases completas para jogadores de 8-17 anos
import { TagKey } from '../constants/tags';

export interface Exercise {
  name: string;
  duration: string;
  sets: string | null;
  tag: TagKey;
  description: string;
  tip: string | null;
}

export interface TrainingDay {
  shortName: string;
  label: string;
  icon: string;
  type: 'treino' | 'descanso' | 'escolinha';
  focus: string;
  duration: string;
  color: string;
  needsPartner: boolean;
  exercises: Exercise[];
}

export interface Phase {
  id: number;
  label: string;
  subtitle: string;
  color: string;
  description: string;
  days: TrainingDay[];
}

function ex(
  name: string,
  duration: string,
  sets: string | null,
  tag: TagKey,
  description: string,
  tip: string | null
): Exercise {
  return { name, duration, sets, tag, description, tip };
}

// Dias que contam para progresso (SEG=0, QUI=3, SAB=5)
export const TRAINING_DAY_INDICES = [0, 3, 5];

export const PHASES: Phase[] = [
  // ============================================================
  // FASE 1: Sem. 1-2 — Base
  // ============================================================
  {
    id: 0,
    label: 'Sem. 1-2',
    subtitle: 'Base',
    color: '#4ade80',
    description:
      'Aprende os movimentos com qualidade. Sem pressa — executa certo antes de rápido.',
    days: [
      {
        shortName: 'SEG',
        label: 'Segunda',
        icon: '⚽',
        type: 'treino',
        focus: 'Técnica + Pé Esquerdo + Recepção',
        duration: '40 min',
        color: '#4ade80',
        needsPartner: false,
        exercises: [
          ex('Aquecimento', '5 min', null, 'aq', 'Corrida leve 2 min + rotação de tornozelos, joelhos e quadril. 15 polichinelos.', null),
          ex('Toque Alternado com os Dois Pés', '6 min', '3 x 2 min', 'tec', 'Toca a bola na parede alternando pé direito e esquerdo. Ritmo tranquilo — foco no controle.', 'Joelhos levemente dobrados, corpo equilibrado. Olha pra frente'),
          ex('Condução só Pé Esquerdo', '8 min', '4 x 2 min', 'pe', '5 cones em linha reta com 2m de espaço. Conduz APENAS com o pé esquerdo em vai-e-vem. Depois faz o zigue-zague.', 'Vai devagar no começo. Toque curto e controlado'),
          ex('Primeiro Toque — Recepção no Peito', '8 min', '3 x 8 rep', 'rec', 'SEM PARCEIRO: encosta a bola na parede e recebe no peito amortecendo. COM PARCEIRO: ele joga na altura do peito, você recebe e domina no chão.', 'Peitoral levemente recuado no contato para absorver a bola'),
          ex('Finalização Pé Esquerdo', '8 min', '15 chutes', 'fin', 'Alvo improvisado a 3m. Chuta só com o pé esquerdo. Acertou 5 seguidos? Afasta 50cm.', 'Contato no peito do pé esquerdo. Pé de apoio ao lado da bola'),
          ex('Resfriamento', '5 min', null, 'aq', 'Caminhada leve 2 min + alongamento: panturrilha, posterior de coxa e quadríceps (20s cada).', null),
        ],
      },
      {
        shortName: 'TER',
        label: 'Terça',
        icon: '😴',
        type: 'descanso',
        focus: 'Descanso Ativo',
        duration: '-',
        color: '#94a3b8',
        needsPartner: false,
        exercises: [
          ex('Descanso Ativo', '-', null, 'desc', 'Sem treino pesado. Se quiser, 10 min de toque leve com a bola.', 'Assiste jogos e analisa movimentos de pontas e centroavantes'),
        ],
      },
      {
        shortName: 'QUA',
        label: 'Quarta',
        icon: '🟢',
        type: 'escolinha',
        focus: 'Escolinha',
        duration: '90 min',
        color: '#34d399',
        needsPartner: false,
        exercises: [
          ex('Treino na Escolinha', '90 min', null, 'esc', 'Foca 100% no treinador. Ouve as instruções, faz perguntas e dá o máximo em campo.', 'Dorme cedo na terça — chega descansado pro treino'),
        ],
      },
      {
        shortName: 'QUI',
        label: 'Quinta',
        icon: '💪',
        type: 'treino',
        focus: 'Físico + Agilidade + Cabeçada',
        duration: '40 min',
        color: '#fb923c',
        needsPartner: true,
        exercises: [
          ex('Aquecimento', '5 min', null, 'aq', 'Skipping no lugar 1 min + 10 agachamentos leves + mobilidade de quadril. 2 rounds.', null),
          ex('Sprint entre Cones', '10 min', '6 sprints', 'fis', '4 cones em linha com 5m entre cada (15m total). Arranca em velocidade máxima. Trota de volta, descansa 30s.', 'Os primeiros 3 passos são os mais importantes — explode na saída!'),
          ex('Slalom com Bola', '8 min', '5 séries', 'fis', 'Cones em zigue-zague com 1m de espaço. Conduz a bola passando por todos. Cronometra.', 'Toque curto perto do pé e mais rápido'),
          ex('Saltos Explosivos', '8 min', '2 x 8 rep cada', 'fis', '(1) Salto em comprimento. (2) Agachamento + salto — agacha fundo e explode pra cima.', 'Aterrissa com os joelhos levemente dobrados'),
          ex('Cabeçada Básica Parado', '5 min', '10 rep', 'cab', 'COM PARCEIRO: ele joga na altura da testa. Você cabeceia de volta. SEM PARCEIRO: joga pra cima e cabeceia.', 'Olhos abertos até o contato. Contato NA TESTA'),
          ex('Resfriamento', '4 min', null, 'aq', 'Corrida leve 1 min + alongamento focado em coxas, panturrilhas e pescoço.', null),
        ],
      },
      {
        shortName: 'SEX',
        label: 'Sexta',
        icon: '🟢',
        type: 'escolinha',
        focus: 'Escolinha',
        duration: '90 min',
        color: '#34d399',
        needsPartner: false,
        exercises: [
          ex('Treino na Escolinha', '90 min', null, 'esc', 'Foca 100% no treinador. Tenta usar o pé esquerdo mais — mesmo errando, continua.', 'Depois do treino: come dentro de 30 min e hidrata bem'),
        ],
      },
      {
        shortName: 'SÁB',
        label: 'Sábado',
        icon: '🔥',
        type: 'treino',
        focus: 'Sessão Completa',
        duration: '50 min',
        color: '#f43f5e',
        needsPartner: true,
        exercises: [
          ex('Aquecimento Completo', '8 min', null, 'aq', 'Corrida pelo quintal 2 min + mobilidade articular completa + 30 toques alternados de bola.', null),
          ex('Pedalada + Corte', '8 min', '2 x 8 cada lado', 'tec', '2 cones com 1m de espaço. Faz a pedalada e corta pro lado. Alterna direita e esquerda.', 'Movimento convicto — corpo pra um lado, bola pro outro'),
          ex('Recepção + Giro (com parceiro)', '8 min', '3 x 8 rep', 'rec', 'Parceiro lança a bola. Você recebe de costas, domina com 1 toque e gira pra um lado. Alterna o lado.', 'Esse é o movimento do centroavante de costas pro gol!'),
          ex('Jogada Completa de Ponta', '10 min', '8 rep', 'fin', 'Conduz pelos cones, 1 drible, finaliza no alvo. 4 chegadas pela direita + 4 pela esquerda.', 'Não pensa demais — em jogo real não tem tempo pra hesitar'),
          ex('Circuito de Finalização', '10 min', '15 chutes (8+7)', 'fin', 'Finaliza no alvo alternando pés. Começa de 4m de distância.', 'Anota os acertos com o pé esquerdo'),
          ex('Resfriamento', '6 min', null, 'aq', 'Alongamento completo + respiração + hidratação.', null),
        ],
      },
      {
        shortName: 'DOM',
        label: 'Domingo',
        icon: '😴',
        type: 'descanso',
        focus: 'Descanso Total',
        duration: '-',
        color: '#60a5fa',
        needsPartner: false,
        exercises: [
          ex('Descanso Obrigatório', '-', null, 'desc', 'Corpo evolui no descanso. Sem treino — assiste jogos analisando os pontas favoritos.', 'Vini Jr., Neymar, Mbappé, Salah — observa os movimentos SEM bola'),
        ],
      },
    ],
  },

  // ============================================================
  // FASE 2: Sem. 3-4 — Desenvolvimento
  // ============================================================
  {
    id: 1,
    label: 'Sem. 3-4',
    subtitle: 'Desenvolv.',
    color: '#60a5fa',
    description:
      'Os movimentos básicos já estão no corpo. Aumenta o volume e começa a ganhar velocidade.',
    days: [
      {
        shortName: 'SEG',
        label: 'Segunda',
        icon: '⚽',
        type: 'treino',
        focus: 'Técnica + Pé Esquerdo + Recepção',
        duration: '45 min',
        color: '#60a5fa',
        needsPartner: false,
        exercises: [
          ex('Aquecimento', '5 min', null, 'aq', 'Corrida leve 2 min + mobilidade dinâmica + 20 polichinelos + 10 agachamentos.', null),
          ex('Toque Alternado — Ritmo Crescente', '8 min', '4 x 2 min', 'tec', '1ª série: devagar. 2ª: médio. 3ª e 4ª: o mais rápido sem perder o controle.', 'Se a bola escapar, pega e volta'),
          ex('Condução Pé Esquerdo — Slalom', '10 min', '5 x 2 min', 'pe', 'Agora faz o slalom em zigue-zague além da linha reta. 5 cones a 1,5m. Reduz o tempo a cada série.', 'Mantém a bola perto do pé'),
          ex('Primeiro Toque com Variação de Altura', '10 min', '4 x 10 rep', 'rec', 'COM PARCEIRO: ele lança de 3 alturas — joelho, peito e acima da cabeça. SEM PARCEIRO: lança na parede com força variada.', 'Cada altura pede uma parte diferente do corpo'),
          ex('Finalização Pé Esquerdo — Mais Distante', '8 min', '20 chutes', 'fin', 'Alvo a 4-5m. Acertou 5 seguidos? Recua mais. Anota o melhor resultado.', 'Foca no balanço da perna antes de pensar na força'),
          ex('Resfriamento', '4 min', null, 'aq', 'Caminhada + alongamento estático.', null),
        ],
      },
      {
        shortName: 'TER',
        label: 'Terça',
        icon: '😴',
        type: 'descanso',
        focus: 'Descanso Ativo',
        duration: '-',
        color: '#94a3b8',
        needsPartner: false,
        exercises: [
          ex('Descanso Ativo', '-', null, 'desc', 'Leve. Se quiser, 10 min de toque ou condução com o pé esquerdo.', null),
        ],
      },
      {
        shortName: 'QUA',
        label: 'Quarta',
        icon: '🟢',
        type: 'escolinha',
        focus: 'Escolinha',
        duration: '90 min',
        color: '#34d399',
        needsPartner: false,
        exercises: [
          ex('Treino na Escolinha', '90 min', null, 'esc', 'Com 2 semanas de treino em casa, já deve sentir diferença! Aplica o pé esquerdo mais em campo.', 'Tenta usar o pé esquerdo sempre que der'),
        ],
      },
      {
        shortName: 'QUI',
        label: 'Quinta',
        icon: '💪',
        type: 'treino',
        focus: 'Físico + Cabeçada em Movimento',
        duration: '45 min',
        color: '#60a5fa',
        needsPartner: true,
        exercises: [
          ex('Aquecimento', '5 min', null, 'aq', 'Skipping 1 min + 15 agachamentos + mobilidade de quadril. 3 rounds.', null),
          ex('Sprint + Mudança de Direção', '12 min', '8 sprints', 'fis', 'No cone do meio muda de direção — vai até ele, toca com o pé e volta.', 'Agacha um pouco na mudança — dá mais explosão na saída'),
          ex('Slalom Cronometrado', '10 min', '6 séries', 'fis', 'Zigue-zague nos cones. Cronometra cada série. Tenta bater o tempo anterior.', 'Anota o melhor tempo da semana 3 pra comparar com a 4'),
          ex('Saltos Explosivos', '8 min', '3 x 8 rep cada', 'fis', 'Os mesmos 2 tipos + salto com 1 perna alternando. 3 séries de cada.', null),
          ex('Cabeçada em Deslocamento', '6 min', '12 rep', 'cab', 'COM PARCEIRO: caminha, ele lança na testa e você cabeceia em movimento. SEM PARCEIRO: caminha 3 passos, joga pra cima e cabeceia.', 'O deslocamento da corrida já dá força'),
          ex('Resfriamento', '4 min', null, 'aq', 'Corrida leve + alongamento completo + pescoço.', null),
        ],
      },
      {
        shortName: 'SEX',
        label: 'Sexta',
        icon: '🟢',
        type: 'escolinha',
        focus: 'Escolinha',
        duration: '90 min',
        color: '#34d399',
        needsPartner: false,
        exercises: [
          ex('Treino na Escolinha', '90 min', null, 'esc', 'Aplica tudo que está treinando em casa. O corpo já está mais forte.', 'Depois do treino: come bem dentro de 30 min'),
        ],
      },
      {
        shortName: 'SÁB',
        label: 'Sábado',
        icon: '🔥',
        type: 'treino',
        focus: 'Sessão Completa',
        duration: '55 min',
        color: '#f43f5e',
        needsPartner: true,
        exercises: [
          ex('Aquecimento Completo', '8 min', null, 'aq', 'Corrida + mobilidade + 40 toques alternados de bola.', null),
          ex('Pedalada + Corte + Arrancada', '10 min', '3 x 8 cada lado', 'tec', 'Depois do corte, arranca em velocidade máxima por 5m antes de parar.', 'A arrancada pós-drible é onde o jogo é decidido'),
          ex('Elástico Básico', '8 min', '2 x 8 rep', 'tec', 'Passa a bola por trás da perna de apoio e sai pelo outro lado. Devagar primeiro.', 'Corpo inclinado pra um lado e bola pro outro'),
          ex('Recepção de Costas + Giro + Finalização', '10 min', '4 x 8 rep', 'rec', 'COM PARCEIRO: recebe de costas, gira e finaliza no alvo. Alternando qual lado você gira.', 'Domina antes de girar'),
          ex('Circuito de Finalização', '12 min', '20 chutes (10+10)', 'fin', '10 chutes com pé direito + 10 com pé esquerdo. Anota os acertos.', null),
          ex('Resfriamento', '7 min', null, 'aq', 'Alongamento completo + hidratação.', null),
        ],
      },
      {
        shortName: 'DOM',
        label: 'Domingo',
        icon: '😴',
        type: 'descanso',
        focus: 'Descanso Total',
        duration: '-',
        color: '#60a5fa',
        needsPartner: false,
        exercises: [
          ex('Descanso Obrigatório', '-', null, 'desc', 'Descanso total. Corpo vai estar mais exigido — respeita o descanso.', 'Assiste um jogo e anota 3 movimentos que quer aprender'),
        ],
      },
    ],
  },

  // ============================================================
  // FASE 3: Sem. 5-6 — Intensidade
  // ============================================================
  {
    id: 2,
    label: 'Sem. 5-6',
    subtitle: 'Intensidade',
    color: '#fb923c',
    description:
      'Os movimentos já estão no corpo. Agora é intensidade, velocidade e encadear tudo junto.',
    days: [
      {
        shortName: 'SEG',
        label: 'Segunda',
        icon: '⚽',
        type: 'treino',
        focus: 'Técnica + Pé Esquerdo + Sequência',
        duration: '50 min',
        color: '#fb923c',
        needsPartner: false,
        exercises: [
          ex('Aquecimento', '5 min', null, 'aq', 'Corrida 2 min + mobilidade + 20 polichinelos + 15 agachamentos.', null),
          ex('Toque Alternado — Ritmo Alto', '12 min', '4 x 3 min', 'tec', 'Toque alternado na parede no ritmo mais alto possível. 30s de intervalo entre as séries.', 'Se a bola escapar, pega e volta'),
          ex('Condução Pé Esquerdo com Obstáculo', '12 min', '6 x 2 min', 'pe', 'Coloca um cone obstáculo no meio do percurso — passa ao redor sem perder a bola. Depois coloca 2 obstáculos.', 'Testa o pé esquerdo em situações mais difíceis'),
          ex('Sequência: Recepção + Virada + Finalização', '12 min', '4 x 10 rep', 'rec', 'Recebe com 1 toque, vira rapidamente e finaliza no alvo. 5 rep com giro pra direita, 5 pra esquerda.', 'O primeiro toque define tudo na sequência'),
          ex('Finalização Pé Esquerdo de Distância', '6 min', '20 chutes', 'fin', 'De 5 a 7m de distância. Alvo menor. Foca em precisão antes de força.', null),
          ex('Resfriamento', '3 min', null, 'aq', 'Alongamento rápido mas completo.', null),
        ],
      },
      {
        shortName: 'TER',
        label: 'Terça',
        icon: '😴',
        type: 'descanso',
        focus: 'Descanso Ativo',
        duration: '-',
        color: '#94a3b8',
        needsPartner: false,
        exercises: [
          ex('Descanso Ativo', '-', null, 'desc', 'Recuperação muscular importante nessa fase intensa. No máximo 10 min de toque leve.', null),
        ],
      },
      {
        shortName: 'QUA',
        label: 'Quarta',
        icon: '🟢',
        type: 'escolinha',
        focus: 'Escolinha',
        duration: '90 min',
        color: '#34d399',
        needsPartner: false,
        exercises: [
          ex('Treino na Escolinha', '90 min', null, 'esc', 'Com 4 semanas de treino em casa, o corpo já está condicionado. Aplica tudo com confiança.', 'Pede feedback pro treinador'),
        ],
      },
      {
        shortName: 'QUI',
        label: 'Quinta',
        icon: '💪',
        type: 'treino',
        focus: 'Físico Intenso + Cabeçada em Salto',
        duration: '50 min',
        color: '#fb923c',
        needsPartner: true,
        exercises: [
          ex('Aquecimento', '5 min', null, 'aq', 'Skipping 1 min + agachamento 15 rep + mobilidade completa. 3 rounds rápidos.', null),
          ex('Sprint com Distâncias Variadas', '15 min', '10 sprints', 'fis', 'Alterna: 2 sprints de 15m + 2 de 20m + 2 de 10m com mudança de direção.', 'Arrancada máxima em todos'),
          ex('Circuito: Slalom + Salto + Sprint', '12 min', '5 séries', 'fis', 'Em sequência sem parar: slalom nos cones, salto explosivo, sprint de volta. Descansa 1 min entre séries.', 'Treina o corpo a ser explosivo mesmo cansado'),
          ex('Cabeçada em Salto', '8 min', '10 rep', 'cab', 'COM PARCEIRO: ele lança na altura que obriga a pular. Você salta e cabeceia. SEM PARCEIRO: joga a bola alta, pula e cabeceia.', 'Olhos na bola até o último momento. Pescoço firme'),
          ex('Resfriamento', '5 min', null, 'aq', 'Corrida leve + alongamento completo com foco em coxas e pescoço.', null),
        ],
      },
      {
        shortName: 'SEX',
        label: 'Sexta',
        icon: '🟢',
        type: 'escolinha',
        focus: 'Escolinha',
        duration: '90 min',
        color: '#34d399',
        needsPartner: false,
        exercises: [
          ex('Treino na Escolinha', '90 min', null, 'esc', 'Aplica em campo tudo que está treinando em casa. Corpo mais forte, técnica mais afiada.', 'Pós-treino: come bem dentro de 30 min'),
        ],
      },
      {
        shortName: 'SÁB',
        label: 'Sábado',
        icon: '🔥',
        type: 'treino',
        focus: 'Sessão Completa Intensa',
        duration: '60 min',
        color: '#f43f5e',
        needsPartner: true,
        exercises: [
          ex('Aquecimento Completo', '8 min', null, 'aq', 'Corrida + mobilidade + 50 toques alternados.', null),
          ex('Sequência de Dribles', '12 min', '3 x 10 cada', 'tec', 'Encadeia: pedalada + elástico + corte seco nos cones, sem pausar.', 'Quanto mais fluido, mais difícil pro defensor ler'),
          ex('Recepção + Giro + Finalização Rápida', '12 min', '4 x 10 rep', 'rec', 'Velocidade máxima. Recebe de costas, gira e finaliza em no máximo 2 segundos.', 'Conta: recebe (1), gira (2), chuta (3)'),
          ex('Circuito de Finalização Intenso', '14 min', '25 chutes (12+13)', 'fin', 'Conduz, dribla 2 cones, finaliza. Alterna pés. Aumenta a distância a cada 5 chutes.', null),
          ex('Cabeçada no Alvo com Parceiro', '8 min', '10 rep', 'cab', 'Parceiro lança na altura que exige salto. Você tenta direcionar a cabeçada pro alvo.', 'Torce o pescoço na direção do alvo no momento do contato'),
          ex('Resfriamento', '6 min', null, 'aq', 'Alongamento completo + hidratação + respiração controlada.', null),
        ],
      },
      {
        shortName: 'DOM',
        label: 'Domingo',
        icon: '😴',
        type: 'descanso',
        focus: 'Descanso Total',
        duration: '-',
        color: '#60a5fa',
        needsPartner: false,
        exercises: [
          ex('Descanso Total', '-', null, 'desc', 'Semana pesada — descanso total obrigatório.', 'Assiste jogos, descansa e dorme bem. O crescimento acontece aqui'),
        ],
      },
    ],
  },

  // ============================================================
  // FASE 4: Sem. 7-8 — Desafio
  // ============================================================
  {
    id: 3,
    label: 'Sem. 7-8',
    subtitle: 'Desafio',
    color: '#f43f5e',
    description:
      'Nível mais alto do plano. Execução em velocidade de jogo real. Vai se surpreender com a evolução!',
    days: [
      {
        shortName: 'SEG',
        label: 'Segunda',
        icon: '⚽',
        type: 'treino',
        focus: 'Técnica + Ambidestro + Recepção Avançada',
        duration: '55 min',
        color: '#f43f5e',
        needsPartner: false,
        exercises: [
          ex('Aquecimento', '5 min', null, 'aq', 'Corrida + mobilidade + 30 polichinelos + 20 agachamentos.', null),
          ex('Toque Misto — Desafio de Ritmo', '15 min', '5 x 3 min', 'tec', 'Série 1-2: só pé esquerdo. Série 3-4: alternando. Série 5: o mais rápido possível alternando.', 'Na série 5 empurra os limites — vê quanto melhorou'),
          ex('Condução Pé Esquerdo — Nível Avançado', '12 min', '6 x 3 min', 'pe', 'Slalom + obstáculos + mudança de velocidade (câmera lenta, explosão rápida).', 'O pé esquerdo com 6 semanas de treino diário já deve parecer muito mais natural'),
          ex('Sequência: Recepção + Drible + Finalização', '15 min', '5 x 10 rep', 'rec', 'Recebe com 1 toque, executa 1 drible e finaliza — tudo em velocidade máxima. Alterna direita e esquerda.', 'Esse é o exercício mais próximo do jogo real'),
          ex('Finalização Pé Esquerdo — Teste de Evolução', '6 min', '25 chutes', 'fin', 'De 6-7m, só pé esquerdo, 25 chutes. Anota os acertos e compara com a semana 1.', 'Esse é o momento de ver o quanto o pé esquerdo evoluiu em 2 meses!'),
          ex('Resfriamento', '2 min', null, 'aq', 'Alongamento rápido mas completo.', null),
        ],
      },
      {
        shortName: 'TER',
        label: 'Terça',
        icon: '😴',
        type: 'descanso',
        focus: 'Descanso Ativo',
        duration: '-',
        color: '#94a3b8',
        needsPartner: false,
        exercises: [
          ex('Descanso Ativo', '-', null, 'desc', 'Fase mais intensa — recuperação é fundamental. No máximo 10 min leve.', null),
        ],
      },
      {
        shortName: 'QUA',
        label: 'Quarta',
        icon: '🟢',
        type: 'escolinha',
        focus: 'Escolinha',
        duration: '90 min',
        color: '#34d399',
        needsPartner: false,
        exercises: [
          ex('Treino na Escolinha', '90 min', null, 'esc', 'Com 6 semanas de treino, a diferença em campo já deve ser bem visível. Aplica tudo com confiança máxima.', 'Pede pro treinador um feedback comparando com o início'),
        ],
      },
      {
        shortName: 'QUI',
        label: 'Quinta',
        icon: '💪',
        type: 'treino',
        focus: 'Físico Máximo + Cabeçada Direcionada',
        duration: '55 min',
        color: '#f43f5e',
        needsPartner: true,
        exercises: [
          ex('Aquecimento', '5 min', null, 'aq', 'Skipping + agachamento 20 rep + mobilidade completa. 3 rounds.', null),
          ex('Sprint Máximo + Mudança de Direção', '15 min', '10 sprints', 'fis', 'Sprint de 20m com 2 mudanças de direção. Cronometra. Tenta bater o recorde.', 'Depois disso disputar 90 min vai parecer mais fácil'),
          ex('Circuito Físico Completo', '15 min', '5 séries', 'fis', 'Sem parar: slalom, 3 saltos explosivos, sprint 10m, 10 polichinelos. Descansa 1 min entre séries.', 'Exige coordenação no cansaço — exatamente como nos últimos minutos do jogo'),
          ex('Cabeçada Direcionada com Alvo', '10 min', '15 rep', 'cab', 'COM PARCEIRO: ele lança, você salta e direciona pra alvos diferentes (esq/dir/centro). SEM PARCEIRO: joga pra cima e direciona.', 'Torce o pescoço na direção do alvo no momento do contato'),
          ex('Resfriamento', '5 min', null, 'aq', 'Corrida leve + alongamento completo + pescoço e cervical.', null),
        ],
      },
      {
        shortName: 'SEX',
        label: 'Sexta',
        icon: '🟢',
        type: 'escolinha',
        focus: 'Escolinha',
        duration: '90 min',
        color: '#34d399',
        needsPartner: false,
        exercises: [
          ex('Treino na Escolinha', '90 min', null, 'esc', 'Última sexta do plano de 2 meses. Aplica tudo com máxima confiança e intensidade.', null),
        ],
      },
      {
        shortName: 'SÁB',
        label: 'Sábado',
        icon: '🔥',
        type: 'treino',
        focus: 'Sessão Final — Teste Completo',
        duration: '65 min',
        color: '#f43f5e',
        needsPartner: true,
        exercises: [
          ex('Aquecimento Completo', '10 min', null, 'aq', 'Corrida + mobilidade completa + 50 toques alternados + slalom leve.', null),
          ex('Circuito Técnico Completo', '15 min', 'Livre', 'tec', 'Todos os dribles em sequência: pedalada, elástico, corte seco, arrancada. 15 min sem parar.', '2 meses chegaram aqui. Deixa o corpo fazer o que já aprendeu'),
          ex('Jogada Completa Avançada (com parceiro)', '15 min', '5 x 10 rep', 'rec', 'Parceiro lança, recebe de costas, gira, dribla 1 cone, finaliza. 5 com pé direito + 5 com pé esquerdo.', 'Essa é a sequência mais completa do plano'),
          ex('Grande Circuito de Finalização — Teste Final', '15 min', '30 chutes (15+15)', 'fin', '15 chutes com pé direito + 15 com pé esquerdo, de distâncias crescentes. Anota e compara com a semana 1.', 'Foca no pé esquerdo — a evolução vai aparecer aqui'),
          ex('Cabeçada Simulando Jogo', '5 min', '10 rep', 'cab', 'Parceiro cruza a bola pelo ar, você salta e cabeceia pro alvo. Simula situação real.', null),
          ex('Resfriamento Final', '5 min', null, 'aq', 'Alongamento completo + hidratação. 2 meses de treino concluídos!', null),
        ],
      },
      {
        shortName: 'DOM',
        label: 'Domingo',
        icon: '😴',
        type: 'descanso',
        focus: 'Descanso Total',
        duration: '-',
        color: '#60a5fa',
        needsPartner: false,
        exercises: [
          ex('Descanso Obrigatório', '-', null, 'desc', 'Fim de 2 meses! Descansa totalmente. Na próxima semana reinicia da Fase 1 com uma base muito mais forte.', 'Próximo passo: reinicia a Fase 1 e vê o quanto ficou mais fácil!'),
        ],
      },
    ],
  },
];
