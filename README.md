# TCC-SI — Ecossistema Digital para Gestão de Associados e Eventos

Repositório do TCC de Sistemas de Informação (AMF) de Yuri Garcia Baptista, contendo tanto o
artigo/monografia (LaTeX) quanto a implementação do sistema proposto — mantidos juntos
deliberadamente para preservar o histórico de trabalho de autor único.

## Estrutura

- **`PROJETO-TCC/`** — pré-projeto (proposta), já entregue.
- **`TCC-FINAL/`** — artigo final (LaTeX) e planejamento do sistema:
  - `TCC-FINAL/main.tex` — o artigo.
  - `TCC-FINAL/arquitetura/` — grafos de arquitetura/fluxos de negócio (fonte funcional do backlog).
  - `TCC-FINAL/aplicacoes/` — planejamento do software: `PLANEJAMENTO-GERAL.md` (backlog único,
    Definition of Done) e planejamentos específicos por app.
- **`backend/`** — API NestJS (Hexagonal + Clean Architecture).
- **`frontend-web/`** — painel administrativo (Next.js + Tailwind + shadcn/ui).
- **`mobile/`** — app do associado (React Native + Expo).
- **`docker-compose.yml`** — sobe o PostgreSQL usado pelo backend em desenvolvimento.

Ver `CLAUDE.md` para o guia completo do repositório.

## Rodando o sistema localmente

```bash
docker compose up -d          # PostgreSQL (porta 5433 — ver docker-compose.yml)

cd backend && cp .env.example .env && npm install
npm run migration:run && npm run seed:admin   # cria as tabelas + primeiro admin
npm run start:dev                             # API em :3000

# em outro terminal
cd frontend-web && npm install && npm run dev   # painel em :3010 (ajustar em package.json se conflitar)

# em outro terminal
cd mobile && npm install && npx expo start      # app via Expo Go
```

Detalhes de cada app nos respectivos READMEs.
