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

2 a 4 participantes por entidade (definido com o orientador em 2026-10-26; substitui a faixa de 6 a
10 anterior), ou seja, 4 a 8 no total, distribuídos em dois papéis:

- **Diretoria / responsável administrativo** — testa os passos mediados pela entidade, no painel web.
- **Associado** — testa os passos de autoatendimento, no aplicativo mobile.

Distribuição alvo por entidade: **1 a 2 da Diretoria + 1 a 2 Associados** (mínimo viável: 1 + 1, o
que ainda cobre as duas pontas de cada fluxo). Com 4 pessoas, o ideal é 2 + 2 e pelo menos uma
pessoa idosa ou de menor familiaridade digital entre os Associados.

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

**Implementado.** `backend/src/shared/database/seed-demo.ts`, rodado com `npm run seed:demo`
(requer a API no ar e um usuário administrador já existente). A rotina chama a própria API (mesmo
caminho que a diretoria usa no painel), reaproveitando as regras de negócio dos use cases: garante
as categorias de sócio (Efetivo, Dançarino, Remido), cria associados fictícios (nomes gaúchos
gerados por combinação de pools, CPFs sintéticos, ~10% nascidos por auto-cadastro e ainda pendentes
de validação), gera e paga as mensalidades do mês em proporção mista (pagas online/presencial,
pendentes, inadimplentes após `processar-inadimplencia`), cria um salão com croqui completo (mesas,
paredes, porta e áreas como "Tablado"/"Bar"), publica eventos com preços configurados por
perfil/categoria, e vende ingressos e reserva mesas variados (incluindo alguns já com check-in). É
idempotente por CPF: rodar de novo reaproveita os associados já criados em vez de duplicar.

Depois da primeira rodada (36 associados, um evento), uma olhada nas capturas de tela do artigo
expôs problemas que só ficam visíveis olhando a UI, não só a API: volume baixo demais frente ao
diagnóstico (1.343 e 822 associados reais), inadimplência em ~45% (bem acima do razoável), todo o
cadastro concentrado no dia em que o script rodou e ingressos com check-in carimbado antes da data
do próprio evento. Um segundo script,
`backend/src/shared/database/ajustar-realismo-demo.ts` (`npm run ajustar-demo`), corrigiu isso:
escalou o cohort para 90+ associados, rebalanceou a inadimplência para ~10%, moveu os check-ins
equivocados para um evento já realizado e, por SQL direto (sob confirmação explícita, já que a API
deliberadamente não aceita retroceder `criado_em`/`pago_em`/`usado_em`), espalhou as datas de
cadastro ao longo dos últimos 6 meses com tendência crescente e preencheu 2 competências
retroativas de mensalidade por associado. Os nomes gerados continuam claramente fictícios (sem
semelhança com associados reais das entidades). Rodado contra a API em produção (Cloud Run),
populando o banco real usado pelas duas entidades parceiras nesta fase de preparo (2026-10-18 e
2026-10-19).

## 5. Fluxos avaliados

Os três fluxos abaixo foram escolhidos por cobrirem, de forma combinada, os três módulos centrais do
ecossistema (associados, ingressos/eventos, mensalidades) e por corresponderem a pontos relatados
como prioritários no diagnóstico (Seção 4.1 — RF14, por exemplo, nasceu de um problema relatado por
ambas as entidades).

**Princípio de independência.** Nenhuma tarefa depende do resultado de outra tarefa nem da ação de
outro participante: o estado inicial de cada tarefa é preparado pelo moderador antes da sessão (kit do
participante, em `materiais-impressao.md`). Uma falha em uma tarefa invalida apenas aquela tarefa. As
duas pontas de cada fluxo (diretoria e associado) são avaliadas em tarefas separadas, com dados
pré-preparados, e não encadeadas entre si.

### Fluxo 1 — Cadastro de associado (RF01, RF18)

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
3. Variante a testar com pelo menos um participante (em vez do auto-cadastro, não além dele):
   "Já tenho cadastro" / vincular conta (`(auth)/vincular-conta.tsx`), usando um CPF
   **pré-cadastrado pelo moderador** (ativo, sem login), e não um cadastro feito por outro
   participante.

*Critério de sucesso objetivo:* existe um usuário de autenticação vinculado (`usuarioId` preenchido
no registro de associado correspondente).

### Fluxo 2 — Compra de ingresso e check-in (RF12, RF20, RF21)

**Papel: Associado (app mobile).**
1. Na aba "Eventos", abrir um dos eventos fictícios publicados.
2. Comprar um ingresso (ou reservar mesa, se o moderador pedir essa variante).
3. Abrir a aba "Ingressos" e localizar o ingresso recém-comprado, com o código QR visível.

