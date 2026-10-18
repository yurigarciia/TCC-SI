import 'dotenv/config';
import dataSource from './data-source';

// Script complementar ao seed-demo.ts (ver Seção 4 de TCC-FINAL/avaliacao/plano-avaliacao.md).
// Corrige, numa instância já povoada por `npm run seed:demo`, um conjunto de inconsistências
// que só ficaram visíveis depois de olhar as capturas de tela geradas a partir dos dados
// fictícios: volume de associados baixo demais frente ao diagnóstico, taxa de inadimplência
// irrealisticamente alta, todo o cadastro concentrado num único dia, histórico de mensalidade
// com um mês só, e ingressos marcados como "usados" com check-in anterior à data do evento.
//
// As operações que validam regra de negócio (gerar cobrança, registrar pagamento, vender e
// validar ingresso) continuam indo pela API, como no seed-demo.ts. Só os carimbos de tempo dos
// registros fictícios (data de cadastro do associado, data de pagamento/check-in) são ajustados
// por SQL direto ao final, porque a API deliberadamente não permite informar uma data passada
// nesses campos — e não há outro jeito de simular, numa única rodada, a distribuição ao longo do
// tempo que uma adoção real teria. Executado uma vez, sob confirmação explícita, contra o banco
// de produção (2026-10-19).
//
// Uso: `npm run ajustar-demo` (requer a mesma API e o mesmo administrador do seed-demo.ts).

const API_URL = process.env.SEED_API_URL ?? 'http://localhost:3000';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'diretoria@piadosul.org.br';
const ADMIN_SENHA = process.env.SEED_ADMIN_SENHA ?? 'mudar123';

const CATEGORIA_EFETIVO = '9a7154bb-4522-4f7c-acd0-9c7a60bd9344';
const CATEGORIA_DANCARINO = 'c7ff6904-54e8-44d2-8163-3c028ccac94f';
const CATEGORIA_REMIDO = 'c71b576e-5371-4e2c-9813-77aa3911eda6';

const EVENTO_FESTIVAL_PASSADO = '4517b96c-f1f7-4df5-b6ae-b95eac19a15a'; // 25/09/2026, já ocorreu
const EVENTO_BAILE_FUTURO = '7bff5c98-6208-48de-804d-30d8d3d41d8c'; // 05/12/2026, ainda não ocorreu

interface Associado {
  id: string;
  nome: string;
  cpf: string;
  categoriaSocioId: string | null;
}

async function api<T = any>(
  token: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const resposta = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const texto = await resposta.text();
  const json: unknown = texto ? JSON.parse(texto) : undefined;
  if (!resposta.ok) {
    throw new Error(
      `${method} ${path} -> ${resposta.status}: ${JSON.stringify(json)}`,
    );
  }
  return json as T;
}

async function login(): Promise<string> {
  const resposta = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, senha: ADMIN_SENHA }),
  });
  if (!resposta.ok) {
    throw new Error(`Login do administrador falhou (${resposta.status}).`);
  }
  const { accessToken } = (await resposta.json()) as { accessToken: string };
  return accessToken;
}

const PRIMEIROS_NOMES = [
  'Adão',
  'Beatriz',
  'Celso',
  'Diana',
  'Edemar',
  'Elisete',
  'Fabiano',
  'Gislaine',
  'Honório',
  'Ivonete',
  'Jandir',
  'Kelly',
  'Leonel',
  'Marlene',
  'Nelson',
  'Odete',
  'Pedro',
  'Rosmari',
  'Sérgio',
  'Tânia',
  'Ubiratã',
  'Valéria',
  'Wilson',
  'Zuleika',
  'Anselmo',
  'Bernadete',
  'Cleverson',
  'Darci',
  'Eunice',
  'Firmino',
  'Geni',
  'Hélio',
];
const SOBRENOMES = [
  'Bertoldo',
  'Casagrande',
  'Dalla Costa',
  'Escobar',
  'Feijó',
  'Gularte',
  'Hoffmann',
  'Iora',
  'Jacobsen',
  'Klein',
  'Lermen',
  'Machado',
  'Noal',
  'Oliveira',
  'Prestes',
  'Quadros',
  'Ribas',
  'Spanholi',
  'Trindade',
  'Uberti',
  'Vencato',
  'Zimmer',
  'Webber',
];
const RUAS = [
  'Rua Venâncio Aires',
  'Rua Floriano Peixoto',
  'Avenida Rio Branco',
  'Rua Duque de Caxias',
  'Rua Silva Jardim',
  'Rua dos Andradas',
];
const BAIRROS = [
  'Centro',
  'Nossa Senhora de Lourdes',
  'Nossa Senhora Medianeira',
  'Camobi',
  'Kennedy',
];

