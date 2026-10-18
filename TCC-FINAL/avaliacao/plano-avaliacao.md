# Plano de Avaliação — Querência ERP

> Fonte de verdade operacional para a sessão de avaliação com as entidades parceiras (CPF Pia do Sul
> e CTG Sentinela da Querência). O texto de `main.tex` (Método, seção 3.6) resume este plano em
> registro acadêmico; este documento é o nível de detalhe operacional — script do moderador, critérios
> de sucesso objetivos, instrumentos de coleta — que não cabe na prosa do artigo. Decidido em reunião
> com o orientador em 2026-10-18 (ver `TCC-FINAL/revisoes/` se precisar do contexto da conversa).

## 1. Objetivo

Validar, com usuários reais das duas entidades parceiras, se o ecossistema digital qualifica os
processos administrativos identificados no diagnóstico (Seção 4.1 do artigo) — e, em especial, se o
fluxo mediado pela entidade (RNF01) funciona como alternativa viável para participantes com menor
familiaridade digital. A avaliação **não busca** validar a arquitetura técnica (isso já é verificado
pelos 73 testes e2e do backend) — busca validar a experiência de uso.

## 2. Formato da sessão

Sessão individual, moderada, com um participante por vez, em quatro blocos sequenciais:

1. **Demonstração geral** (≈10 min) — o moderador apresenta o sistema (painel e/ou app, conforme o
   papel do participante) de forma guiada, sem o participante tocar ainda, cobrindo navegação geral e
   terminologia da interface. Objetivo: nivelar familiaridade antes de medir desempenho em tarefa.
2. **Execução das tarefas** (≈15-20 min) — o participante executa, sem ajuda do moderador a menos que
   trave por mais de ~2 min, as tarefas do(s) fluxo(s) atribuídos ao seu papel (ver Seção 4). O
   moderador cronometra e anota pontos de hesitação/erro, mas não intervém preventivamente.
3. **Questionário SUS** (≈5 min) — aplicado imediatamente após as tarefas, enquanto a experiência
   ainda está fresca.
4. **Entrevista semiestruturada** (≈10 min) — roteiro de perguntas abertas (Seção 6.3).

Duração total estimada por participante: ~40-45 min.

## 3. Participantes

6 a 10 participantes por entidade (conforme já fixado no artigo), distribuídos em dois papéis:

- **Diretoria / responsável administrativo** — testa os passos mediados pela entidade, no painel web.
- **Associado** — testa os passos de autoatendimento, no aplicativo mobile.

Recrutar participantes com diferentes graus de familiaridade digital, incluindo pessoas idosas —
esse é o ponto que valida (ou não) RNF01 na prática. Confirmar com cada entidade, antes da sessão,
quais pessoas específicas assumem cada papel.

## 4. Ambientação: dados fictícios realistas

Antes de qualquer sessão, popular o banco de cada entidade (ambiente de avaliação, isolado do banco
de produção real) com um conjunto de dados fictícios, mas plausíveis:

- Associados com nomes, categorias de sócio e status variados (ativo, inadimplente, pendente de
  aprovação) — volume pequeno mas não trivial (sugestão: 30-50 associados), o bastante para que
  listagens, busca e paginação pareçam reais, sem replicar o volume de produção (1.343 e 822
  associados, respectivamente) desnecessariamente.
- 2-3 eventos publicados, com croqui de salão configurado (mesas/paredes/portas/áreas) e preços de
  ingresso por categoria.
- Histórico de mensalidades (pagas, pendentes e inadimplentes) e de ingressos já emitidos/validados,
  pra que o participante não comece a tarefa de uma base vazia.

Implementação: script de seed (Node, reaproveitando os repositórios/TypeORM do backend) a ser escrito
em `backend/` — ver pendência na Seção 7. Os nomes gerados devem ser claramente fictícios (evitar
qualquer semelhança com associados reais das entidades).

## 5. Fluxos avaliados

Os três fluxos abaixo foram escolhidos por cobrirem, de forma combinada, os três módulos centrais do
ecossistema (associados, ingressos/eventos, mensalidades) e por corresponderem a pontos relatados
como prioritários no diagnóstico (Seção 4.1 — RF14, por exemplo, nasceu de um problema relatado por
ambas as entidades).

### Fluxo 1 — Cadastro de associado (RF01, RF04, RF18)

**Papel: Diretoria (painel web).**
1. Acessar `/associados/novo`.
2. Preencher dados pessoais, endereço e categoria de sócio de uma pessoa fictícia dada pelo moderador
   (ficha em papel, simulando a proposta física que a entidade usa hoje).
3. Salvar o cadastro.
4. Localizar o associado recém-criado em `/associados` e, se o fluxo da entidade exigir aprovação,
   aprová-lo.

*Critério de sucesso objetivo:* existe, no banco, um registro de associado com CPF/nome informados
pelo moderador, com `status = ativo` (ou `pendente`, se a etapa de aprovação não foi exercida) ao
final da tarefa.

