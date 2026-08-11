# Decisões de design — Ecossistema Digital (CPF Pia do Sul)

Log de decisões tomadas durante o mapeamento dos fluxos de negócio (pasta `fluxos/`), em ordem
cronológica. Cada entrada registra o que foi decidido, o porquê, e o que ficou em aberto para validar
em campo (entrevista/observação no CPF Pia do Sul). Serve de matéria-prima para a seção de Resultados
e Discussão do artigo — não é um documento de arquitetura técnica (isso fica nos `.json` e nos
diagramas navegáveis).

---

## Cadastro de Associado — 2026-08-11
,                                      
**Decisões:**
- Existem dois caminhos de entrada: auto-cadastro pelo próprio associado (tela "Criar conta" no app
  mobile, sem exigir login prévio) e cadastro mediado pela diretoria (painel web), coerente com a
  diretriz RNF01 do pré-projeto (fluxos mediados pela entidade para o público com menor familiaridade
  digital).
- Dependentes (RF04) são vinculados no momento do cadastro mediado, como uma decisão explícita da
  diretoria ("cadastra dependentes agora?").
- A categoria de sócio (efetivo, contribuinte, caçula etc.) **não é um enum fixo no sistema** — é uma
  lista cadastrável, mantida pela própria diretoria. Isso vira um CRUD à parte, fora do escopo deste
  fluxo, e evita amarrar o sistema a nomenclaturas específicas do CPF Pia do Sul que podem não valer
  para outras entidades.
- Todo cadastro passa por uma checagem de duplicidade de CPF antes de ser criado.

**Em aberto (validar com o CPF Pia do Sul):**
- Um cadastro feito diretamente pela diretoria entra ativo imediatamente, ou também passa pela mesma
  aprovação exigida para o auto-cadastro via app?
- Quando um cadastro pendente é rejeitado: o associado é notificado? Os dados ficam salvos para nova
  tentativa, ou são descartados?

---

## Controle de Mensalidade — 2026-08-11

**Decisões:**
- A cobrança é gerada **automaticamente** no início de cada ciclo mensal, para todo associado ativo —
  não depende de alguém lançar manualmente para existir um registro "a pagar". Isso é o que permite
  rastrear inadimplência (RF07) de forma consistente.
- O valor da mensalidade varia por categoria de sócio, reaproveitando a mesma lista cadastrável do
  fluxo de Cadastro de Associado (uma categoria concentra tanto o enquadramento do associado quanto o
  valor da sua mensalidade).
- Dois canais de pagamento convivem: lançamento manual pela diretoria (associado paga em
  dinheiro/Pix/transferência por fora, fluxo mediado) e pagamento online direto pelo associado via app,
  processado por um gateway de pagamento externo — coerente com a diretriz arquitetural de não tratar
  diretamente dados financeiros sensíveis.
- Emissão de comprovante (RF08) acontece automaticamente assim que a mensalidade é marcada como paga,
  por qualquer um dos dois canais.

**Em aberto (validar com o CPF Pia do Sul):**
- Quando o associado fica inadimplente, isso apenas aparece no relatório da diretoria (RF07), ou também
  bloqueia funcionalidades como reserva de mesa/ingresso até a regularização?

---

## Cadastro de Croqui de Salão — 2026-08-11

**Contexto:** este fluxo não estava nas tabelas de requisitos do artigo original — surgiu ao mapear os
pré-requisitos de Reserva de Mesa e Emissão de Ingresso. O RF10 do artigo previa "definir configuração
de mesas e ingressos **por evento**"; ao detalhar esse fluxo, ficou claro que faz mais sentido separar
o salão (recurso físico, reutilizável) da configuração específica de cada evento. **Isso é um ponto a
revisar na seção de requisitos do artigo** — provavelmente vale desdobrar RF10 em dois requisitos:
cadastro de croqui de salão e configuração de mesas/ingressos por evento (que passaria a referenciar um
croqui existente).

**Decisões:**
- O croqui é um recurso **reutilizável**: a entidade cadastra o(s) salão(ões) que possui uma vez e
  reaproveita esse croqui em vários eventos, em vez de redesenhar a cada evento.
- O croqui cadastra mesas numeradas com capacidade **e posição espacial (x/y)** — não é uma lista
  simples, é pensado para virar um mapa clicável de seleção de mesa na interface (relevante para o
  fluxo de Reserva de Mesa, que vem a seguir).
