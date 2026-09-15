# Planejamento Geral — Ecossistema Digital para Gestão de Associados e Eventos

> Fonte de verdade do projeto de software do TCC. Este documento orienta as decisões de
> implementação; os planejamentos específicos (`frontend-web/PLANEJAMENTO.md`,
> `backend/PLANEJAMENTO.md`, `mobile/PLANEJAMENTO.md`) detalham cada frente e devem se manter
> coerentes com este arquivo. Escopo, terminologia e decisões travadas seguem
> `PROJETO-TCC/instrucoes_base.md` e o `CLAUDE.md` da raiz do repositório. Os fluxos de negócio
> mapeados (base do backlog abaixo) estão em `TCC-FINAL/arquitetura/fluxos/` e o rastreamento de
> cobertura RF/RNF em `TCC-FINAL/arquitetura/decisoes.md`.

## 1. Visão Geral

Construir um ecossistema digital — painel web administrativo + aplicativo mobile para associados,
com o nome **Pampa Gestão** — que digitalize a gestão de associados, mensalidades e eventos sociais
(bailes e fandangos) de entidades tradicionalistas gaúchas. Desde 2026-09-15 (achado de uma segunda
entrevista, com o CTG Sentinela da Querência, convergindo fortemente com a do Pia do Sul), o produto
é desenhado como reutilizável entre entidades — não sob medida pra uma única — e validado como
**estudo de casos múltiplos** com duas entidades parceiras: o **CPF Pia do Sul** e o **CTG Sentinela
da Querência** (ambos Santa Maria/RS, 13ª RT). Isso não é multi-tenant (ver §2) — cada entidade roda
sua própria instância/banco no mesmo código-base; o que muda é que a marca do produto na UI é
genérica ("Pampa Gestão", não o nome de uma entidade específica) e o modelo de dados já era, antes
disso, desacoplado o bastante (categorias de sócio configuráveis N×N, por exemplo) pra não exigir
retrabalho nessa mudança de enquadramento.

Sucesso, para efeito deste projeto, significa: um MVP funcional cobrindo os requisitos Must/Should
do artigo (ver §7 Backlog), avaliado com a diretoria e associados reais das duas entidades parceiras
via SUS + entrevista/observação, produzindo resultados que sustentem o capítulo de Resultados e
Discussão do TCC até o prazo de 2026-06-19.

O sistema não substitui o julgamento humano da diretoria — os fluxos são majoritariamente
**mediados pela entidade** (RNF01), refletindo o nível de familiaridade digital heterogêneo do
público. As duas entrevistas escritas (Pia do Sul em 2026-08-11, Sentinela da Querência depois)
mostram que esse perfil varia por entidade — não é uma constante do público-alvo: o Pia do Sul
relatou diretoria leiga e confiança nos associados; o Sentinela da Querência espera um colaborador
contratado e instruído operando o painel, mas antecipa dificuldade de acesso pelos associados. RNF01
segue como diretriz porque cobre os dois perfis (fluxo mediado sempre disponível, nunca a única
opção), não porque assume um único perfil de usuário leigo universal.

## 2. Não Objetivos (Non Goals)

- Integração institucional com CIT/MTG (Conselho/Movimento Tradicionalista Gaúcho).
- Suporte a outros tipos de evento além de bailes/fandangos (ex.: rodeios, provas campeiras).
- Processamento ou armazenamento direto de dados sensíveis de pagamento (cartão) — pagamentos
  online passam por gateway terceirizado; o sistema guarda apenas status/referência da transação.
- Totem físico de autoatendimento (pedido levantado na entrevista, fora do escopo do MVP).
- Tema escuro (dark mode) no frontend administrativo — pode ser considerado pós-MVP, não é meta do
  system design atual.
- Multi-tenant (suporte a múltiplas entidades compartilhando a mesma implantação/banco ao mesmo
  tempo) — o MVP é validado com duas entidades parceiras, mas cada uma em sua própria
  implantação/banco isolados (mesmo código-base); arquitetura deve ser desacoplada o suficiente para
  não impedir multi-tenant real no futuro, mas não é entregável agora.

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

- [x] Todos os requisitos **Must** do artigo (RF01, RF03, RF04\*, RF05, RF06, RF09, RF10, RF11,
      RF12, RF13, RNF01, RNF02, RNF03) estão implementados e testados manualmente contra o fluxo
      correspondente em `TCC-FINAL/arquitetura/fluxos/`. Concluído em 2026-08-29 com T-MOB-004
      (RF11/RF12/RF14 pelo app) — todos os T-BE-*/T-FE-*/T-MOB-* Must do backlog estão Done.
      \* RF04 é Should no artigo, mas depende do mesmo fluxo de RF01 — tratado junto.
- [ ] Requisitos **Should** priorizados (RF02, RF07, RF08, RF14, RNF04, RNF05) implementados na
      medida em que o tempo do cronograma permitir; os que ficarem de fora devem ser documentados
      como limitação no TCC, não silenciados. RF02/RF08/RF14 Done; RF07 implementado e permissão
      de push confirmada num device real, mas token ainda pendente de credencial FCM/Firebase
      (T-MOB-005 — ver adendo 2026-08-30 no ticket); RNF04 Done (T-BE-013 — auditoria completa dos
      55 endpoints com `@ApiOperation`/`@ApiResponse` e exemplos em `@ApiProperty`, ver nota do
      ticket); RNF05 (resposta <2s) nunca medido formalmente.
- [x] RF15 (Could) implementado — `cancelamento-transferencia-reserva.json`, T-BE-010 Done.
- [x] Backend com migrations versionadas rodando localmente a partir de zero (`docker compose up` +
      `npm run migration:run`) sem passos manuais não documentados — 11 migrations, todas testadas
      nesta sessão.
- [x] API documentada via Swagger, cobrindo todos os endpoints usados pelo web e pelo mobile —
      T-BE-013 concluído: 55 rotas nos 10 controllers com `@ApiOperation`/`@ApiResponse`
      (sucesso + todos os erros observados nos use cases/e2e) e exemplos em `@ApiProperty`;
      `/api/docs-json` conferido manualmente.
- [x] Painel web navegável de ponta a ponta pelos fluxos Must, aplicando o Design System
      (`frontend-web/DESIGN-SYSTEM.md`) — T-FE-001 a T-FE-008 concluídos e verificados ponta a
      ponta contra o backend real; checkup visual de responsividade/consistência feito em
      2026-08-29 (ver nota em T-FE-008 e commit correspondente).
- [x] App mobile instalável (build Expo Go ou APK/TestFlight interno) cobrindo os fluxos do
      associado (consulta de reservas, pagamento de mensalidade, compra de ingresso). Concluído em
      2026-08-30: projeto `@ogarciia/pia-do-sul` criado no EAS, build Android `preview` (APK,
      assinado com keystore local em `mobile/keystores/`, fora do controle de versão) gerado com
      sucesso via `eas build` — instalado e testado num emulador Android real (fluxo completo de
      T-MOB-004 reproduzido de ponta a ponta, ver adendo em T-MOB-004). APK independente de Metro,
      pronto pra instalar em qualquer Android via o link de build do EAS. iOS/TestFlight fora de
      escopo por ora (sem Mac disponível neste ambiente de dev).
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

  **Adendo 2026-08-31 (isenção de mensalidade):** regra de negócio real de entidades
  tradicionalistas gaúchas (categorias como benemérito/honorário não pagam mensalidade) nunca
  tinha sido modelada — passou batido tanto no artigo quanto nos fluxos mapeados (ver adendo em
  `decisoes.md` § Controle de Mensalidade). `CategoriaSocio` ganha `isenta: boolean` (migration
  `AddIsentaToCategoriasSocio`); `GerarCobrancasMensaisUseCase` pula por completo o associado
  cuja categoria é isenta, sem gerar cobrança de valor zero. `CriarCategoriaSocioDto` faz
  `valorMensalidade` obrigatório apenas quando `isenta` não é `true` (`@ValidateIf`); o use case
  força `valorMensalidade = 0` server-side quando isenta, nunca confia no que o cliente mandou.
  2 casos novos em `mensalidades.e2e-spec.ts`, suíte completa em 50/50.

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
- **Adendo (edição de evento e consulta de preços por perfil):** pré-requisito pro redesenho da
  tela de evento (ver adendo em T-FE-006) — faltavam dois endpoints. `PATCH /eventos/:id`
  (`AtualizarEventoUseCase`) — não existia nenhum jeito de editar nome/data/local/descrição/salão
  depois de criado, só criar (POST) e publicar; mesma validação de salão do `CriarEventoUseCase`
  (404 se `salaoId` informado não existe). `GET /eventos/:eventoId/precos-ingresso`
  (`ConsultarPrecosIngressoUseCase`, módulo de ingressos) — só existia o `PUT` pra definir preço
  por perfil (`DefinirPrecoPadraoUseCase`/`DefinirPrecoPorEventoUseCase`), nunca um jeito de
  consultar o que já estava configurado; resolve com o mesmo método já usado de fato na emissão
  (`PrecoIngressoRepositoryPort.resolverPreco()` — override do evento, senão o padrão da entidade,
  senão `null`), só que pros 3 perfis de uma vez. Validado com `npm run build` e `npm run
  test:e2e`. Achado no caminho, sem relação com este adendo: boa parte da suíte e2e (Reservas,
  Ingressos, Mensalidades) começou a estourar de forma consistente (não esporádica) o timeout
  padrão de 5s do Jest em hooks/testes com muitas requisições sequenciais contra o Postgres remoto
  (Neon) usado em dev/teste — timeout aumentado (15-30s conforme o volume de chamadas) nos
  hooks/testes específicos que precisavam; suíte completa (59/59) passa de forma consistente
  agora.

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
- **Adendo (preço de sócio por categoria):** pedido do usuário depois do preço "sócio" único ter
  sido exposto na UI pela primeira vez (ver adendo em T-FE-006) — a ideia sempre foi variar o
  preço por categoria de sócio (Contribuinte, Benemérito etc.), não um valor fixo pra "sócio"
  igual pra todo mundo; nao_socio/crianca continuam com um preço só (não têm categoria).
  `PrecoIngresso` ganha `categoriaSocioId` nullable (migração
  `1756100000000-AddCategoriaSocioIdToPrecosIngresso`) — preenchido só quando `perfil = SOCIO`,
  validado nos use cases (`DefinirPrecoPadraoUseCase`/`DefinirPrecoPorEventoUseCase`: 400 sem
  categoria informada quando perfil é sócio, 404 se a categoria não existe — mesma checagem via
  `CategoriaSocioRepositoryPort.buscarPorId`, já exportado por `AssociadosModule` e importado por
  `IngressosModule` desde antes). `EmitirIngressoUseCase` passa a exigir `categoriaSocioId` pra
  perfil sócio, tanto na venda presencial (`EmitirIngressoDto`, escolhida por quem está vendendo)
  quanto na compra pelo app (`ComprarMeuIngressoUseCase` usa a categoria já cadastrada do
  associado — recusa com 400 se o associado não tiver categoria definida). `resolverPreco` e o
  upsert interno do adapter passam a incluir `categoriaSocioId` na chave de busca (`IsNull()`
  quando não se aplica, senão duas linhas com perfil sócio e categorias diferentes colidiriam).
  `ConsultarPrecosIngressoUseCase` reescrito: em vez de um valor por perfil, resolve um preço por
  categoria cadastrada (busca todas via `CategoriaSocioRepositoryPort.listarPaginado`, resolve o
  preço de cada uma) mais os dois valores fixos (`naoSocio`, `crianca`). Validado com `npm run
  build` e `npm run test:e2e` (60/60, um teste novo: recusa emitir ingresso de sócio sem
  categoria).
