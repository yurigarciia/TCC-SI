import 'dotenv/config';

// Povoa a instância com dados fictícios, porém plausíveis — associados, categorias, um salão
// com croqui completo, eventos publicados e um histórico de mensalidades/ingressos/reservas —,
// para que as sessões de avaliação com as entidades parceiras (ver
// TCC-FINAL/avaliacao/plano-avaliacao.md, Seção 4) comecem de um sistema com volume e variação
// realistas, em vez de uma base vazia. Roda contra a API já em execução (não acessa o banco
// diretamente), reaproveitando as mesmas regras de negócio que a diretoria usaria no painel.
//
// Uso: a API precisa estar no ar (`npm run start:dev`) e um usuário administrador já precisa
// existir (`npm run seed:admin`). Então: `npm run seed:demo`.
//
// Idempotência: verifica se o salão de demonstração já existe e aborta sem duplicar nada caso
// positivo — rodar de novo numa instância já povoada exige remover esse salão manualmente antes.

const API_URL = process.env.SEED_API_URL ?? 'http://localhost:3000';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'diretoria@piadosul.org.br';
const ADMIN_SENHA = process.env.SEED_ADMIN_SENHA ?? 'mudar123';

const NOME_SALAO = 'Salão Social (demonstração)';

interface Associado {
  id: string;
  nome: string;
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
    throw new Error(
      `Login do administrador falhou (${resposta.status}). Rode "npm run seed:admin" antes, ou confira SEED_ADMIN_EMAIL/SEED_ADMIN_SENHA.`,
    );
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

function nomeFicticio(indice: number): string {
  const primeiro = PRIMEIROS_NOMES[indice % PRIMEIROS_NOMES.length];
  const sobrenome = SOBRENOMES[(indice * 7) % SOBRENOMES.length];
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

async function garantirCategorias(
  token: string,
): Promise<Record<string, string>> {
  const existentes = await api<{ itens: Array<{ id: string; nome: string }> }>(
    token,
    'GET',
    '/categorias-socio?limite=50',
  );
  const porNome = new Map(existentes.itens.map((c) => [c.nome, c.id]));

  const desejadas: Array<{
    nome: string;
    valorMensalidade?: number;
    isenta?: boolean;
  }> = [
    { nome: 'Efetivo', valorMensalidade: 100 },
    { nome: 'Dançarino', valorMensalidade: 50 },
    { nome: 'Remido', isenta: true },
  ];

  for (const categoria of desejadas) {
    if (!porNome.has(categoria.nome)) {
      const criada = await api<{ id: string }>(
        token,
        'POST',
        '/categorias-socio',
        categoria,
      );
      porNome.set(categoria.nome, criada.id);
      console.log(`  categoria criada: ${categoria.nome}`);
    }
  }

  return {
    efetivo: porNome.get('Efetivo')!,
    dancarino: porNome.get('Dançarino')!,
    remido: porNome.get('Remido')!,
  };
}

async function criarAssociados(
  token: string,
  categorias: Record<string, string>,
  quantidade: number,
): Promise<Associado[]> {
  const ordemCategoria = [
    'efetivo',
    'efetivo',
    'dancarino',
    'efetivo',
    'remido',
    'dancarino',
  ];
  const associados: Associado[] = [];

  // Reaproveita associados já criados em uma rodada anterior (mesmo CPF fictício), em vez de
  // tentar recriar e falhar com 409 — deixa o script seguro pra rodar de novo se parar no meio.
  const existentes = await api<{
    itens: Array<{
      id: string;
      nome: string;
      cpf: string;
      categoriaSocioId: string | null;
    }>;
  }>(token, 'GET', '/associados?pagina=1&limite=100');
  const porCpf = new Map(existentes.itens.map((a) => [a.cpf, a]));

  for (let i = 0; i < quantidade; i++) {
    const nome = nomeFicticio(i);
    const cpf = cpfFicticio(i);
    const telefone = `5599${String(8000000 + i).padStart(7, '0')}`;
    const endereco = enderecoFicticio(i);

    const jaExiste = porCpf.get(cpf);
    if (jaExiste) {
      associados.push({
        id: jaExiste.id,
        nome: jaExiste.nome,
        categoriaSocioId: jaExiste.categoriaSocioId,
      });
      continue;
    }

    // ~10% nascem via auto-cadastro e ficam pendentes de validação, pra mostrar essa fila
    // também — o resto é cadastrado diretamente pela diretoria (mediado), já ativo.
    if (i % 10 === 9) {
      const criado = await api<{ id: string }>(
        token,
        'POST',
        '/associados/auto-cadastro',
        {
          nome,
          cpf,
          telefone,
          endereco,
          email: `demo.${i}@querenciaerp.org`,
          senha: 'demo12345',
        },
      );
      associados.push({ id: criado.id, nome, categoriaSocioId: null });
      continue;
    }

    const categoriaSocioId =
      categorias[ordemCategoria[i % ordemCategoria.length]];
    const criado = await api<{ id: string }>(token, 'POST', '/associados', {
      nome,
      cpf,
      telefone,
      categoriaSocioId,
      endereco,
    });
    associados.push({ id: criado.id, nome, categoriaSocioId });
  }

  console.log(`  ${associados.length} associados criados.`);
  return associados;
}

async function gerarEPagarMensalidades(
  token: string,
  associados: Associado[],
): Promise<void> {
  await api(token, 'POST', '/mensalidades/gerar');

  // Paga ~60% (metade online, metade presencial) e deixa o resto pendente — o que ainda
  // estiver pendente e já vencido vira inadimplente no passo seguinte, gerando o mix realista
  // de em dia / inadimplente que aparece no relatório e no dashboard.
  const ativos = associados.filter((a) => a.categoriaSocioId !== null);
  for (let i = 0; i < ativos.length; i++) {
    if (i % 5 === 4) continue; // ~20% seguem pendentes sem nunca virar inadimplente nesta rodada
    if (i % 10 >= 6) continue; // mais ~40% ficam pendentes e viram inadimplentes
    if (!ativos[i]?.id) continue;

    const historico = await api<Array<{ id: string; status: string }>>(
      token,
      'GET',
      `/mensalidades/associado/${ativos[i].id}`,
    );
    const pendente = historico.find((m) => m.status === 'pendente');
    if (!pendente) continue;

    if (i % 2 === 0) {
      await api(
        token,
        'POST',
        `/mensalidades/${pendente.id}/pagamento-presencial`,
      );
    } else {
      await api(
        token,
        'POST',
        `/mensalidades/${pendente.id}/pagamento-online/iniciar`,
      );
      await api(
        token,
        'POST',
        `/mensalidades/${pendente.id}/pagamento-online/confirmar`,
      );
    }
  }

  await api(token, 'POST', '/mensalidades/processar-inadimplencia');
  console.log('  cobranças do mês geradas e pagamentos simulados.');
}

async function criarSalaoComCroqui(
  token: string,
): Promise<{ salaoId: string; mesaIds: string[] }> {
  const salao = await api<{ id: string }>(token, 'POST', '/saloes', {
    nome: NOME_SALAO,
    capacidadeTotal: 400,
  });

  const mesaIds: string[] = [];
  let numero = 1;
  for (const coluna of [120, 220, 480, 580]) {
    for (const linha of [100, 180, 260, 340]) {
      const formato = numero % 5 === 0 ? 'retangular' : 'redonda';
      const mesa = await api<{ id: string }>(
        token,
        'POST',
        `/saloes/${salao.id}/mesas`,
        {
          numero,
          capacidade: formato === 'retangular' ? 10 : 6,
          posicaoX: coluna,
          posicaoY: linha,
          formato,
        },
      );
      mesaIds.push(mesa.id);
      numero++;
    }
  }

  const paredes = [
    { x1: 80, y1: 60, x2: 80, y2: 400 },
    { x1: 80, y1: 400, x2: 620, y2: 400 },
    { x1: 620, y1: 400, x2: 620, y2: 60 },
    { x1: 620, y1: 60, x2: 80, y2: 60 },
  ];
  for (const parede of paredes) {
    await api(token, 'POST', `/saloes/${salao.id}/elementos`, {
      tipo: 'parede',
      ...parede,
    });
  }
  await api(token, 'POST', `/saloes/${salao.id}/elementos`, {
    tipo: 'porta',
    x1: 130,
    y1: 400,
    x2: 200,
    y2: 400,
  });

  await api(token, 'POST', `/saloes/${salao.id}/areas`, {
    nome: 'Tablado',
    x: 300,
    y: 70,
    largura: 180,
    altura: 70,
  });
  await api(token, 'POST', `/saloes/${salao.id}/areas`, {
    nome: 'Bar',
    x: 520,
    y: 320,
    largura: 90,
    altura: 60,
  });

  console.log(
    `  salão "${NOME_SALAO}" criado com ${mesaIds.length} mesas, paredes, porta e 2 áreas.`,
  );
  return { salaoId: salao.id, mesaIds };
}

async function configurarPrecosIngresso(
  token: string,
  eventoId: string,
  categorias: Record<string, string>,
): Promise<void> {
  const precos: Array<{
    perfil: string;
    preco: number;
    categoriaSocioId?: string;
  }> = [
    { perfil: 'socio', preco: 40, categoriaSocioId: categorias.efetivo },
    { perfil: 'socio', preco: 25, categoriaSocioId: categorias.dancarino },
    { perfil: 'socio', preco: 0.5, categoriaSocioId: categorias.remido },
    { perfil: 'nao_socio', preco: 60 },
    { perfil: 'crianca', preco: 20 },
  ];
  for (const preco of precos) {
    await api(token, 'PUT', `/eventos/${eventoId}/precos-ingresso`, preco);
  }
}

async function criarEventos(
  token: string,
  salaoId: string,
  mesaIds: string[],
  categorias: Record<string, string>,
): Promise<string[]> {
  const bailePrimeira = await api<{ id: string }>(token, 'POST', '/eventos', {
    nome: 'Baile da Invernada Mirim',
    data: '2026-12-05T20:00:00.000Z',
    local: 'Sede Social',
    descricao:
      'Baile tradicionalista com apresentação da invernada artística mirim.',
    salaoId,
  });
  await api(token, 'PUT', `/eventos/${bailePrimeira.id}/mesas`, {
    mesas: mesaIds.slice(0, 6).map((mesaId, indice) => ({
      mesaId,
      preco: 180 + indice * 10,
      bloqueada: false,
    })),
  });
  await api(token, 'PUT', `/eventos/${bailePrimeira.id}/ingresso`, {
    quantidadeDisponivel: 150,
  });
  await configurarPrecosIngresso(token, bailePrimeira.id, categorias);
  await api(token, 'POST', `/eventos/${bailePrimeira.id}/publicar`);

  const jantar = await api<{ id: string }>(token, 'POST', '/eventos', {
    nome: 'Jantar de Encerramento da Safra',
    data: '2026-12-19T19:30:00.000Z',
    local: 'Salão de Festas',
    descricao: 'Jantar de confraternização ao final da temporada de eventos.',
  });
  await api(token, 'PUT', `/eventos/${jantar.id}/ingresso`, {
    quantidadeDisponivel: 80,
  });
  await configurarPrecosIngresso(token, jantar.id, categorias);
  await api(token, 'POST', `/eventos/${jantar.id}/publicar`);

  console.log(
    '  2 eventos publicados ("Baile da Invernada Mirim" e "Jantar de Encerramento da Safra").',
  );
  return [bailePrimeira.id, jantar.id];
}

async function venderIngressosEReservas(
  token: string,
  eventoId: string,
  mesaIds: string[],
  associados: Associado[],
): Promise<void> {
  const perfisNaoSocio: Array<'nao_socio' | 'crianca'> = [
    'nao_socio',
    'crianca',
  ];

  // Reserva algumas mesas em nome de associados sócios.
  for (let i = 0; i < 3; i++) {
    const associado = associados[i];
    await api(
      token,
      'POST',
      `/eventos/${eventoId}/mesas/${mesaIds[i]}/reservar`,
      {
        canal: 'mediado',
        formaPagamento: 'presencial',
        nomeTitular: associado.nome,
        associadoId: associado.id,
      },
    );
  }

  // Vende ingressos avulsos variados (sócio, não-sócio, criança) e já valida a entrada de
  // alguns, pra mostrar o painel de check-in com estado misto (igual à Figura 5 do artigo).
  const vendidos: string[] = [];
  for (let i = 3; i < 9; i++) {
    const associado = associados[i % associados.length];
    const perfil =
      i % 3 === 0 ? 'socio' : perfisNaoSocio[i % perfisNaoSocio.length];
    const ingresso = await api<{ id: string }>(
      token,
      'POST',
      `/eventos/${eventoId}/ingressos`,
      {
        nomeComprador: perfil === 'socio' ? associado.nome : `Convidado ${i}`,
        perfilComprador: perfil,
        categoriaSocioId:
          perfil === 'socio'
            ? (associado.categoriaSocioId ?? undefined)
            : undefined,
        canal: 'mediado',
        formaPagamento: i % 2 === 0 ? 'presencial' : 'online',
      },
    );
    vendidos.push(ingresso.id);
  }
  for (const ingressoId of vendidos.slice(0, 3)) {
    await api(token, 'POST', `/ingressos/${ingressoId}/checkin`);
  }

  console.log(
    '  3 mesas reservadas, 6 ingressos vendidos (3 já com check-in).',
  );
}

async function main(): Promise<void> {
  console.log(`Seed de demonstração contra ${API_URL}...`);

  const token = await login();

  const salaoExistente = await api<{ itens: Array<{ nome: string }> }>(
    token,
    'GET',
    '/saloes?pagina=1&limite=50',
  );
  if (salaoExistente.itens.some((s) => s.nome === NOME_SALAO)) {
    console.log(
      `Já existe um salão "${NOME_SALAO}" — instância parece já ter sido povoada. Nada a fazer.`,
    );
    return;
  }

  console.log('Garantindo categorias de sócio...');
  const categorias = await garantirCategorias(token);

  console.log('Criando associados fictícios...');
  const associados = await criarAssociados(token, categorias, 36);

  console.log('Gerando e pagando mensalidades...');
  await gerarEPagarMensalidades(token, associados);

  console.log('Criando salão com croqui completo...');
  const { salaoId, mesaIds } = await criarSalaoComCroqui(token);

  console.log('Criando e publicando eventos...');
  const [eventoComSalaoId] = await criarEventos(
    token,
    salaoId,
    mesaIds,
    categorias,
  );

  console.log('Vendendo ingressos e reservando mesas...');
  await venderIngressosEReservas(token, eventoComSalaoId, mesaIds, associados);

  console.log('Seed de demonstração concluído.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