**Papel: Associado (app mobile).**
1. Abrir o app e, na tela de autenticação, escolher "Criar conta" (`(auth)/cadastro.tsx`).
2. Preencher o auto-cadastro com um CPF fictício fornecido pelo moderador.
3. Alternativa a testar com pelo menos um participante: "Já tenho cadastro" / vincular conta
   (`(auth)/vincular-conta.tsx`), usando um CPF que a diretoria já cadastrou no Fluxo 1.

*Critério de sucesso objetivo:* existe um usuário de autenticação vinculado (`associadoId`
preenchido) ao registro de associado correspondente.

### Fluxo 2 — Compra de ingresso e check-in (RF12, RF20, RF21)

**Papel: Associado (app mobile).**
1. Na aba "Eventos", abrir um dos eventos fictícios publicados.
2. Comprar um ingresso (ou reservar mesa, se o moderador pedir essa variante).
3. Abrir a aba "Ingressos" e localizar o ingresso recém-comprado, com o código QR visível.

*Critério de sucesso objetivo:* existe um ingresso emitido para o associado no evento indicado,
`entradaValidada = false`.

**Papel: Diretoria (painel web).**
1. Acessar `/eventos/[id]/ingressos` do mesmo evento.
2. Ler o código QR exibido pelo participante-associado (pela câmera) **ou** digitar manualmente o
   código, conforme instrução do moderador (os dois caminhos de validação precisam ser exercidos ao
   menos uma vez cada, em participantes diferentes).
3. Confirmar que o painel exibe a entrada validada e os totais atualizados (emitidos / validados /
   aguardando).

*Critério de sucesso objetivo:* o mesmo ingresso do passo anterior passa a `entradaValidada = true`,
com timestamp de validação populado.

### Fluxo 3 — Pagamento de mensalidade (RF05, RF06, RF08)

**Papel: Associado (app mobile).**
1. Na aba "Mensalidade", localizar a cobrança em aberto.
2. Realizar o pagamento online (gateway simulado).
3. Verificar que o histórico passa a refletir o pagamento.

*Critério de sucesso objetivo:* a mensalidade indicada pelo moderador muda de `status = pendente`
para `status = pago`, com `dataPagamento` preenchida.

**Papel: Diretoria (painel web).**
1. Acessar `/mensalidades`.
2. Localizar o mesmo associado e confirmar visualmente o pagamento refletido no histórico.
3. Abrir o relatório de inadimplência e confirmar que esse associado não consta mais na lista (ou,
   numa variação da tarefa com outro associado fictício ainda inadimplente, localizá-lo na lista e
   registrar manualmente um pagamento presencial por ele).

*Critério de sucesso objetivo:* idem ao passo anterior (estado da mensalidade no banco), mais — na
variação de pagamento presencial — uma nova entrada de pagamento com `canal = presencial`.

## 6. Instrumentos de coleta

### 6.1 Verificação automatizada de conclusão

Para cada tarefa listada na Seção 5, uma rotina de verificação consulta a API/banco imediatamente
após a sessão do participante e confere, de forma objetiva e independente da autopercepção, se o
estado esperado foi atingido. Essa rotina produz uma métrica de **taxa de conclusão da tarefa**
(concluiu sozinho / concluiu com ajuda do moderador / não concluiu), complementar — não substituta —
aos instrumentos subjetivos abaixo. Ver pendência de implementação na Seção 7.

### 6.2 Escala SUS

Aplicação do formulário padrão de 10 itens da *System Usability Scale* \parencite{brooke1996},
em português, imediatamente após o bloco de tarefas de cada participante. Resultado por participante
e, na análise, agregado por entidade e por papel (diretoria vs. associado) para a comparação prevista
no método (Seção 3.6 do artigo).

### 6.3 Roteiro de entrevista semiestruturada

Perguntas abertas, conduzidas após o SUS:

1. De forma geral, como foi a experiência de usar o sistema hoje?
2. Em qual momento das tarefas você se sentiu mais em dúvida ou perdido? O que ajudaria ali?
3. Alguma tela ou termo usado no sistema não ficou claro?
4. [Só para quem usou o fluxo mediado] Você confiaria em pedir pra alguém da diretoria fazer isso por
   você, caso preferisse não usar o sistema diretamente?
5. [Só para diretoria] Esse processo ficou mais rápido, mais lento ou parecido com o que vocês já
   faziam antes (planilha/papel)?
6. Tem alguma coisa que você esperava encontrar e não encontrou, ou que faria diferente?

## 7. Pendências de implementação (antes da sessão real)

- [ ] Script de seed de dados fictícios realistas (Seção 4) — a escrever em `backend/`.
- [ ] Rotina de verificação automatizada de conclusão (Seção 6.1) — a escrever, provavelmente como um
  script Node separado que roda consultas diretas (TypeORM ou SQL) após cada sessão.
- [ ] Formulário SUS em português pronto para aplicação (papel ou formulário digital simples).
- [ ] Confirmar com cada entidade a lista de participantes e seus papéis (Seção 3).
- [ ] Agendar as datas das sessões com CPF Pia do Sul e CTG Sentinela da Querência.
- [ ] Atualizar as capturas de tela do sistema usadas no artigo (estão desatualizadas em relação à
  interface atual) — relacionado, mas não bloqueante para este plano.
