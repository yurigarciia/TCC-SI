import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface MensalidadeResponseBody {
  id: string;
  associadoId: string;
  status: string;
  competencia: string;
  vencimento: string;
}

async function loginAdmin(app: INestApplication<App>): Promise<string> {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'diretoria@piadosul.org.br';
  const senha = process.env.SEED_ADMIN_SENHA ?? 'mudar123';
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, senha });
  return (response.body as { accessToken: string }).accessToken;
}

describe('Mensalidades (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let adminToken: string;

  const cpfAssociado = '44444444444';
  const nomeCategoria = 'Contribuinte — mensalidades e2e';
  let associadoId: string;

  const cpfAssociadoLogado = '66666666666';
  const emailAssociadoLogado = 'associado.mensalidade@e2e.local';
  let associadoLogadoId: string;
  let mensalidadeDoLogadoId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    adminToken = await loginAdmin(app);

    const categoria = await request(app.getHttpServer())
      .post('/categorias-socio')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: nomeCategoria, valorMensalidade: 60 });
    const categoriaId = (categoria.body as { id: string }).id;

    const associado = await request(app.getHttpServer())
      .post('/associados')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Associado Mensalidade',
        cpf: cpfAssociado,
        contato: '55999990005',
        categoriaSocioId: categoriaId,
      });
    associadoId = (associado.body as { associado: { id: string } }).associado
      .id;
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM mensalidades WHERE associado_id = $1', [
      associadoId,
    ]);
    await dataSource.query('DELETE FROM associados WHERE cpf = $1', [
      cpfAssociado,
    ]);
    await dataSource.query('DELETE FROM categorias_socio WHERE nome = $1', [
      nomeCategoria,
    ]);
    if (associadoLogadoId) {
      await dataSource.query(
        'DELETE FROM mensalidades WHERE associado_id = $1',
        [associadoLogadoId],
      );
      const usuarioLogado = await dataSource.query<
        Array<{ usuario_id: string | null }>
      >('SELECT usuario_id FROM associados WHERE id = $1', [associadoLogadoId]);
      await dataSource.query('DELETE FROM associados WHERE id = $1', [
        associadoLogadoId,
      ]);
      const usuarioId = usuarioLogado[0]?.usuario_id;
      if (usuarioId) {
        await dataSource.query('DELETE FROM usuarios WHERE id = $1', [
          usuarioId,
        ]);
      }
    }
    await app.close();
  });

  it('gera a cobrança do mês para o associado ativo com categoria', async () => {
    const response = await request(app.getHttpServer())
      .post('/mensalidades/gerar')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const geradas = response.body as MensalidadeResponseBody[];
    expect(
      geradas.some(
        (m) => m.associadoId === associadoId && m.status === 'pendente',
      ),
    ).toBe(true);
  });

  it('é idempotente — gerar de novo no mesmo mês não duplica', async () => {
    const response = await request(app.getHttpServer())
      .post('/mensalidades/gerar')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const geradas = response.body as MensalidadeResponseBody[];
    expect(geradas.some((m) => m.associadoId === associadoId)).toBe(false);
  });

  it('associado numa categoria isenta nunca recebe cobrança de mensalidade', async () => {
    const nomeCategoriaIsenta = 'Benemérito — mensalidades e2e';
    const cpfIsento = '55555555550';

    const categoriaIsenta = await request(app.getHttpServer())
      .post('/categorias-socio')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: nomeCategoriaIsenta, isenta: true })
      .expect(201);
    const categoriaIsentaBody = categoriaIsenta.body as {
      id: string;
      isenta: boolean;
      valorMensalidade: number;
    };
    expect(categoriaIsentaBody.isenta).toBe(true);
    expect(categoriaIsentaBody.valorMensalidade).toBe(0);

    const associadoIsento = await request(app.getHttpServer())
      .post('/associados')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Associado Isento',
        cpf: cpfIsento,
        contato: '55999990006',
        categoriaSocioId: categoriaIsentaBody.id,
      })
      .expect(201);
    const associadoIsentoId = (
      associadoIsento.body as { associado: { id: string } }
    ).associado.id;

    const response = await request(app.getHttpServer())
      .post('/mensalidades/gerar')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const geradas = response.body as MensalidadeResponseBody[];
    expect(geradas.some((m) => m.associadoId === associadoIsentoId)).toBe(
      false,
    );

    await dataSource.query('DELETE FROM associados WHERE id = $1', [
      associadoIsentoId,
    ]);
    await dataSource.query('DELETE FROM categorias_socio WHERE nome = $1', [
      nomeCategoriaIsenta,
    ]);
  });

  it('categoria não isenta exige valorMensalidade positivo (400 sem ele)', () => {
    return request(app.getHttpServer())
      .post('/categorias-socio')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Categoria sem valor — e2e' })
      .expect(400);
  });

  it('lista o histórico do associado com a mensalidade gerada', async () => {
    const response = await request(app.getHttpServer())
      .get(`/mensalidades/associado/${associadoId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const historico = response.body as MensalidadeResponseBody[];
    expect(historico).toHaveLength(1);
    expect(historico[0].status).toBe('pendente');
  });

  it('completa o ciclo de pagamento online (iniciar -> confirmar -> comprovante)', async () => {
    const historico = await request(app.getHttpServer())
      .get(`/mensalidades/associado/${associadoId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const mensalidadeId = (historico.body as MensalidadeResponseBody[])[0].id;

    const iniciar = await request(app.getHttpServer())
      .post(`/mensalidades/${mensalidadeId}/pagamento-online/iniciar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);
    expect((iniciar.body as { linkPagamento: string }).linkPagamento).toContain(
      'http',
    );

    await request(app.getHttpServer())
      .post(`/mensalidades/${mensalidadeId}/pagamento-online/confirmar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const comprovante = await request(app.getHttpServer())
      .get(`/mensalidades/${mensalidadeId}/comprovante`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(
      (comprovante.body as { formaPagamento: string }).formaPagamento,
    ).toBe('online');
  });

  it('marca uma mensalidade vencida como inadimplente e aparece no relatório', async () => {
    const vencida = await dataSource.query<Array<{ id: string }>>(
      `INSERT INTO mensalidades (associado_id, competencia, valor, vencimento, status)
       VALUES ($1, '2000-01', 60, '2000-01-10', 'pendente') RETURNING id`,
      [associadoId],
    );
    const mensalidadeId = vencida[0].id;

    await request(app.getHttpServer())
      .post('/mensalidades/processar-inadimplencia')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const relatorio = await request(app.getHttpServer())
      .get('/mensalidades/inadimplentes')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const { itens } = relatorio.body as {
      itens: Array<{
        mensalidade: { id: string };
        diasEmAtraso: number;
      }>;
    };
    const item = itens.find((i) => i.mensalidade.id === mensalidadeId);
    expect(item).toBeDefined();
    expect(item!.diasEmAtraso).toBeGreaterThan(0);
  });

  it('T-MOB-002 — associado autenticado vê e paga a própria mensalidade em /mensalidades/minhas', async () => {
    // Timeout maior que o padrão do Jest (5s) — 8 requisições sequenciais (incluindo um
    // auto-cadastro com hash de senha) contra o Postgres remoto (Neon) usado em dev/teste (mesmo
    // achado do ingressos.e2e-spec.ts e do reservas.e2e-spec.ts).
    const autoCadastro = await request(app.getHttpServer())
      .post('/associados/auto-cadastro')
      .send({
        nome: 'Associado Mensalidade Logado',
        cpf: cpfAssociadoLogado,
        contato: '55999990006',
        email: emailAssociadoLogado,
        senha: 'senha123',
      })
      .expect(201);
    associadoLogadoId = (autoCadastro.body as { id: string }).id;

    await request(app.getHttpServer())
      .post(`/associados/${associadoLogadoId}/aprovar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const mensalidade = await dataSource.query<Array<{ id: string }>>(
      `INSERT INTO mensalidades (associado_id, competencia, valor, vencimento, status)
       VALUES ($1, '2026-08', 60, '2026-08-10', 'pendente') RETURNING id`,
      [associadoLogadoId],
    );
    mensalidadeDoLogadoId = mensalidade[0].id;

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: emailAssociadoLogado, senha: 'senha123' })
      .expect(200);
    const associadoToken = (login.body as { accessToken: string }).accessToken;

    const minhas = await request(app.getHttpServer())
      .get('/mensalidades/minhas')
      .set('Authorization', `Bearer ${associadoToken}`)
      .expect(200);
    expect(
      (minhas.body as MensalidadeResponseBody[]).some(
        (m) => m.id === mensalidadeDoLogadoId,
      ),
    ).toBe(true);

    // administrador não deve conseguir usar a rota exclusiva do associado
    await request(app.getHttpServer())
      .get('/mensalidades/minhas')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);

    const iniciar = await request(app.getHttpServer())
      .post(
        `/mensalidades/minhas/${mensalidadeDoLogadoId}/pagamento-online/iniciar`,
      )
      .set('Authorization', `Bearer ${associadoToken}`)
      .expect(201);
    expect((iniciar.body as { linkPagamento: string }).linkPagamento).toContain(
      'http',
    );

    await request(app.getHttpServer())
      .post(
        `/mensalidades/minhas/${mensalidadeDoLogadoId}/pagamento-online/confirmar`,
      )
      .set('Authorization', `Bearer ${associadoToken}`)
      .expect(201);

    const comprovante = await request(app.getHttpServer())
      .get(`/mensalidades/minhas/${mensalidadeDoLogadoId}/comprovante`)
      .set('Authorization', `Bearer ${associadoToken}`)
      .expect(200);
    expect(
      (comprovante.body as { formaPagamento: string }).formaPagamento,
    ).toBe('online');
  }, 15000);

  it('recusa acesso de um associado à mensalidade de outro (403)', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: emailAssociadoLogado, senha: 'senha123' })
      .expect(200);
    const associadoToken = (login.body as { accessToken: string }).accessToken;

    // mensalidade criada pra `associadoId` (o associado mediado, sem login) no início do arquivo
    const historico = await request(app.getHttpServer())
      .get(`/mensalidades/associado/${associadoId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const mensalidadeDeOutro = (historico.body as MensalidadeResponseBody[])[0]
      .id;

    await request(app.getHttpServer())
      .get(`/mensalidades/minhas/${mensalidadeDeOutro}/comprovante`)
      .set('Authorization', `Bearer ${associadoToken}`)
      .expect(403);
  });
});