// Multiplicadores escolhidos por serem coprimos do tamanho de cada lista (32 e 23), pra
// percorrer várias combinações antes de repetir — a versão original do seed-demo.ts usava um
// multiplicador de sobrenome (7) que compartilhava fator com o tamanho da lista de então (21),
// o que colapsava a geração em só 3 sobrenomes distintos.
function nomeFicticio(indice: number): string {
  const primeiro = PRIMEIROS_NOMES[indice % PRIMEIROS_NOMES.length];
  const sobrenome = SOBRENOMES[(indice * 5) % SOBRENOMES.length];
  return `${primeiro} ${sobrenome}`;
}

function cpfFicticio(indice: number): string {
  return String(90000000000 + indice * 97)
    .padStart(11, '0')
    .slice(0, 11);
}

function enderecoFicticio(indice: number) {
  return {
    cep: '97000-000',
    logradouro: RUAS[indice % RUAS.length],
    numero: String(100 + indice * 15),
    bairro: BAIRROS[indice % BAIRROS.length],
    cidade: 'Santa Maria',
    uf: 'RS',
  };
}

async function corrigirCategoriaDancarino(token: string): Promise<void> {
  await api(token, 'PATCH', `/categorias-socio/${CATEGORIA_DANCARINO}`, {
    valorMensalidade: 50,
  });
  console.log(
    '  categoria "Dançarino" corrigida para R$ 50,00 de mensalidade.',
  );
}

async function completarAssociados(
  token: string,
  totalDesejado: number,
): Promise<Associado[]> {
  // Pagina por completo em vez de confiar num único limite=100 — com os pré-existentes mais o
  // cohort de demonstração o total já passa de 100, e uma única página deixava CPFs fictícios de
  // fora do mapa de "já existe", causando 409 ao tentar recriá-los.
  const todosExistentes: Associado[] = [];
  for (let pagina = 1; ; pagina++) {
    const resultado = await api<{ itens: Associado[]; totalPaginas: number }>(
      token,
      'GET',
      `/associados?pagina=${pagina}&limite=100`,
    );
    todosExistentes.push(...resultado.itens);
    if (pagina >= resultado.totalPaginas) break;
  }
  const porCpf = new Map(todosExistentes.map((a) => [a.cpf, a]));
  const cohort = todosExistentes.filter((a) => a.cpf.startsWith('90000'));

  const ordemCategoria = [
    CATEGORIA_EFETIVO,
    CATEGORIA_EFETIVO,
    CATEGORIA_DANCARINO,
    CATEGORIA_EFETIVO,
    CATEGORIA_REMIDO,
    CATEGORIA_DANCARINO,
  ];

  for (let i = 0; i < totalDesejado; i++) {
    const cpf = cpfFicticio(i);
    if (porCpf.has(cpf)) continue;

    const nome = nomeFicticio(i);
    const contato = `5599${String(8000000 + i).padStart(7, '0')}`;
    const categoriaSocioId = ordemCategoria[i % ordemCategoria.length];
    const criado = await api<Associado>(token, 'POST', '/associados', {
      nome,
      cpf,
      contato,
      categoriaSocioId,
      endereco: enderecoFicticio(i),
    });
    cohort.push({ id: criado.id, nome, cpf, categoriaSocioId });
  }

  console.log(
    `  cohort de demonstração agora com ${cohort.length} associados.`,
  );
  return cohort;
}

