# Planejamento — Frontend Web (Painel Administrativo)

> Detalha a frente de frontend web dentro do `PLANEJAMENTO-GERAL.md`. Segue o
> `DESIGN-SYSTEM.md` desta mesma pasta para toda decisão visual.

## 1. Visão Geral

Painel web para a **diretoria** operar o sistema: cadastrar/consultar associados, controlar
mensalidades e inadimplência, montar croquis de salão, publicar eventos, gerenciar reservas de mesa
e emitir/checar ingressos. Público majoritariamente com **menor familiaridade digital** — a
prioridade de UX é clareza e prevenção de erro, não densidade de informação.

## 2. Stack e Convenções Técnicas

- **Next.js** (App Router), **Tailwind CSS**, **shadcn/ui**.
- Estado de servidor/cache: **React Query (TanStack Query)** para toda chamada à API — nenhum
  `fetch` direto em componente sem passar por um hook de query/mutation.
- Formulários: `react-hook-form` + `zod` (validação compartilhável com os DTOs de erro da API).
- Autenticação: JWT emitido pelo backend, guardado em cookie httpOnly (não localStorage, para
  reduzir exposição a XSS); guard de rota no middleware do Next.js.
- Estrutura de pastas por domínio (espelhando os módulos do backend): `associados/`,
  `mensalidades/`, `eventos/`, `reservas/`, cada um com suas rotas, componentes e hooks de query.

## 3. Telas do MVP (mapeadas para os fluxos)

| Tela | Fluxo/Requisito | Prioridade |
|---|---|---|
| Login | RNF02 | Must |
| Lista/Cadastro/Edição de Associado | RF01, RF02, RF03, RF04 | Must |
| Mensalidades — histórico e registro de pagamento | RF05, RF06, RF08 | Must |
| Relatório de Inadimplência | RF07 | Should |
| Editor de Croqui de Salão | RF10 (desdobrado) | Must |
| Cadastro/Publicação de Evento | RF09, RF10 | Must |
| Mapa de Mesas do Evento + Reservas | RF11, RF14, RF15 | Must / Could (RF15) |
| Emissão e Check-in de Ingresso | RF12 | Must |

Cada tela deve ser validada manualmente contra o fluxograma correspondente em
`TCC-FINAL/arquitetura/fluxos/` antes de ser considerada concluída (ver Definition of Done abaixo).

## 4. Definition of Done (frontend web)

- [ ] Tela implementada usando exclusivamente componentes/tokens do `DESIGN-SYSTEM.md`.
- [ ] Todos os caminhos do fluxograma correspondente (inclusive os de erro/recusa) têm
      representação visual — não só o caminho feliz.
- [ ] Estados de carregamento (`skeleton`) e erro (mensagem amigável, sem stack trace) tratados em
      toda chamada de API.
- [ ] Responsivo o suficiente para uso em tablet (a diretoria pode operar fora do computador da
      sede) — não é necessário otimizar para celular, o app mobile cobre esse caso.
- [ ] Validado contra a checklist de acessibilidade do `DESIGN-SYSTEM.md` §7.
- [ ] Testado manualmente em zoom 150%.

## 5. Backlog

Os tickets `T-FE-001` a `T-FE-008` vivem no backlog central (`PLANEJAMENTO-GERAL.md` §7) para manter
um único ponto de rastreamento entre as três frentes. Ordem de implementação recomendada:

1. `T-FE-001` (Design System aplicado) — bloqueia todas as demais.
2. `T-FE-002` (Auth + layout) — bloqueia todas as telas internas.
3. `T-FE-003` (Associados) — módulo mais simples, valida o padrão de CRUD.
4. `T-FE-004` (Mensalidades/Inadimplência).
5. `T-FE-005` (Croqui de Salão) — maior complexidade de UI, reservar tempo extra.
6. `T-FE-006` (Evento) — depende de `T-FE-005` existir para vincular croqui.
7. `T-FE-007` (Mapa de Mesas/Reservas) — depende de `T-FE-006`.
8. `T-FE-008` (Ingressos) — pode ser paralelo a `T-FE-007`.

## 6. Perguntas em Aberto Específicas do Frontend

- O editor de croqui de salão (`T-FE-005`) precisa suportar upload de planta baixa como fundo
  (imagem de referência) ou o posicionamento livre de mesas em uma grade é suficiente para o MVP?
  Não decidido — impacta bastante o esforço da tela.
- ~~O check-in de ingresso por QR code exige suporte a câmera~~ — resolvido em 2026-08-29: leitor
  de QR via câmera do navegador implementado em `/eventos/[id]/ingressos`
  (`src/features/ingressos/qr-code-scanner.tsx`, biblioteca `qr-scanner`). A câmera só liga sob
  clique explícito da diretoria ("Ativar câmera") — nunca pede permissão sozinha ao abrir a tela —
  e o campo de texto (colar/digitar o código) continua funcionando em paralelo como fallback
  sempre disponível, para quando o dispositivo não tiver câmera, a permissão for negada, ou o
  hardware da sede não suportar (mesma decisão de "os dois formatos coexistem" de
  `emissao-ingresso.json`). Verificado sem erros com câmera falsa do Chromium (headless); teste
  ponta a ponta com um QR real só é possível quando o app mobile (T-MOB) existir para gerar o
  código — o scanner decodifica qualquer texto, incluindo o id do ingresso que o backend espera
  em `POST /ingressos/:id/checkin`.
