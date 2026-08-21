# Planejamento — Backend (API)

> Detalha a frente de backend dentro do `PLANEJAMENTO-GERAL.md`.

## 1. Visão Geral

API REST em NestJS, seguindo **Arquitetura Hexagonal (Ports and Adapters) + princípios de Clean
Architecture** (decisão travada do TCC — ver `CLAUDE.md`), servindo tanto o painel web quanto o app
mobile. Persistência em PostgreSQL via TypeORM com migrations versionadas.

## 2. Camadas e Convenções

```
src/
  <modulo>/                      (ex.: associados, mensalidades, eventos, reservas, identidade)
    domain/                      entidades e regras de negócio puras, sem dependência de framework
    application/
      use-cases/                 um caso de uso por ação de negócio (ex.: CadastrarAssociado)
      ports/                     interfaces das dependências externas (ex.: AssociadoRepository,
                                  PaymentGateway) — o domínio depende só destas interfaces
    infrastructure/
      adapters/
        persistence/              implementação TypeORM das portas de repositório
        gateways/                 implementação concreta de integrações externas
      controllers/                controllers HTTP (NestJS), DTOs de entrada/saída, Swagger
  shared/                        utilidades transversais (guards, decorators, filtros de exceção)
```

Regra de dependência: `domain` não importa nada de `application`/`infrastructure`; `application` só
conhece `domain` e suas próprias `ports`; `infrastructure` implementa as `ports` e é o único lugar
que conhece TypeORM, HTTP, ou bibliotecas de terceiros. Controllers **não** contêm regra de negócio —
apenas traduzem HTTP ↔ use case.

## 3. Módulos de Domínio (mapeados aos fluxos)

| Módulo | Fluxo(s) fonte | Requisitos |
|---|---|---|
| `identidade` | — (transversal) | RNF02 |
| `associados` | `cadastro-associado.json` | RF01–RF04 |
| `mensalidades` | `mensalidade.json`, `relatorio-inadimplencia.json` | RF05–RF08 |
| `eventos` | `croqui-salao.json`, `evento.json` | RF09, RF10 |
| `reservas` | `reserva-mesa.json`, `emissao-ingresso.json`, `cancelamento-transferencia-reserva.json` | RF11, RF12, RF14, RF15 |

## 4. Portas de Saída (Adapters externos)

- `PaymentGateway` — abstrai o provedor de pagamento (mensalidades online e ingressos online).
  Nenhum use case deve importar o SDK do provedor diretamente.
- `NotificationSender` — abstrai push/e-mail, usado pelo lembrete automático de inadimplência e
  confirmações de reserva/compra.
- `AssociadoRepository`, `MensalidadeRepository`, `EventoRepository`, `ReservaRepository`,
  `IngressoRepository` — cada um implementado por um adapter TypeORM em
  `infrastructure/adapters/persistence`.

## 5. Modelo de Dados (rascunho inicial, sujeito a migration incremental)

Entidades centrais previstas (nomes preliminares, refinar ao implementar cada módulo):
`Associado`, `Dependente`, `CategoriaSocio`, `Mensalidade`, `Pagamento`, `Evento`, `CroquiSalao`,
`Mesa`, `Reserva`, `Ingresso`, `Usuario` (identidade/RBAC). Relações principais: Associado 1—N
Dependente; Associado 1—N Mensalidade; CroquiSalao 1—N Mesa; Evento N—1 CroquiSalao (opcional);
Evento 1—N Reserva; Reserva N—1 Mesa; Evento 1—N Ingresso.

Toda alteração de schema via **migration versionada do TypeORM** — nunca `synchronize: true` fora do
ambiente de desenvolvimento local.

## 6. Definition of Done (backend)

- [ ] Módulo segue a separação de camadas descrita em §2 (checável por revisão de imports: nada em
      `domain`/`application` importa de `infrastructure` ou de bibliotecas de framework).
- [ ] Todo endpoint tem DTO de entrada validado (`class-validator`) e está documentado no Swagger.
- [ ] Todo caso de uso com ramificação (conforme o fluxograma correspondente) tem teste de
      integração cobrindo os caminhos principais, não só o caminho feliz.
- [ ] Migration incluída no mesmo PR que introduz/altera a entidade correspondente.
- [ ] Nenhum dado sensível de pagamento (número de cartão etc.) é persistido — apenas status e
      referência externa da transação (ver Non Goal de dados sensíveis de pagamento).

## 7. Backlog

Os tickets `T-BE-001` a `T-BE-012` vivem no backlog central (`PLANEJAMENTO-GERAL.md` §7). Ordem de
implementação recomendada:

1. `T-BE-001` (esqueleto hexagonal) → `T-BE-002` (auth/RBAC) — fundação, bloqueiam tudo o resto.
2. `T-BE-003`/`T-BE-004` (Associados) — módulo mais simples, valida o padrão de camadas na prática.
3. `T-BE-011` (porta de pagamento, ainda sem adapter real ou com adapter fake) — necessário antes de
   `T-BE-005` e `T-BE-009` para não bloquear o desenvolvimento na escolha do provedor.
4. `T-BE-005`/`T-BE-006` (Mensalidades/Inadimplência).
5. `T-BE-007` (Eventos + Croqui) → `T-BE-008` (Reservas) → `T-BE-009` (Ingressos) — nessa ordem, pois
   cada um depende do anterior existir.
6. `T-BE-010` (Cancelamento/Transferência) — Could, pode ficar para o fim.
7. `T-BE-012` (Swagger completo) — contínuo, revisar a cada módulo, não deixar só para o final.

## 8. Perguntas em Aberto Específicas do Backend

- Job de geração mensal de cobrança (`T-BE-005`): roda via cron interno do NestJS
  (`@nestjs/schedule`) ou via agendador externo? Para o porte da entidade, cron interno é suficiente
  — decisão provisória até haver motivo para mudar.
- Prazo do lembrete automático de inadimplência (`T-BE-006`): manter como variável de ambiente
  configurável até a resposta do CPF Pia do Sul (pendência #9 de `TCC-FINAL/arquitetura/decisoes.md`).
- Regra de suspensão de associado (RF03) e seu efeito sobre mensalidades pendentes: ainda não
  mapeada como fluxo — não implementar `T-BE-003` (parte de status) sem essa decisão, ou implementar
  com a regra mais simples possível (bloqueio manual pela diretoria, sem automação) como fallback.
