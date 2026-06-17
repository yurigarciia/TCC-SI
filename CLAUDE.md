# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a LaTeX academic project — a TCC (Trabalho de Conclusão de Curso) pre-project for Sistemas de Informação at Faculdade Antônio Meneghetti. The document is written in Portuguese (Brazilian).

**Title:** Desenvolvimento e Avaliação de um Ecossistema Digital para Gestão de Associados e Eventos em Entidades Tradicionalistas Gaúchas  
**Author:** Yuri Garcia Baptista  
**Case study partner:** CPF Pia do Sul, Santa Maria/RS (13ª RT)

## Build Commands

```bash
# Compile the document (run twice for references)
pdflatex docs/main.tex
bibtex main
pdflatex docs/main.tex
pdflatex docs/main.tex
```

## Repository Structure

- [docs/main.tex](docs/main.tex) — the main LaTeX document
- [docs/referencias.bib](docs/referencias.bib) — BibTeX bibliography
- [docs/instrucoes_base.md](docs/instrucoes_base.md) — master context file; read this before any edit to understand scope, decisions, and writing style
- [docs/instrucoes_reescrita.md](docs/instrucoes_reescrita.md) — editorial rules for revisions
- [docs/feedbacks/](docs/feedbacks/) — advisor feedback transcripts

## Critical Context for Edits

Always read [docs/instrucoes_base.md](docs/instrucoes_base.md) before editing main.tex. It defines:
- What the system does and does not include (non-scope)
- Preferred terminology (e.g., "pessoas idosas", "ecossistema digital", "entidade parceira")
- Architecture decisions already locked in (Hexagonal + Clean Architecture, REST API, web + mobile)
- Style rules: academic Portuguese, no commercial tone, no propaganda, dense but clear

## Document Structure (main.tex)

1. Introdução → Problema → Justificativa → Objetivos  
2. Referencial Teórico (5 subsections — each needs multiple citations)  
3. Metodologia — uses DSDM for software development, SUS as one evaluation instrument among others  
4. Resultados parciais e esperados  
5. Referências bibliográficas

## Advisor Feedback Summary (apply when revising)

- Justificativa needs more citations and a personal motivation paragraph from the author
- Referencial teórico sections 2.1, 2.3, 2.4, 2.5 had too few citations — each section needs a proper beginning, middle, and end
- Avoid over-relying on the same authors across sections; prefer sources from 2018 onward
- Sections 3.2 (coleta de dados) and 3.4 (avaliação) can be merged; include SUS plus interviews, questionnaires, and observation
- Section 3.3 (metodologia de desenvolvimento): cite and justify DSDM as a methodology explicitly
- Section 3.5: specify the technologies that will be used in the architecture
- Describe current administrative practices at CPF Pia do Sul (how things work today without tech)
