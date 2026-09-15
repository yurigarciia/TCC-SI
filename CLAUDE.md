# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a LaTeX academic project — a TCC (Trabalho de Conclusão de Curso) for Sistemas de Informação at
Faculdade Antônio Meneghetti (AMF). The document is written in Portuguese (Brazilian).

**Title:** Desenvolvimento e Avaliação de um Ecossistema Digital para Gestão de Associados e Eventos em
Entidades Tradicionalistas Gaúchas
**Author:** Yuri Garcia Baptista
**Orientador:** Prof. Dr. Felipe Becker Nunes
**Case study partners (multiple-case study):** CPF Pia do Sul and CTG Sentinela da Querência, both
Santa Maria/RS (13ª RT)
**System name:** Pampa Gestão

The work proposes and evaluates a digital ecosystem (web admin panel + mobile app for members) for
managing associados, mensalidades, and social events (bailes e fandangos) at Gaúcho traditionalist
entities. As of 2026-09-15, the system is deliberately designed as a reusable product across
traditionalist entities (not coupled to one partner's particularities — e.g. member categories are
configurable N×N, not hard-coded), validated via a two-entity multiple-case study rather than a
single-entity case study. This is NOT multi-tenancy: each partner entity runs its own isolated
deployment/database on the same codebase. Product branding in the UI ("Pampa Gestão") is intentionally
generic; do not reintroduce a single entity's name into UI copy, titles, or placeholders — entity
names remain legitimate in the thesis text itself (method/diagnosis sections) as case-study
identifiers, and in per-deployment config/seed data for a specific entity's own instance.

## Repository Structure

The repo now holds two separate deliverables in their own folders — do not confuse them:

- **`PROJETO-TCC/`** — the original pré-projeto (proposal), already delivered/approved. Compiled with
  `pdflatex` + `bibtex` (classic BibTeX flow, no `compile.sh`). Structure: Introdução → Referencial
  Teórico → Metodologia → Resultados parciais e esperados → Referências.
  - [main.tex](PROJETO-TCC/main.tex) — pré-projeto document
  - [referencias.bib](PROJETO-TCC/referencias.bib)
  - [instrucoes_base.md](PROJETO-TCC/instrucoes_base.md) — master context for the pré-projeto (scope,
    locked decisions, terminology, tone)
  - [instrucoes_reescrita.md](PROJETO-TCC/instrucoes_reescrita.md) — editorial rules for revisions
  - [feedbacks/feedback_pre_projeto.md](PROJETO-TCC/feedbacks/feedback_pre_projeto.md) — advisor feedback
    transcript (already applied)
  - [planejamento_projeto.md](PROJETO-TCC/planejamento_projeto.md) — tracks what was expanded for the
    pré-projeto vs. deferred to the TCC final article
  - [entrevista_cpf_pia_do_sul.md](PROJETO-TCC/entrevista_cpf_pia_do_sul.md) — semi-structured interview
    with CPF Pia do Sul (source material for the diagnosis section)

- **`TCC-FINAL/`** — the current, active deliverable: the final TCC **article** (not a full monograph),
  following the AMF "Modelo do Artigo" template. This is where ongoing work happens.
  - [main.tex](TCC-FINAL/main.tex) — the article (capa, folha de rosto, folha de aprovação, then the
    article body: Resumo/Abstract → Introdução → Fundamentação teórica → Método → Resultados e discussão
    → Considerações finais → Referências)
  - [referencias.bib](TCC-FINAL/referencias.bib)
  - [compile.sh](TCC-FINAL/compile.sh) — build script; uses `biblatex`/`biber` (not bibtex)
  - [Modelo do Artigo.pdf](TCC-FINAL/Modelo%20do%20Artigo.pdf) — the official AMF article template to
    follow for formatting
  - [Manual_para_elaboração_de_trabalhos_academicos_da_AMF_3.ed._2025.pdf](TCC-FINAL/) — AMF academic
    writing manual (ABNT-based rules)
  - [diagram.jpg](TCC-FINAL/diagram.jpg) — reference image for the architecture diagram (also
    reproduced in TikZ inside main.tex, figure `fig:arquitetura`)

There is no `docs/` folder — if you see references to `docs/main.tex` or `docs/instrucoes_base.md`
elsewhere (e.g. old notes), they are stale; the real paths are under `PROJETO-TCC/` and `TCC-FINAL/`.

