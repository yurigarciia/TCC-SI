# Planejamento Geral — Ecossistema Digital para Gestão de Associados e Eventos

> Fonte de verdade do projeto de software do TCC. Este documento orienta as decisões de
> implementação; os planejamentos específicos (`frontend-web/PLANEJAMENTO.md`,
> `backend/PLANEJAMENTO.md`, `mobile/PLANEJAMENTO.md`) detalham cada frente e devem se manter
> coerentes com este arquivo. Escopo, terminologia e decisões travadas seguem
> `PROJETO-TCC/instrucoes_base.md` e o `CLAUDE.md` da raiz do repositório. Os fluxos de negócio
> mapeados (base do backlog abaixo) estão em `TCC-FINAL/arquitetura/fluxos/` e o rastreamento de
> cobertura RF/RNF em `TCC-FINAL/arquitetura/decisoes.md`.

## 1. Visão Geral

Construir um ecossistema digital — painel web administrativo + aplicativo mobile para associados —
que digitalize a gestão de associados, mensalidades e eventos sociais (bailes e fandangos) de
entidades tradicionalistas gaúchas, usando o CTG/CPF **Pia do Sul** (Santa Maria/RS, 13ª RT) como
estudo de caso e validador do MVP.

Sucesso, para efeito deste projeto, significa: um MVP funcional cobrindo os requisitos Must/Should
do artigo (ver §7 Backlog), avaliado com a diretoria e associados reais do Pia do Sul via SUS +
entrevista/observação, produzindo resultados que sustentem o capítulo de Resultados e Discussão do
TCC até o prazo de 2026-06-19.

O sistema não substitui o julgamento humano da diretoria — os fluxos são majoritariamente
**mediados pela entidade** (RNF01), refletindo o nível de familiaridade digital heterogêneo do
público (associados incluem pessoas idosas; a diretoria tem dificuldade digital, conforme relatado
na entrevista escrita de 2026-08-11).

## 2. Não Objetivos (Non Goals)

- Integração institucional com CIT/MTG (Conselho/Movimento Tradicionalista Gaúcho).
- Suporte a outros tipos de evento além de bailes/fandangos (ex.: rodeios, provas campeiras).
- Processamento ou armazenamento direto de dados sensíveis de pagamento (cartão) — pagamentos
  online passam por gateway terceirizado; o sistema guarda apenas status/referência da transação.
- Totem físico de autoatendimento (pedido levantado na entrevista, fora do escopo do MVP).
- Tema escuro (dark mode) no frontend administrativo — pode ser considerado pós-MVP, não é meta do
  system design atual.
- Multi-tenant (suporte a múltiplas entidades ao mesmo tempo) — o MVP é validado com uma única
  entidade parceira; arquitetura deve ser desacoplada o suficiente para não impedir isso no futuro,
  mas não é entregável agora.

## 3. Premissas

- A stack técnica descrita no `CLAUDE.md` está travada e não deve ser trocada por conveniência de
  implementação (NestJS + Hexagonal/Clean Architecture, Next.js + Tailwind + shadcn/ui, React
  Native + Expo, PostgreSQL + TypeORM, JWT + RBAC, Swagger).
- Os 8 fluxos já mapeados em `TCC-FINAL/arquitetura/fluxos/` (cadastro-associado, mensalidade,
  croqui-salao, evento, reserva-mesa, emissao-ingresso, relatorio-inadimplencia,
  cancelamento-transferencia-reserva) são a especificação funcional primária para o backlog. Os
  itens não mapeados por escolha consciente (RF02, RF06, RF13, RNF02) são telas de CRUD/consulta
  simples e entram no backlog sem fluxograma dedicado.
- Existe(m) sistema(s) em uso informal hoje pela entidade (ex.: planilhas, grupo de WhatsApp para
  cobrança) — o novo sistema deve ser uma evolução assistida desses processos, não uma ruptura
  brusca (ver `contraperguntas_sistemas.docx`, ainda sem resposta da entidade).
- Gateway de pagamento: a escolha do provedor específico é um detalhe de implementação do backend,
  não uma decisão de escopo do TCC — deve ser abstraída atrás de uma porta (Ports and Adapters) para
  não acoplar o domínio a um fornecedor.
- Não há orçamento de infraestrutura definido pela entidade parceira; presume-se hospedagem de
  baixo custo (ex.: free/hobby tiers) adequada ao porte pequeno da entidade, sem SLA formal.

## 4. Restrições

- **Prazo:** entrega do TCC em 2026-06-19 (19h). O MVP funcional e a avaliação com usuários
  precisam estar concluídos com folga suficiente para escrever os capítulos de Resultados e
  Considerações Finais antes dessa data.
- **Metodologia:** DSDM com priorização MoSCoW (padronizado pela coordenação do curso — não trocar
  por outra metodologia ágil).
- **Avaliação:** SUS como um dos instrumentos, combinado com entrevistas/questionários/observação —
  não usar SUS isoladamente como critério de sucesso.
- **Tom/terminologia:** preferir "pessoas idosas", "usuários com menor familiaridade digital",
  "adoção gradual", "fluxos mediados pela entidade", "entidade parceira", "ecossistema digital" (ver
  `PROJETO-TCC/instrucoes_base.md`).
- **Escopo travado:** associados, mensalidades, eventos, reservas de mesas/ingressos. Qualquer
  funcionalidade fora desse escopo (ver §2) exige decisão explícita antes de entrar no backlog.
- **Time:** desenvolvedor único (o autor do TCC) — o backlog deve ser sequenciável por uma única
  pessoa, sem pressupor paralelismo de equipe.

## 5. Arquitetura Geral (visão de conjunto)

```
[App Mobile — associado]        [Painel Web — diretoria]
   React Native + Expo               Next.js + Tailwind + shadcn/ui
        |  REST/JSON                        |  REST/JSON
        +------------------+  +-------------+
                           |  |
                     [API NestJS — Hexagonal/Clean]
                     Controllers (Adapters de entrada)
                     Use Cases (Application/Domain)
                     Portas de saída → Adapters:
                       - Repositório (TypeORM → PostgreSQL)
                       - Gateway de pagamento (externo)
                       - Notificações (push/e-mail, para lembretes)
                     Swagger (documentação da API)
                        |
                  [PostgreSQL] (migrations versionadas)
```

