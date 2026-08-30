# Backend — API (Pia do Sul)

API REST em NestJS (Hexagonal + Clean Architecture). Ver
`TCC-FINAL/aplicacoes/backend/PLANEJAMENTO.md` para o planejamento completo e
`TCC-FINAL/aplicacoes/PLANEJAMENTO-GERAL.md` para o backlog (`T-BE-*`).

## Rodando localmente

```bash
# na raiz do repo — sobe o PostgreSQL (porta 5433, não 5432 — ver comentário no docker-compose.yml)
docker compose up -d

# nesta pasta
cp .env.example .env
npm install
npm run migration:run   # cria as tabelas
npm run seed:admin      # cria o primeiro usuário administrador (login em backend/.env.example)
npm run start:dev
```

API disponível em `http://localhost:3000`. Documentação Swagger em
`http://localhost:3000/api/docs`.

## Estrutura

Cada módulo de domínio segue a separação hexagonal (ver exemplos em `src/health/` e
`src/identidade/`, este último já com persistência real via TypeORM):

```
src/<modulo>/
  domain/            entidades e regras de negócio puras (quando o módulo tem um conceito real)
  application/
    use-cases/   regras de negócio (casos de uso)
    ports/       interfaces das dependências externas
  infrastructure/
    adapters/      implementações concretas das ports (banco, gateways externos)
    controllers/    entrada HTTP (DTOs, rotas, Swagger)
```

`src/shared/database/` concentra a infraestrutura de banco compartilhada entre módulos: conexão
TypeORM (`database.module.ts`), migrations e o `data-source.ts` usado pelo CLI. `src/shared/payments/`
e `src/shared/notifications/` são portas transversais (gateway de pagamento, notificações) com
adapters fake/console enquanto os provedores reais não são escolhidos — qualquer módulo pode
importá-las sem depender do provedor concreto.

## Autenticação

`POST /auth/login` com `{ email, senha }` retorna um JWT (`accessToken`). Rotas protegidas usam
`JwtAuthGuard`; rotas restritas a um perfil usam `@UseGuards(JwtAuthGuard, RolesGuard)` +
`@Roles(Perfil.ADMINISTRADOR)` (ver `src/identidade/infrastructure/controllers/auth.controller.ts`
para o padrão a seguir nos próximos módulos).

## Módulos implementados

- `health` — exemplo mínimo da separação hexagonal, sem persistência.
- `identidade` — login (`POST /auth/login`), JWT + RBAC (`administrador`/`associado`).
- `associados` — cadastro (auto-cadastro público + mediado pela diretoria), dependentes,
  categorias de sócio, aprovação/rejeição de cadastro pendente (RF01, RF02, RF04). Auto-cadastro
  cria `Usuario`+`Associado` já vinculados (`GET /associados/me`); cadastro mediado vincula depois,
  sob demanda do próprio associado, via `POST /associados/vincular-conta` (CPF+e-mail+senha —
  404 se o CPF não existir, 409 se já tiver conta vinculada).
- `mensalidades` — geração mensal automática (cron), pagamento presencial e online (via
  `PaymentGatewayPort`), histórico, comprovante, relatório de inadimplência e lembrete automático
  (RF05, RF06, RF07, RF08). Endpoints `/mensalidades/*` são `@Roles(ADMINISTRADOR)`; o associado
  tem seu próprio conjunto sob `/mensalidades/minhas` (`GET` lista, `.../pagamento-online/{iniciar,
  confirmar}`, `.../comprovante`) — cada um verifica posse da mensalidade antes de agir
  (`ResolverMinhaMensalidadeUseCase`, 403 se não for do associado autenticado).
- `eventos` — croqui de salão reutilizável (mesas numeradas com posição x/y), cadastro de evento
  com vínculo opcional a croqui, preço/bloqueio por mesa no evento, ingresso avulso, publicação
  (RF09, RF10). `GET /eventos/publicados` é público (vitrine para o app do associado); `GET
  /eventos/publicados/:id` (também público) devolve o detalhe já enriquecido com mesas/ingresso
  configurados, pro app não precisar de N chamadas.
- `reservas` — reserva de mesa pelos dois canais que convivem: mediado pela diretoria (`POST
  /eventos/:eventoId/mesas/:mesaId/reservar`, admin) e direto pelo app (`.../reservar-minha`,
  associado — canal/titular/posse sempre resolvidos a partir do JWT, nunca do corpo da requisição),
  pagamento online/presencial, checagem de concorrência via índice único parcial no Postgres, mapa
  de mesas em tempo real (`GET /eventos/:eventoId/mapa-mesas`, acessível a admin e associado),
  cancelamento e transferência (mesa ou titular) (RF11, RF14, RF15). `GET /reservas/minhas` (perfil
  associado) cobre RF13.
- `ingressos` — emissão avulsa com preço por perfil (sócio/não-sócio/criança, padrão da entidade
  + override por evento), controle de quantidade disponível, check-in único (serve QR e busca
  manual por nome) com prevenção de reuso (RF12). Compra pelo associado via `POST
  /eventos/:eventoId/meu-ingresso` (sem corpo — perfil sócio, canal app e pagamento online sempre
  forçados no servidor a partir do JWT).

Com isso, todos os módulos Must e o único Could do backend do MVP (T-BE-001 a T-BE-014) estão
implementados — ver `TCC-FINAL/aplicacoes/PLANEJAMENTO-GERAL.md` para o backlog completo e o que
segue conscientemente fora do escopo de fluxo (RF02, RF06, RNF02).

## Testes

```bash
npm test          # testes unitários
npm run test:e2e  # testes de integração (sobe a aplicação in-memory)
```

Os testes e2e compartilham um único Postgres de desenvolvimento — `test/jest-e2e.json` fixa
`maxWorkers: 1` de propósito, para não rodar suítes em paralelo contra o mesmo banco.