- **`TCC-FINAL/aplicacoes/`** — planning docs for the actual software system (not LaTeX). Source of
  truth for scope/backlog before touching implementation code:
  - [PLANEJAMENTO-GERAL.md](TCC-FINAL/aplicacoes/PLANEJAMENTO-GERAL.md) — overall plan, architecture
    sketch, Definition of Done, and the single cross-app backlog (`T-BE-*`/`T-FE-*`/`T-MOB-*`/`T-OPS-*`
    tickets)
  - [frontend-web/DESIGN-SYSTEM.md](TCC-FINAL/aplicacoes/frontend-web/DESIGN-SYSTEM.md) — color
    tokens (Gaúcho traditionalist palette, light-toned), typography, shadcn/ui conventions,
    accessibility rules
  - `frontend-web/PLANEJAMENTO.md`, `backend/PLANEJAMENTO.md`, `mobile/PLANEJAMENTO.md` — per-app
    detail referencing the shared backlog
  - `arquitetura/fluxos/*.json` (sibling folder, not under `aplicacoes/`) — the mapped business
    flows that are the functional spec behind the backlog; `arquitetura/decisoes.md` tracks
    RF/RNF coverage and open questions

- **`backend/`, `frontend-web/`, `mobile/`** — implementation code for the system described in
  `TCC-FINAL/main.tex` and planned in `TCC-FINAL/aplicacoes/`. Kept in this same repository
  (deliberate choice — keeps thesis and implementation history together for a single-author TCC).
  Each has its own README with setup/run instructions once scaffolded.

## Build Commands

**TCC-FINAL (active document):**
```bash
cd TCC-FINAL
./compile.sh
# equivalent to: pdflatex main.tex && biber main && pdflatex main.tex && pdflatex main.tex
```
Note: `compile.sh` hardcodes a MiKTeX path (`/c/Users/eidip/AppData/Local/Programs/MiKTeX/miktex/bin/x64`)
that is specific to the original author's machine — adjust it or invoke `pdflatex.exe`/`biber.exe`
directly if MiKTeX is installed elsewhere.

**PROJETO-TCC (delivered pré-projeto, rarely touched):**
```bash
cd PROJETO-TCC
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

## Critical Context for Edits

Before editing `TCC-FINAL/main.tex`, read [PROJETO-TCC/instrucoes_base.md](PROJETO-TCC/instrucoes_base.md)
for the locked scope, terminology, and tone decisions carried over from the pré-projeto — they still
apply to the final article. Also check [PROJETO-TCC/instrucoes_reescrita.md](PROJETO-TCC/instrucoes_reescrita.md)
for editorial rules (localized edits over full rewrites, preserve structure/numbering, no propaganda tone).

Key locked decisions (do not casually override):
- Scope: associados, mensalidades, eventos (bailes e fandangos), reservas de mesas/ingressos —
  explicitly **not** CIT/MTG institutional integration, not sensitive payment data handling, not other
  event types (e.g. rodeios).
- Architecture: Hexagonal (Ports and Adapters) + Clean Architecture principles on the backend.
- Development methodology: DSDM with MoSCoW prioritization (standardized across all students by the
  coordinator — do not swap for another methodology).
- Evaluation: SUS (System Usability Scale) as **one of several** instruments, combined with interviews,
  questionnaires, and observation (not SUS alone).
- Preferred terminology: "pessoas idosas", "usuários com menor familiaridade digital", "adoção gradual",
  "fluxos mediados pela entidade", "entidade parceira", "ecossistema digital".
- Tone: academic Portuguese, no commercial/propaganda tone, no overselling, avoid overusing the same
  cited authors, prefer sources from 2018 onward.

## Technical Architecture (as described in TCC-FINAL/main.tex)

The system is TypeScript end-to-end:

| Layer | Technology |
|---|---|
| Backend | NestJS (Node.js + TypeScript), Hexagonal + Clean Architecture |
| Frontend Web (admin) | Next.js |
| Web styling | Tailwind CSS + shadcn/ui |
| Client cache/state | React Query (TanStack Query) |
| Mobile (associado) | React Native + Expo |
| Database | PostgreSQL via TypeORM (versioned migrations) |
| Auth | JWT + RBAC (perfis: administrador / associado) |
| API | REST, documented via Swagger |

This describes the *software system the TCC is about*. Implementation code lives in this same repo
under `backend/`, `frontend-web/`, `mobile/` (see Repository Structure above), scaffolded and built
incrementally against the backlog in `TCC-FINAL/aplicacoes/PLANEJAMENTO-GERAL.md`.

## Document Status

`TCC-FINAL/main.tex` contains several sections still marked as placeholders (in `[...]` brackets) pending
real data:
- 3.1 "Diagnóstico dos processos administrativos atuais" — needs write-up from the CPF Pia do Sul
  interview/observation once conducted for the TCC (distinct from the earlier
  [entrevista_cpf_pia_do_sul.md](PROJETO-TCC/entrevista_cpf_pia_do_sul.md) used for the pré-projeto)
- "Implementação do MVP" — needs screenshots/description once modules are built
- "Avaliação com usuários e análise dos resultados" — needs SUS scores + qualitative results
- "Considerações finais" — needs to be finalized once results are in
- Resumo/Abstract — marked to be completed with evaluation results

Deadline: 2026-06-19 (19h). Expected length: 20–25 pages.
