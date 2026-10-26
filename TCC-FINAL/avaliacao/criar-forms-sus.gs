/**
 * Cria os dois formulários SUS do Querência ERP (painel web e app mobile),
 * espelhando sus-painel-web.md e sus-app-mobile.md.
 *
 * Como usar:
 *   1. Acesse https://script.google.com e crie um novo projeto.
 *   2. Cole este arquivo inteiro em Code.gs.
 *   3. Selecione a função `criarTodos` e clique em Executar (aceite as permissões
 *      de Forms, Drive e Sheets na primeira vez).
 *   4. Os links (edição, resposta e planilha) saem em Ver > Registros de execução.
 *
 * Cada formulário já nasce vinculado a uma planilha de respostas, com uma coluna
 * extra "Pontuação SUS (0-100)" calculada pela fórmula de Brooke (1996).
 *
 * ⚠️ Confira a redação dos itens contra Lourenço, Carmona e Lopes (2022) antes
 * de aplicar de verdade (mesma ressalva dos .md).
 */

var ENTIDADES = ['CPF Pia do Sul', 'CTG Sentinela da Querência'];

// Termos como aparecem em "Eu achei o {obj} fácil de usar." etc.
var VARIANTES = {
  painel: {
    titulo: 'Questionário SUS — Painel Administrativo (Querência ERP)',
    objeto: 'o painel administrativo',
    objetoDe: 'do painel administrativo',
    publico: 'Diretoria',
    nome: 'SUS - Painel Administrativo',
  },
  app: {
    titulo: 'Questionário SUS — Aplicativo do Associado (Querência ERP)',
    objeto: 'o aplicativo',
    objetoDe: 'do aplicativo',
    publico: 'Associado',
    nome: 'SUS - Aplicativo do Associado',
  },
};

function itensSus_(v) {
  return [
    'Eu acho que gostaria de usar ' + v.objeto + ' com frequência.',
    'Eu achei ' + v.objeto + ' complexo sem necessidade.',
    'Eu achei ' + v.objeto + ' fácil de usar.',
    'Eu acho que precisaria da ajuda de uma pessoa com conhecimentos técnicos para usar ' + v.objeto + '.',
    'Eu achei que as várias funções ' + v.objetoDe + ' estavam bem integradas.',
    'Eu achei que houve muita inconsistência ' + (v === VARIANTES.painel ? 'no painel administrativo' : 'no aplicativo') + '.',
    'Eu imagino que a maioria das pessoas aprenderia a usar ' + v.objeto + ' rapidamente.',
    'Eu achei ' + v.objeto + ' muito complicado de usar.',
    'Eu me senti confiante usando ' + v.objeto + '.',
    'Eu precisei aprender várias coisas novas antes de conseguir usar ' + v.objeto + '.',
  ];
}

function criarFormSus_(v) {
  var form = FormApp.create(v.nome);
  form.setTitle(v.titulo);
  form.setDescription(
    'Pensando na sua experiência usando ' + v.objeto + ' agora há pouco, para cada frase abaixo ' +
    'marque o quanto você concorda ou discorda, numa escala de 1 (discordo totalmente) a 5 ' +
    '(concordo totalmente). Não existe resposta certa ou errada.\n\n' +
    'Aplicar somente a participantes do papel ' + v.publico + '. ' +
    'Não informe dados pessoais identificáveis.'
  );
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false); // não exige login Google
  form.setShowLinkToRespondAgain(false);
  form.setConfirmationMessage('Obrigado pela participação!');

  // Identificação (a data da sessão vem do carimbo de data/hora da resposta)
  form.addTextItem()
    .setTitle('ID do participante')
    .setHelpText('Código fornecido pelo aplicador, não o nome.')
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Entidade')
    .setChoiceValues(ENTIDADES)
    .setRequired(true);

  // Itens SUS (1–5)
  itensSus_(v).forEach(function (texto, i) {
    form.addScaleItem()
      .setTitle((i + 1) + '. ' + texto)
      .setBounds(1, 5)
      .setLabels('Discordo totalmente', 'Concordo totalmente')
      .setRequired(true);
  });

  form.addParagraphTextItem()
    .setTitle('Algum comentário livre sobre a experiência? (opcional)')
    .setRequired(false);

  // Planilha de respostas
  var ss = SpreadsheetApp.create(v.nome + ' (respostas)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  return { form: form, ss: ss };
}

/**
 * Colunas da planilha: A carimbo, B ID, C Entidade, D..M itens 1..10, N comentário.
 * Coluna O = pontuação SUS (ímpares: v-1; pares: 5-v; soma × 2,5).
 */
function adicionarPontuacao_(ss) {
  // O vínculo cria a aba de respostas de forma assíncrona; espera ela aparecer.
  var aba = null;
  for (var t = 0; t < 10 && !aba; t++) {
    SpreadsheetApp.flush();
    aba = ss.getSheets().filter(function (s) { return s.getLastColumn() >= 14; })[0];
    if (!aba) Utilities.sleep(1000);
  }
  if (!aba) {
    Logger.log('Aba de respostas ainda não criada em %s — adicione a coluna O manualmente.', ss.getUrl());
    return;
  }
  aba.getRange('O1').setFormula(
    '=ARRAYFORMULA(IF(ROW(A1:A)=1,"Pontuação SUS (0-100)",' +
    'IF(D1:D="","",((D1:D+F1:F+H1:H+J1:J+L1:L-5)+(25-(E1:E+G1:G+I1:I+K1:K+M1:M)))*2.5)))'
  );
}

function criarTodos() {
  ['painel', 'app'].forEach(function (chave) {
    var r = criarFormSus_(VARIANTES[chave]);
    adicionarPontuacao_(r.ss);
    Logger.log('%s\n  Editar:    %s\n  Responder: %s\n  Planilha:  %s',
      VARIANTES[chave].nome, r.form.getEditUrl(), r.form.getPublishedUrl(), r.ss.getUrl());
  });
}

// Alternativa: rodar só um dos dois.
function criarApenasPainel() { var r = criarFormSus_(VARIANTES.painel); adicionarPontuacao_(r.ss); Logger.log(r.form.getPublishedUrl()); }
function criarApenasApp()    { var r = criarFormSus_(VARIANTES.app);    adicionarPontuacao_(r.ss); Logger.log(r.form.getPublishedUrl()); }
