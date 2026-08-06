# Planejamento: Expansão do Pré-Projeto para Projeto de TCC

**Prazo de entrega:** 19 de junho de 2026 (19h)  
**Tamanho esperado:** 20–25 páginas  
**Formato:** PDF  
**Status atual:** ✅ 21 páginas — entregável

---

## Stack tecnológica definida

| Camada | Tecnologia |
|---|---|
| Backend | NestJS (Node.js + TypeScript) |
| Frontend Web (admin) | Next.js (TypeScript) |
| Estilização Web | Tailwind CSS + shadcn/ui |
| Cache/Estado | React Query (TanStack Query) |
| Mobile (associado) | React Native + Expo (TypeScript) |
| Banco de Dados | PostgreSQL |
| ORM | TypeORM |
| Autenticação | JWT + RBAC |
| Linguagem unificada | TypeScript em todas as camadas |

---

## O que foi feito (expansão concluída)

| Seção | Status |
|---|---|
| Capitalização de todos os `\subsection` | ✅ |
| Objetivos específicos em lista de alíneas a)–d) | ✅ |
| 3.3 DSDM — justificativa + MoSCoW explicado | ✅ |
| 3.5.1 Stack tecnológica — texto + tabela | ✅ |
| 3.5.2 Diagrama de arquitetura em TikZ | ✅ |
| 3.5.3 Requisitos funcionais + MoSCoW (4 tabelas) | ✅ |
| Seção 4 — Resultados Parciais reescrita com entregas concretas por camada | ✅ |
| Seção 5 — Cronograma Jul–Nov/2026 com milestones | ✅ |
| Pacotes LaTeX: graphicx, booktabs, caption, mdframed, xcolor, tikz | ✅ |
| Referências novas: Stapleton (1997), Bierman (2014), NestJS, TypeORM, Next.js, Expo | ✅ |
| Destaques visuais em amarelo (mdframed) nas seções novas | ✅ |
| PDF compilado e no repositório remoto | ✅ |

---

## O que deixamos para o TCC

- Modelagem detalhada do banco de dados (depende da reunião com o Pia do Sul)
- Detalhamento do fluxo administrativo atual do CPF Pia do Sul
- Expansão do referencial teórico (2.1 e 2.4 ainda rasas)
- Refinamento dos requisitos RF01–RF15 / RNF01–05 após levantamento
- Substituição do placeholder do diagrama por versão final (se necessário)

---

## Notas técnicas

- Tabelas dentro de ambientes `mdframed` precisam usar `\captionof` + `\begin{center}` (não `\begin{table}`)
- TikZ é incompatível com `mdframed` — diagramas ficam fora dos blocos amarelos
- Compilação: `pdflatex` → `bibtex` → `pdflatex` → `pdflatex`
- MiKTeX instalado em `C:\Users\eidip\AppData\Local\Programs\MiKTeX\miktex\bin\x64`
