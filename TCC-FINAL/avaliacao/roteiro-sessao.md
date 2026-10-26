# Roteiro de Sessão — Querência ERP

> Script literal do moderador, passo a passo, telas e botões exatos de cada fluxo (Seção 5 de
> `plano-avaliacao.md`), já refletindo a interface atual (checada em 2026-10-25). Usar junto com
> `materiais-impressao.md` (fichas e kits) e `backend/scripts/verificar-tarefas.js` (checagem
> objetiva de conclusão).

## Princípio: tarefas independentes

Com 2–4 participantes por entidade, **nenhuma tarefa pode depender do resultado de outra tarefa
nem da ação de outro participante**. Se um passo falhar (por erro do participante, bug ou rede),
só aquela tarefa é perdida — registra-se como _não concluída_ e a sessão segue.

Para isso, todo estado de que uma tarefa precisa é **preparado pelo moderador antes da sessão**
(o "kit" do participante, em `materiais-impressao.md`), e não produzido por outra tarefa:

| Tarefa | Estado de que precisa | De onde vem |
|---|---|---|
| F1 Diretoria (cadastrar) | Ficha de persona não usada | Ficha impressa (Pxx) |
| F1 Associado A (auto-cadastro) | Ficha de persona não usada | Ficha impressa (Pxx) |
| F1 Associado B (vincular conta) | CPF de associado **ativo e sem conta de login** | Pré-cadastrado pelo moderador no painel, antes do dia |
| F2 Associado (comprar ingresso) | Conta de teste ativa + evento publicado | Conta de teste do kit (login feito pelo moderador) |
| F2 Diretoria (validar entrada) | 2 ingressos já emitidos, em nome de associados fictícios | Emitidos pelo moderador antes; QR mostrado no celular do moderador |
| F3 Associado (pagar) | Conta de teste com mensalidade em aberto | Conta de teste do kit |
| F3 Diretoria (pagamento presencial) | 1 associado ativo e inadimplente | Reservado pelo moderador antes, anotado no kit |

Cada kit é de **uso único** (ingresso validado, mensalidade paga e persona cadastrada não voltam
ao estado inicial). Preparar 1 kit reserva por entidade além dos participantes confirmados.

## Antes de começar (checklist do moderador)

- [ ] Celular do moderador com o APK já instalado, pronto pra ser entregue ao participante
      durante os cenários do papel Associado — não depende do celular do participante nem de
      instalação no dia. Pro papel Diretoria, acesso ao painel web logado como administrador.
- [ ] Conectividade confirmada no local (Wi-Fi da sede ou dados móveis) — o sistema depende de
      um backend real na nuvem, não funciona offline.
- [ ] `backend/scripts/verificar-tarefas.js` acessível (terminal com `cd backend` já configurado,
      `.env` com acesso ao banco).
- [ ] **Kit do participante conferido** (ver `materiais-impressao.md`, Seção "Kits"): personas,
      CPF pré-cadastrado, conta de teste com mensalidade em aberto, 2 ingressos pré-emitidos e
      associado inadimplente reservado — tudo conferido **na véspera**, no painel, não no dia.
- [ ] Cronômetro e planilha/papel pra registrar tempo, erros e intervenções (ver Instrumento 6.2
      do plano).
- [ ] Formulário SUS pronto (digital ou impresso) — `sus-painel-web.md` ou `sus-app-mobile.md`,
      conforme o papel do participante.

## Se uma tarefa falhar

1. Aplicar a regra de intervenção (depois de ~2 min travado, indicar o campo/botão específico e
   contar como 1 intervenção). Se mesmo assim não avançar, parar a tarefa.
2. Registrar _não concluída_ e o motivo (erro do participante / bug do sistema / rede). Bug do
   sistema vai pra lista de achados, não é apagado.
3. Seguir para a próxima tarefa **sem refazer a anterior**: a próxima já tem seu estado
   preparado no kit. Nunca "consertar" o estado da tarefa seguinte com dados da que falhou.

---

## Fluxo 1 — Cadastro de associado (RF01, RF18)

### Papel: Diretoria (painel web)

**O que dizer ao participante:** "Alguém novo quer se associar à entidade. Você recebeu esta
ficha preenchida à mão — cadastre essa pessoa no sistema como se fosse um caso real."