Responsabilidades por módulo de domínio (mapeiam 1:1 com os fluxos já desenhados):
- **Associados**: cadastro, dependentes, categoria de sócio, status (ativo/inativo/suspenso).
- **Mensalidades**: geração de cobrança recorrente, pagamento, inadimplência, comprovantes.
- **Eventos**: cadastro de evento, croqui de salão reutilizável, configuração de mesas/ingressos por
  evento.
- **Reservas**: reserva de mesa, emissão de ingresso, cancelamento/transferência.
- **Identidade/Acesso**: autenticação JWT, RBAC (administrador/associado).

Integrações externas: gateway de pagamento (mensalidades e ingressos online), serviço de
push/e-mail para lembretes (inadimplência, confirmações).

## 6. Definition of Done (nível de projeto)

O projeto é considerado no ponto de MVP avaliável quando, simultaneamente:

- [ ] Todos os requisitos **Must** do artigo (RF01, RF03, RF04\*, RF05, RF06, RF09, RF10, RF11,
      RF12, RF13, RNF01, RNF02, RNF03) estão implementados e testados manualmente contra o fluxo
      correspondente em `TCC-FINAL/arquitetura/fluxos/`.
      \* RF04 é Should no artigo, mas depende do mesmo fluxo de RF01 — tratado junto.
- [ ] Requisitos **Should** priorizados (RF02, RF07, RF08, RF14, RNF04, RNF05) implementados na
      medida em que o tempo do cronograma permitir; os que ficarem de fora devem ser documentados
      como limitação no TCC, não silenciados.
- [ ] RF15 (Could) implementado se houver tempo — já mapeado em
      `cancelamento-transferencia-reserva.json`.
- [ ] Backend com migrations versionadas rodando localmente a partir de zero (`docker compose up` ou
      equivalente) sem passos manuais não documentados.
- [ ] API documentada via Swagger, cobrindo todos os endpoints usados pelo web e pelo mobile.
- [ ] Painel web navegável de ponta a ponta pelos fluxos Must, aplicando o Design System
      (`frontend-web/DESIGN-SYSTEM.md`).
- [ ] App mobile instalável (build Expo Go ou APK/TestFlight interno) cobrindo os fluxos do
      associado (consulta de reservas, pagamento de mensalidade, compra de ingresso).
- [ ] Sessão de avaliação com a diretoria e associados do Pia do Sul realizada, com SUS aplicado e
      notas de observação/entrevista coletadas.
- [ ] Resultados da avaliação registrados em `TCC-FINAL/arquitetura/decisoes.md` (ou anexo
      equivalente) para alimentar o capítulo de Resultados e Discussão.

## 7. Backlog (fonte de verdade do trabalho)