- Cadastro/edição é exclusivo da diretoria, pelo painel web — sem envolvimento do associado, mesmo
  padrão dos demais fluxos administrativos.
- O sistema valida que não há numeração de mesa duplicada dentro do mesmo croqui antes de salvar.

**Em aberto (validar com o CPF Pia do Sul):**
- Um croqui já usado em um evento com reservas pode ser editado depois (mover/remover mesa)? Isso
  afetaria reservas existentes — precisa de uma regra clara antes da implementação.

---

## Cadastro de Evento — 2026-08-11

**Decisões:**
- Vincular um croqui de salão ao evento é **opcional** — um evento pode existir só com ingresso avulso,
  sem reserva de mesa (ex.: rodeio artístico ou evento sem estrutura de mesas).
- Quando o evento vincula um croqui, ele define seu próprio **preço e disponibilidade por mesa**
  (podendo bloquear mesas específicas para aquele evento), sem alterar o croqui original — o croqui é a
  estrutura física reutilizável, o evento é a configuração comercial daquela ocorrência.
- Ingresso avulso e reserva de mesa **coexistem** no mesmo evento — não é uma escolha exclusiva.
- O evento nasce como **rascunho** e passa por uma decisão explícita de publicação da diretoria antes
  de ficar visível ao associado no app (RF13) — não é publicado automaticamente ao ser salvo.

**Em aberto (validar com o CPF Pia do Sul):**
- Um evento já publicado — possivelmente já com reservas de mesa ou ingressos vendidos — pode ter
  preço/disponibilidade de mesa ou ingresso editados depois?

---

## Reserva de Mesa — 2026-08-11

**Decisões:**
- Dois canais de entrada convivem, mesmo padrão do Cadastro de Associado: a diretoria lança a reserva
  direto (pedido recebido por fora — WhatsApp, presencial) ou o associado solicita pelo próprio app,
  escolhendo a mesa num mapa que usa a posição espacial (x/y) cadastrada no Croqui de Salão.
- Reserva e pagamento acontecem juntos, reaproveitando os mesmos dois canais de pagamento do fluxo de
  Mensalidade (mediado presencial ou online via gateway).
- A reserva é sempre da **mesa inteira** — não existe reserva de lugar avulso dentro de uma mesa
  compartilhada.
- Mesas **sem** reserva ficam livres para ocupação orgânica no evento (preenchidas por diferentes
  pessoas conforme chegam) — o sistema só controla mesas que têm uma reserva formal.
- Há uma checagem de concorrência ("mesa ainda disponível?") antes de confirmar, para evitar duas
  reservas simultâneas na mesma mesa — risco citado diretamente no roteiro de entrevista original
  (Bloco 4, pergunta 7: "já houve conflito de reserva, mesa dupla vendida?").
- Inclui um caminho básico de cancelamento (RF15, prioridade Could): a diretoria recebe o pedido por
  fora e, se confirmar, o sistema libera a mesa.

**Em aberto (validar com o CPF Pia do Sul):**
- Uma solicitação de mesa feita pelo app com pagamento presencial, aguardando confirmação da
  diretoria, expira depois de quanto tempo se não for confirmada? Ou fica pendente indefinidamente?

---

## Pendências consolidadas para a entrevista/observação de campo

Perguntas que se acumularam mapeando os fluxos e que devem entrar no roteiro de entrevista
semiestruturada com o CPF Pia do Sul:

1. Cadastro mediado pela diretoria: ativa na hora ou exige aprovação, igual ao auto-cadastro?
2. Cadastro rejeitado: associado é notificado? dados descartados ou mantidos para nova tentativa?
3. Inadimplência: só informativa (relatório) ou bloqueia reservas até regularizar?
4. Croqui de salão já usado em evento: pode ser editado depois, e o que acontece com reservas
   existentes se sim?
5. Evento já publicado (com reservas/ingressos vendidos): pode ter preço ou disponibilidade editados
   depois?
6. Solicitação de mesa pendente (paga presencial, aguardando confirmação): tem prazo de expiração?

## Pendências de revisão do texto do artigo

- RF10 ("Definir configuração de mesas e ingressos por evento") provavelmente precisa ser desdobrado
  em dois requisitos após a introdução do croqui de salão reutilizável: (a) cadastro de croqui de
  salão, (b) configuração de mesas/ingressos por evento, referenciando um croqui existente — ver
  decisão do Croqui de Salão acima.
