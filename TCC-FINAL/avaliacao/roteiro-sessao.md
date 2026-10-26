# Roteiro de Sessão — Querência ERP

> Script literal do moderador, passo a passo, telas e botões exatos de cada fluxo (Seção 5 de
> `plano-avaliacao.md`), já refletindo a interface atual (checada em 2026-10-25). Usar junto com
> `materiais-impressao.md` (fichas dos participantes) e `scripts/verificar-tarefas.js` (checagem
> objetiva de conclusão — ver `backend/scripts/verificar-tarefas.js`).
>
> Cada sessão real provavelmente encadeia os 3 fluxos num único participante (a amostra de 6–10
> por entidade não cobre 1 participante por combinação fluxo×papel) — ver nota ao final de cada
> fluxo sobre como a conta criada num fluxo alimenta o próximo.

## Antes de começar (checklist do moderador)

- [ ] Celular do moderador com o APK já instalado (build mais recente — ver link do EAS), pronto
      pra ser entregue ao participante durante os cenários do papel Associado — não depende do
      celular do participante nem de instalação no dia. Pro papel Diretoria, acesso ao painel web
      logado como administrador.
- [ ] Conectividade confirmada no local (Wi-Fi da sede ou dados móveis) — o sistema depende de
      um backend real na nuvem, não funciona offline.
- [ ] `backend/scripts/verificar-tarefas.js` acessível (terminal com `cd backend` já configurado,
      `.env` com acesso ao banco).
- [ ] Fichas impressas da Seção "Personas" de `materiais-impressao.md` em mãos, uma reservada por
      execução de cadastro (cada persona só pode ser usada uma vez).
- [ ] Cronômetro e planilha/papel pra registrar tempo, erros e intervenções (ver Instrumento 6.2
      do plano).
- [ ] Formulário SUS pronto (digital ou impresso) — `sus-painel-web.md` ou `sus-app-mobile.md`,
      conforme o papel do participante.

---

## Fluxo 1 — Cadastro de associado (RF01, RF18)

### Papel: Diretoria (painel web)

**O que dizer ao participante:** "Alguém novo quer se associar à entidade. Você recebeu esta
ficha preenchida à mão — cadastre essa pessoa no sistema como se fosse um caso real."

**Passo a passo:**
1. Entregar uma ficha ainda não usada (ver `materiais-impressao.md`, Seção "Personas").
2. Participante acessa **Associados → Novo associado** (`/associados/novo`).
3. Preenche: Nome completo, CPF, Telefone, E-mail (a tela agora pede e-mail numa linha cheia,
   abaixo de CPF/telefone — não é mais ao lado de outro campo).
4. Preenche o endereço (CEP aciona autopreenchimento de logradouro/bairro/cidade/UF — se a busca
   falhar, completar manualmente).
5. Seleciona a **Categoria de sócio** — campo agora obrigatório (aparece com `*` e erro em
   vermelho se deixado em branco). Usar a categoria indicada na ficha.
6. Clica **Salvar**.
7. Confirma que o associado aparece na listagem (`/associados`), buscando pelo nome ou CPF da
   ficha.

**Se o participante travar:** depois de ~2 min sem progresso, o moderador pode indicar o campo
específico (registrar como 1 intervenção), não resolver a tarefa por ele.

**Verificação objetiva (rodar depois do passo 7):**
```
cd backend
node scripts/verificar-tarefas.js 1 <CPF-DA-FICHA>
```
Esperado: ✅ nos dois critérios de status (associado existe, `ativo`) — a conta de login ainda
não aparece vinculada nesta etapa (normal, isso só acontece se um associado também vincular a
própria conta — ver abaixo).

### Papel: Associado (app mobile)

**O que dizer:** "Você quer se tornar associado da entidade e está criando sua conta pelo
aplicativo pela primeira vez."

**Variante A — Auto-cadastro (a maioria dos participantes):**
1. Abrir o app → tela de login → **"Ainda não é associado? Cadastre-se"**.
2. Preencher com os dados de uma ficha de persona ainda não usada: Nome, CPF, Telefone
   (seção "Dados pessoais"), Endereço (seção com ícone de mapa), E-mail e Senha (seção "Acesso",
   com botão de olho pra mostrar/ocultar a senha).
3. Tocar **Criar conta**.
4. Esperado: mensagem de sucesso / tela indicando "pendente de validação".

**Verificação:**
```
node scripts/verificar-tarefas.js 1 <CPF-DA-FICHA>
```
Esperado: ✅ associado existe com status `pendente_validacao` **e** ✅ conta de login vinculada.

**Variante B — Vincular conta (rodar com pelo menos 1 participante associado):**
Pré-requisito: um CPF já cadastrado pela diretoria no Fluxo 1 (papel Diretoria), **ainda sem**
conta de login própria. Anotar esse CPF na hora (não é uma ficha impressa — é um dado gerado na
própria sessão).
1. Tela de login → **"Já é associado mas nunca acessou?"**.
2. Preencher CPF (o mesmo que a diretoria cadastrou), e-mail e senha novos.
3. Tocar **Vincular conta**.

