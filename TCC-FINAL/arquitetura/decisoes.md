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

## Emissão de Ingresso — 2026-08-11

**Contexto:** este fluxo incorpora diretamente três achados da primeira rodada de entrevista escrita
com o CPF Pia do Sul (ver seção "Resultado da entrevista escrita" abaixo): preço diferenciado por
perfil do comprador, os dois formatos de validação de entrada convivendo, e a existência de
compradores não-associados.

**Decisões:**
- O preço do ingresso varia por perfil do comprador — sócio, não-sócio ou criança — com um valor
  **padrão da entidade** que pode ser sobrescrito por evento, reaproveitando o mesmo padrão de
  override já usado no preço de mesa (Cadastro de Evento).
- Associado que compra pelo app **sempre paga online** (via gateway); a diretoria continua vendendo
  presencialmente (secretaria), tanto para associados quanto para visitantes.
- Não-associados (visitantes) também compram ingresso — confirmado na entrevista.
- A validação na entrada substitui a pulseira e a lista impressa atuais, mas mantendo os **dois
  formatos coexistindo**: QR code no app para quem tem, busca manual por nome no painel para quem não
  tem.
- Há uma checagem de reuso ("ingresso já foi usado?") antes de validar a entrada, prevenindo duplicidade
  — mesmo princípio de proteção usado na Reserva de Mesa contra conflito de reserva.

**Em aberto (validar com o CPF Pia do Sul):**
- O visitante consegue comprar ingresso online (app ou link público), ou compra é sempre presencial
  com a diretoria?
- Um ingresso já comprado pode ser cancelado ou estornado?

---

## Resultado da entrevista escrita — 2026-08-11

Primeira rodada de respostas do CPF Pia do Sul (roteiro semiestruturado, respondido por escrito).
Achados relevantes, já incorporados nos fluxos acima onde aplicável:

- **Escala real é maior que a assumida**: 1.343 associados (448 efetivos), diretoria com 11 membros.
  Bailes chegam a 600 pessoas, festivais a 5-6 mil — relevante para dimensionar RNF05 (tempo de
  resposta) e capacidade de mesas/ingressos por evento.
- **Já existe um "sistema em teste"** cobrindo parte do cadastro e do controle financeiro — contradiz
  parcialmente a premissa de gestão "pouco digitalizada" do pré-projeto. A operação do evento em si
  (disponibilidade de mesa/ingresso, controle de entrada) continua 100% manual/papel. Gerou uma
  segunda rodada de perguntas (ver `respostas_formulario_inicial/contraperguntas_sistemas.docx`) para
  entender se é uma ou mais ferramentas, se são pagas, e se há interesse em substituição.
- **Validações fortes do que já havia sido desenhado**: confirmaram ocorrência de conflito de reserva
  de mesa (valida a checagem de concorrência do fluxo de Reserva de Mesa) e de divergência de
  informação sobre pagamentos (valida a justificativa central do artigo). "Sistema de cobrança" foi
  citado como maior dificuldade atual e "controle de regularidade financeira e cadastral" como o
  problema prioritário — confirma Cadastro de Associado e Mensalidade como a sequência correta de
  prioridade.
- **Preço diferenciado e validação de entrada** (sócio/não-sócio/criança; pulseira e lista impressa) —
  incorporados no fluxo de Emissão de Ingresso.
- **Achado fora do escopo do MVP**: pedido espontâneo de um totem físico no salão para consulta de
  eventos, compra de ingresso, reserva de mesa e pagamento de mensalidade. Não contemplado no MVP
  (web + mobile), mas vale registrar como sugestão para trabalhos futuros no artigo.
- **Organização de evento tem dois papéis**, não só "a diretoria" genericamente: um "diretor social"
  para eventos da entidade e um "coordenador de departamento" para eventos de departamentos — o
  Cadastro de Evento modelou só "diretoria" como ator; pode precisar de refinamento depois de uma
  próxima rodada de perguntas sobre isso.
- **Dificuldade digital não é só dos associados**: a resposta sobre quem usaria o painel administrativo
  indica que a própria diretoria "possui dificuldades com a modernidade" — amplia o argumento de
  acessibilidade do RNF, que no pré-projeto era focado principalmente nos associados.

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
7. Visitante (não-associado) compra ingresso online, ou sempre presencial com a diretoria?
8. Ingresso já comprado pode ser cancelado ou estornado?

## Pendências de revisão do texto do artigo

- RF10 ("Definir configuração de mesas e ingressos por evento") provavelmente precisa ser desdobrado
  em dois requisitos após a introdução do croqui de salão reutilizável: (a) cadastro de croqui de
  salão, (b) configuração de mesas/ingressos por evento, referenciando um croqui existente — ver
  decisão do Croqui de Salão acima.
