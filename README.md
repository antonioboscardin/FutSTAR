<p align="center">
  <img src="./assets/images/icon.png" alt="FutSTAR Logo" width="120" height="120" style="border-radius: 24px;" />
</p>

<h1 align="center">⚽ FutSTAR</h1>

<p align="center">
  <strong>Seu app de treino completo para evoluir no futebol</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

---

## 📖 Sobre

**FutSTAR** é um aplicativo mobile de treinamento para jogadores de futebol que querem evoluir de verdade. Com planos de treino personalizados por posição, acompanhamento de progresso, nutrição, sono e ranking — tudo em um só lugar.

## ✨ Funcionalidades

- 🏋️ **Treinos por Posição** — Exercícios específicos para goleiro, zagueiro, lateral, meia e atacante
- 📊 **Progresso & Streak** — Acompanhe sua evolução diária com sistema de sequência (streak)
- 🏆 **Ranking & Conquistas** — Desbloqueie badges e suba no ranking
- 🥗 **Nutrição** — Dicas e planos de alimentação para atletas
- 😴 **Controle de Sono** — Monitore e melhore sua qualidade de sono
- 🎯 **Quiz de Posição** — Descubra qual posição combina mais com você
- 👨‍👩‍👧 **Área dos Pais** — Controle parental integrado
- 🌍 **Internacionalização (i18n)** — Suporte a múltiplos idiomas
- 🔔 **Notificações** — Lembretes para manter a consistência nos treinos
- 🎊 **Animações** — Confetti, animação de gol e micro-interações

## 🛠️ Tech Stack

| Tecnologia | Uso |
|---|---|
| [React Native](https://reactnative.dev/) | Framework mobile |
| [Expo](https://expo.dev/) (SDK 57) | Plataforma de desenvolvimento |
| [Expo Router](https://docs.expo.dev/router/) | Navegação file-based |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | Animações performáticas |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Persistência local |
| [Google Mobile Ads](https://docs.page/invertase/react-native-google-mobile-ads) | Monetização |

## 📁 Estrutura do Projeto

```
FutSTAR/
├── app/                    # Telas (file-based routing)
│   ├── (tabs)/             # Telas com navegação por abas
│   │   ├── treinos.tsx     # Tela de treinos
│   │   ├── progresso.tsx   # Progresso do jogador
│   │   ├── nutricao.tsx    # Dicas de nutrição
│   │   ├── sono.tsx        # Controle de sono
│   │   ├── ranking.tsx     # Ranking e conquistas
│   │   └── perfil.tsx      # Perfil do usuário
│   ├── cadastro.tsx        # Cadastro
│   ├── onboarding.tsx      # Fluxo de boas-vindas
│   ├── quiz-posicao.tsx    # Quiz de posição ideal
│   └── area-pais.tsx       # Área dos pais
├── components/             # Componentes reutilizáveis
├── data/                   # Dados estáticos (exercícios, posições, etc.)
├── store/                  # Estado global (progresso)
├── services/               # Serviços (notificações)
├── i18n/                   # Internacionalização
├── constants/              # Tema e constantes
└── assets/                 # Fontes e imagens
```

## 🚀 Como Rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/go) no celular (para teste rápido)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/FutSTAR.git

# Entre no diretório
cd FutSTAR

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
```

Escaneie o QR Code com o **Expo Go** no celular ou pressione `a` para abrir no emulador Android.

## 📱 Screenshots

> Em breve

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

1. Faça um fork do projeto
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Feito com ❤️ por <strong>Antonio Boscardin</strong>
</p>