async function rebalancearInadimplencia(
  token: string,
  cohort: Associado[],
): Promise<void> {
  await api(token, 'POST', '/mensalidades/gerar');

  // ~10% fica sem pagar (vira inadimplente ao processar) — o resto (inclusive quem já tinha
  // ficado inadimplente numa rodada anterior) é pago agora, metade online metade presencial.
  for (let i = 0; i < cohort.length; i++) {
    const deveFicarInadimplente = i % 10 === 0;
    if (deveFicarInadimplente) continue;
    if (!cohort[i]?.id) continue;

    const historico = await api<Array<{ id: string; status: string }>>(
      token,
      'GET',
      `/mensalidades/associado/${cohort[i].id}`,
    );
    const emAberto = historico.find(
      (m) => m.status === 'pendente' || m.status === 'inadimplente',
    );
    if (!emAberto) continue;

    if (i % 2 === 0) {
      await api(
        token,
        'POST',
        `/mensalidades/${emAberto.id}/pagamento-presencial`,
      );
    } else {
      await api(
        token,
        'POST',
        `/mensalidades/${emAberto.id}/pagamento-online/iniciar`,
      );
      await api(
        token,
        'POST',
        `/mensalidades/${emAberto.id}/pagamento-online/confirmar`,
      );
    }
  }

  await api(token, 'POST', '/mensalidades/processar-inadimplencia');
  console.log('  inadimplência rebalanceada para ~10% do cohort.');
}

async function corrigirCheckinsForaDeData(token: string): Promise<void> {
  // Reverte os ingressos do evento futuro que tinham sido marcados como "usados" (check-in não
  // podia ter acontecido antes do próprio evento) e vende/valida um lote novo contra o festival
  // já realizado, cujas datas fazem sentido com um check-in feito hoje.
  const emitidosNoFuturo = await api<{
    itens: Array<{ id: string; status: string }>;
  }>(
    token,
    'GET',
    `/eventos/${EVENTO_BAILE_FUTURO}/ingressos?pagina=1&limite=50`,
  );
  const usadosIndevidos = emitidosNoFuturo.itens.filter(
    (i) => i.status === 'usado',
  );
  for (const ingresso of usadosIndevidos) {
    await dataSource.query(
      `UPDATE ingressos SET status = 'emitido', usado_em = NULL WHERE id = $1`,
      [ingresso.id],
    );
  }
  console.log(
    `  ${usadosIndevidos.length} check-in(s) prematuro(s) revertido(s) no evento futuro.`,
  );

  const precosFaltantes: Array<{
    perfil: string;
    preco: number;
    categoriaSocioId?: string;
  }> = [
    { perfil: 'socio', preco: 0.5, categoriaSocioId: CATEGORIA_REMIDO },
    { perfil: 'nao_socio', preco: 50 },
    { perfil: 'crianca', preco: 15 },
  ];
  for (const preco of precosFaltantes) {
    await api(
      token,
      'PUT',
      `/eventos/${EVENTO_FESTIVAL_PASSADO}/precos-ingresso`,
      preco,
    );
  }
  await api(token, 'PUT', `/eventos/${EVENTO_FESTIVAL_PASSADO}/ingresso`, {
    quantidadeDisponivel: 200,
  });

  const jaVendidosNoFestival = await api<{
    itens: Array<{ nomeComprador: string }>;
  }>(
    token,
    'GET',
    `/eventos/${EVENTO_FESTIVAL_PASSADO}/ingressos?pagina=1&limite=50`,
  );
  if (
    jaVendidosNoFestival.itens.some((i) =>
      i.nomeComprador.startsWith('Visitante '),
    )
  ) {
    console.log(
      '  festival já tem ingressos de demonstração vendidos, pulando venda.',
    );
    return;
  }

  const vendidos: string[] = [];
  const perfis: Array<'socio' | 'nao_socio' | 'crianca'> = [
    'socio',
    'nao_socio',
    'crianca',
  ];
  for (let i = 0; i < 5; i++) {
    const perfil = perfis[i % perfis.length];
    const ingresso = await api<{ id: string }>(
      token,
      'POST',
      `/eventos/${EVENTO_FESTIVAL_PASSADO}/ingressos`,
      {
        nomeComprador: `Visitante ${i + 1} do Festival`,
        perfilComprador: perfil,
        categoriaSocioId: perfil === 'socio' ? CATEGORIA_EFETIVO : undefined,
        canal: 'mediado',
        formaPagamento: i % 2 === 0 ? 'presencial' : 'online',
      },
    );
    vendidos.push(ingresso.id);
  }
  for (const ingressoId of vendidos) {
    await api(token, 'POST', `/ingressos/${ingressoId}/checkin`);
  }

  // Espalha os horários de check-in ao longo da noite do festival (25/09/2026), em vez de todos
  // no mesmo minuto em que o script rodou.
  const horarios = ['19:05:00', '19:22:00', '19:48:00', '20:10:00', '20:31:00'];
  for (let i = 0; i < vendidos.length; i++) {
    await dataSource.query(
      `UPDATE ingressos SET usado_em = $1::timestamptz WHERE id = $2`,
      [`2026-09-25 ${horarios[i % horarios.length]}-03`, vendidos[i]],
    );
  }
  console.log(
    `  ${vendidos.length} ingresso(s) vendido(s) e validado(s) no festival já realizado.`,
  );
}