- **Adendo (remoção do "preço de vitrine"):** achado numa conversa com o usuário revisando o texto
  da tela de evento — até então `ConfiguracaoIngressoEvento` (T-BE-007) guardava um `preco` próprio
  ("preço de vitrine", mostrado no app antes de comprar) que nunca era o valor de fato cobrado
  (`EmitirIngressoUseCase` sempre resolve via `PrecoIngressoRepositoryPort.resolverPreco`, ignorando
  esse campo); os dois podiam divergir e confundir o associado. Coluna `preco` removida de
  `configuracoes_ingresso_evento` (migração
  `1756200000000-RemovePrecoFromConfiguracaoIngressoEvento`) — a entidade agora só controla
  `quantidadeDisponivel`. Novo endpoint `GET /eventos/:eventoId/meu-preco-ingresso` (só
  `Perfil.ASSOCIADO`, `ConsultarMeuPrecoIngressoUseCase`) resolve o preço efetivo do associado
  logado (perfil sócio, pela categoria dele) pra ser mostrado no lugar do preço de vitrine. Validado
  com `npm run build` e `npm run test:e2e` (60/60).

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
  **Adendo 2026-08-29 (T-MOB-003):** `GET /reservas/minhas` devolvia `Reserva` crua
  (`eventoId`/`mesaId` como UUID solto) — inútil pra exibir numa lista pro associado no app.
  `ListarMinhasReservasUseCase` passou a enriquecer cada reserva com `evento` (id/nome/data/local)
  e `mesa` (id/numero) via `EventoRepositoryPort`/`MesaRepositoryPort` (já exportados por
  `EventosModule`, nenhuma mudança de módulo necessária). Teste e2e existente atualizado pra
  conferir a nova forma; validado de novo com `npm run test:e2e` (ainda 40 testes, nenhum novo,
  só a asserção mudou de forma).

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

#### Ticket: T-BE-013 Documentação Swagger completa (RNF04)
- **Priority:** Should
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Anotar todos os endpoints com DTOs, exemplos e códigos de erro no Swagger.
- **Acceptance Criteria:** `/api/docs` lista 100% dos endpoints usados pelo web e mobile.
- **Validation Steps:** Checklist manual comparando endpoints implementados x documentados.
- **Notes:** Auditados e anotados os 10 controllers (`associados`, `categorias-socio`, `eventos`,
  `saloes`, `health`, `auth`, `ingressos`, `mensalidades`, `reservas`, `notificacoes`) — 55 rotas no
  total, todas agora com `@ApiOperation({ summary })` em português descrevendo o que o endpoint
  faz de fato (lido a partir do use case, não só do nome da rota) e `@ApiResponse` para o status de
  sucesso (200/201/204) mais todo status de erro que o use case realmente lança: 401 nas rotas com
  `JwtAuthGuard`, 403 nas restritas por `@Roles`/checagem de propriedade (`ForbiddenException`,
  como em `ResolverMinhaMensalidadeUseCase`), 404 para `NotFoundException` (associado/evento/
  mensalidade/reserva não encontrados), 409 para `ConflictException` (CPF duplicado, mesa já
  reservada, ingressos esgotados, conta já vinculada) e 400 para `BadRequestException`/validação —
  cada combinação foi cruzada com o e2e correspondente (`test/*.e2e-spec.ts`) para confirmar que o
  comportamento é realmente observado, não só teórico. Também adicionado `example:` a todo
  `@ApiProperty()` que ainda não tinha (DTOs de associados, eventos/salões, ingressos, reservas,
  login) com valores realistas do domínio (CPF de 11 dígitos, datas ISO, enums com o valor exato
  usado no banco, preços em formato decimal). Nenhuma lógica de negócio, guard, rota ou validação
  foi alterada — mudança puramente aditiva de decoradores Swagger. Validado com `npm run build`
  (limpo), `npm run lint` (limpo, `eslint --fix` reformatou alguns blocos multi-linha via
  Prettier) e `npm run test:e2e` (48/48 passando, mesmo total de antes). Spot-check manual do
  `/api/docs-json`: JSON parseia com 49 paths, `GET /associados` retorna summary + responses
  `[200,401,403]`, `POST /eventos/{eventoId}/mesas/{mesaId}/reservar-minha` retorna summary +
  responses `[201,400,401,403,404,409]`, `GET /mensalidades/minhas` retorna summary + responses
  `[200,401,403,404]` — todas com mais do que o 200 default do Nest.