*Critério de sucesso objetivo:* existe um ingresso emitido para o associado no evento indicado,
`entradaValidada = false`.

**Papel: Diretoria (painel web).**
1. Acessar `/eventos/[id]/ingressos` do mesmo evento e tocar **Check-in**, que abre o modal
   "Check-in por código (QR)".
2. Validar **dois ingressos pré-emitidos pelo moderador**: um lendo o QR pela câmera (mostrado no
   celular do moderador) e outro digitando o código manualmente. Os dois caminhos são exercidos
   pelo mesmo participante, sem depender de nenhum participante-associado.
3. Confirmar que o painel exibe a entrada validada e os cards do evento ("Ingressos emitidos",
   "Já entraram", "Aguardando entrada") atualizam.

*Critério de sucesso objetivo:* cada um dos dois ingressos pré-emitidos passa a `status = usado`,
com `usadoEm` preenchido.

### Fluxo 3 — Pagamento de mensalidade (RF05, RF06, RF07, RF19)

**Papel: Associado (app mobile).**
1. Na aba "Mensalidade", localizar a cobrança em aberto.
2. Realizar o pagamento online (gateway simulado).
3. Verificar que o histórico passa a refletir o pagamento.

*Critério de sucesso objetivo:* a mensalidade indicada pelo moderador muda de `status = pendente`
para `status = paga`, com `pagoEm` preenchida.

**Papel: Diretoria (painel web).**
1. Acessar `/mensalidades` e abrir o relatório de inadimplência para localizar o **associado
   inadimplente reservado pelo moderador** (kit) — a tabela do relatório não tem ação nem link, só
   confirma que ele está lá.
2. Buscar o mesmo associado em **Associados** e abrir sua ficha; no card de mensalidades, lançar o
   pagamento da cobrança em aberto.
3. Confirmar que ele deixa de constar no relatório e que o histórico reflete o pagamento.

*Critério de sucesso objetivo:* a mensalidade do associado reservado muda para `status = paga`, com
`forma_pagamento = presencial` (não depende de nenhum pagamento feito por participante-associado).

## 6. Instrumentos de coleta

### 6.1 Verificação automatizada de conclusão

Para cada tarefa listada na Seção 5, uma rotina de verificação consulta a API/banco imediatamente
após a sessão do participante e confere, de forma objetiva e independente da autopercepção, se o
estado esperado foi atingido. Essa rotina produz uma métrica de **taxa de conclusão da tarefa**
(concluiu sozinho / concluiu com ajuda do moderador / não concluiu), complementar — não substituta —
aos instrumentos subjetivos abaixo. Ver pendência de implementação na Seção 7.

### 6.2 Registro de observação do moderador

Durante cada tarefa, o moderador anota tempo gasto, número de erros (ações desfeitas ou refeitas) e
número de intervenções (vezes em que precisou indicar o próximo passo). É esse registro, não só a
taxa de conclusão, que sustenta a conclusão sobre se o fluxo mediado (RNF01) funcionou de fato como
alternativa viável para quem tem menor familiaridade digital.

### 6.3 Escala SUS

Aplicação do formulário padrão de 10 itens da *System Usability Scale* \parencite{brooke1996},
em português (adaptação de Lourenço, Carmona e Lopes, 2022), imediatamente após o bloco de tarefas de
cada participante. Resultado reportado por participante e, de forma apenas indicativa, agregado por
papel (diretoria vs. associado), somando as duas entidades — não por entidade × papel isoladamente
(ver nota de amostra na Seção 6.5). Interpretado segundo as faixas de Bangor, Kortum e Miller (2009).
Estatística de tendência central usada na agregação por papel: **mediana, não média** (orientação do
orientador em 2026-10-27 — com n tão pequeno por grupo, a média é sensível demais a um único
participante discrepante).

### 6.4 Roteiro de entrevista semiestruturada

Perguntas abertas, conduzidas após o SUS:

1. De forma geral, como foi a experiência de usar o sistema hoje?
2. Em qual momento das tarefas você se sentiu mais em dúvida ou perdido? O que ajudaria ali?
3. Alguma tela ou termo usado no sistema não ficou claro? O vocabulário (categoria de sócio, cargos
   da diretoria, tipos de evento) fez sentido pra entidade, ou soou genérico demais?
4. Comparando com o que vocês já faziam antes (papel, planilha, WhatsApp), esse processo pelo sistema
   parece mais útil, mais fácil, ou não fez diferença? (inspirada nos construtos de utilidade e
   facilidade de uso percebidas do TAM, Davis 1989)
5. (Só para quem usou o fluxo mediado) Você confiaria em pedir pra alguém da diretoria fazer isso por
   você, caso preferisse não usar o sistema diretamente?
6. (Só para diretoria) As categorias de sócio e o croqui do salão, do jeito que ficaram configurados,
   correspondem a como a entidade de fato organiza isso hoje?
