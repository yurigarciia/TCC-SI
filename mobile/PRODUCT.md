# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Primário: o **associado** de uma entidade tradicionalista gaúcha (contraparte do painel web operado
pela diretoria) — inclui **pessoas idosas**. A barra de complexidade de interação deve ser mais baixa
que a do painel web, não mais alta. Usa o app para tarefas simples e recorrentes: consultar situação
de mensalidade, pagar, consultar/fazer reservas, comprar ingresso para bailes e fandangos. Rede
instável é esperada nesse público — estados de carregamento/erro/offline precisam de tratamento
explícito.

## Product Purpose

App do associado do **Querência ERP (QERP)**: autocadastro (fica "Pendente de validação" até a
diretoria aprovar), consulta e pagamento de mensalidade, consulta/criação de reservas, compra de
ingresso para eventos publicados, notificações (lembrete de inadimplência, confirmações). Contraparte
do painel administrativo web — mesma API/backend, mesmas regras de negócio, mas sem nenhum fluxo de
gestão institucional (aprovação, emissão em nome de terceiros, etc. ficam só no painel).

## Positioning

Mesmo posicionamento do ecossistema Querência ERP: produto reutilizável entre entidades
tradicionalistas distintas (cada uma com sua própria implantação/banco, não multi-tenant), nunca
acoplado ao nome de uma entidade específica na UI. O app é deliberadamente mais simples que o painel
web — fluxos mediados pela entidade continuam existindo (ex.: aprovação de cadastro), o app só expõe
o lado "autoatendimento" dos mesmos fluxos, nunca substitui o julgamento da diretoria.

## Operating Context

- Companion do painel web administrativo (Next.js), mesmo backend NestJS — a diretoria opera
  aprovações/emissões no painel; o associado opera consulta/pagamento/compra aqui.
- Autocadastro público entra como "Pendente de validação" até a diretoria aprovar — mesmos campos
  pessoais/endereço do formulário de cadastro mediado do painel, sem categoria/vínculo institucional
  (isso é preenchido pela diretoria na aprovação).
- Contato do associado é separado em dois campos independentes, `email` e `telefone` (não existe
  mais um campo único "contato"); no autocadastro, o e-mail de contato reaproveita o e-mail de login,
  só `telefone` é pedido como campo adicional.
- Tela de detalhe de evento foi redesenhada (título em destaque, badges de data/local, descrição em
  card, CTA de compra de ingresso, mapa de mesas) — ponto de referência de qualidade visual esperado
  para outras telas do app, não só um ajuste pontual.
- Tela de login tem logo centrada + texto de boas-vindas (nome do produto + frase curta) — evitar
  reintroduzir banner/gradiente no topo, foi removido deliberadamente.
- Notificações push via `expo-notifications` (lembrete de inadimplência, confirmações); gateway de
  pagamento terceirizado para mensalidade/ingresso (sem armazenar dado de cartão).

## Capabilities and Constraints

- Stack travada: **React Native + Expo** (managed workflow), compatível com Android e iOS;
  `expo-router` (navegação file-based); **React Query** (mesma biblioteca do painel web, para
  reaproveitar padrões de cache/invalidação entre os dois front-ends); autenticação com token em
  `expo-secure-store` (nunca `AsyncStorage` puro, por ser dado sensível); biblioteca de componentes
  **react-native-paper**, com tema customizado em `src/theme/paper-theme.ts`. Distribuição via build
  interno EAS (`@ogarciia/querencia-associados` no EAS / projeto `querencia-associados`).
- Não herda componentes shadcn/ui do painel web (são web-only), mas herda os **tokens de cor e
  princípios** do `frontend-web/DESIGN-SYSTEM.md`: mesma paleta vinho/verde/couro sobre fundo claro,
  mesmo padrão de badge semântico + texto para status, mesmo alvo mínimo de toque 44×44px, mesma
  regra de confirmação explícita para ações destrutivas/irreversíveis.
- Terminologia preferida no texto/UI: "pessoas idosas", "usuários com menor familiaridade digital",
  "adoção gradual", "fluxos mediados pela entidade", "entidade parceira", "ecossistema digital".
- Não objetivos (herdados do produto): integração institucional com CIT/MTG, outros tipos de evento
  além de bailes/fandangos, processamento direto de dado sensível de pagamento, multi-tenant real.

## Brand Commitments

Nome do produto: **Querência ERP** (abreviado **QERP**) — branding genérico, nunca o nome de uma
entidade parceira específica em copy de produto compartilhada (títulos, placeholders, textos de
tela). Nomes de entidade são legítimos só em dados de seed/config por implantação.

## Evidence on Hand

Mesmas duas entrevistas com entidades parceiras do ecossistema (CPF Pia do Sul, CTG Sentinela da
Querência) documentam o perfil de familiaridade digital do associado — varia por entidade, não é uma
constante universal. Fluxos de negócio relevantes ao mobile em `TCC-FINAL/arquitetura/fluxos/*.json`:
`evento.json`, `reserva-mesa.json`, `emissao-ingresso.json`, `mensalidade.json`,
`cadastro-associado.json` (canal associado).

## Product Principles

- Mais simples que o painel web, nunca mais complexo — o público de referência inclui pessoas idosas
  e conectividade instável.
- O app é autoatendimento dos mesmos fluxos mediados pela entidade — nunca contorna a aprovação da
  diretoria para ações de maior risco (cadastro, pagamento confirmado, emissão de ingresso).
- Craft visual consistente: a tela de evento redesenhada é a régua de qualidade (hierarquia clara,
  badges, CTA de destaque) para qualquer tela nova ou retrabalhada.
- Reutilizável entre entidades, marca sempre genérica na UI.
- Estado vazio/carregando/erro tratado explicitamente em toda tela — rede instável é esperada, não
  excepcional.

## Accessibility & Inclusion

Herdado do design system do painel web: alvo mínimo de toque 44×44px, confirmação explícita para
ações destrutivas/irreversíveis, badge semântico sempre com texto (nunca só cor). Testado em pelo
menos um device Android real e um simulador/device iOS — não validar só em um dos dois sistemas
(RNF03). Público de referência inclui pessoas idosas: texto legível, linguagem simples, sem jargão
técnico nas telas do associado.