**Passo a passo:**

1. Entregar a ficha de persona do kit (ainda não usada).
2. Participante acessa **Associados → Novo associado** (`/associados/novo`).
3. Preenche: Nome completo, CPF, Telefone, E-mail.
4. Preenche o endereço.
5. Seleciona a **Categoria de sócio**. Usar a categoria indicada na ficha.
6. Clica **Salvar**.
7. Confirma que o associado aparece na listagem (`/associados`), buscando pelo nome ou CPF da
   ficha.

**Verificação objetiva (rodar depois do passo 7):**

```
cd backend
node scripts/verificar-tarefas.js 1 <CPF-DA-FICHA>
```

Esperado: ✅ nos dois critérios de status (associado existe, `ativo`). A conta de login não
aparece vinculada — é normal, aqui só a diretoria cadastrou.

### Papel: Associado (app mobile)

Cada participante faz **uma** das variantes (alternar entre participantes da mesma entidade; com
um único Associado, fazer a Variante A).

**Variante A — Auto-cadastro**

**O que dizer:** "Você quer se tornar associado da entidade e está criando sua conta pelo
aplicativo pela primeira vez."

1. Partir da tela de login (app deslogado).
2. Tocar **"Ainda não é associado? Cadastre-se"**.
3. Preencher com os dados da ficha de persona do kit: Nome, CPF, Telefone (seção "Dados
   pessoais"), Endereço (seção com ícone de mapa), E-mail e Senha.
4. Tocar **Criar conta**.
5. Esperado: mensagem de sucesso / tela indicando "pendente de validação".

```
node scripts/verificar-tarefas.js 1 <CPF-DA-FICHA>
```

Esperado: ✅ associado existe com status `pendente_validacao` **e** ✅ conta de login vinculada.

**Variante B — Vincular conta**

**O que dizer:** "A diretoria já cadastrou você como associado, mas você nunca entrou no
aplicativo. Use o CPF que consta neste cartão para criar seu acesso."

Pré-requisito: o CPF do kit foi **pré-cadastrado pelo moderador** (ativo, sem login). Não depende
de nenhum participante da Diretoria.

1. Partir da tela de login (app deslogado).
2. Tocar **"Já é associado mas nunca acessou?"**.
3. Preencher o CPF do cartão, e-mail e senha novos.
4. Tocar **Vincular conta**.

```
node scripts/verificar-tarefas.js 1 <CPF-DO-CARTAO>
```

Esperado: ✅ ambos os critérios (status `ativo` + conta de login vinculada).

> **Sem encadeamento:** a conta criada no Fluxo 1 **não** é usada nos Fluxos 2 e 3. Depois do
> Fluxo 1, o moderador sai da conta e entra na **conta de teste do kit** antes de entregar o
> celular de volta (o login dessa conta não é tarefa avaliada).

---

## Fluxo 2 — Compra de ingresso e check-in (RF12, RF20, RF21)

**Pré-requisito:** evento publicado com ingresso avulso configurado, definido no kit
(idealmente também com mesas, pra exercitar essa opção quando disponível — a tela só mostra a aba
"Mesa" se o evento tiver mesas de fato cadastradas).

### Papel: Associado (app mobile)

Conta usada: **conta de teste do kit** (já logada pelo moderador).

1. Abrir a aba **Eventos**, tocar no evento indicado no kit.
2. Na tela do evento, tocar **Comprar ingressos**.
3. Se aparecer o seletor "Mesa / Ingresso avulso", escolher **Ingresso avulso** (a menos que o
   moderador peça explicitamente a variante de reserva de mesa).
4. Confirmar a compra do próprio ingresso (e, opcionalmente, adicionar 1 acompanhante).
5. Abrir a aba **Ingressos**, localizar o ingresso recém-comprado — confirmar que aparece um
   código (`#001`, `#002`...) junto ao nome, e o QR ao tocar no card.

```
node scripts/verificar-tarefas.js 2 <CPF-DA-CONTA-DE-TESTE> "<trecho do nome do evento>"
```

Esperado: ✅ ingresso emitido; check-in ainda não validado (normal nesse ponto).

> Nesta tarefa o QR do participante **não** é lido por ninguém. A validação é avaliada na tarefa
> da Diretoria, com ingressos pré-emitidos.

### Papel: Diretoria (painel web)

Ingressos usados: os **2 ingressos pré-emitidos do kit**, em nome de associados fictícios.
Ingresso **A** = validar por câmera (QR); ingresso **B** = validar por código digitado. O QR do
ingresso A aparece no celular do moderador (app logado na conta do associado fictício) ou na
impressão do kit; o código do ingresso B está anotado no cartão do kit.

**O que dizer:** "Estes dois convidados chegaram ao baile. Confira a entrada de cada um."

1. Acessar **Eventos → [o evento] → Ingressos** (`/eventos/[id]/ingressos`).
2. **Ingresso A:** tocar **Ler código** (câmera) e apontar para o QR mostrado pelo moderador.
3. **Ingresso B:** informar o código digitado manualmente no campo de texto, conforme o cartão.
4. Em cada um, na tela de conferência (nome + código do ingresso, evento, categoria, valor,
   status), revisar os dados e tocar **Confirmar entrada** — o check-in não é automático ao ler
   o QR.
5. Confirmar que a listagem/contadores do evento (emitidos / validados / aguardando) atualizam.

```
node scripts/verificar-tarefas.js 2 <CPF-DO-ASSOCIADO-FICTICIO-A> "<trecho do nome do evento>"
node scripts/verificar-tarefas.js 2 <CPF-DO-ASSOCIADO-FICTICIO-B> "<trecho do nome do evento>"
```

Esperado: ✅ ingresso emitido **e** ✅ entrada validada, com horário preenchido, nos dois.

Se a câmera falhar (permissão, luz, rede), registrar o motivo e pedir o ingresso A pelo caminho
manual, contando como intervenção — sem usar o ingresso B (que continua reservado para o caminho
manual).

---

## Fluxo 3 — Pagamento de mensalidade (RF05, RF06, RF07, RF19)

**Antes de começar:** avisar o participante de que o pagamento online usa uma porta de pagamento
simulada (RF19) — a tarefa valida a interação com a interface e o registro no sistema, não um
pagamento financeiro real.

### Papel: Associado (app mobile)

Conta usada: **conta de teste do kit**, com mensalidade em aberto.

1. Abrir a aba **Mensalidade**, localizar a cobrança em aberto do mês.
2. Tocar **Pagar** e seguir o fluxo de pagamento online (simulado).
3. Confirmar que o histórico passa a mostrar a competência como paga.

```
node scripts/verificar-tarefas.js 3 <CPF-DA-CONTA-DE-TESTE>
```

Esperado: ✅ mensalidade paga, com data/forma de pagamento preenchidas.

### Papel: Diretoria (painel web)

Associado usado: o **associado inadimplente reservado no kit** (nome e CPF anotados antes).

**O que dizer:** "Este associado veio até a sede pagar a mensalidade em atraso. Registre o
pagamento."

1. Acessar **Mensalidades** (`/mensalidades`) e abrir o **Relatório de inadimplência**.
2. Localizar o associado do kit na lista.
3. Registrar manualmente um **pagamento presencial** por ele.
4. Confirmar que o associado deixa de constar no relatório e que o histórico reflete o
   pagamento.

```
node scripts/verificar-tarefas.js 3 <CPF-DO-ASSOCIADO-INADIMPLENTE>
```

Esperado: ✅ mensalidade paga, com `forma_pagamento = presencial`.

---

## Depois da sessão

1. Rodar os comandos de verificação acima (se ainda não rodados durante a sessão) e anotar o
   resultado na planilha de observação, cruzando com o número de intervenções do moderador —
   essa combinação é o que classifica a tarefa como _concluída sem ajuda_ / _concluída com
   intervenção_ / _não concluída_ (ver `plano-avaliacao.md` §6.1–6.2).
2. Aplicar o formulário SUS correspondente ao papel do participante.
3. Conduzir a entrevista semiestruturada (roteiro em `plano-avaliacao.md` §6.4, 8 perguntas,
   pareado com o Apêndice A.2 de `main.tex`).
4. Marcar o kit como **usado** (personas, CPF pré-cadastrado, ingressos, inadimplente) e, se
   houver participante seguinte, abrir o próximo kit — nunca reaproveitar itens.