async function espalharDatasDeCadastro(): Promise<void> {
  const cohort = await dataSource.query<Array<{ id: string }>>(
    `SELECT id FROM associados WHERE cpf LIKE '90000%' ORDER BY criado_em ASC`,
  );

  // Distribuição crescente (adoção gradual) em vez de tudo concentrado no dia em que o script
  // rodou: poucos cadastros nos meses mais antigos, mais nos meses recentes.
  const baldes = [
    { mes: '2026-05', peso: 2 },
    { mes: '2026-06', peso: 3 },
    { mes: '2026-07', peso: 4 },
    { mes: '2026-08', peso: 6 },
    { mes: '2026-09', peso: 8 },
    { mes: '2026-10', peso: 10 },
  ];
  const totalPeso = baldes.reduce((soma, b) => soma + b.peso, 0);

  // Mês corrente limitado ao dia de hoje — os demais meses (já encerrados) podem usar o mês
  // inteiro sem risco de cair numa data futura.
  const hoje = new Date();
  const mesCorrente = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  const diaMaximoMesCorrente = Math.max(1, hoje.getDate() - 1);

  let indice = 0;
  for (const balde of baldes) {
    const limiteDia = balde.mes === mesCorrente ? diaMaximoMesCorrente : 27;
    const quantidade = Math.round((balde.peso / totalPeso) * cohort.length);
    for (let j = 0; j < quantidade && indice < cohort.length; j++, indice++) {
      const dia = 1 + (indice % limiteDia);
      const hora = 8 + (indice % 10);
      const minuto = (indice * 13) % 60;
      const dataFicticia = `${balde.mes}-${String(dia).padStart(2, '0')} ${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00-03`;
      await dataSource.query(
        `UPDATE associados SET criado_em = $1::timestamptz WHERE id = $2`,
        [dataFicticia, cohort[indice].id],
      );
    }
  }
  // Sobras (arredondamento) ficam no último balde, já no mês corrente.
  for (; indice < cohort.length; indice++) {
    const dia = 1 + (indice % diaMaximoMesCorrente);
    await dataSource.query(
      `UPDATE associados SET criado_em = $1::timestamptz WHERE id = $2`,
      [
        `${mesCorrente}-${String(dia).padStart(2, '0')} 10:00:00-03`,
        cohort[indice].id,
      ],
    );
  }

  console.log(
    `  datas de cadastro de ${cohort.length} associados espalhadas de maio a outubro/2026.`,
  );
}

