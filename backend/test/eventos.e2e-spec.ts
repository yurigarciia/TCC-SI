import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

async function loginAdmin(app: INestApplication<App>): Promise<string> {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'diretoria@piadosul.org.br';
  const senha = process.env.SEED_ADMIN_SENHA ?? 'mudar123';
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, senha });
  return (response.body as { accessToken: string }).accessToken;
}

describe('Eventos e Croqui de Salão (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let adminToken: string;

  const nomeSalao = 'Salão Principal — e2e';
  let salaoId: string;
  let mesaId: string;
  let eventoComCroquiId: string;
  let eventoSemCroquiId: string;

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
    await dataSource.query(
      'DELETE FROM configuracoes_ingresso_evento WHERE evento_id IN (SELECT id FROM eventos WHERE nome LIKE $1)',
      ['%— e2e'],
    );
    await dataSource.query(
      'DELETE FROM configuracoes_mesa_evento WHERE evento_id IN (SELECT id FROM eventos WHERE nome LIKE $1)',
      ['%— e2e'],
    );
    await dataSource.query('DELETE FROM eventos WHERE nome LIKE $1', [
      '%— e2e',
    ]);
    await dataSource.query('DELETE FROM mesas WHERE salao_id = $1', [salaoId]);
    await dataSource.query('DELETE FROM saloes WHERE nome = $1', [nomeSalao]);
    await app.close();
  });

  it('cria um salão (croqui) e adiciona mesas numeradas', async () => {
    const salao = await request(app.getHttpServer())
      .post('/saloes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: nomeSalao, capacidadeTotal: 200 })
      .expect(201);
    salaoId = (salao.body as { id: string }).id;

    const mesa = await request(app.getHttpServer())
      .post(`/saloes/${salaoId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero: 1, capacidade: 8, posicaoX: 10, posicaoY: 20 })
      .expect(201);
    mesaId = (mesa.body as { id: string }).id;

    const consulta = await request(app.getHttpServer())
      .get(`/saloes/${salaoId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect((consulta.body as { mesas: unknown[] }).mesas).toHaveLength(1);
  });

  it('bloqueia numeração de mesa duplicada dentro do mesmo salão (409)', () => {
    return request(app.getHttpServer())
      .post(`/saloes/${salaoId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero: 1, capacidade: 4, posicaoX: 30, posicaoY: 40 })
      .expect(409);
  });

  it('cria evento sem croqui (só ingresso avulso), nasce como rascunho', async () => {
    const response = await request(app.getHttpServer())
      .post('/eventos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Fandango sem mesa — e2e',
        data: new Date(Date.now() + 86400000).toISOString(),
        local: 'Galpão do CTG',
      })
      .expect(201);

    eventoSemCroquiId = (response.body as { id: string; status: string }).id;
    expect((response.body as { status: string }).status).toBe('rascunho');
  });

  it('rejeita configurar mesas em evento sem croqui vinculado (400)', () => {
    return request(app.getHttpServer())
      .put(`/eventos/${eventoSemCroquiId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ mesas: [{ mesaId, preco: 50, bloqueada: false }] })
      .expect(400);
  });

  it('cria evento vinculado a um croqui, configura mesas e ingresso, e publica', async () => {
    const evento = await request(app.getHttpServer())
      .post('/eventos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Baile com mesas — e2e',
        data: new Date(Date.now() + 172800000).toISOString(),
        local: 'Salão Principal',
        salaoId,
      })
      .expect(201);
    eventoComCroquiId = (evento.body as { id: string }).id;

    await request(app.getHttpServer())
      .put(`/eventos/${eventoComCroquiId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ mesas: [{ mesaId, preco: 120, bloqueada: false }] })
      .expect(200);

    await request(app.getHttpServer())
      .put(`/eventos/${eventoComCroquiId}/ingresso`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantidadeDisponivel: 100, preco: 25 })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/eventos/${eventoComCroquiId}/publicar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const detalhado = await request(app.getHttpServer())
      .get(`/eventos/${eventoComCroquiId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const body = detalhado.body as {
      evento: { status: string };
      mesas: unknown[];
      ingresso: { preco: string | number };
    };
    expect(body.evento.status).toBe('publicado');
    expect(body.mesas).toHaveLength(1);
    expect(Number(body.ingresso.preco)).toBe(25);
  });

  it('lista o evento publicado na vitrine pública, sem exigir autenticação', async () => {
    const response = await request(app.getHttpServer())
      .get('/eventos/publicados')
      .expect(200);
    const publicados = response.body as Array<{ id: string }>;
    expect(publicados.some((e) => e.id === eventoComCroquiId)).toBe(true);
    expect(publicados.some((e) => e.id === eventoSemCroquiId)).toBe(false);
  });
});