**Verificação:** mesmo comando acima, com o CPF anotado — esperado: ✅ ambos os critérios (o
status já era `ativo`, agora também aparece ✅ conta de login vinculada).

> **Encadeamento:** a conta criada em qualquer uma das duas variantes (desde que tenha
> `categoriaSocioId` definida — sempre verdade na Variante B, e na Variante A só depois que a
> diretoria aprovar e atribuir categoria) pode ser reaproveitada como a conta do **mesmo
> participante** nos Fluxos 2 e 3, evitando ter que preparar contas de teste separadas.

---

## Fluxo 2 — Compra de ingresso e check-in (RF12, RF20, RF21)

**Pré-requisito:** escolher, antes da sessão, um evento publicado com ingresso avulso configurado
(idealmente também com mesas, pra também poder exercitar essa opção quando disponível — a tela
só mostra a aba "Mesa" se o evento tiver mesas de fato cadastradas).

### Papel: Associado (app mobile)

1. Abrir a aba **Eventos**, tocar no evento escolhido.
2. Na tela do evento (título e badges de data/local agora centralizados), tocar **Comprar
   ingressos**.
3. Se aparecer o seletor "Mesa / Ingresso avulso", escolher **Ingresso avulso** (a menos que o
   moderador peça explicitamente a variante de reserva de mesa).
4. Confirmar a compra do próprio ingresso (e, opcionalmente, adicionar 1 acompanhante — bom
   momento pra testar que o código do ingresso diferencia duas compras do mesmo comprador).
5. Abrir a aba **Ingressos**, localizar o ingresso recém-comprado — confirmar que aparece um
   código (`#001`, `#002`...) junto ao nome, e o QR ao tocar no card.

**Verificação (depois do passo 5):**
```
node scripts/verificar-tarefas.js 2 <CPF-DO-PARTICIPANTE> "<trecho do nome do evento>"
```
Esperado: ✅ ingresso emitido; check-in ainda não validado (normal nesse ponto).

### Papel: Diretoria (painel web)

1. Acessar **Eventos → [o evento] → Ingressos** (`/eventos/[id]/ingressos`).
2. Tocar **Ler código** (ou o botão equivalente de câmera) e apontar pro QR mostrado pelo
   participante-associado — **ou**, conforme instrução do moderador, digitar o código
   manualmente no campo de texto (os dois caminhos precisam ser exercidos ao menos uma vez cada,
   em participantes diferentes).
3. Na tela de conferência que abre (nome + código do ingresso, evento, categoria, valor, status),
   revisar os dados e tocar **Confirmar entrada** — o check-in não é mais automático ao ler o QR.
4. Confirmar que a listagem/contadores do evento (emitidos / validados / aguardando) atualizam.

**Verificação (depois do passo 4):**
```
node scripts/verificar-tarefas.js 2 <CPF-DO-ASSOCIADO> "<trecho do nome do evento>"
```
Esperado: ✅ ingresso emitido **e** ✅ entrada validada, com horário preenchido.

---

## Fluxo 3 — Pagamento de mensalidade (RF05, RF06, RF07, RF19)

**Antes de começar:** avisar o participante de que o pagamento online usa uma porta de pagamento
simulada (RF19) — a tarefa valida a interação com a interface e o registro no sistema, não um
pagamento financeiro real.

### Papel: Associado (app mobile)

1. Abrir a aba **Mensalidade**, localizar a cobrança em aberto do mês.
2. Tocar **Pagar** e seguir o fluxo de pagamento online (simulado).
3. Confirmar que o histórico passa a mostrar a competência como paga.

**Verificação:**
```
node scripts/verificar-tarefas.js 3 <CPF-DO-PARTICIPANTE>
```
Esperado: ✅ mensalidade paga, com data/forma de pagamento preenchidas.

### Papel: Diretoria (painel web)

1. Acessar **Mensalidades** (`/mensalidades`), localizar o mesmo associado, confirmar visualmente
   o pagamento refletido no histórico.
2. Abrir o **Relatório de inadimplência** e confirmar que esse associado não consta mais na lista.
3. **Variação** (rodar com outro participante, usando um associado fictício ainda inadimplente —
   ver `materiais-impressao.md`): localizar esse associado no relatório de inadimplência e
   registrar manualmente um **pagamento presencial** por ele.

**Verificação (variação de pagamento presencial):**
```
node scripts/verificar-tarefas.js 3 <CPF-DO-ASSOCIADO-INADIMPLENTE>
```
Esperado: ✅ mensalidade paga, com `forma_pagamento = presencial`.

---

## Depois da sessão

1. Rodar os 3 comandos de verificação acima (se ainda não rodados durante a sessão) e anotar o
   resultado na planilha de observação, cruzando com o número de intervenções do moderador —
   essa combinação é o que classifica a tarefa como *concluída sem ajuda* / *concluída com
   intervenção* / *não concluída* (ver `plano-avaliacao.md` §6.1–6.2).
2. Aplicar o formulário SUS correspondente ao papel do participante.
3. Conduzir a entrevista semiestruturada (roteiro em `plano-avaliacao.md` §6.4, 8 perguntas,
   pareado com o Apêndice A.2 de `main.tex`).