async function preencherHistoricoDeMensalidades(): Promise<void> {
  // Backfill de 2 competências anteriores (agosto e setembro) pra ~80% do cohort, pra que o
  // histórico de mensalidade (painel e app) mostre mais de uma linha — a API só gera a cobrança
  // do mês corrente (idempotente), então os meses passados são inseridos direto, com valor
  // herdado da categoria do próprio associado.
  const ativos = await dataSource.query<
    Array<{ id: string; categoria_socio_id: string | null }>
  >(
    `SELECT id, categoria_socio_id FROM associados WHERE cpf LIKE '90000%' AND categoria_socio_id IS NOT NULL ORDER BY criado_em ASC`,
  );

  const valorPorCategoria: Record<string, number> = {
    [CATEGORIA_EFETIVO]: 100,
    [CATEGORIA_DANCARINO]: 50,
    [CATEGORIA_REMIDO]: 0,
  };

  const competencias = [
    { competencia: '2026-08', vencimento: '2026-08-10' },
    { competencia: '2026-09', vencimento: '2026-09-10' },
  ];

  let inseridas = 0;
  for (let i = 0; i < ativos.length; i++) {
    if (i % 5 === 4) continue; // ~20% do cohort não tem histórico retroativo (entrou há pouco)
    const associado = ativos[i];
    const valor = valorPorCategoria[associado.categoria_socio_id ?? ''] ?? 100;

    for (const { competencia, vencimento } of competencias) {
      const pago = i % 6 !== 0; // a maioria paga em dia nos meses anteriores
      const formaPagamento = i % 2 === 0 ? 'presencial' : 'online';
      const diaPagamento = 5 + (i % 5);
      const pagoEm = pago
        ? `${vencimento.slice(0, 7)}-${String(diaPagamento).padStart(2, '0')} 14:00:00-03`
        : null;
      const status = pago ? 'paga' : 'inadimplente';

      await dataSource.query(
        `INSERT INTO mensalidades
           (associado_id, competencia, valor, vencimento, status, forma_pagamento, pago_em)
         SELECT $1::uuid, $2::varchar, $3, $4, $5, $6, $7
         WHERE NOT EXISTS (
           SELECT 1 FROM mensalidades WHERE associado_id = $1::uuid AND competencia = $2::varchar
         )`,
        [
          associado.id,
          competencia,
          valor.toFixed(2),
          vencimento,
          status,
          pago ? formaPagamento : null,
          pagoEm,
        ],
      );
      inseridas++;
    }
  }

  console.log(
    `  até ${inseridas} mensalidade(s) retroativa(s) inserida(s) (agosto e setembro/2026).`,
  );
}

async function corrigirValoresAntigosDeDancarino(): Promise<void> {
  await dataSource.query(
    `UPDATE mensalidades SET valor = '50.00' WHERE valor = '0.46'`,
  );
  console.log(
    '  mensalidades antigas com valor de R$ 0,46 corrigidas para R$ 50,00.',
  );
}

async function main(): Promise<void> {
  console.log(`Ajuste de realismo contra ${API_URL}...`);
  const token = await login();
  await dataSource.initialize();

  console.log('Corrigindo categoria "Dançarino"...');
  await corrigirCategoriaDancarino(token);

  console.log('Completando o cohort de associados fictícios...');
  const cohort = await completarAssociados(token, 90);

  console.log('Rebalanceando inadimplência...');
  await rebalancearInadimplencia(token, cohort);

  console.log('Corrigindo check-ins com data incoerente...');
  await corrigirCheckinsForaDeData(token);

  console.log('Espalhando datas de cadastro ao longo dos últimos 6 meses...');
  await espalharDatasDeCadastro();

  console.log('Preenchendo histórico retroativo de mensalidades...');
  await preencherHistoricoDeMensalidades();

  console.log('Corrigindo mensalidades antigas com valor incorreto...');
  await corrigirValoresAntigosDeDancarino();

  await dataSource.destroy();
  console.log('Ajuste de realismo concluído.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
