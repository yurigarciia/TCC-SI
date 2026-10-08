import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface AssociadoResponseBody {
  id: string;
  nome: string;
  cpf: string;
  status: string;
  origem: string;
}

const ENDERECO_TESTE = {
  cep: '97000-000',
  logradouro: 'Rua Teste',
  numero: '100',
  bairro: 'Centro',
  cidade: 'Santa Maria',
  uf: 'RS',
};

async function loginAdmin(app: INestApplication<App>): Promise<string> {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'diretoria@piadosul.org.br';
  const senha = process.env.SEED_ADMIN_SENHA ?? 'mudar123';
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, senha });
  return (response.body as { accessToken: string }).accessToken;
}

describe('Associados (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let adminToken: string;

  const cpfAutoCadastro = '11111111111';
  const cpfMediado = '22222222222';
  const cpfParaRejeitar = '33333333333';

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
  });

  afterAll(async () => {
    const cpfs = [cpfAutoCadastro, cpfMediado, cpfParaRejeitar];
    await dataSource.query(
      'DELETE FROM dependentes WHERE associado_id IN (SELECT id FROM associados WHERE cpf = ANY($1))',
      [cpfs],
    );
    const usuarioIds = await dataSource.query<
      Array<{ usuario_id: string | null }>
    >('SELECT usuario_id FROM associados WHERE cpf = ANY($1)', [cpfs]);
    await dataSource.query('DELETE FROM associados WHERE cpf = ANY($1)', [
      cpfs,
    ]);
    const idsParaRemover = usuarioIds.map((u) => u.usuario_id).filter(Boolean);
    if (idsParaRemover.length > 0) {
      await dataSource.query('DELETE FROM usuarios WHERE id = ANY($1)', [
        idsParaRemover,
      ]);
    }
    await dataSource.query('DELETE FROM categorias_socio WHERE nome = $1', [
      'Contribuinte — e2e',
    ]);
    await app.close();
  });

  it('permite auto-cadastro público e entra como Pendente de validação', async () => {
    const response = await request(app.getHttpServer())
      .post('/associados/auto-cadastro')
      .send({
        nome: 'Maria Auto',
        cpf: cpfAutoCadastro,
        contato: '55999990000',
        endereco: ENDERECO_TESTE,
        email: 'maria.auto@e2e.local',
        senha: 'senha123',
      })
      .expect(201);

    const body = response.body as AssociadoResponseBody;
    expect(body.status).toBe('pendente_validacao');
    expect(body.origem).toBe('auto_cadastro');
  });

  it('bloqueia auto-cadastro com CPF duplicado (409)', () => {
    return request(app.getHttpServer())
      .post('/associados/auto-cadastro')
      .send({
        nome: 'Maria Auto 2',
        cpf: cpfAutoCadastro,
        contato: '55999990001',
        endereco: ENDERECO_TESTE,
        email: 'maria.auto2@e2e.local',
        senha: 'senha123',
      })
      .expect(409);
  });

  it('permite ao associado consultar o próprio cadastro autenticado ("me")', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'maria.auto@e2e.local', senha: 'senha123' })
      .expect(200);
    const token = (login.body as { accessToken: string }).accessToken;

    const meu = await request(app.getHttpServer())
      .get('/associados/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect((meu.body as AssociadoResponseBody).cpf).toBe(cpfAutoCadastro);
  });

  it('nega criação sem autenticação (401)', () => {
    return request(app.getHttpServer())
      .post('/associados')
      .send({ nome: 'X', cpf: '99999999999', contato: '55999990002' })
      .expect(401);
  });

  it('permite cadastro mediado pela diretoria com dependentes e categoria, entra Ativo', async () => {
    const categoria = await request(app.getHttpServer())
      .post('/categorias-socio')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Contribuinte — e2e', valorMensalidade: 45.5 })
      .expect(201);
    const categoriaId = (categoria.body as { id: string }).id;

    const response = await request(app.getHttpServer())
      .post('/associados')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'João Mediado',
        cpf: cpfMediado,
        contato: '55999990003',
        vinculoInstitucional: 'Departamento de Danças',
        categoriaSocioId: categoriaId,
        endereco: ENDERECO_TESTE,
        dependentes: [{ nome: 'Filho do João', dataNascimento: '2015-04-10' }],
      })
      .expect(201);

    const body = response.body as {
      associado: AssociadoResponseBody;
      dependentes: unknown[];
    };
    expect(body.associado.status).toBe('ativo');
    expect(body.associado.origem).toBe('mediado');
    expect(body.dependentes).toHaveLength(1);
  });

  it('permite a um associado mediado vincular a própria conta e depois se autenticar', async () => {
    await request(app.getHttpServer())
      .post('/associados/vincular-conta')
      .send({
        cpf: cpfMediado,
        email: 'joao.mediado@e2e.local',
        senha: 'senha123',
      })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'joao.mediado@e2e.local', senha: 'senha123' })
      .expect(200);
    const token = (login.body as { accessToken: string }).accessToken;

    const meu = await request(app.getHttpServer())
      .get('/associados/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect((meu.body as AssociadoResponseBody).cpf).toBe(cpfMediado);
  });

  it('recusa vincular-conta com CPF não encontrado (404)', () => {
    return request(app.getHttpServer())
      .post('/associados/vincular-conta')
      .send({
        cpf: '00000000000',
        email: 'ninguem@e2e.local',
        senha: 'senha123',
      })
      .expect(404);
  });

  it('recusa vincular-conta num cadastro que já tem conta vinculada (409)', () => {
    return request(app.getHttpServer())
      .post('/associados/vincular-conta')
      .send({
        cpf: cpfMediado,
        email: 'outro.email@e2e.local',
        senha: 'senha123',
      })
      .expect(409);
  });

  it('pagina a listagem de associados respeitando limite e página (contrato compartilhado por todo endpoint de listagem)', async () => {
    const paginaUm = await request(app.getHttpServer())
      .get('/associados')
      .query({ pagina: 1, limite: 1 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const corpoPaginaUm = paginaUm.body as {
      itens: AssociadoResponseBody[];
      total: number;
      pagina: number;
      limite: number;
      totalPaginas: number;
    };
    expect(corpoPaginaUm.itens).toHaveLength(1);
    expect(corpoPaginaUm.pagina).toBe(1);
    expect(corpoPaginaUm.limite).toBe(1);
    expect(corpoPaginaUm.total).toBeGreaterThanOrEqual(2);
    expect(corpoPaginaUm.totalPaginas).toBeGreaterThanOrEqual(2);

    const paginaDois = await request(app.getHttpServer())
      .get('/associados')
      .query({ pagina: 2, limite: 1 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const corpoPaginaDois = paginaDois.body as {
      itens: AssociadoResponseBody[];
    };
    expect(corpoPaginaDois.itens).toHaveLength(1);
    expect(corpoPaginaDois.itens[0].id).not.toBe(corpoPaginaUm.itens[0].id);

    await request(app.getHttpServer())
      .get('/associados')
      .query({ limite: 101 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);
  });

  it('busca associados por nome (contrato compartilhado por todo endpoint de listagem)', async () => {
    const porNome = await request(app.getHttpServer())
      .get('/associados')
      .query({ busca: 'joão mediado' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const { itens } = porNome.body as { itens: AssociadoResponseBody[] };
    expect(itens.length).toBeGreaterThan(0);
    expect(itens.every((a) => a.cpf === cpfMediado)).toBe(true);

    const porCpf = await request(app.getHttpServer())
      .get('/associados')
      .query({ busca: cpfMediado })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const { itens: itensPorCpf } = porCpf.body as {
      itens: AssociadoResponseBody[];
    };
    expect(itensPorCpf.some((a) => a.cpf === cpfMediado)).toBe(true);

    const semResultado = await request(app.getHttpServer())
      .get('/associados')
      .query({ busca: 'termo-que-nao-deve-existir-em-nenhum-associado' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(
      (semResultado.body as { itens: AssociadoResponseBody[] }).itens,
    ).toHaveLength(0);
  });

  it('aprova um cadastro pendente e reflete o novo status na consulta', async () => {
    const listagem = await request(app.getHttpServer())
      .get('/associados')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const pendente = (
      listagem.body as { itens: AssociadoResponseBody[] }
    ).itens.find((a) => a.cpf === cpfAutoCadastro);
    expect(pendente).toBeDefined();

    await request(app.getHttpServer())
      .post(`/associados/${pendente!.id}/aprovar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const consulta = await request(app.getHttpServer())
      .get(`/associados/${pendente!.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(
      (consulta.body as { associado: AssociadoResponseBody }).associado.status,
    ).toBe('ativo');
  });

  it('rejeita um cadastro pendente e reflete o novo status na consulta', async () => {
    await request(app.getHttpServer())
      .post('/associados/auto-cadastro')
      .send({
        nome: 'Pedro Rejeitado',
        cpf: cpfParaRejeitar,
        contato: '55999990004',
        endereco: ENDERECO_TESTE,
        email: 'pedro.rejeitado@e2e.local',
        senha: 'senha123',
      })
      .expect(201);

    const listagem = await request(app.getHttpServer())
      .get('/associados')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const pendente = (
      listagem.body as { itens: AssociadoResponseBody[] }
    ).itens.find((a) => a.cpf === cpfParaRejeitar);
    expect(pendente).toBeDefined();

    await request(app.getHttpServer())
      .post(`/associados/${pendente!.id}/rejeitar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const consulta = await request(app.getHttpServer())
      .get(`/associados/${pendente!.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(
      (consulta.body as { associado: AssociadoResponseBody }).associado.status,
    ).toBe('rejeitado');
  });
});
