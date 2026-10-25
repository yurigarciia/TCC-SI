# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primário: a diretoria de uma entidade tradicionalista gaúcha (CTG/CPF — ex.: CPF Pia do Sul, CTG
Sentinela da Querência), operando o painel para administrar associados, mensalidades e eventos
sociais (bailes e fandangos). Público majoritariamente com **menor familiaridade digital** — em uma
das entidades parceiras a diretoria é leiga; na outra, espera-se um colaborador contratado e
instruído operando o painel no lugar da diretoria diretamente. A prioridade de UX é clareza e
prevenção de erro, não densidade de informação. Uso previsto inclui tablet (fora da sede), não é
necessário otimizar para celular — o app mobile cobre esse caso para o público associado.

## Product Purpose

Painel administrativo do **Querência ERP (QERP)**: cadastrar/consultar associados, controlar
mensalidades e inadimplência, montar croquis de salão reutilizáveis, publicar eventos, gerenciar
reservas de mesa e emitir/checar ingressos (check-in por QR code). Substitui processos informais
hoje em uso (planilhas, grupo de WhatsApp para cobrança) — deve ser uma evolução assistida desses
processos, não uma ruptura brusca. Sucesso é cobrir os requisitos Must/Should do backlog de forma
navegável ponta a ponta e validada com a diretoria/associados reais via SUS + entrevista/observação.

## Positioning

Produto desenhado para ser reutilizável entre entidades tradicionalistas gaúchas distintas — não sob
medida para uma única — mas **sem ser multi-tenant**: cada entidade roda sua própria
implantação/banco isolados sobre o mesmo código-base. O que é genérico na UI é a marca ("Querência
ERP", nunca o nome de uma entidade específica); o que é configurável por entidade são as categorias
de sócio (N×N) e dados de seed próprios. Os fluxos de maior risco (aprovação de cadastro, confirmação
de pagamento, check-in de ingresso) são **mediados pela entidade** — o sistema não substitui o
julgamento humano da diretoria, refletindo o nível de familiaridade digital heterogêneo do público,
que varia por entidade (não é uma constante assumida).

## Operating Context

- Companion app: um aplicativo mobile (React Native + Expo) para o associado, mesmo backend NestJS —
  consultar/pagar mensalidade, ver reservas, comprar ingresso. O painel web não precisa cobrir esses
  fluxos do ponto de vista do associado, só do ponto de vista da diretoria (aprovar, conferir,
  emitir).
- Check-in de ingresso por QR code: a câmera só liga sob clique explícito ("Ativar câmera") — nunca
  pede permissão sozinha ao abrir a tela; um campo de texto (colar/digitar o código) coexiste sempre
  como fallback, para dispositivo sem câmera, permissão negada ou hardware incompatível. Ao detectar
  um código, o fluxo abre uma tela de conferência (nome, se já foi lido, evento, valor, categoria)
  antes de confirmar — não confirma automaticamente.
- Autenticação: JWT emitido pelo backend, guardado em cookie httpOnly (não localStorage).
- Integrações externas: gateway de pagamento terceirizado (o sistema guarda só status/referência da
  transação, nunca dado de cartão), serviço de notificações (push/e-mail) para lembretes de
  inadimplência.
- Evento de uso real: bailes e fandangos (eventos sociais), com mapa de mesas e emissão de ingresso
  por evento; não cobre outros tipos de evento (ex.: rodeios, provas campeiras).

## Capabilities and Constraints

- Stack travada: Next.js (App Router) + Tailwind CSS + shadcn/ui; React Query (TanStack Query) para
  toda chamada à API (nenhum fetch direto fora de hook de query/mutation); react-hook-form + zod para
  formulários, com erro de validação exibido por campo (não só toast genérico) — ver padrão
  `FormErrorBanner` + mensagens reais de `ApiError` já aplicado nos formulários de cadastro/edição.
  Esse tratamento de erro passou por correção recente (bug de crash silencioso em `.refine()` de
  data) e foi deliberadamente padronizado em todos os formulários de criar/editar do painel.
  Estrutura de pastas por domínio, espelhando os módulos do backend (hexagonal): `associados/`,
  `mensalidades/`, `eventos/`, `reservas/`, `ingressos/`.
- Dark mode está fora de escopo do MVP (não é meta do system design atual).
- Responsivo o suficiente para tablet; não precisa ser otimizado para celular.
- Terminologia preferida no texto/UI: "pessoas idosas", "usuários com menor familiaridade digital",
  "adoção gradual", "fluxos mediados pela entidade", "entidade parceira", "ecossistema digital".
- Associado tem campos de contato separados: `email` e `telefone`, cada um opcional individualmente
  mas com pelo menos um dos dois exigido (campo único "contato" foi descontinuado).
- Não objetivos: integração institucional com CIT/MTG, outros tipos de evento, processamento direto
  de dados sensíveis de pagamento, totem físico de autoatendimento, multi-tenant real (múltiplas
  entidades na mesma implantação/banco simultaneamente).

## Brand Commitments

Nome do produto: **Querência ERP** (abreviado **QERP**) — branding deliberadamente genérico, nunca
acoplado ao nome de uma entidade parceira específica na UI (títulos, placeholders, textos de tela).
Nomes de entidades (CPF Pia do Sul, CTG Sentinela da Querência) são legítimos só em dados de
seed/config por implantação, nunca em copy de produto compartilhada.

## Evidence on Hand

Duas entrevistas com entidades parceiras reais (CPF Pia do Sul, 2026-08-11; CTG Sentinela da
Querência, depois) documentadas em `PROJETO-TCC/entrevista_cpf_pia_do_sul.md` e no corpo do TCC —
fonte dos achados sobre familiaridade digital heterogênea e do enquadramento "reutilizável, não
multi-tenant". Fluxos de negócio mapeados em `TCC-FINAL/arquitetura/fluxos/*.json` (cadastro-associado,
mensalidade, croqui-salao, evento, reserva-mesa, emissao-ingresso, relatorio-inadimplencia,
cancelamento-transferencia-reserva) são a especificação funcional primária — qualquer tela deve ser
validada contra o fluxograma correspondente antes de ser considerada concluída.

## Product Principles

- Clareza e prevenção de erro vêm antes de densidade de informação — o público de referência tem
  menor familiaridade digital, mesmo quando quem efetivamente opera é um colaborador contratado.
- Ações de maior risco (aprovar cadastro, confirmar pagamento, check-in de ingresso) exigem
  confirmação explícita mediada pela entidade — nunca automatismo silencioso.
- Reutilizável entre entidades, nunca multi-tenant: a marca e a UI ficam genéricas; dados e
  configuração (categorias de sócio, seed) ficam isolados por implantação.
- Erro de validação é sempre visível e específico por campo — nunca só um toast genérico sem
  indicação do que falhou.
- Evolução assistida dos processos informais existentes (planilha, WhatsApp), não ruptura brusca.

## Accessibility & Inclusion

Checklist de acessibilidade própria do design system (`DESIGN-SYSTEM.md` §6/§7): alvo mínimo de toque
44×44px, texto legível em zoom 150%, badge semântico sempre acompanhado de texto (nunca só cor),
confirmação explícita para ações destrutivas/irreversíveis. Público de referência inclui pessoas
idosas e usuários com baixa familiaridade digital — testar sempre com essa lente, não só com usuário
técnico.
