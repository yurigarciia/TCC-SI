# Resultados da Sessão de Avaliação — CTG Sentinela da Querência

> Registro da primeira sessão de avaliação de usabilidade, realizada em 2026-10-29. Preenchido
> incrementalmente com os dados repassados pelo moderador (papel de cada participante, tempo gasto,
> persona/CPF usado) e cruzado contra o banco via `backend/scripts/verificar-tarefas.js`
> (`plano-avaliacao.md` §6.1).

## Participantes

| Participante | Papel | Fluxos executados | Tempo total |
|---|---|---|---|
| (a identificar) | Diretoria | F1, F2, F3 | 2:14 + 1:20 + 0:31 = 4:05 |
| (a identificar) | Associado | F1, F2, F3 | 3:06 + 0:30 + 0:15 = 3:51 |

Todas as seis tarefas concluídas **sem intervenção** do moderador.

## Verificação por tarefa

### Fluxo 1 — Diretoria — Cadastro de associado

- Tempo gasto: 2:14
- Persona usada: P01 — Vera Lúcia Pereira dos Santos (CPF 911.990.000-01)

```
$ node scripts/verificar-tarefas.js 1 91199000001

=== Fluxo 1 — Cadastro de associado — CPF 911.990.000-01 ===
Nome: Vera Lucia Pereira dos Santos
Status: ativo
Categoria de sócio: Efetivo
Cadastrado em: 29/10/2026, 15:35:11
✅ Critério de conclusão (associado existe com status ativo ou pendente_validacao): OK
ℹ️  Sem conta de login vinculada ainda — esperado se só a diretoria cadastrou (Fluxo 1, papel
Diretoria), sem o passo do associado ter rodado.
```

### Fluxo 2 — Diretoria — Validação de entrada no evento

- Tempo gasto: 1:20
- Evento: Jantar Dançante de Primavera
- Convite validado: Yuri Garcia, código **#002**

```
$ node scripts/verificar-tarefas.js 2 05373761001 "Jantar Dançante de Primavera"

=== Fluxo 2 — Compra de ingresso e check-in — Yuri Garcia ===
Ingresso #002 — "Jantar Dançante de Primavera" — status: usado — entrada validada em 29/10/2026,
16:33:51
✅ Ingresso emitido (critério da etapa do associado — comprou pelo app): OK
✅ Entrada validada (critério da etapa da diretoria — check-in confirmado): OK
```

### Fluxo 3 — Diretoria — Pagamento presencial de mensalidade

- Tempo gasto: 0:31
- Associado pago: Rosane Terezinha Brum (CPF 100.000.237-57)

```
$ node scripts/verificar-tarefas.js 3 10000023757

=== Fluxo 3 — Pagamento de mensalidade — Rosane Terezinha Brum ===
Competência 2026-10 — status: paga — pago em 28/10/2026, 21:00:00 (presencial)
✅ Mensalidade paga (critério de conclusão da tarefa): OK
```

### Fluxo 1 — Associado — Cadastro de associado (auto-cadastro)

- Tempo gasto: 3:06
- Persona usada: P02 — Osvaldo Ramires Fagundes (CPF 911.990.000-02)

```
$ node scripts/verificar-tarefas.js 1 91199000002

=== Fluxo 1 — Cadastro de associado — CPF 911.990.000-02 ===
Nome: Osvaldo RamiresFagundes
Status: pendente_validacao
Categoria de sócio: (nenhuma)
Cadastrado em: 29/10/2026, 16:02:14
✅ Critério de conclusão (associado existe com status ativo ou pendente_validacao): OK
✅ Conta de login vinculada (associado concluiu auto-cadastro ou "vincular conta").
```

(Confirma que foi o auto-cadastro completo — variante A —, não cadastro mediado.)

### Fluxo 2 — Associado — Compra de ingresso

- Tempo gasto: 0:30
- Usuário: Yuri Garcia (CPF 053.737.610-01)
- Evento: Baile da Invernada Mirim
- Código do ingresso comprado (conforme anotado): #007

```
$ node scripts/verificar-tarefas.js 2 05373761001 "Baile da Invernada Mirim"

=== Fluxo 2 — Compra de ingresso e check-in — Yuri Garcia ===
Ingresso #007 — "Baile da Invernada Mirim" — status: emitido
✅ Ingresso emitido (critério da etapa do associado — comprou pelo app): OK
ℹ️  Entrada ainda não validada — normal antes do passo de check-in da diretoria. Rode este
comando de novo depois do check-in.
```

(Esperado — essa tarefa não inclui o check-in, que é etapa separada da Diretoria.)

### Fluxo 3 — Associado — Pagamento de mensalidade

- Tempo gasto: 0:15
- Usuário: Yuri Garcia (CPF 053.737.610-01)

```
$ node scripts/verificar-tarefas.js 3 05373761001

=== Fluxo 3 — Pagamento de mensalidade — Yuri Garcia ===
Competência 2026-10 — status: paga — pago em 29/10/2026, 18:55:34 (online)
✅ Mensalidade paga (critério de conclusão da tarefa): OK
```

## Resumo

- Verificações ✅: F1, F2 e F3 — Diretoria e Associado (6 de 6) — todas batem com o banco.
- Verificações ❌ ou pendentes: nenhuma.
- Observações gerais:
  - As seis tarefas foram concluídas sem intervenção do moderador.
