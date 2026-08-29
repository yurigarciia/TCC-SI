# Planejamento — Mobile (App do Associado)

> Detalha a frente de mobile dentro do `PLANEJAMENTO-GERAL.md`.

## 1. Visão Geral

App **React Native + Expo**, compatível com Android e iOS (RNF03), voltado ao **associado** — a
contraparte do painel web operado pela diretoria. Prioriza tarefas simples e recorrentes: consultar
situação de mensalidade, pagar, consultar/fazer reservas, comprar ingresso. Público inclui
**pessoas idosas** — a barra de complexidade de interação deve ser mais baixa que a do painel web,
não mais alta.

## 2. Stack e Convenções Técnicas

- **Expo** (managed workflow) para simplificar build/distribuição durante o MVP (Expo Go em
  desenvolvimento, build interno via EAS para a avaliação com o Pia do Sul).
- Navegação: `expo-router` (file-based, consistente com a convenção de rotas do Next.js no web,
  reduzindo custo de troca de contexto para o único desenvolvedor).
- Estado de servidor: **React Query**, mesma biblioteca do painel web, para reaproveitar padrões de
  cache/invalidação entre os dois frontends.
- Autenticação: JWT emitido pelo mesmo backend; token guardado em `expo-secure-store` (não
  `AsyncStorage` puro, por ser dado sensível).
- Notificações: `expo-notifications` para push (lembrete de inadimplência, confirmações).

## 3. Reaproveitamento do Design System

O app mobile **não** herda diretamente os componentes shadcn/ui (são web-only), mas herda os
**tokens de cor e os princípios** do `frontend-web/DESIGN-SYSTEM.md` (§2 paleta, §6 acessibilidade):
mesma paleta vinho/verde/couro sobre fundo claro, mesmo padrão de badge semântico + texto para
status, mesmo alvo de toque mínimo 44×44px, mesma regra de confirmação explícita para ações
destrutivas/irreversíveis. Biblioteca de componentes recomendada: `react-native-paper` ou
`tamagui`, configurada com os tokens de cor do design system — escolha definitiva fica para o início
da implementação de `T-MOB-001`.

## 4. Telas do MVP (mapeadas para os fluxos)

| Tela | Fluxo/Requisito | Prioridade |
|---|---|---|
| Login / Auto-cadastro | RF01 (canal associado), RNF02 | Must |
| Início — status do associado (situação da mensalidade, avisos) | RF03, RF06 | Must |
| Mensalidade — pagar e ver histórico | RF05, RF06, RF08 | Must |
| Minhas Reservas | RF13 | Must |
| Eventos publicados — reservar mesa / comprar ingresso | RF11, RF12, RF14 | Must |
| Notificações (lembrete, confirmações) | RF07 (lado associado) | Should |

## 5. Definition of Done (mobile)

- [ ] Tela testada em pelo menos um device Android real e um simulador iOS (ou device físico, se
      disponível) — não validar só em um dos dois sistemas.
- [ ] Textos e alvos de toque seguem os mínimos de acessibilidade do design system (§6).
- [ ] Estados de carregamento/erro/offline tratados (rede instável é esperada no público-alvo).
- [ ] Push notification testada de ponta a ponta (backend dispara → device recebe) antes de marcar
      `T-MOB-005` como concluído.
- [ ] Build de avaliação (Expo Go link ou build interno EAS) instalável por um associado do Pia do
      Sul sem passos técnicos (ex.: sem precisar de linha de comando).

## 6. Backlog

Os tickets `T-MOB-001` a `T-MOB-005` vivem no backlog central (`PLANEJAMENTO-GERAL.md` §7). Ordem de
implementação recomendada:

1. `T-MOB-001` (Auth/onboarding) — fundação.
2. `T-MOB-003` (Minhas Reservas) — tela de leitura simples, valida o padrão de consumo da API antes
   de partir para telas com mutação/pagamento.
3. `T-MOB-002` (Mensalidade — pagamento) — primeira tela com gateway de pagamento integrado.
4. `T-MOB-004` (Reserva de mesa / compra de ingresso) — reaproveita a integração de pagamento feita
   em `T-MOB-002`.
5. `T-MOB-005` (Notificações) — pode começar em paralelo assim que o backend expuser o evento de
   mudança de status (depende de `T-BE-006`).

## 7. Perguntas em Aberto Específicas do Mobile

- Distribuição para a avaliação com o Pia do Sul: Expo Go (mais simples, exige o app Expo Go
  instalado) ou build interno via EAS (mais próximo do produto final, mas exige processo de
  instalação)? Decidir perto da fase de avaliação, não bloqueia o desenvolvimento inicial.
- ~~Biblioteca de componentes~~ — resolvido em 2026-08-29: `react-native-paper`, tema customizado
  em `src/theme/paper-theme.ts` com os tokens de cor do `DESIGN-SYSTEM.md`. Ícones via
  `@expo/vector-icons` (fluxo gerenciado do Expo, sem linking nativo manual).