Convenção de IDs: `T-BE-###` (backend), `T-FE-###` (frontend web), `T-MOB-###` (mobile),
`T-DS-###` (design system), `T-OPS-###` (infra/transversal). Prioridade em MoSCoW
(Must/Should/Could/Won't), coerente com o artigo. Detalhamento adicional de cada frente vive nos
planejamentos específicos — este backlog é o nível "épico/ticket inicial".

### Transversal / Infraestrutura

#### Ticket: T-OPS-001 Estrutura do monorepo e ambiente local
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Criar repositório(s)/pastas do backend, frontend-web e mobile; docker-compose com
  PostgreSQL; scripts de bootstrap.
- **Acceptance Criteria:** `docker compose up` sobe PostgreSQL local; cada app roda com um único
  comando documentado no respectivo README.
- **Validation Steps:** Rodar setup do zero em uma pasta limpa e confirmar os 3 apps de pé.
- **Notes:** Decisão registrada em 2026-08-18: código fica neste mesmo repositório (`backend/`,
  `frontend-web/`, `mobile/` na raiz), não em repositórios separados — ver `CLAUDE.md`. Scaffolds
  gerados via `@nestjs/cli`, `create-next-app` e `create-expo-app`; `docker-compose.yml` na raiz
  sobe PostgreSQL 16. READMEs por app e raiz documentam o comando único de cada um.

#### Ticket: T-OPS-002 CI básico (lint + build)
- **Priority:** Should
- **Status:** Todo
- **Owner:** Unassigned
- **Scope:** Pipeline simples (GitHub Actions) rodando lint/build/test em cada app a cada push.
- **Acceptance Criteria:** PR quebra o CI se lint ou build falhar em qualquer um dos 3 apps.
- **Validation Steps:** Abrir PR com erro de lint proposital e confirmar falha do CI.
- **Notes:**

### Backend (API)

#### Ticket: T-BE-001 Esqueleto NestJS Hexagonal
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Estrutura de pastas por módulo de domínio (associados, mensalidades, eventos,
  reservas, identidade), separando controllers (entrada), use cases (aplicação), entidades de
  domínio e portas de saída.
- **Acceptance Criteria:** Módulo de exemplo (`health`) demonstra a separação; documentado em
  `backend/PLANEJAMENTO.md`.
- **Validation Steps:** Revisão de código contra a checklist de camadas do planejamento de backend.
- **Notes:** Implementado em `backend/src/health/` (`application/ports`, `application/use-cases`,
  `infrastructure/adapters`, `infrastructure/controllers`) — `ClockPort` como porta de saída,
  `SystemClockAdapter` como implementação concreta, injetados via token de classe abstrata.
  Swagger habilitado em `/api/docs` (RNF04), `ValidationPipe` global já configurado em `main.ts`
  para os módulos futuros. Validado com `npm run build` e `npm run test:e2e` (endpoint `/health`).

#### Ticket: T-BE-002 Autenticação JWT + RBAC (RNF02)
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Login, emissão/refresh de JWT, guard de perfis (administrador/associado).
- **Acceptance Criteria:** Endpoint protegido retorna 401/403 corretamente para token ausente/perfil
  incorreto.
- **Validation Steps:** Testes de integração cobrindo os 3 casos (sem token, token válido perfil
  errado, token válido perfil correto).
- **Notes:** Implementado em `backend/src/identidade/` seguindo a mesma separação hexagonal do
  módulo `health` (domain `Usuario`/`Perfil`, ports `UsuarioRepositoryPort`/`PasswordHasherPort`,
  use cases `AutenticarUsuarioUseCase`/`ListarUsuariosUseCase`, adapters TypeORM/bcryptjs, guards
  `JwtAuthGuard`/`RolesGuard` + decorator `@Roles`). Primeira persistência real via TypeORM
  (`usuarios` table, migration `1755000000000-CreateUsuariosTable`), com script `npm run
  migration:run` e `npm run seed:admin` para criar o primeiro administrador. Sem refresh token no
  MVP (JWT de vida curta/média via `JWT_EXPIRES_IN`, reautenticação simples) — revisitar se a
  avaliação com o Pia do Sul mostrar necessidade. Validado com `npm run build`, `npm run lint` e
  `npm run test:e2e` (7 testes, cobrindo 401 sem token, 403 perfil errado e 200 perfil correto em
  `/auth/usuarios`, e 401/200 de login). Achado durante o setup: havia um PostgreSQL nativo já
  ocupando a porta 5432 na máquina de dev — `docker-compose.yml` expõe o container em `5433` para
  não colidir.

#### Ticket: T-BE-003 Módulo Associados (RF01, RF03, RF04)
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Cadastro (auto-cadastro + mediado pela diretoria), dependentes, categoria de sócio,
  status (ativo/inativo/suspenso) — seguir `cadastro-associado.json`.
- **Acceptance Criteria:** Todos os caminhos do fluxograma (aprovação, rejeição, CPF duplicado)
  cobertos por endpoint e teste.
- **Validation Steps:** Testes de integração por caminho do fluxo.
- **Notes:** Implementado em `backend/src/associados/` (domain `Associado`/`Dependente`/
  `CategoriaSocio`, ports/use cases por ação, adapters TypeORM). Endpoints: `POST
  /associados/auto-cadastro` (público, status inicial `pendente_validacao`), `POST /associados`
  (admin, cadastro mediado com dependentes/categoria no mesmo payload, status `ativo`), `POST
  /associados/:id/aprovar` e `/rejeitar`, `POST/GET /categorias-socio`. RF03 completo
  (ativo/inativo/suspenso, quem pode suspender, efeito em mensalidades) segue sem fluxo mapeado —
  este módulo só implementa os 3 status que já existem no fluxograma
  (`pendente_validacao`/`ativo`/`rejeitado`). Duas assunções documentadas em código (comentários
  nos use cases) por decisões ainda em aberto na entrevista de campo: (1) cadastro mediado entra
  Ativo na hora, não pendente; (2) rejeição só marca o status, sem notificação/descarte de dados
  automatizado. Validado com `npm run build`, `npm run lint` e `npm run test:e2e` (13 testes:
  auto-cadastro, CPF duplicado 409, criação sem token 401, cadastro mediado com dependentes,
  aprovação e rejeição).

#### Ticket: T-BE-004 Consulta/edição de associado (RF02)
- **Priority:** Should
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Endpoints de listagem, busca e edição de dados cadastrais.
- **Acceptance Criteria:** CRUD completo com validação de campos obrigatórios.
- **Validation Steps:** Teste de integração de CRUD.
- **Notes:** Implementado junto com T-BE-003 no mesmo controller (`GET /associados`, `GET
  /associados/:id`, `PATCH /associados/:id`, `POST /associados/:id/dependentes`), já que é o mesmo
  módulo de domínio — sem endpoints/telas próprias, mas cobrindo o requisito integralmente.

#### Ticket: T-BE-005 Módulo Mensalidades (RF05, RF06, RF08)
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Geração automática de cobrança mensal por categoria, registro de pagamento (2 canais),
  histórico, comprovante — seguir `mensalidade.json`.
- **Acceptance Criteria:** Job de geração mensal cria cobranças corretas por categoria; pagamento
  muda status corretamente; comprovante gerado.
- **Validation Steps:** Teste do job com dados semeados de 3 categorias distintas.
- **Notes:** Implementado em `backend/src/mensalidades/`. Geração mensal idempotente
  (`GerarCobrancasMensaisUseCase`, chamável via `POST /mensalidades/gerar` e agendada via
  `@nestjs/schedule` no dia 1 de cada mês); valor vem de `CategoriaSocio.valorMensalidade`
  (módulo `associados`, porta reexportada). Dois canais de pagamento: presencial (lançamento
  manual pela diretoria) e online (via `PaymentGatewayPort` — ver T-BE-011). Comprovante (RF08)
  como JSON estruturado, não PDF (decisão consciente — layout de impressão fica para quando o
  frontend existir). Validado com `npm run build`, `npm run lint` e `npm run test:e2e`.

#### Ticket: T-BE-006 Relatório de Inadimplência + lembrete automático (RF07)
- **Priority:** Should
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Endpoint de listagem sob demanda + disparo de lembrete ao entrar em
  `Status: Inadimplente` — seguir `relatorio-inadimplencia.json`.
- **Acceptance Criteria:** Lembrete disparado automaticamente ao mudar status; relatório reflete
  tempo de atraso e valor devido.
- **Validation Steps:** Teste de integração simulando vencimento sem pagamento.
- **Notes:** Prazo exato do lembrete é pergunta em aberto (item 9 de `decisoes.md`) — usar valor
  configurável, não hardcoded, para não bloquear o desenvolvimento. Implementado como
  `ProcessarInadimplenciaUseCase`, disparado diariamente via cron (`@nestjs/schedule`,
  `EVERY_DAY_AT_6AM`) e também exposto em `POST /mensalidades/processar-inadimplencia` para
  gatilho manual/testes; prazo de graça lido de `INADIMPLENCIA_LEMBRETE_DIAS` (`.env`). Lembrete
  enviado via novo `NotificationSenderPort` (`shared/notifications/`), hoje só com adapter de
  console/log — sem push/e-mail real ainda (decisão consciente, mesma lógica da porta de
  pagamento: abstração pronta, provedor concreto é decisão técnica futura). Relatório (`GET
  /mensalidades/inadimplentes`) sempre disponível sob consulta, sem geração agendada, conforme
  decisão já registrada no fluxo. Validado com `npm run test:e2e` (mensalidade vencida inserida
  diretamente no banco, processada pelo use case, aparece no relatório com dias de atraso > 0).

#### Ticket: T-BE-007 Módulo Eventos + Croqui de Salão (RF09, RF10)
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Croqui de salão reutilizável com mesas posicionadas (x/y), cadastro de evento com
  vínculo opcional a croqui, preço/disponibilidade por evento — seguir `croqui-salao.json` e
  `evento.json`.
- **Acceptance Criteria:** Evento pode referenciar um croqui existente e sobrescrever preço padrão;
  validação de numeração duplicada de mesa.
- **Validation Steps:** Testes de integração para criação de croqui, evento com/sem croqui,
  publicação.
- **Notes:** Implementado em `backend/src/eventos/`, dois sub-domínios no mesmo módulo:
  Salão/Mesa (`SaloesController`) e Evento (`EventosController`). Croqui reutilizável: `Salao` 1—N
  `Mesa` (número único por salão, validado em `AdicionarMesaUseCase`). Evento com vínculo opcional
  a salão (`salaoId` nullable); quando vinculado, `ConfigurarMesasEventoUseCase` cria/substitui
  `ConfiguracaoMesaEvento` (preço + bloqueio por mesa, sem alterar a mesa original) e valida que
  cada mesa pertence ao salão vinculado; sem salão, o endpoint recusa (400). Ingresso avulso
  (`ConfiguracaoIngressoEvento`, uma config por evento) coexiste independente do salão. Evento
  nasce `rascunho`, `POST /eventos/:id/publicar` muda para `publicado`. `GET /eventos/publicados`
  é o único endpoint público (sem guard) do módulo — vitrine para o app do associado (RF13), já
  que ainda não há linkagem Usuario↔Associado para autenticar o associado como si mesmo (mesma
  lacuna registrada em T-BE-003). Editar croqui/evento depois de já ter reservas segue em aberto
  (pendências #4 e #5 de `decisoes.md`) — não implementado nesta ticket. Validado com `npm run
  build`, `npm run lint` e `npm run test:e2e`. Achado no caminho: os testes e2e rodavam em
  paralelo (múltiplos workers do Jest) contra o mesmo Postgres de dev, causando uma falha
  intermitente entre suítes (`mensalidades.e2e-spec.ts` via endpoint global de inadimplência) —
  corrigido fixando `maxWorkers: 1` em `test/jest-e2e.json`, já que os testes e2e compartilham
  estado real no banco e não devem rodar concorrentes entre arquivos.

#### Ticket: T-BE-008 Módulo Reservas de Mesa (RF11, RF14)
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Reserva mediada, checagem de concorrência (mesa ainda disponível?), disponibilidade em
  tempo real — seguir `reserva-mesa.json`.
- **Acceptance Criteria:** Duas tentativas concorrentes de reservar a mesma mesa resultam em uma
  aprovada e uma recusada, sem duplicidade.
- **Validation Steps:** Teste de concorrência (requisições simultâneas na mesma mesa).
- **Notes:** Implementado em `backend/src/reservas/`. A checagem "Mesa ainda disponível?" não é um
  simples check-then-insert na aplicação — é um índice único parcial no Postgres
  (`ux_reservas_mesa_ativa` sobre `evento_id, mesa_id` onde `status IN ('pendente','confirmada')`),
  seguro sob concorrência real; o adapter TypeORM traduz a violação (`23505`) em
  `MesaJaReservadaError` → `ConflictException` (409). Dois canais convivem: `mediado` sempre
  confirma direto (RNF01, diretoria já tratou o pagamento); `app` com presencial fica `pendente`
  até `POST /reservas/:id/confirmar`, com online confirma direto via `PaymentGatewayPort`. `GET
  /eventos/:eventoId/mapa-mesas` cobre RF14, cruzando `ConfiguracaoMesaEvento` (bloqueio/preço) +
  reservas ativas em tempo real, sem cache. RF15 básico (cancelar libera a mesa) também
  implementado aqui, adiantando parte de T-BE-010. Assim como em T-BE-007, toda criação de reserva
  é admin-guarded (RNF01) — não há endpoint público para o associado reservar em nome próprio,
  pela mesma lacuna de linkagem Usuario↔Associado. Validado com `npm run build`, `npm run lint` e
  `npm run test:e2e`, incluindo teste real de concorrência (duas requisições simultâneas via
  `Promise.all` na mesma mesa, uma 201 e uma 409). Bug real encontrado e corrigido no caminho:
  `EventosModule` não exportava `ConfiguracaoMesaEventoRepositoryPort`, quebrando o bootstrap do
  Nest inteiro — o sintoma enganoso era "Unable to connect to the database" nos testes, mas a
  causa era falha de resolução de dependências, não conectividade.

#### Ticket: T-BE-009 Módulo Ingressos (RF12)
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Emissão de ingresso avulso, preço por perfil de comprador (sócio/não-sócio/criança),
  check-in (QR + manual), prevenção de reuso — seguir `emissao-ingresso.json`.
- **Acceptance Criteria:** Ingresso já usado não permite novo check-in; preço aplicado conforme
  perfil e override do evento.
- **Validation Steps:** Teste de integração cobrindo os 3 perfis de comprador e o caminho de reuso.
- **Notes:** Implementado em `backend/src/ingressos/`. Preço por perfil (sócio/não-sócio/criança)
  como tabela própria (`PrecoIngresso`), separada do `preco` simples de
  `ConfiguracaoIngressoEvento` (T-BE-007) — resolução em `PrecoIngressoRepositoryPort.resolverPreco`:
  override do evento se existir, senão padrão da entidade, senão `BadRequestException`. Quantidade
  disponível continua controlada por `ConfiguracaoIngressoEvento.quantidadeDisponivel`
  (`T-BE-007`), comparada contra a contagem de ingressos já emitidos. Check-in único endpoint
  (`POST /ingressos/:id/checkin`) serve tanto QR (o `id` do ingresso É o payload do QR) quanto
  busca manual (`GET /eventos/:eventoId/ingressos?nome=`, `ILIKE`) — os dois formatos convergem
  para o mesmo caminho de validação, como no fluxograma. Canal `app` sempre paga online via
  `PaymentGatewayPort` (mesmo padrão de mensalidades/reservas); canal `mediado` cobre
  associado/visitante/criança comprando presencial com a diretoria. Cancelamento/estorno de
  ingresso (pendência #8 de `decisoes.md`) segue em aberto — não implementado. Validado com `npm
  run build`, `npm run lint` e `npm run test:e2e` (5 testes: override de preço por evento, preço
  padrão, pagamento online via gateway, esgotamento de quantidade, busca manual + check-in +
  reuso recusado).

#### Ticket: T-BE-010 Cancelamento/Transferência de Reserva (RF15)
- **Priority:** Could
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Cancelar (libera mesa), transferir mesa ou transferir titular — seguir
  `cancelamento-transferencia-reserva.json`.
- **Acceptance Criteria:** Transferência de mesa falha graciosamente se a nova mesa não estiver
  disponível; transferência de titular atualiza o vínculo.
- **Validation Steps:** Teste de integração dos 3 sub-caminhos (cancelar, trocar mesa, trocar
  titular).
- **Notes:** Depende da decisão em aberto sobre se o novo titular precisa ser associado cadastrado
  — mantido como texto livre (`nomeTitular`, nova coluna nullable em `reservas`) enquanto isso não
  é resolvido. Cancelar básico já estava pronto desde T-BE-008
  (`POST /reservas/:id/cancelar`). Implementados agora: `POST /reservas/:id/transferir-mesa`
  (`TransferirMesaReservaUseCase`) e `POST /reservas/:id/transferir-titular`
  (`TransferirTitularReservaUseCase`). A transferência de mesa segue fielmente o fluxograma: a
  checagem de disponibilidade da mesa nova acontece criando a reserva nova PRIMEIRO (a mesma
  constraint de unicidade de T-BE-008 faz a checagem real) e só cancela a reserva antiga se a
  nova for aceita — se a mesa nova estiver ocupada, a reserva original fica intacta (o
  fluxograma não mostra "libera mesa" no caminho de recusa). Validado com `npm run build`, `npm
  run lint` e `npm run test:e2e` (3 testes novos: transferir titular mantendo a mesma mesa,
  transferir para mesa livre liberando a original, recusar transferência para mesa ocupada sem
  tocar na reserva original).

Com este ticket, **todos os módulos do backend do MVP (T-BE-001 a T-BE-011) estão concluídos**,
incluindo o único item Could. Seguem pendentes apenas os itens conscientemente não mapeados como
fluxo (RF02, RF06, RNF02 — ver `arquitetura/decisoes.md`; RF13 resolvido por T-BE-012 abaixo) e as
frentes de frontend-web e mobile.

#### Ticket: T-BE-012 Vínculo Usuario↔Associado + "Minhas Reservas" (RF13)
- **Priority:** Should
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Resolver a lacuna que impedia RF13 ("Associado consultar suas reservas pelo app") de
  ser implementável: até aqui, `Usuario` (login) e `Associado` (dados cadastrais) eram entidades
  desconectadas, e `reservas`/`ingressos` só guardavam nome livre do titular/comprador, sem
  associadoId. Sem isso, T-MOB-003 (Minhas Reservas) não teria endpoint de backend para consumir.
- **Acceptance Criteria:** Associado autenticado consegue ver o próprio cadastro (`GET
  /associados/me`) e as próprias reservas (`GET /reservas/minhas`); administrador não consegue
  usar essas rotas (403).
- **Validation Steps:** Teste de integração cobrindo auto-cadastro→aprovação→criação de reserva
  vinculada→login do associado→consulta de "minhas reservas".
- **Notes:** `associados.usuario_id` (nullable, unique, FK→usuarios) — hoje só preenchido pelo
  **auto-cadastro** (`AutoCadastrarAssociadoUseCase` agora cria `Usuario`+`Associado` juntos, já
  vinculados, usando `UsuarioRepositoryPort`/`PasswordHasherPort` do módulo `identidade`,
  exportados especificamente para isso). Cadastro **mediado** pela diretoria continua sem
  `usuarioId` — não existe hoje um fluxo mapeado de "associado reivindica a própria conta depois
  de cadastro feito pela diretoria"; registrado como não resolvido, não implementado. `reservas`
  ganhou `associado_id` (nullable, FK→associados) opcional na criação
  (`SolicitarReservaDto.associadoId`) — quem cria a reserva continua sendo sempre a diretoria
  (RNF01), só que agora pode opcionalmente vincular a um associado cadastrado. `GET
  /reservas/minhas` e `GET /associados/me` guardados por `@Roles(Perfil.ASSOCIADO)`, resolvendo o
  `usuarioId` do JWT (`CurrentUser().sub`) para o Associado correspondente. RF13 do lado
  **ingressos** (associado ver seus próprios ingressos) ficou fora do escopo desta ticket — mesmo
  padrão pode ser replicado ali quando/se for priorizado. Validado com `npm run build`, `npm run
  lint` e `npm run test:e2e` (37 testes no total; 2 novos: "me" autenticado, "minhas reservas" +
  bloqueio de acesso para administrador).

#### Ticket: T-BE-011 Integração com gateway de pagamento
- **Priority:** Must
- **Status:** Done (adapter fake — provedor real ainda pendente)
- **Owner:** Unassigned
- **Scope:** Porta de saída `PaymentGateway` (Ports and Adapters) com um adapter concreto para o
  gateway escolhido; usada por Mensalidades e Ingressos.
- **Acceptance Criteria:** Trocar o adapter concreto não exige alterar use cases de domínio.
- **Validation Steps:** Teste de unidade do use case com um adapter fake/mocado.
- **Notes:** Escolha do provedor é decisão técnica, não de escopo do TCC — ver Open Questions.
  Implementado em `backend/src/shared/payments/`: `PaymentGatewayPort`
  (`iniciarCobranca`/`consultarStatus`) + `FakePaymentGatewayAdapter` (aprova na hora, só para
  dev/testes). Já consumida pelo módulo `mensalidades` (`IniciarPagamentoOnlineUseCase`/
  `ConfirmarPagamentoOnlineUseCase`) sem nenhum use case depender de SDK de provedor — trocar para
  um adapter real (Stripe/Mercado Pago/PagSeguro etc., a decidir) é só reimplementar a porta.
  Reaproveitável por T-BE-009 (Ingressos) quando for implementado.

#### Ticket: T-BE-012 Documentação Swagger completa (RNF04)
- **Priority:** Should
- **Status:** Todo
- **Owner:** Unassigned
- **Scope:** Anotar todos os endpoints com DTOs, exemplos e códigos de erro no Swagger.
- **Acceptance Criteria:** `/api/docs` lista 100% dos endpoints usados pelo web e mobile.
- **Validation Steps:** Checklist manual comparando endpoints implementados x documentados.
- **Notes:**

### Frontend Web (Painel Administrativo)

#### Ticket: T-FE-001 Design System aplicado (tokens + tema shadcn/ui)
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Implementar os tokens de `frontend-web/DESIGN-SYSTEM.md` como variáveis CSS/tema
  Tailwind + shadcn/ui no projeto Next.js.
- **Acceptance Criteria:** Componentes shadcn/ui (button, input, card, table, dialog) renderizam com
  a paleta definida, sem cores hardcoded fora dos tokens.
- **Validation Steps:** Página de showcase (`/dev/design-system`) exibindo todos os componentes
  base com os tokens aplicados.
- **Notes:** shadcn/ui inicializado via `npx shadcn@latest init` (CLI 4.18, estilo `base-nova` —
  usa `@base-ui/react` em vez de Radix; componentes usam prop `render` no lugar de `asChild`).
  Tokens em `src/app/globals.css` convertidos de HSL (doc) para hex direto nas custom properties
  (`:root`), com `success`/`warning`/`silver` adicionados como tokens extras (não fazem parte do
  preset shadcn) e registrados em `@theme inline` para gerar utilitários Tailwind
  (`bg-success`, `text-warning` etc.). Fontes via `next/font/google`: Inter → `--font-sans`,
  Fraunces → `--font-display`/`font-heading` (títulos de tela, não em UI densa). `Badge` ganhou
  variantes `success`/`warning` (não vêm no preset). Dark mode confirmado como Non Goal — bloco
  `.dark` mantido com os neutros padrão do shadcn (nunca reaproveita os tons claros), sem toggle
  na aplicação. Showcase em `/dev/design-system` cobre paleta, tipografia, botões, badges
  semânticos, formulário, tabela (linhas alternadas + avatar), abas, diálogo e alert-dialog de
  confirmação. Validado com `npm run build`, `npm run lint` e screenshot headless (Edge) da home e
  do showcase.

#### Ticket: T-FE-002 Autenticação e layout base do painel
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Tela de login, guarda de rota autenticada, layout com navegação lateral/topo.
- **Acceptance Criteria:** Usuário não autenticado é redirecionado ao login; sessão persiste no
  refresh.
- **Validation Steps:** Teste manual de login/logout/refresh.
- **Notes:** `/login` (react-hook-form + zod) chama `POST /auth/login` direto no backend (sem BFF).
  Token guardado em cookie legível por JS (`src/lib/auth-token.ts`) — decisão deliberada dado que
  o painel chama a API NestJS diretamente do navegador; documentada em comentário no código, não
  httpOnly. `src/proxy.ts` (Next.js 16 renomeou `middleware.ts` → `proxy.ts`, função `middleware`
  → `proxy` — achado durante o build, corrigido) guarda as rotas no servidor, sem "flash" de tela
  protegida. `AppShell` (`src/components/layout/app-shell.tsx`) com nav lateral + header
  mostrando e-mail/perfil (via `GET /auth/me`, React Query) + botão "Sair". `src/lib/api-client.ts`
  centraliza toda chamada HTTP (anexa `Authorization` automaticamente). Validado com `npm run
  build`, `npm run lint`, e teste funcional ponta a ponta contra o backend real: login real →
  token → cookie → `/` retorna 200 e `/login` redireciona para `/`; sem cookie, `/` redireciona
  para `/login`; `GET /auth/me` confirmado com CORS permitindo a origem do painel. Screenshot
  headless confirmou o visual de `/login`. Achado no caminho: as portas `3000` (backend) e `3001`
  (usada por outro projeto não relacionado nesta máquina de dev) colidiam — `frontend-web` fixado
  na porta `3010` em `package.json`.

#### Ticket: T-FE-003 Tela de Associados (cadastro mediado, consulta, status)
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** CRUD de associado, dependentes, mudança de status (RF01–RF04).
- **Acceptance Criteria:** Diretoria consegue cadastrar associado mediado e ver pendências de
  aprovação (se aplicável).
- **Validation Steps:** Teste manual seguindo o fluxograma `cadastro-associado.json` ponta a ponta.
- **Notes:** `src/features/associados/` (types + hooks React Query) e 3 rotas em
  `src/app/(painel)/associados/`: lista (`/associados`, tabela com badge de status semântico),
  cadastro mediado (`/associados/novo`, react-hook-form + zod + `useFieldArray` para dependentes
  dinâmicos + `Select` de categoria via `Controller`), detalhe (`/associados/[id]`, dados
  editáveis inline + lista/adição de dependentes + aprovar/rejeitar quando `pendente_validacao`,
  rejeitar atrás de `AlertDialog` de confirmação). Validado com `npm run build`, `npm run lint` e
  teste manual ponta a ponta contra o backend real (login → criar associado mediado com
  dependente e categoria via API → lista mostra badges corretos → auto-cadastro cria pendente →
  tela renderiza aprovar/rejeitar). 2 bugs reais encontrados e corrigidos no caminho: (1) `Button`
  (`src/components/ui/button.tsx`) emitia warning do Base UI ao ser renderizado como link
  (`render={<Link .../>}`) por não setar `nativeButton={false}` — corrigido com um default
  automático (`nativeButton = !render`) no wrapper, sem precisar lembrar disso em cada call site;
  (2) nomes com acento enviados via `curl -d` no Git Bash do Windows chegavam corrompidos no
  banco — não é bug da aplicação, documentado como cuidado ao gerar dados de teste manualmente
  (usar arquivo JSON em vez de string inline em testes futuros).

#### Ticket: T-FE-004 Tela de Mensalidades e Inadimplência
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Histórico de pagamentos, registro manual de pagamento presencial, relatório de
  inadimplência (RF05–RF08).
- **Acceptance Criteria:** Diretoria vê lista de inadimplentes com tempo de atraso e valor devido.
- **Validation Steps:** Teste manual contra `relatorio-inadimplencia.json`.
- **Notes:** `src/features/mensalidades/` (types + hooks) e duas superfícies: `/mensalidades`
  (relatório de inadimplência sempre disponível + botões "Gerar cobranças do mês" e "Processar
  inadimplência" para gatilho manual dos jobs que também rodam via cron no backend) e um card
  "Mensalidades" injetado na página de detalhe do associado (`/associados/[id]`, só quando
  `status === "ativo"`, já que só associados ativos recebem cobrança) com histórico + botão
  "Lançar pagamento" por linha pendente/inadimplente. Novo helper `src/lib/format.ts`
  (`formatarMoeda`/`formatarData`, `Intl.NumberFormat`/`toLocaleDateString` pt-BR) — primeiro
  lugar no frontend que precisou formatar moeda/data, deve ser reaproveitado dali em diante.
  Validado com `npm run build`, `npm run lint` e teste manual ponta a ponta contra o backend real
  (gerou cobrança do mês, forçou uma mensalidade vencida direto no banco, processou inadimplência,
  conferiu o relatório e o card do associado com os badges e valores corretos, lançou pagamento
  presencial e confirmei a mudança de status via API).

#### Ticket: T-FE-005 Croqui de Salão (editor visual de mesas)
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Editor para posicionar mesas (x/y) em um croqui reutilizável, com validação de
  numeração duplicada.
- **Acceptance Criteria:** Diretoria cria um croqui com N mesas posicionadas e reutiliza em mais de
  um evento.
- **Validation Steps:** Teste manual contra `croqui-salao.json`.
- **Notes:** Acabou mais simples do que a nota original previa. `src/features/saloes/` (types +
  hooks) e 3 rotas: `/saloes` (lista em cards), `/saloes/novo` (form), `/saloes/[id]` (mapa +
  form de adicionar mesa). `MesaCanvas` (`src/features/saloes/mesa-canvas.tsx`) é um plano
  cartesiano simples (640×420, sem imagem de planta baixa de fundo — pendência em aberto do
  fluxo, não implementada) que posiciona mesas por `posicaoX`/`posicaoY` em pixels; clicar no
  canvas preenche X/Y no formulário abaixo via `setValue`, evitando digitar coordenadas na mão.
  Validação de numeração duplicada é 100% do backend (409) — o front só traduz em mensagem de
  erro. Validado com `npm run build`, `npm run lint` e teste manual ponta a ponta (criei salão +
  3 mesas via API, confirmei 409 em número duplicado, conferi o canvas renderizando as 3 mesas
  nas posições certas). Achado no caminho, não bug desta tela mas de convenção geral: campos
  numéricos com `z.coerce.number()` exigem tipar `useForm` com os três genéricos
  (`<Input, unknown, Output>`) para o TypeScript aceitar o resolver — documentado no README como
  padrão a seguir nas próximas telas com número (eventos, ingressos).

#### Ticket: T-FE-006 Cadastro/Publicação de Evento
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Formulário de evento com vínculo opcional a croqui, preço/disponibilidade por evento,
  fluxo rascunho → publicado.
- **Acceptance Criteria:** Evento publicado fica visível para reserva/compra pelos associados.
- **Validation Steps:** Teste manual contra `evento.json`.
- **Notes:** `src/features/eventos/` (types + hooks) e 3 rotas: `/eventos` (lista), `/eventos/novo`
  (form: nome/data/local/descrição + `Select` opcional de croqui via `useSaloes`), `/eventos/[id]`
  (detalhe: badge de status + botão "Publicar" só em rascunho, card condicional "Mesas do croqui
  vinculado" só quando o evento tem `salaoId`, form de "Ingresso avulso" sempre visível). O card de
  mesas busca o croqui completo (`useSalao`), funde com `configuracoesMesa` já salvas (`Map` por
  `mesaId`) e popula o form via `useFieldArray` + `reset()` num `useEffect` disparado só por
  `salaoData`; submit reenvia a lista inteira (replace-all, igual ao `PUT /eventos/:id/mesas` do
  backend). Achado no caminho: o componente `Checkbox` do shadcn (`base-ui`) usa
  `checked`/`onCheckedChange` controlados, não é compatível com `register()` do react-hook-form —
  precisa de `Controller` (mesmo motivo já documentado para o `Select`). Validado com `npm run
  build`, `npm run lint` e teste manual ponta a ponta contra o backend real: criei croqui + 2 mesas
  e um evento vinculado via API, abri `/eventos` e `/eventos/[id]` no navegador (headless) para
  conferir o form pré-preenchido com os defaults, configurei preço/bloqueio das mesas e o ingresso
  avulso via API, recarreguei a página e confirmei que preço, checkbox "Bloqueada" e os campos de
  ingresso refletem o estado salvo, publiquei e confirmei o badge "Publicado" (sem botão Publicar)
  e a presença do evento em `GET /eventos/publicados`.

#### Ticket: T-FE-007 Mapa de Mesas e Reservas (visão da diretoria)
- **Priority:** Must
- **Status:** Todo
- **Owner:** Unassigned
- **Scope:** Visualização do croqui do evento com status de cada mesa (livre/reservada/pendente),
  registro de reserva mediada, cancelamento/transferência.
- **Acceptance Criteria:** Duas mesas reservadas simultaneamente por engano nunca ficam visualmente
  como "livres" ao mesmo tempo (reflete a checagem de concorrência do backend).
- **Validation Steps:** Teste manual contra `reserva-mesa.json` e
  `cancelamento-transferencia-reserva.json`.
- **Notes:**

#### Ticket: T-FE-008 Emissão e Check-in de Ingresso
- **Priority:** Must
- **Status:** Todo
- **Owner:** Unassigned
- **Scope:** Venda presencial de ingresso (sócio/visitante), leitura de QR + check-in manual.
- **Acceptance Criteria:** Ingresso já usado é sinalizado claramente na tentativa de reuso.
- **Validation Steps:** Teste manual contra `emissao-ingresso.json`.
- **Notes:**

### Mobile (App do Associado)

#### Ticket: T-MOB-001 Autenticação e onboarding
- **Priority:** Must
- **Status:** Todo
- **Owner:** Unassigned
- **Scope:** Login, auto-cadastro (RF01 canal associado), tela inicial com status do associado.
- **Acceptance Criteria:** Associado com CPF já cadastrado pela diretoria consegue vincular sua
  conta; novo associado consegue se auto-cadastrar.
- **Validation Steps:** Teste manual dos dois canais de entrada descritos em
  `cadastro-associado.json`.
- **Notes:**

#### Ticket: T-MOB-002 Mensalidade — pagamento e histórico
- **Priority:** Must
- **Status:** Todo
- **Owner:** Unassigned
- **Scope:** Ver mensalidade atual, pagar via app (gateway), ver histórico e comprovantes.
- **Acceptance Criteria:** Pagamento aprovado no gateway reflete no status em até alguns segundos
  (RNF05).
- **Validation Steps:** Teste manual com gateway em modo sandbox.
- **Notes:**

#### Ticket: T-MOB-003 Minhas Reservas (RF13)
- **Priority:** Must
- **Status:** Todo
- **Owner:** Unassigned
- **Scope:** Lista de reservas de mesa e ingressos do associado logado.
- **Acceptance Criteria:** Lista reflete status atualizado (reservada/cancelada/transferida).
- **Validation Steps:** Teste manual após operações feitas pelo painel web.
- **Notes:** Tela de consulta simples (sem fluxograma dedicado, ver `decisoes.md`). Backend pronto
  via T-BE-012: `GET /reservas/minhas` (associado autenticado). Cobre reservas de mesa; ingressos
  do associado ainda não têm endpoint equivalente (fora do escopo de T-BE-012) — se este ticket
  for pego, avaliar se cria esse endpoint junto ou se a tela cobre só reservas por enquanto. Só
  funciona para associados que se auto-cadastraram (têm `usuarioId` vinculado) — associados
  cadastrados pela diretoria ainda não têm login próprio, ver nota em T-BE-012.

#### Ticket: T-MOB-004 Reserva de Mesa e Compra de Ingresso pelo app
- **Priority:** Must
- **Status:** Todo
- **Owner:** Unassigned
- **Scope:** Ver eventos publicados, solicitar reserva de mesa, comprar ingresso avulso, pagar
  online.
- **Acceptance Criteria:** Mapa de mesas no app reflete disponibilidade em tempo real (RF14).
- **Validation Steps:** Teste manual contra `reserva-mesa.json` e `emissao-ingresso.json`.
- **Notes:**

#### Ticket: T-MOB-005 Notificações (lembrete de inadimplência, confirmações)
- **Priority:** Should
- **Status:** Todo
- **Owner:** Unassigned
- **Scope:** Push notification para lembrete automático de mensalidade em atraso e confirmações de
  reserva/compra.
- **Acceptance Criteria:** Associado recebe notificação ao entrar em `Status: Inadimplente`.
- **Validation Steps:** Teste manual disparando o job de lembrete do backend.
- **Notes:**

## 8. Perguntas em Aberto

1. **Prazo do lembrete de inadimplência**: quantos dias após o vencimento o sistema dispara o
   lembrete automático? (mesma pendência #9 de `decisoes.md`) — bloqueia o ajuste fino de
   `T-BE-006`, mas não bloqueia o desenvolvimento (usar valor configurável).
2. **Titular de reserva transferida**: precisa ser associado cadastrado ou pode ser qualquer pessoa?
   (pendência #10 de `decisoes.md`) — afeta `T-BE-010`.
3. **Gateway de pagamento**: qual provedor concreto será usado (Stripe, Mercado Pago, PagSeguro
   etc.)? Decisão técnica, não bloqueante graças à porta abstrata de `T-BE-011`, mas precisa ser
   fechada antes da integração real.
4. **RF03 (status do associado)**: vale mapear como fluxograma dedicado antes de implementar
   `T-BE-003`, dado que envolve regra de quem pode suspender e efeito sobre mensalidades pendentes?
   Ainda não decidido pelo usuário.
5. **Sistema(s) existente(s) na entidade**: as respostas às contra-perguntas em
   `contraperguntas_sistemas.docx` (ainda não recebidas) podem mudar requisitos de migração/importação
   de dados — não assumir migração automática até essa resposta chegar.
6. **Ambiente de hospedagem/deploy do MVP**: onde o backend, o painel web e o build do app serão
   hospedados para a sessão de avaliação com o Pia do Sul? Não definido ainda.

## 9. Log de Problemas Descobertos

> _Novos problemas devem ser adicionados aqui com data e contexto breve._