7. (Só para diretoria) Nos fluxos em que a diretoria age em nome do associado (como o cadastro
   feito pelo painel), a forma como o sistema trata essa aprovação corresponde a como a entidade
   decide isso hoje, ou falta algum nível de autorização interna?
8. Tem alguma coisa que você esperava encontrar e não encontrou, ou que faria diferente?

### 6.5 Amostra e análise

Cada combinação de entidade × papel (diretoria/associado) reúne de 1 a 2 participantes (2 a 4 por
entidade, 4 a 8 no total). Isso inviabiliza comparação estatística, e até a comparação entre
entidades: a análise é descritiva e de caráter exploratório (estudo de casos múltiplos). A pontuação
SUS é reportada **por participante** (tabela individual) e, de forma apenas indicativa, agrupada por
papel somando as duas entidades (diretoria n≈2–4; associado n≈2–4) usando a **mediana** (não a
média — ver 6.3), sem agregação por entidade × papel isoladamente.
O peso da conclusão recai sobre a triangulação entre os quatro instrumentos acima (taxa de
conclusão, observação, SUS e entrevista), usando análise de conteúdo (Gil, 2017) como técnica. Recrutamento por conveniência, com indicação da própria diretoria
de cada entidade. Uma rodada de teste-piloto interno precede as sessões reais, para calibrar o
roteiro de tarefas e o tempo estimado por sessão.

## 7. Pendências de implementação (antes da sessão real)

- [x] Script de seed de dados fictícios realistas (Seção 4) — `backend/src/shared/database/seed-demo.ts`,
  rodado em 2026-10-18 contra a API em produção.
- [x] Atualizar as capturas de tela do sistema usadas no artigo (estavam desatualizadas em relação à
  interface atual).
- [x] Rotina de verificação automatizada de conclusão (Seção 6.1) —
  `backend/scripts/verificar-tarefas.js`, testada contra dados reais em 2026-10-25 (associado,
  ingresso e mensalidade). Uso documentado em `roteiro-sessao.md`.
- [x] Roteiro literal de sessão, passo a passo por fluxo e papel, refletindo a interface atual —
  `roteiro-sessao.md`.
- [x] Fichas das personas fictícias para os fluxos de cadastro (CPFs conferidos sem colisão em
  2026-10-25) — `materiais-impressao.md`.
- [x] Formulário SUS em português pronto para aplicação — `sus-painel-web.md` (papel Diretoria) e
  `sus-app-mobile.md` (papel Associado), um por interface (ver nota de divergência abaixo).
- [ ] Preparar os kits de participante (`materiais-impressao.md`, "Kits do participante"): CPFs
  pré-cadastrados, contas de teste com mensalidade em aberto, ingressos pré-emitidos e inadimplentes
  reservados — 1 kit por participante confirmado + 1 reserva por entidade. Hoje manual; avaliar um
  script `preparar-kits` no padrão de `seed-demo.ts` (a decidir).
- [ ] Confirmar com cada entidade a lista de participantes e seus papéis (Seção 3).
- [ ] Agendar as datas das sessões com CPF Pia do Sul e CTG Sentinela da Querência.
- [x] Divergência da Seção 6.4 corrigida — agora 8 perguntas, pareadas com o Apêndice A.2 de
  `main.tex` (decisão do autor, não do orientador: as duas versões são nossas de qualquer forma).
- [ ] Consentimento informado dos participantes (TCLE) e gravação (áudio/vídeo, se houver) —
  ainda não endereçado em nenhum documento desta pasta; confirmar exigência da AMF.
- [x] Dispositivo do papel Associado: o próprio moderador leva o celular com o APK já instalado
  e o entrega ao participante durante os cenários — não depende do celular do participante nem
  de instalação no dia. Falta só confirmar conectividade (Wi-Fi/dados) no local de cada sessão.
- [x] Materiais de sessão em PDF, prontos para impressão — `materiais-sessao/`: fichas de persona,
  1 roteiro por fluxo × papel (6 PDFs) e o guia geral do condutor.
- [x] Revisão do orientador sobre SUS, roteiro e materiais (áudio transcrito em
  `TCC-FINAL/revisoes/revisao_avaliacao.md`, 2026-10-27): material validado ("pode tocar ficha").
  Three apontamentos endereçados: (1) usar **mediana**, não média, na agregação por papel do SUS
  (corrigido acima, Seções 6.3 e 6.5); (2) imprimir os materiais para a sessão (já contemplado em
  `materiais-sessao/`); (3) distinguir Apêndice (fluxos/roteiro/fichas, autorais) de Anexo (SUS,
  instrumento de terceiros) no `main.tex` — reproduzido por completo, não apenas resumido.