#### Ticket: T-BE-014 Vincular conta de associado mediado (RF01, canal associado)
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Fecha a lacuna registrada em T-BE-012: associado com cadastro mediado pela diretoria
  (sem `usuarioId`) precisa conseguir criar login e se vincular ao próprio cadastro pelo app —
  bloqueava a Acceptance Criteria de T-MOB-001 ("associado com CPF já cadastrado pela diretoria
  consegue vincular sua conta").
- **Acceptance Criteria:** Associado mediado consegue criar conta (e-mail+senha) informando o CPF
  já cadastrado e depois se autenticar normalmente; CPF não encontrado dá 404; cadastro que já tem
  conta vinculada dá 409 (não permite hijack/duplicidade).
- **Validation Steps:** Teste de integração cobrindo cadastro mediado→vincular-conta→login→"me".
- **Notes:** `POST /associados/vincular-conta` (rota pública, mesmo motivo do auto-cadastro: quem
  ainda não tem conta não tem token) — `VincularContaAssociadoUseCase` busca o Associado por CPF,
  recusa se não existir (404) ou se já tiver `usuarioId` (409), cria o `Usuario` via
  `UsuarioRepositoryPort`/`PasswordHasherPort` (mesmo caminho do auto-cadastro) e atualiza
  `associados.usuario_id` — nenhuma migration nova, `AtualizacaoAssociado.usuarioId` já existia.
  Cadastro mediado nasce sempre Ativo, então não há fila de aprovação a repetir aqui (diferente do
  auto-cadastro). Também corrigida uma colisão de numeração pré-existente: havia dois tickets
  "T-BE-012" no backlog (o de vínculo Usuario↔Associado e o de Swagger) — o de Swagger foi
  renumerado para T-BE-013 e este ficou como T-BE-014. Validado com `npm run build`, `npm run
  lint` e `npm run test:e2e` (40 testes no total; 3 novos: vincular-conta com sucesso+login+"me",
  404 para CPF inexistente, 409 para cadastro já vinculado).

#### Ticket: T-BE-015 Gestão de contas de administrador
- **Priority:** Should
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Endpoint pra criar uma nova conta de administrador pela própria aplicação.
- **Acceptance Criteria:** Administrador autenticado consegue criar outra conta administrador
  informando e-mail+senha; a conta criada consegue logar em seguida; e-mail duplicado dá 409;
  associado não consegue criar (403); sem token dá 401.
- **Validation Steps:** Teste de integração cobrindo criação→login com a conta nova.
- **Notes:** Identificado numa conversa com o usuário — RNF02 previa RBAC/perfis
  (administrador/associado), mas nunca a gestão de contas em si. Até esta ticket, a única forma de
  existir uma conta administrador era o script `seed-admin.ts` (rodado manualmente, direto no
  banco) — sem nenhum endpoint pra conceder acesso administrativo pela aplicação. `POST
  /auth/usuarios` (`@Roles(ADMINISTRADOR)`) via `CriarAdministradorUseCase`, mesmo padrão de
  `AutoCadastrarAssociadoUseCase` (checa e-mail duplicado, hasheia senha, `UsuarioRepositoryPort.
  salvar`) — cria só `Usuario`, sem `Associado` associado, porque contas de associado sempre
  nascem junto de um Associado (auto-cadastro ou vincular-conta), nunca soltas. O já existente
  `GET /auth/usuarios` (existia desde T-BE-002, nunca tinha UI consumindo) passa a alimentar a
  tela nova. 3 casos novos em `auth.e2e-spec.ts`, suíte completa em 53/53, build/lint limpos.

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
- **Adendo (breadcrumb compartilhado):** pedido do usuário — a tela `/eventos/novo` tinha só um
  `<h1>` "flutuando sozinho" (depois de remover um subtítulo tipo tutorial, ver adendo em T-FE-006),
  e algumas telas aninhadas do painel já inventavam cada uma o seu próprio jeito de indicar "de onde
  vim" (um link solto "← Associados", "← {nome do evento}" etc.), inconsistente e sem mostrar o
  caminho completo quando havia mais de um nível (ex.: emissão de ingressos, dois níveis abaixo de
  Eventos). Criado `src/components/breadcrumb.tsx` (`Breadcrumb`, recebe uma lista de `{label,
  href?}` — o último item, sem `href`, é a página atual) e aplicado nas 11 telas aninhadas do
  painel: `eventos/novo`, `eventos/[id]`, `eventos/[id]/ingressos`, `eventos/[id]/mapa`,
  `associados/novo`, `associados/[id]`, `associados/categorias`, `associados/categorias/novo`,
  `saloes/novo`, `saloes/[id]`, `usuarios/novo` — substituindo todo link "← X" ad hoc encontrado.
  Telas de listagem no primeiro nível (`/eventos`, `/associados`, `/saloes`, `/usuarios`,
  `/mensalidades`, `/`) não ganham breadcrumb — a barra lateral já indica a seção atual, não têm
  "pai" acima delas na navegação. Validado com `npm run build`, `npm run lint` e screenshot headless
  logado de três telas com profundidades diferentes (`eventos/novo`: 2 níveis,
  `associados/categorias/novo`: 3 níveis, `usuarios/novo`: 2 níveis).
- **Adendo (largura padronizada, sem margens laterais mortas):** pedido do usuário — telas de
  listagem (`/eventos`, `/associados` etc.) já ocupavam a largura inteira do conteúdo, mas toda
  "subtela" (detalhe/cadastro) usava `mx-auto w-full max-w-{3xl,5xl,lg}`, centralizando o conteúdo e
  deixando cantos vazios nas laterais em monitores largos — inconsistente com as listagens.
  Removido o wrapper `mx-auto w-full max-w-*` das 10 telas afetadas (todas as 11 da lista de
  breadcrumb acima, exceto `associados/categorias` que já não tinha), alinhando o padrão ao das
  listagens (`<div className="space-y-N">`, sem limite de largura). Ressalva encontrada depois de
  aplicar direto em tudo: nas 3 telas de formulário de coluna única (`usuarios/novo`, `saloes/novo`,
  `associados/categorias/novo`) isso esticava os campos de input a quase 1300px de largura — ruim,
  não é "aproveitar o espaço", é só feio. Corrigido com um `max-w-lg` direto no `Card` dessas 3
  telas (o container da página continua full-width e alinhado à esquerda, sem a margem morta
  reclamada; só o cartão do formulário em si fica com uma largura de leitura razoável). Achado no
  caminho, não relacionado à mudança em si: um erro anterior desta sessão (ver adendo abaixo) deixou
  o cache do Turbopack corrompido a ponto de retornar 500 em `/associados/novo` e servir HTML/CSS
  desatualizado mesmo após `npm run build` limpo — resolvido matando o processo do `next dev` e
  apagando `.next` de novo antes de reiniciar. **Lição de processo:** nunca apontar o
  `--user-data-dir` de um Chrome/Edge headless de verificação para dentro de um diretório que o
  Turbopack está observando (ex.: `frontend-web/.tmp-cdp/`) — o watcher tenta ler os arquivos de
  sessão do navegador, um deles fica bloqueado enquanto o navegador está aberto, e um build
  concorrente derruba com `TurbopackInternalError` (arquivo em uso, os error 32), corrompendo o
  cache em disco para builds seguintes também. Perfil do navegador de verificação passa a ficar
  sempre fora do repositório (no diretório de scratchpad da sessão). Validado com `npm run build`,
  `npm run lint` e screenshot headless logado das 3 telas de coluna única mais uma de duas colunas
  (`eventos/[id]`), após restart limpo do `next dev`.

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

  **Adendo 2026-08-31 (categorias de sócio nunca tinham tela própria):** bug real reportado pelo
  usuário — o `Select` de categoria em `/associados/novo` sempre aparecia vazio, porque
  categorias só tinham sido criadas via API direta em teste manual, nunca existiu UI pra isso.
  Corrigido com uma tela dedicada `/associados/categorias` (lista + formulário de criação inline,
  não modal — pedido explícito do usuário) e, junto, o suporte a isenção de mensalidade (ver
  adendo em T-BE-005 e em `decisoes.md`): checkbox "isenta" desabilita/ignora o campo de valor,
  categoria isenta aparece como badge "Isenta" em vez do valor na tabela.

  Sidebar (`AppShell`) ganhou dois refinamentos pedidos junto: (1) cada item de navegação (antes
  só texto) ganhou um ícone `lucide-react`; (2) "Associados" virou um grupo expansível (chevron,
  abre sozinho quando a rota atual já está dentro dele) com dois subitens — "Sócios" (`/associados`,
  tela existente) e "Categorias" (`/associados/categorias`, tela nova). Sidebar colapsada (ver
  T-FE refinamento de 2026-08-30) não tenta renderizar um flyout de submenu — o ícone do grupo
  vira atalho direto pra "Sócios". Validado com `npm run build`/`npm run lint` (limpos) e teste
  manual ponta a ponta contra o backend real: categoria paga e categoria isenta criadas com
  sucesso, isenção confirmada não gerando mensalidade (checado direto no banco), navegação
  sidebar → tela nova funcionando. Achado no caminho (só de tooling, não da aplicação): testar um
  `Checkbox` do base-ui via clique sintético precisa mirar o `span[role="checkbox"]` visível, não
  o `<input>` nativo (`aria-hidden`, 1×1px) que ele esconde por trás.

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
- **Adendo (QA — cadastro/edição de croqui "completamente quebrado"):** pedido do usuário pra fazer
  QA na tela; achados reproduzidos ao vivo (headless, logado), do pior pro mais cosmético:
  1. Clicar no croqui não dava feedback nenhum ali — só atualizava os campos Posição X/Y do
     formulário abaixo, sem marcador nenhum no próprio croqui. Corrigido com um marcador tracejado
     (`posicaoPendente` em `MesaCanvas`) que aparece na hora, no ponto clicado, até a mesa ser de
     fato salva.
  2. Impossível editar ou excluir uma mesa depois de criada — só existia `POST`, nunca
     `PATCH`/`DELETE`, nem na API nem na UI. Um clique errado era permanente.
  3. Clicar em cima de uma mesa já existente não selecionava nada — só preparava silenciosamente
     uma mesa *nova* nas mesmas coordenadas (número seguinte, validado, mas posição sem checagem
     nenhuma), deixando fácil empilhar mesas exatamente uma em cima da outra sem aviso.
  4. Warning real de console ("Base UI: A component is changing the default value state of an
     uncontrolled FieldControl after being initialized") — causado por um `defaultValue={...}` do
     DOM lado a lado com `register()` do react-hook-form no campo "Número da mesa" (dois
     mecanismos definindo o valor inicial do mesmo input). Resolvido tirando o `defaultValue` e
     deixando só `defaultValues`/`reset()` do RHF controlar isso, como os outros campos já faziam.
  5. Canvas marcado `role="button"` mas sem `onKeyDown` — não dava pra operar por teclado apesar
     de se anunciar como elemento interativo pro leitor de tela.

  Resolvido com endpoints novos `PATCH /saloes/:id/mesas/:mesaId` e
  `DELETE /saloes/:id/mesas/:mesaId` (`AtualizarMesaUseCase`/`RemoverMesaUseCase`, backend).
  Editar nunca tem restrição — capacidade é só informativa no mapa de mesas
  (`ConsultarMapaMesasUseCase`), nunca entra em validação de reserva. Excluir é bloqueado (409) se
  a mesa já aparece em alguma `reserva` ou `configuracao_mesa_evento` — as duas FKs são
  `ON DELETE CASCADE` (ver migrations `CreateReservasTable`/`CreateEventosTables`), então deletar
  direto apagaria histórico de verdade; a checagem faz uma consulta direta nessas duas tabelas a
  partir do adapter de mesa (em vez de injetar `ReservaRepositoryPort` no módulo `eventos`, que
  criaria um ciclo — `reservas` já importa `eventos`, não o contrário). Mesa sem uso nenhum pode
  ser excluída livremente; isso não conflita com a pendência já documentada acima ("mover/remover
  mesa de um croqui já usado com reservas" — essa pergunta continua em aberto, mas nunca bloqueou
  excluir uma mesa que nunca teve reserva nenhuma).

  `MesaCanvas` ganhou `onMesaClick` (mesa existente abre pra editar, com `stopPropagation` pra não
  disparar `onCanvasClick` também) e `mesaSelecionadaId` (realce visual da mesa em edição). A tela
  `/saloes/[id]` unificou os dois modos num só formulário — "Adicionar mesa" vira
  "Editar mesa N" com botões "Excluir mesa" (`AlertDialog` de confirmação, chamando
  `DELETE`) e "Cancelar edição" quando uma mesa está selecionada. Achado em teste manual depois do
  fix: excluir uma mesa editada deixava o campo "Capacidade" com o número antigo (`reset()` com
  `capacidade: undefined` não limpa um input que já teve valor digitado pelo usuário) — trocado
  por `""` explícito. Texto "X mesa(s) cadastrada(s)" (nunca pluralizava de verdade) trocado por
  uma função de pluralização de verdade.

  Validado com `npm run test:e2e` (backend, 62/62, 2 testes novos: editar bloqueando número
  duplicado e 404 pra mesa inexistente, excluir com sucesso e recusar quando em uso) e
  `npm run build`/`npm run lint` (frontend), mais teste manual ponta a ponta headless: criei mesa,
  vi o marcador de prévia aparecer no clique, editei capacidade/posição, excluí (mesa sumiu do
  croqui, texto voltou pra "Nenhuma mesa cadastrada"), e confirmei via API+UI que excluir uma mesa
  já vinculada a um evento é recusado com a mensagem certa. Zero warnings de console na segunda
  rodada.
- **Adendo (usuário leigo — sem coordenada, sem rolar a tela):** pedido do usuário logo em seguida,
  olhando a mesma tela: "Posição X"/"Posição Y" apareciam como campos de formulário — coordenada em
  pixel não significa nada pra quem vai usar o sistema de verdade (diretoria de um CTG, não gente
  técnica). E o formulário de adicionar/editar mesa vivia num card separado, embaixo do croqui —
  clicar no croqui e ter que rolar a tela até um formulário sem nenhuma pista visual de que ele se
  referia àquele clique deixava o fluxo sem sentido nenhum pra quem tá vendo pela primeira vez.

  `posicaoX`/`posicaoY` continuam existindo no formulário (`react-hook-form` continua validando e
  enviando os dois pro backend), só nunca aparecem — viraram `<input type="hidden">`, preenchidos
  só pelo clique no croqui, nunca digitados à mão. O formulário de adicionar/editar em si saiu do
  card solto embaixo e virou um painel pequeno flutuando ao lado do ponto clicado dentro do
  próprio `MesaCanvas` (prop nova `painel`/`painelPosicao`) — abre pro lado com mais espaço
  sobrando (nunca estoura a borda do croqui, testado perto das 4 quinas), campo "Quantas pessoas
  sentam?" com foco automático, e um "X" pra fechar sem salvar. Clicar numa mesa em edição também
  funciona pra mover ela — clicar em outro ponto do croqui atualiza a posição pendente (o círculo
  tracejado mostra pra onde), o círculo cheio da mesa some do lugar antigo só depois de "Salvar
  alterações" de verdade (a chamada à API). Rótulo do campo trocado de "Capacidade (lugares)" pra
  "Quantas pessoas sentam?" — mais direto pra quem não é do ramo de eventos.

  A questão de desenhar paredes/portas/formato do salão (mencionada na mesma conversa) ficou de
  fora deste adendo — depende de uma decisão de escopo maior (imagem de planta baixa enviada pela
  entidade vs. uma ferramenta de desenho vetorial dentro do app) que precisa ser combinada com o
  usuário antes de implementar; ver próximo adendo.

  Validado com `npm run build`/`npm run lint` (frontend, sem mudança no backend) e teste manual
  ponta a ponta headless: cliquei perto de cada quina do croqui confirmando que o painel nunca sai
  da área visível, adicionei mesa com sucesso pelo painel, cliquei nela de novo e confirmei que o
  painel abre em modo edição pré-preenchido com o valor certo (persistido, não só local).
- **Adendo (paredes e portas — ferramenta de desenho vetorial):** perguntado ao usuário se
  parede/porta/formato do salão deveriam vir de uma imagem de planta baixa enviada pela entidade
  ou de uma ferramenta de desenho dentro do próprio app — escolhida a ferramenta de desenho (RF10
  ampliado; croqui-salao.json nunca tinha modelado isso, é extensão de escopo pedida em conversa).

  Novo conceito de domínio `ElementoEstrutural` (backend, `eventos/domain/`) — um traço livre
  (`tipo: 'parede' | 'porta'`, dois pontos `x1,y1`/`x2,y2`, mesmo plano cartesiano das mesas), sem
  exigir formar um polígono fechado nem validação de geometria nenhuma — a entidade desenha do
  jeito que representa o espaço real. Nova tabela `elementos_estruturais` (migração
  `1756400000000-CreateElementosEstruturaisTable`, FK `salao_id` `ON DELETE CASCADE`) e endpoints
  `POST`/`DELETE /saloes/:id/elementos(/:elementoId)` (`AdicionarElementoEstruturalUseCase`/
  `RemoverElementoEstruturalUseCase`). Diferente de mesa, excluir elemento não tem restrição de
  "em uso" — parede/porta nunca é referenciada por reserva nem configuração de evento, é só
  desenho. `ConsultarSalaoUseCase`/`GET /saloes/:id` passa a devolver `elementos` junto de
  `salao`/`mesas`.

  Frontend: `MesaCanvas` ganhou um `modo` (`mesa`/`parede`/`porta`, controlado por um seletor de
  ferramentas em abas acima do croqui, ícones `Armchair`/`Minus`/`DoorOpen`) que muda o que
  clicar/arrastar no croqui faz. Em modo parede/porta, arrastar desenha um traço (linha de prévia
  tracejada acompanhando o mouse via `<svg>` sobreposto, elementos existentes desenhados como
  `<line>`; parede sólida escura, porta pontilhada numa cor mais clara — visualmente distinguíveis
  mesmo sobrepostas) — comprimento mínimo de 12px pra não criar traço de um clique acidental sem
  arrastar quase nada. Clicar num traço já existente (em vez de arrastar) abre o mesmo painel
  flutuante já usado pras mesas, agora só com "Excluir" (sem confirmação — diferente de mesa, não
  tem risco de perder histórico, redesenhar é trivial). Mesas ficam com opacidade reduzida e
  não-clicáveis enquanto uma ferramenta de parede/porta está ativa (só contexto visual, sem
  disputar o mesmo clique).

  Achado em teste manual, corrigido antes de considerar pronto: o navegador dispara um "click"
  nativo no elemento embaixo do cursor mesmo depois de um arraste (mousedown→mousemove→mouseup
  ainda conta como clique nesse elemento) — desenhar uma porta cruzando por cima de uma parede já
  existente também selecionava a parede pra excluir, efeito colateral do mesmo gesto. Corrigido
  com uma ref que marca "acabei de desenhar um traço de verdade" pra engolir esse clique fantasma
  uma única vez. Segundo achado: já que a ordem que a API devolve os elementos não é garantida, uma
  parede podia ser pintada por cima de uma porta na mesma posição, escondendo o traço pontilhado
  dela — corrigido ordenando parede sempre antes de porta no render (porta sempre por cima).

  Validado com `npm run test:e2e` (backend, 63/63, 1 teste novo: adiciona parede e porta, lista
  ambas em `GET /saloes/:id`, recusa elemento em salão inexistente com 404, remove e confirma que
  só a removida some) e `npm run build`/`npm run lint` (frontend), mais teste manual ponta a ponta
  headless: troquei de ferramenta, arrastei uma parede e depois uma porta cruzando por cima dela,
  confirmei visualmente (screenshot com zoom 4x) que a porta aparece distinguível por cima da
  parede, cliquei na parede pra selecionar e excluir — sem seleção fantasma da porta que acabou de
  ser desenhada por cima. Zero warnings de console.

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
- **Adendo (redesenho cadastro/edição unificados):** pedido do usuário — o fluxo original tinha
  telas diferentes pra criar (só dados básicos) e editar (dados básicos + ingresso avulso + mesas,
  cada seção com seu próprio botão "Salvar"), muito espaço vazio na tela de criação, e não existia
  campo de preço por perfil de comprador (sócio/não-sócio/criança) em lugar nenhum do painel — só
  dava pra configurar via API direta. Resolvido com um componente único,
  `src/features/eventos/evento-formulario.tsx`, renderizado tanto por `/eventos/novo` quanto por
  `/eventos/[id]` (modo `criar`/`editar`) — as duas telas ficam visualmente idênticas, cada seção
  em um `Card` (Dados do evento, Ingresso avulso, Preço por perfil, Mesas do croqui — este último
  só aparece com um salão selecionado) e um único botão "Salvar" no fim. Precisou de dois
  endpoints novos no backend (ver adendo "Edição de evento e consulta de preços por perfil" em
  T-BE-007 — não havia PATCH de evento nem GET de preço por perfil antes desta ticket).

  No modo criar, o evento ainda não existe quando o formulário é preenchido, mas mesas/ingresso/
  preços por perfil dependem de um `eventoId` — resolvido encadeando as chamadas no submit: POST
  `/eventos` primeiro (pega o id), depois PUT mesas (se um salão foi escolhido), PUT ingresso (se
  quantidade e preço de vitrine foram preenchidos) e um PUT por perfil de preço preenchido, nessa
  ordem, tudo dentro do mesmo `onSubmit`. Erro na primeira etapa (criar/atualizar o evento em si)
  mantém a pessoa no formulário; erro numa etapa posterior ainda navega pra `/eventos/[id]` (o
  evento já existe nesse ponto) com um aviso de que parte da configuração não foi salva. Campos de
  preço/quantidade usam `z.string().optional()` em vez de `z.coerce.number()` — coerção de número
  em cima de string vazia dá `0` (não `undefined`), o que faria todo campo em branco virar um
  preço zerado ao salvar; a conversão pra número (ou `undefined`, se vazio) é manual no submit.
  Novo helper `paraInputDatetimeLocal` (`lib/format.ts`) — não existia conversão de ISO pro formato
  que `<input type="datetime-local">` espera (a mesma tela agora precisa disso na edição, pra
  pré-popular o campo).

  Validado com `npm run build`, `npm run lint` e teste manual ponta a ponta headless contra o
  backend real: preenchi o formulário de criação inteiro (dados básicos, ingresso avulso, preço
  por perfil), salvei, confirmei o redirecionamento pra `/eventos/[id]` com todos os campos
  pré-preenchidos vindos da API (prova que os dois GETs — evento e preços por perfil — resolvem
  certo); separadamente, editei um evento já vinculado a um croqui e confirmei que a seção de
  mesas aparece e o botão "Mapa de mesas" some/aparece corretamente conforme o salão. Achado no
  caminho, sem relação com esta ticket: um `curl` desta própria sessão gravou um nome de salão com
  acentuação corrompida no banco (charset do terminal, não um bug do app) — encontrado ao revisar
  o screenshot, confirmado direto no Postgres, e limpo.
- **Adendo (preço de sócio por categoria):** o card "Preço por perfil de comprador" tinha um
  campo "Sócio" único — pedido do usuário logo em seguida pra variar por categoria de sócio (ver
  adendo correspondente em T-BE-009). Campo único vira uma lista dinâmica, uma linha por categoria
  cadastrada (`useCategoriasSocio`, mesmo hook e mesmo `limite=100` já usado no dropdown de croqui
  — sem paginação aqui, número de categorias tende a ser pequeno), populada via `useFieldArray` +
  `reset()` num `useEffect` dependente da query de categorias, mesmo padrão já usado pras mesas do
  croqui. Não-sócio/criança continuam como campos fixos (não têm categoria). O `POST`/`PUT` de
  cada categoria preenchida no submit passa `categoriaSocioId` no corpo. Tela de emissão de
  ingresso (`/eventos/[id]/ingressos`) ganhou o mesmo tratamento: um `Select` de "Categoria de
  sócio" aparece condicionalmente (`useWatch` no perfil escolhido) só quando o perfil selecionado
  é "Sócio", validado com `superRefine` no schema (exige a categoria só nesse caso). Validado com
  `npm run build`, `npm run lint` e teste manual ponta a ponta headless contra o backend real:
  criei 2 categorias, preenchi preço só pra uma delas + não-sócio no formulário de criação de
  evento, confirmei o toast e o redirect, e vi o mesmo valor pré-preenchido na tela de edição —
  prova de que a escrita (um `PUT /precos-ingresso` por categoria preenchida) e a leitura (o novo
  formato do `GET`) resolvem corretamente ponta a ponta.
- **Adendo (duas colunas em monitores largos):** pedido do usuário olhando o formulário num
  monitor de 27" — os Cards empilhados numa coluna só sobravam bastante espaço vazio nas laterais.
  "Dados do evento" e "Ingresso avulso" + "Preço por perfil" (empilhados) passam a ficar lado a
  lado (`grid lg:grid-cols-2`, ver §5.2 do `DESIGN-SYSTEM.md`) a partir do breakpoint `lg`; abaixo
  disso continua empilhado numa coluna só. "Mesas do croqui" continua full-width abaixo (é uma
  lista que se beneficia da largura total, não faz sentido dividir em coluna). Página sobe de
  `max-w-3xl` pra `max-w-5xl` nas duas rotas (`/eventos/novo`, `/eventos/[id]`). Achado no
  caminho: as classes `lg:*` novas não apareciam no CSS compilado (`lg:grid-cols-2` ausente até de
  `getComputedStyle`, junto com todo e qualquer outro `lg:*` do projeto) — cache do Turbopack preso
  numa versão anterior da varredura de conteúdo; resolvido limpando `.next` e reiniciando o `next
  dev`, sem precisar mudar nada no código. Validado com `npm run build`, `npm run lint` e
  verificação visual headless em três larguras (2560px simulando o monitor de 27" do usuário,
  800px confirmando que volta a empilhar abaixo do breakpoint `lg`, e a suíte de screenshots já
  feita pra esta ticket).
- **Adendo (remoção do "preço de vitrine"):** pedido do usuário perguntando sobre o texto do card
  "Ingresso avulso" — ver adendo correspondente em T-BE-009 pra explicação completa do problema
  (preço de vitrine podia divergir do preço efetivamente cobrado). Campo "Preço de vitrine" removido
  do card (schema, `defaultValues`, JSX e corpo do `PUT /eventos/:id/ingresso` no submit) — sobra só
  "Quantidade disponível". O card passou a caber numa coluna só (não precisa mais do `grid
  sm:grid-cols-2`). Validado com `npm run build` e `npm run lint`.
- **Adendo (unificação visual + ícones):** pedido do usuário — os cards da tela estavam "muito
  semelhantes", sem nada pra diferenciar um do outro à primeira vista, e "Ingresso avulso" (só a
  quantidade) e "Preço por perfil de comprador" viviam em cards separados sem motivo (o preço
  configurado ali é o que se cobra pela quantidade configurada ao lado — são a mesma coisa).
  Unificados num card só ("Ingresso avulso": quantidade no topo, "Preço por perfil de comprador"
  como subseção abaixo de um `border-t`). Título de cada card ganhou um ícone num badge
  (`TituloComIcone`, `lucide-react`: `PartyPopper` pra Dados do evento, `Ticket` pra Ingresso
  avulso, `Table2` pra Mesas do croqui) e os campos de texto/data/local/quantidade ganharam ícone
  interno à esquerda (`InputComIcone`, mesmo padrão de `components/search-input.tsx`
  generalizado); campos de preço ganharam prefixo "R$" em vez de ícone (mais informativo que um
  ícone de cifrão genérico numa tela em reais). Validado com `npm run build`, `npm run lint` e
  screenshot headless de `/eventos/novo` logado.

#### Ticket: T-FE-007 Mapa de Mesas e Reservas (visão da diretoria)
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Visualização do croqui do evento com status de cada mesa (livre/reservada/pendente),
  registro de reserva mediada, cancelamento/transferência.
- **Acceptance Criteria:** Duas mesas reservadas simultaneamente por engano nunca ficam visualmente
  como "livres" ao mesmo tempo (reflete a checagem de concorrência do backend).
- **Validation Steps:** Teste manual contra `reserva-mesa.json` e
  `cancelamento-transferencia-reserva.json`.
- **Notes:** Nova rota `/eventos/[id]/mapa` (link "Mapa de mesas" na página do evento, só quando
  `salaoId` está setado) — reaproveita o mesmo plano cartesiano do `MesaCanvas` (T-FE-005) num
  novo `MapaMesasCanvas` (`src/features/reservas/`), agora colorindo cada mesa pelo status vindo
  de `GET /eventos/:id/mapa-mesas` (livre/pendente/reservada/bloqueada, com legenda). Clicar numa
  mesa abre um `Dialog` com o painel de ação certo pro status: livre → form de reserva mediada
  (nome do titular + forma de pagamento, canal sempre "mediado" per RNF01); pendente → titular/
  canal + Confirmar/Cancelar; reservada → titular/canal + Cancelar, transferir titularidade
  (input) e transferir mesa (`Select` só com mesas livres). Erros de concorrência (409 do backend
  quando a mesa some enquanto o dialog estava aberto) viram toast, sem crash — o
  `invalidateQueries` de cada mutation resolve o "nunca aparecem duas livres ao mesmo tempo" do
  critério de aceite, porque a próxima leitura do mapa vem sempre fresca do banco (RF14, sem
  cache). Achado no caminho, resolvido no próprio ticket: `GET /eventos/:id/mapa-mesas`
  (`ConsultarMapaMesasUseCase`) não devolvia o id da reserva nem titular/canal — sem isso o
  front não tinha como acionar confirmar/cancelar/transferir a partir do mapa. Estendido o
  usecase com `reservaId`/`nomeTitular`/`canal` (null quando a mesa está livre/bloqueada);
  aditivo, não quebrou os testes e2e existentes (37/37 continuam passando). Validado com `npm
  run build`, `npm run lint`, `npm run test:e2e` (backend) e teste manual ponta a ponta contra o
  backend real: criei um salão com 4 mesas e um evento configurado com uma mesa livre, uma
  reservada (mediada), uma pendente (canal app) e uma bloqueada; conferi as 4 cores no mapa e o
  conteúdo do dialog para cada status; confirmei a reserva pendente via API e recarreguei o mapa
  para ver a mesa virar "reservada" ao vivo; conferi o botão "Mapa de mesas" na página do evento.

#### Ticket: T-FE-008 Emissão e Check-in de Ingresso
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Venda presencial de ingresso (sócio/visitante), leitura de QR + check-in manual.
- **Acceptance Criteria:** Ingresso já usado é sinalizado claramente na tentativa de reuso.
- **Validation Steps:** Teste manual contra `emissao-ingresso.json`.
- **Notes:** Nova rota `/eventos/[id]/ingressos` (link "Ingressos" na página do evento, sempre
  visível — venda avulsa não depende de croqui). Três blocos: form "Vender ingresso presencial"
  (nome, perfil sócio/não-sócio/criança, forma de pagamento — canal sempre "mediado" per RNF01,
  preço resolvido pelo backend conforme perfil+override do evento); "Check-in por código (QR)" —
  campo de texto que aceita o id do ingresso colado ou lido por um leitor USB/câmera que funciona
  como teclado, **mais** um leitor de QR pela câmera do navegador (`QrCodeScanner`, biblioteca
  `qr-scanner`, adicionado em 2026-08-29 — ver nota em `frontend-web/PLANEJAMENTO.md` §6) que só
  liga sob clique explícito da diretoria; os dois formatos coexistem (emissao-ingresso.json: "QR
  code no app para quem tem, busca manual por nome no painel para quem não tem"); tabela
  "Ingressos emitidos" com busca por nome
  (`GET /eventos/:id/ingressos?nome=`) e botão "Check-in" por linha, badge "Usado"/"Emitido" +
  horário da entrada. Achado no caminho, corrigido não só aqui mas retroativamente: `SelectValue`
  do base-ui não resolve o label do item selecionado sozinho — sem passar uma função `children`
  mapeando valor→label, ele mostra o valor bruto (ex.: um UUID de mesa/salão, ou o enum
  "nao_socio" em vez de "Não-sócio"). Bug pré-existente desde T-FE-003 (categoria de sócio) e
  T-FE-006 (croqui do evento); corrigido nos 4 `Select`s afetados (`associados/novo`,
  `eventos/novo`, `eventos/[id]/mapa` — forma de pagamento e transferir mesa — e aqui). Validado
  com `npm run build`, `npm run lint` e teste manual ponta a ponta contra o backend real: emiti
  dois ingressos (sócio e não-sócio) pelo form, conferi a tabela com preços/labels corretos,
  fiz check-in de um deles via API (mesmo payload que o campo "check-in por código" envia),
  confirmei a tentativa de reuso recusada (409) e recarreguei a página vendo o badge "Usado" +
  horário aparecerem sem o botão de check-in; conferi a busca por nome contra o endpoint real.
- **Adendo (venda/check-in viram modal, listagem é o foco da tela):** pedido do usuário — os cards
  "Vender ingresso presencial" e "Check-in por código (QR)" ficavam sempre abertos, competindo por
  espaço com "Ingressos emitidos" (a listagem é o que a diretoria mais consulta na prática). Os
  dois viraram botões de ação no cabeçalho da página (`Check-in` com ícone `QrCode`, `Vender
  ingresso` com ícone `TicketPlus`, mesmo padrão de cabeçalho com ações já usado em
  `eventos/[id]`), cada um abrindo o formulário correspondente num `Dialog` — a listagem passa a
  ser o único conteúdo sempre visível da página. Comportamento de cada modal após sucesso
  mantido igual a antes (fica aberto, só limpa os campos) — pensado pra quem está vendendo/
  validando entrada de várias pessoas em sequência na portaria não precisar reabrir o modal a cada
  ingresso. Validado com `npm run build`/`npm run lint` e teste manual ponta a ponta headless:
  abri e fechei os dois modais, emiti um ingresso (peguei o erro esperado de "ingresso avulso não
  configurado" num evento de teste sem essa configuração — confirma que o toast de erro aparece
  corretamente sem quebrar a página por trás do modal), e abri o modal de check-in confirmando o
  botão de câmera e o campo de código manual.
- **Adendo (prévia do valor a cobrar):** pedido do usuário — o valor cobrado só aparecia depois de
  já ter emitido o ingresso, num toast que passa rápido; nada mostrava o preço antes de confirmar
  a venda. Achado ao investigar: o registro "fortemente vinculado" que o usuário pediu já existia
  — `Ingresso.preco` é resolvido uma vez em `EmitirIngressoUseCase` e gravado como valor fixo na
  própria linha do ingresso (nunca recalculado depois), já aparece na coluna "Preço" da listagem;
  o que faltava era mostrar esse valor *antes* de emitir. Modal de "Vender ingresso" passa a
  calcular e mostrar "Valor a cobrar" ao vivo, conforme perfil/categoria escolhidos, reaproveitando
  `usePrecosIngressoEvento` (mesmo hook já usado na tela do evento pra configurar preço por
  perfil) — sem endpoint novo. Quando não há preço configurado pra esse perfil/categoria, mostra
  um aviso vermelho ("Preço não configurado... configure antes de vender") e desabilita "Emitir
  ingresso", evitando uma tentativa fadada a dar 400 no backend. Validado com `npm run build`/
  `npm run lint` e teste manual ponta a ponta headless: evento de teste com preço configurado só
  pra "Não-sócio" — selecionar esse perfil mostrou "R$ 30,00" ao vivo, selecionar "Criança" (sem
  preço configurado) mostrou o aviso com o botão desabilitado.
- **Adendo (sobrescrever o valor na venda + bug do aviso prematuro):** dois achados do usuário
  revisando o adendo anterior: (1) a "prévia" era só leitura — não dava pra vender por um valor
  diferente do configurado (desconto, cortesia, ou repassar um evento sem preço configurado ainda
  sem precisar ir até a tela do evento configurar antes); (2) selecionar "Sócio" já mostrava o
  aviso vermelho de "preço não configurado" antes até da categoria aparecer pra escolher — bug em
  `resolverPrecoPrevisto`, que devolvia `null` (não configurado) pra "sócio sem categoria ainda
  escolhida" em vez de `undefined` (ainda não decidiu), fazendo o aviso aparecer cedo demais.

  Corrigido o bug (`!categoriaSocioId` agora devolve `undefined`, não `null`) e "Valor a cobrar"
  virou um campo editável de verdade: sugere o preço resolvido assim que dá pra calcular
  (`setValue` sem `shouldDirty`, então não conta como editado pela pessoa), mas aceita qualquer
  valor digitado por cima — inclusive quando não há preço configurado pra esse perfil/categoria,
  caso em que o campo fica vazio e o aviso agora orienta "informe o valor manualmente pra vender
  assim mesmo" em vez de só bloquear. Backend: `EmitirIngressoDto`/`EmitirIngressoUseCase` ganham
  `preco?: number` opcional — quando informado, sobrescreve o preço resolvido por perfil/categoria
  (não afeta `ComprarMeuIngressoUseCase`, a compra pelo app nunca preenche esse campo, sempre
  resolvido automaticamente). Validado com `npm run test:e2e` (backend, 64/64, 1 teste novo:
  preço informado vence o preço padrão da entidade) e `npm run build`/`npm run lint` (frontend),
  mais teste manual ponta a ponta headless: perfil com preço configurado sugeriu o valor
  automaticamente, sobrescrevi pra um valor diferente e o toast/registro confirmaram o valor
  digitado (não o sugerido); perfil sem preço configurado mostrou o campo vazio com o aviso certo,
  emissão bloqueada até digitar algo.
- **Adendo ("big numbers" pra acompanhar o evento no dia):** pedido do usuário — a tela só tinha a
  listagem paginada de ingressos, sem nenhum resumo pra bater o olho e saber quantos já entraram
  no evento. Backend ganha `GET /eventos/:eventoId/ingressos/resumo`
  (`ConsultarResumoIngressosUseCase`/`IngressoRepositoryPort.resumoPorEvento`) — agregado em SQL
  puro (`COUNT`/`COUNT ... FILTER`/`SUM`) em vez de contar em cima da listagem paginada do
  frontend, que só cobre a página atual (um evento grande passa fácil de uma página). Frontend
  ganha 4 cartões acima da listagem: "Ingressos emitidos", "Já entraram" (tom `success`),
  "Aguardando entrada" e "Receita total". O cartão em si (`CartaoResumo`) já existia só na tela
  Início (T-FE-002) — extraído pra `src/components/cartao-resumo.tsx` reaproveitável, ganhando um
  tom `success` novo (só tinha default/warning/destructive) e um `href` agora opcional (a tela
  Início sempre linka pra algum lugar, aqui os cartões são só informativos). Chave de cache do
  React Query do resumo (`["eventos", eventoId, "ingressos", "resumo"]`) aninhada de propósito sob
  o mesmo prefixo da listagem — invalidar `["eventos", eventoId, "ingressos"]` ao emitir/fazer
  check-in (já existia) atualiza os dois automaticamente, sem uma invalidação extra. Validado com
  `npm run test:e2e` (backend, 65/65, 1 teste novo: resumo bate com 4 emitidos/1 usado/3
  pendentes/receita 72 depois da sequência de testes anteriores, mais 404 pra evento inexistente)
  e `npm run build`/`npm run lint` (frontend), mais teste manual ponta a ponta headless: criei
  evento, emiti 3 ingressos, fiz check-in de 1, e os 4 cartões bateram exatamente com a tabela
  logo abaixo (3 emitidos, 1 já entrou, 2 aguardando, R$ 90,00).
- **Adendo (cartão "Receita total" vira medidor de check-in):** pedido do usuário — trocar o
  cartão "Receita total" por um gráfico de pizza (emitidos x check-in x pendentes). Seguindo a
  heurística de escolha de forma de gráfico (skill `dataviz`): uma razão contra um total (check-ins
  feitos sobre total emitido — as duas fatias são complementares, uma decorre da outra) é o caso
  documentado como anti-padrão pra pizza de 2 fatias (ângulo/área são mais difíceis de comparar
  entre si do que uma barra preenchida ou um número; com só 2 categorias a pizza não acrescenta
  nada que a barra já não mostre). Perguntado ao usuário via pergunta direta o motivo do anti-padrão
  antes de implementar (ele pediu a explicação, não escolheu entre as opções oferecidas) — depois de
  esclarecido, segui a alternativa recomendada: um medidor (`CartaoMedidor`, novo componente em
  `src/components/cartao-medidor.tsx`) com barra de progresso (`role="meter"`) mostrando "Check-ins
  feitos", percentual + "X de Y", usando os mesmos tokens de cor de status já existentes
  (`bg-success` preenchido sobre `bg-muted` de fundo — sem paleta nova pra validar). Sem mudança de
  backend — reaproveita os mesmos `totalUsados`/`totalEmitidos` do resumo já existente. Validado com
  `npx tsc --noEmit`/`npm run lint` e teste manual ponta a ponta headless contra o backend real:
  evento com 2 ingressos emitidos, fiz check-in de 1 via API e conferi o cartão mostrando "50%" e
  "1 de 2" com a barra preenchida até a metade.

#### Ticket: T-FE-009 Gestão de Usuários da Plataforma
- **Priority:** Should
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Tela pra listar contas de login e criar novos administradores — fecha a lacuna
  identificada em conversa com o usuário (RNF02 previa RBAC/perfis, nunca a gestão de contas).
- **Acceptance Criteria:** Administrador consegue conceder acesso administrativo a outra pessoa
  sem precisar de acesso ao servidor/banco.
- **Validation Steps:** Teste manual ponta a ponta contra o backend real.
- **Notes:** Nova seção top-level na sidebar (`/usuarios`, ícone `ShieldUserIcon` — separado de
  "Associados" de propósito, são contas de sistema, não cadastro de sócio). Duas rotas: lista
  (`/usuarios`, tabela e-mail+badge de perfil, consumindo o `GET /auth/usuarios` que já existia
  sem UI) e cadastro exclusivo (`/usuarios/novo`, mesmo padrão visual de "Novo associado"/"Novo
  salão" — Card com e-mail+senha provisória, redireciona pra lista no sucesso). Só cria
  administrador por aqui, nunca associado (ver nota de T-BE-015). Validado com `npm run build`,
  `npm run lint` e teste manual ponta a ponta contra o backend real: criei um novo administrador
  pelo formulário, confirmei o toast e o redirect, vi a conta nova na lista, e confirmei via API
  que ela consegue logar de fato. Achado no caminho (só de tooling, não da aplicação):
  `--window-size` do Edge headless não bateu com o viewport real da página numa das rodadas
  (pediu 1400px, `window.innerWidth` voltou 500) — contornado forçando o viewport via
  `Emulation.setDeviceMetricsOverride` do CDP em vez de confiar na flag de lançamento.
- **Adendo (nome no usuário interno):** pedido do usuário — contas de administrador só tinham
  e-mail (`Usuario` nunca teve campo nome, diferente de `Associado`), então a sidebar/lista de
  usuários mostrava só o e-mail cru como identidade de quem estava logado. `Usuario.nome` novo
  (nullable — migração `1756300000000-AddNomeToUsuarios`; nulo pra conta de associado, que segue
  sem nome no `Usuario`, o nome dela vive na entidade `Associado`), obrigatório só em
  `CriarAdministradorDto`. Embarcado direto no JWT (`JwtPayload.nome`) em vez de exigir um select
  extra em toda request autenticada — mesmo padrão já usado pra `email`/`perfil` no token; troca de
  nome só reflete depois de um novo login, ressalva que já existia pro e-mail. Sidebar
  (`iniciaisDoUsuario`) e lista de `/usuarios` passam a mostrar o nome, com fallback pro e-mail
  quando `nome` é nulo (conta de associado, ou conta de administrador seedada antes desta ticket).
  Busca da listagem (`GET /auth/usuarios?busca=`) passou a casar por nome OU e-mail. `seed-admin.ts`
  ganhou `SEED_ADMIN_NOME` (padrão "Diretoria"); a conta seed já existente no banco de dev foi
  atualizada manualmente (`UPDATE usuarios SET nome = 'Diretoria' WHERE nome IS NULL`), já que o
  script só insere se a conta ainda não existir. Validado com `npm run build` e `npm run test:e2e`
  (backend, 60/60) e `npm run build`/`npm run lint` (frontend); teste manual ponta a ponta headless
  logado: criei um administrador pelo formulário com nome, confirmei ele aparecendo na lista e a
  sidebar mostrando "Diretoria" em vez do e-mail — conta de teste removida do banco ao final.

#### Ticket: T-BE-016 / T-FE-010 Paginação real das listagens
- **Priority:** Should
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Nenhuma listagem do painel tinha paginação — respondiam/buscavam tudo de uma vez.
  Achado numa conversa com o usuário ao notar que a tabela de associados sempre mostrava uma
  altura fixa de ~10 linhas mesmo sem paginação real por trás. Adicionado `LIMIT`/`OFFSET` real
  no backend e controles de página no frontend em todo endpoint de listagem: associados,
  categorias de sócio, eventos, salões, usuários da plataforma, relatório de inadimplentes e
  ingressos de um evento (este último preservando o filtro por nome já existente).
- **Acceptance Criteria:** Toda listagem paginada responde `{ itens, total, pagina, limite,
  totalPaginas }`; o painel mostra "Anterior/Próxima" e "Mostrando X–Y de Z" abaixo de cada
  tabela/grid paginado; `limite` tem teto de 100 (validado via DTO, 400 se excedido).
- **Validation Steps:** `npm run build`, `npm run test:e2e` (backend, 54/54) e `npm run build`/
  `npm run lint` (frontend). Teste manual contra o backend real confirmando o formato da resposta
  e que `GET /eventos/publicados` (vitrine pública do RF13, não paginada de propósito) continua
  intacto.
- **Notes:** Contrato compartilhado — `PaginacaoQueryDto` (query params `pagina`/`limite`,
  padrão 1/20, teto 100) e `PaginaResultado<T>`/`montarPaginaResultado()`, ambos em
  `backend/src/shared/pagination/`. Cada porta de repositório ganhou um `listarPaginado()` novo
  via `findAndCount` do TypeORM; quando o `listarTodos()` antigo também era usado internamente por
  outro caso de uso (ex.: `AssociadoRepositoryPort.listarTodos()`, usado por
  `GerarCobrancasMensaisUseCase`), ele foi mantido e o paginado foi adicionado ao lado — nunca
  substituído. O relatório de inadimplentes (`ListarInadimplentesUseCase`) pagina em memória, por
  juntar mensalidade + nome do associado sem uma consulta paginável direta. No frontend, um
  componente `Pagination` compartilhado (`src/components/pagination.tsx`) — só "Anterior/Próxima"
  e contagem, sem input de "ir para a página" (DESIGN-SYSTEM: público com menor familiaridade
  digital, evitar entradas numéricas soltas). Dropdowns de seleção (categoria de sócio em
  associados/novo, salão em eventos/novo) e os cartões do dashboard buscam a página 1 com
  `limite=100` em vez de paginar de fato — número desses itens tende a ser pequeno na escala real
  da entidade; uma contagem por status direto na API fica pra quando o volume justificar.
  Achado no caminho: um `Write` (sobrescrita completa) no arquivo de eventos apagou por engano o
  `ListarEventosPublicadosUseCase`, que dividia o arquivo com `ListarEventosUseCase` — restaurado
  antes de prosseguir; lição registrada para preferir `Edit` a `Write` em arquivos com mais de uma
  classe.
- **Adendo (busca textual):** pedido do usuário logo em seguida ("campo de busca textual por
  termo em todas essas listagens também"). Reaproveitado o mesmo `PaginacaoQueryDto` — novo campo
  opcional `busca` (string, teto 200 caracteres) — em vez de criar um DTO por endpoint. Cada
  `listarPaginado()` ganhou um parâmetro `busca?` opcional e filtra via `ILIKE` do TypeORM (sem
  diferenciar caixa) no campo mais relevante do recurso: associados (nome OU CPF, `where` como
  array de duas condições — OR), categorias de sócio/eventos/salões (nome), usuários (e-mail).
  Ingressos já tinha esse filtro desde antes (`nome`, preservado como está — a mesma ideia, nome
  específico ao domínio). Inadimplentes filtra em memória por nome do associado, antes de fatiar a
  página (mesma razão de já paginar em memória: é um relatório de junção, não uma consulta direta).
  Frontend: componente `SearchInput` compartilhado (`src/components/search-input.tsx`, ícone de
  lupa) em cada listagem, sempre resetando pra página 1 ao mudar o termo; texto de "sem itens"
  diferencia "nenhum X cadastrado ainda" de "nenhum X encontrado para esse termo". Validado com
  `npm run build`/`npm run test:e2e` (backend, 55/55, novo teste de busca por nome/CPF/termo sem
  match em associados) e `npm run build`/`npm run lint` (frontend), mais teste manual contra o
  backend real.

#### Ticket: T-FE-011 Sidebar escura + conta no rodapé
- **Priority:** Could
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Refinamento visual pedido pelo usuário: a sidebar estava "crua" — mesmo fundo claro do
  resto do painel, sem identidade própria — e os dados de quem está logado (e-mail, perfil, sair)
  ficavam no header, compartilhado com o conteúdo.
- **Acceptance Criteria:** Sidebar com fundo distinto do restante do painel, contraste AA
  verificado; conta autenticada (avatar com iniciais, e-mail, perfil, botão "Sair") no rodapé da
  sidebar (desktop) e do drawer (mobile), não mais no header.
- **Validation Steps:** `npm run lint`, `npm run build`, verificação visual headless (expandida,
  colapsada e drawer mobile) contra o backend real.
- **Notes:** Ver detalhamento dos tokens `--sidebar*` e da nova estrutura (marca+conta dentro da
  sidebar, header claro só no mobile) no §5.1 do `DESIGN-SYSTEM.md`. Reaproveitou o token set
  `--sidebar*` que já vinha do scaffold shadcn/ui (nunca usado até aqui — o componente `AppShell`
  usava `bg-card` na nav), só substituindo os valores oklch neutros pela paleta gaúcha ("couro
  escuro" — única superfície escura do painel, deliberado, não é dark mode geral). Iniciais do
  avatar vêm das 2 primeiras letras do e-mail (contas de administrador não têm campo "nome").

### Mobile (App do Associado)

#### Ticket: T-MOB-001 Autenticação e onboarding
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Login, auto-cadastro (RF01 canal associado), tela inicial com status do associado.
- **Acceptance Criteria:** Associado com CPF já cadastrado pela diretoria consegue vincular sua
  conta; novo associado consegue se auto-cadastrar.
- **Validation Steps:** Teste manual dos dois canais de entrada descritos em
  `cadastro-associado.json`.
- **Notes:** Bloqueava nessa Acceptance Criteria por uma lacuna real de backend (associado mediado
  não tinha como "reivindicar" a própria conta) — fechada primeiro como T-BE-014
  (`POST /associados/vincular-conta`) antes de implementar esta tela. Biblioteca de componentes:
  `react-native-paper`, tema em `src/theme/paper-theme.ts` reaproveitando os tokens de cor do
  `DESIGN-SYSTEM.md` (decisão que estava em aberto no `mobile/PLANEJAMENTO.md` §7, agora fechada).
  Estrutura: `Stack.Protected` (API nova do Expo Router v57) no layout raiz alterna entre o grupo
  `(auth)` (login=index, `cadastro`=auto-cadastro, `vincular-conta`) e `(app)` (index=início/
  status) conforme `AuthProvider.isAuthenticated` — sem middleware nativo no Expo Router, é tudo
  client-side lendo o token do `expo-secure-store` uma vez no mount. Cadastro e vincular-conta
  logam automaticamente após o sucesso (chamam `/auth/login` em seguida), então o associado cai
  direto na tela de início já autenticado. Início mostra nome/CPF/`StatusAssociadoBadge` + card de
  aviso para "Pendente de validação"/"Rejeitado"; mensalidade fica pra T-MOB-002 (endpoint de
  mensalidades hoje é 100% `@Roles(ADMINISTRADOR)`, sem rota pro associado ainda — gap documentado,
  não implementado aqui de propósito, fora do escopo desta ticket). Achado no caminho:
  `expo-secure-store` não tem implementação no target web (`ExpoSecureStore.web.ts` é só `{}`) —
  como o app não mira web (só Android/iOS), `src/lib/auth-token.ts` cai pra `localStorage` só
  quando `Platform.OS === "web"`, usado apenas para preview via `expo start --web` durante o
  desenvolvimento, nunca em build nativo. Validado com `npx tsc --noEmit` e `npm run lint`
  (limpos) e teste manual ponta a ponta contra o backend real via `expo start --web` (headless):
  auto-cadastro→login automático→token persistido→`GET /associados/me` refletindo
  "Pendente de validação"; vincular-conta com CPF de um cadastro mediado real→login
  automático→"me" refletindo "Ativo"/origem "mediado"; login inválido e vincular-conta com CPF
  inexistente corretamente recusados (401/404) com mensagem do backend exibida na tela.

#### Ticket: T-MOB-002 Mensalidade — pagamento e histórico
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Ver mensalidade atual, pagar via app (gateway), ver histórico e comprovantes.
- **Acceptance Criteria:** Pagamento aprovado no gateway reflete no status em até alguns segundos
  (RNF05).
- **Validation Steps:** Teste manual com gateway em modo sandbox.
- **Notes:** Backend era 100% `@Roles(ADMINISTRADOR)` — nada disso existia pro associado antes
  desta ticket. Em vez de só relaxar o guard pras rotas existentes (o que deixaria um associado
  agir sobre a mensalidade de qualquer outro só sabendo o id — IDOR), criei rotas paralelas
  `/mensalidades/minhas` (`GET`, lista), `/mensalidades/minhas/:id/pagamento-online/iniciar`
  (`POST`), `/mensalidades/minhas/:id/pagamento-online/confirmar` (`POST`) e
  `/mensalidades/minhas/:id/comprovante` (`GET`), todas `@Roles(ASSOCIADO)` sobrescrevendo a
  classe (mesmo padrão de `/reservas/minhas`). `ResolverMinhaMensalidadeUseCase` centraliza a
  checagem de propriedade (resolve o Associado do JWT, recusa com 403 se a mensalidade não for
  dele) e é reaproveitado pelos 3 use cases "meu-*", que só delegam pros use cases de admin já
  existentes (`IniciarPagamentoOnlineUseCase` etc.) depois de confirmar a posse — nenhuma lógica
  de pagamento duplicada. `IniciarMeuPagamentoOnlineUseCase`/`ConfirmarMeuPagamentoOnlineUseCase`
  usam construtor por classe (não `@Inject`) porque injetam outro use case, não uma porta.

  No app: nova aba "Mensalidade" (3ª aba da navbar) — card de "situação atual" em destaque (a
  mensalidade mais antiga ainda não paga, não só a mais recente — importante pra não esconder um
  atraso antigo atrás de uma pendência nova) com botão "Pagar online", card "Você está em dia!"
  quando não há pendência, e histórico completo abaixo com `StatusMensalidadeBadge`
  (pendente/paga/em atraso). O adapter de pagamento em uso (`FakePaymentGatewayAdapter`) aprova a
  cobrança na hora — sem checkout/redirecionamento real ainda (provedor real é decisão em aberto,
  ver Open Questions) — então "pagar" no app encadeia iniciar+confirmar como uma ação só; quando
  um provedor real entrar, só `usePagarMinhaMensalidadeOnline` muda. Comprovante dedicado
  (`GET .../comprovante`) existe no backend mas a tela usa os dados que a própria mensalidade já
  tem (`pagoEm`/`formaPagamento`) pra exibir o histórico — evita uma chamada extra por item;
  fica disponível pra quando a tela precisar gerar/compartilhar um recibo formal.

  Validado com `npm run build`/`lint`/`test:e2e` (backend, 42 testes — 2 novos: ciclo completo
  minha-mensalidade autenticado + 403 pra mensalidade de outro associado) e `npx tsc --noEmit`/
  `npm run lint` (mobile, limpos) e teste manual ponta a ponta contra o backend real via
  `expo start --web` (headless): associado com 3 mensalidades (pendente/paga/inadimplente) vendo
  a mais antiga em aberto correta, pagando as duas pendentes uma de cada vez e conferindo o card
  virar "Você está em dia!" com o histórico atualizado (`pagoEm`/`formaPagamento` corretos).

#### Ticket: T-MOB-003 Minhas Reservas (RF13)
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Lista de reservas de mesa e ingressos do associado logado.
- **Acceptance Criteria:** Lista reflete status atualizado (reservada/cancelada/transferida).
- **Validation Steps:** Teste manual após operações feitas pelo painel web.
- **Notes:** Tela de consulta simples (sem fluxograma dedicado, ver `decisoes.md`). Só cobre
  reservas de mesa — ingressos do associado ainda não têm endpoint equivalente (fora de escopo,
  mesmo padrão pode ser replicado ali quando/se for priorizado). Antes de implementar a tela,
  enriqueci `GET /reservas/minhas` no backend (ver adendo em T-BE-012) porque a resposta crua só
  tinha `eventoId`/`mesaId` — inútil pra exibir. Já não é mais verdade que "só funciona para
  associados que se auto-cadastraram": T-BE-014 (vincular-conta) resolveu isso antes desta ticket
  ser pega.

  Nova aba "Minhas Reservas" em `src/app/(app)/reservas.tsx` — cards com nome/data/local do
  evento, número da mesa, titular e canal (`StatusReservaBadge` por status), estado vazio
  ("Nenhuma reserva ainda") e estado de erro com retry, pull-to-refresh. Também trocada a
  navegação de `Stack` pra `Tabs` do Expo Router em `(app)/_layout.tsx` — navbar inferior
  flutuante (posição absoluta, cantos arredondados, sombra), pedido explícito do usuário por
  cima do padrão anterior de tela única; `AppTopBar` (`src/components/app-top-bar.tsx`) virou
  componente compartilhado entre as abas pra manter "Sair" sempre acessível, não só na aba
  Início. Validado com `npx tsc --noEmit`/`npm run lint` (limpos) e teste manual ponta a ponta
  contra o backend real via `expo start --web` (headless): reserva real com evento/mesa/titular
  aparecendo corretamente enriquecida, estado vazio para associado sem reservas, troca de aba
  preservando o "Sair" em ambas.

#### Ticket: T-MOB-004 Reserva de Mesa e Compra de Ingresso pelo app
- **Priority:** Must
- **Status:** Done
- **Owner:** Unassigned
- **Scope:** Ver eventos publicados, solicitar reserva de mesa, comprar ingresso avulso, pagar
  online.
- **Acceptance Criteria:** Mapa de mesas no app reflete disponibilidade em tempo real (RF14).
- **Validation Steps:** Teste manual contra `reserva-mesa.json` e `emissao-ingresso.json`.
- **Notes:** `reserva-mesa.json`/`emissao-ingresso.json` já modelavam dois canais convivendo
  ("diretoria lança reserva por fora" OU "associado solicita pelo app"; ingresso "associado compra
  pelo app, sempre paga online"), mas nenhum dos dois tinha rota no backend — só o canal mediado
  existia. Backend ganhou 3 endpoints novos, todos reaproveitando os use cases admin existentes por
  composição (nunca duplicando regra de negócio):
  - `GET /eventos/publicados/:id` (público, sem guard) — detalhe de um evento publicado
    (`ConsultarEventoPublicadoUseCase`) já enriquecido com `mesas` e `ingresso` configurados, pro
    app não precisar de N chamadas.
  - `POST /eventos/:eventoId/mesas/:mesaId/reservar-minha` (`@Roles(ASSOCIADO)`) —
    `SolicitarMinhaReservaUseCase` resolve o associado pelo JWT e força `canal=app`/
    `nomeTitular`/`associadoId` no servidor; só `formaPagamento` vem do corpo. `GET
    /eventos/:eventoId/mapa-mesas`, que já existia só pra admin, ganhou
    `@Roles(ADMINISTRADOR, ASSOCIADO)` pro app conseguir mostrar disponibilidade em tempo real
    (RF14) antes de reservar.
  - `POST /eventos/:eventoId/meu-ingresso` (`@Roles(ASSOCIADO)`, sem corpo) —
    `ComprarMeuIngressoUseCase` força `perfilComprador=socio`, `canal=app`,
    `formaPagamento=online`, `nomeComprador` do JWT.

  Mesmo padrão "meu/minha" das tickets anteriores (T-MOB-002/003): nunca relaxar o guard
  admin-only pra deixar o associado bater no mesmo endpoint com campos de posse vindos do cliente
  (risco de IDOR) — sempre uma rota dedicada que resolve a posse a partir do JWT antes de delegar.
  10 casos novos/alterados em `eventos.e2e-spec.ts`/`reservas.e2e-spec.ts`/`ingressos.e2e-spec.ts`,
  suíte completa em 45/45.

  Mobile: aba "Eventos" nova na navbar inferior (`(app)/_layout.tsx`), com sub-navegação em
  `Stack` (`(app)/eventos/_layout.tsx`, header nativo vinho) — lista (`eventos/index.tsx`) →
  detalhe (`eventos/[id].tsx`). Detalhe reaproveita o padrão de canvas de posição fixa com rolagem
  horizontal já usado no painel web (`MapaMesasCanvas`, mesmo motivo: coordenadas de mesa são
  pixels reais, não proporcionais). Toque numa mesa livre abre um `Dialog` (react-native-paper)
  pra escolher forma de pagamento e confirmar a reserva; mesa ocupada mostra só titular/status,
  sem opção de reservar. Cartão de "Ingresso avulso" com preço + botão de compra, feedback via
  `Snackbar` de sucesso e `ErrorSnackbar` de erro (mesmo padrão de toda mutation do app). Reserva
  e compra invalidam `["eventos", eventoId, "mapa-mesas"]` e `["reservas", "minhas"]` via React
  Query, então o mapa e a aba Minhas Reservas refletem o resultado sem precisar de refresh manual.

  Validado com `npx tsc --noEmit`/`npm run lint` (limpos) e teste manual ponta a ponta contra o
  backend real via `expo start --web` (headless Edge + CDP, cliques reais via
  `Input.dispatchMouseEvent` — sintético `.click()` do DOM não aciona o `Pressable` do React
  Native Web): login como associado, listagem de eventos publicados, mapa de mesas com status ao
  vivo, reserva de mesa concluída com sucesso (mapa e aba Minhas Reservas atualizados sem
  refresh), compra de ingresso avulso concluída com sucesso. Dados de teste (associado/salão/
  mesas/eventos) removidos do banco de dev ao final.

  **Adendo 2026-08-30 (verificação em device real):** repetido o mesmo fluxo completo (login,
  eventos, mapa de mesas, reserva, compra de ingresso) num emulador Android nativo (API 36,
  `expo run:android`, GPU software — a aceleração de hardware padrão do emulador devolve
  screenshot preto mesmo com o app renderizando normalmente, então `-gpu swiftshader_indirect` é
  necessário pra capturar telas por `adb`, não é bug do app). Achado um bug real no *seed* de
  teste (não no app): `ConfiguracaoMesaEventoDto.preco` exige `@IsPositive()` mesmo pra mesa
  bloqueada — mandar `preco: 0` numa mesa bloqueada derruba a validação do array inteiro (400),
  deixando o evento sem nenhuma mesa configurada; a UI reagiu corretamente ("Este evento ainda não
  tem mesas configuradas"), then confirmado como erro de dado ao inspecionar a API diretamente.
  Fora isso, todo o fluxo (mapa ao vivo, diálogo de reserva, confirmação, compra de ingresso,
  Minhas Reservas atualizada) reproduziu exatamente o que já tinha passado no teste web. Prints
  reais publicados em artifact (ver anexos da sessão).

  **Adendo 2026-09-04 (remoção do "preço de vitrine"):** ver adendo correspondente em T-BE-009 pra
  explicação completa do problema. O cartão "Ingresso avulso" não recebe mais um `preco` fixo vindo
  de `ConfiguracaoIngressoEvento` — passa a buscar o preço efetivo do próprio associado logado via
  novo hook `useMeuPrecoIngresso` (`GET /eventos/:eventoId/meu-preco-ingresso`). Estados novos no
  cartão: carregando (spinner), preço indisponível (associado sem categoria de sócio configurada,
  ou categoria sem preço nem override do evento nem padrão da entidade — mensagem orientando a
  falar com a diretoria, botão de compra desabilitado). Validado com `npx tsc --noEmit` (limpo).

#### Ticket: T-MOB-005 Notificações (lembrete de inadimplência, confirmações)
- **Priority:** Should
- **Status:** Implementado, pendente de push token real (Firebase/FCM)
- **Owner:** Unassigned
- **Scope:** Push notification para lembrete automático de mensalidade em atraso e confirmações de
  reserva/compra.
- **Acceptance Criteria:** Associado recebe notificação ao entrar em `Status: Inadimplente`.
- **Validation Steps:** Teste manual disparando o job de lembrete do backend.
- **Notes:** `mobile/PLANEJAMENTO.md` §5 exige "push notification testada de ponta a ponta (backend
  dispara → device recebe)" antes de fechar esta ticket como Done.

  **Adendo 2026-08-30:** o bloqueio original ("sem device/emulador, sem projeto EAS") foi
  parcialmente removido — o projeto EAS (`@ogarciia/pia-do-sul`) foi criado e um emulador Android
  real passou a estar disponível nesta sessão. Rodando o app nativo no emulador, o diálogo real de
  permissão do Android ("Allow Pia do Sul to send you notifications?") apareceu e foi concedido —
  prova de que o fluxo de permissão funciona de ponta a ponta num device de verdade. Mas o token
  não chegou a ser gerado: o logcat mostra `FirebaseApp failed to initialize... no default options
  were found` — falta o `google-services.json` (projeto Firebase + credencial FCM configurada no
  EAS), pré-requisito do Android pro Expo Push Service que é uma pendência separada e nova,
  substituindo a pendência antiga. Sem isso, `getExpoPushTokenAsync` nunca retorna um token válido
  neste app, mesmo com permissão concedida e projectId configurado — não é mais "sem device", é
  "sem credencial FCM".

  Backend reaproveita a porta `NotificationSenderPort` que já existia (usada desde o lembrete de
  inadimplência, T-BE-006) — só trocou o adapter provisório
  (`ConsoleNotificationSenderAdapter`, só logava) por um real:
  - `ExpoPushNotificationSenderAdapter` — resolve `destinatarioId` (sempre um `associadoId`) até
    os tokens de push do usuário vinculado e envia via Expo Push API (`exp.host/--/api/v2/push/
    send`). Continua logando sempre (visibilidade em dev sem device), e nunca lança — falha ao
    notificar não pode derrubar a operação de negócio que já aconteceu de verdade.
  - `push_tokens` (migration nova) guarda o(s) token(s) de push por usuário (mais de um device por
    conta é normal — troca de celular sem deslogar do antigo).
  - `POST /notificacoes/push-token` (`@Roles(ASSOCIADO)`) registra o token do device, idempotente.
  - Pontos de disparo novos: `SolicitarReservaUseCase`/`ConfirmarReservaPendenteUseCase` (reserva
    confirmada, mediada ou pelo app) e `ComprarMeuIngressoUseCase` (ingresso emitido) — o lembrete
    de inadimplência (`ProcessarInadimplenciaUseCase`) já chamava a porta antes, não precisou
    mudar. 3 casos novos em `notificacoes.e2e-spec.ts`, suíte completa em 48/48, build/lint
    limpos. Testado manualmente contra o backend real (registro de token + reserva + compra
    disparando os dois pushes, sem bloquear a resposta — log confirmado, ver
    `ExpoPushNotificationSenderAdapter`).

  Mobile: `expo-notifications` + `expo-device`/`expo-constants` instalados, plugin configurado em
  `app.json` (cor `#7A2331`). `registrarParaPushNotifications()`
  (`src/features/notificacoes/register-push-token.ts`) segue o padrão oficial da doc do SDK 57
  (canal Android dedicado, `requestPermissionsAsync`, `getExpoPushTokenAsync` com `projectId`) e é
  100% best-effort — nunca lança, só retorna `null` quando não dá pra registrar (permissão negada,
  sem `projectId` de EAS). `useRegistrarPushToken()` dispara isso uma vez ao entrar em `(app)`
  (`(app)/_layout.tsx`) e registra o token no backend quando um é obtido. Validado com `npx tsc
  --noEmit`/`npm run lint` (limpos) e smoke test via `expo start --web`: login normal, tela
  renderiza sem erro/crash, nenhum token espúrio registrado no backend (esperado — web não tem
  `projectId` de EAS nem suporte completo de push do `expo-notifications`).

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
