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

  it('edita número/capacidade/posição de uma mesa, bloqueia número duplicado e 404 pra mesa inexistente', async () => {
    const mesa = await request(app.getHttpServer())
      .post(`/saloes/${salaoId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero: 9, capacidade: 4, posicaoX: 5, posicaoY: 5 })
      .expect(201);
    const mesaEditavelId = (mesa.body as { id: string }).id;

    const editada = await request(app.getHttpServer())
      .patch(`/saloes/${salaoId}/mesas/${mesaEditavelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ capacidade: 6, posicaoX: 55, posicaoY: 66 })
      .expect(200);
    const body = editada.body as {
      capacidade: number;
      posicaoX: number;
      posicaoY: number;
    };
    expect(body.capacidade).toBe(6);
    expect(body.posicaoX).toBe(55);
    expect(body.posicaoY).toBe(66);

    await request(app.getHttpServer())
      .patch(`/saloes/${salaoId}/mesas/${mesaEditavelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero: 1 })
      .expect(409);

    await request(app.getHttpServer())
      .patch(`/saloes/${salaoId}/mesas/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ capacidade: 10 })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/saloes/${salaoId}/mesas/${mesaEditavelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    const consulta = await request(app.getHttpServer())
      .get(`/saloes/${salaoId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect((consulta.body as { mesas: Array<{ id: string }> }).mesas.some(
      (m) => m.id === mesaEditavelId,
    )).toBe(false);
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

  it('atualiza dados básicos de um evento (nome, local)', async () => {
    const atualizado = await request(app.getHttpServer())
      .patch(`/eventos/${eventoSemCroquiId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Fandango sem mesa (renomeado) — e2e', local: 'Galpão novo' })
      .expect(200);
    expect((atualizado.body as { nome: string }).nome).toBe(
      'Fandango sem mesa (renomeado) — e2e',
    );

    const consulta = await request(app.getHttpServer())
      .get(`/eventos/${eventoSemCroquiId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const body = consulta.body as { evento: { nome: string; local: string } };
    expect(body.evento.nome).toBe('Fandango sem mesa (renomeado) — e2e');
    expect(body.evento.local).toBe('Galpão novo');
  });

  it('recusa atualizar um evento inexistente (404)', () => {
    return request(app.getHttpServer())
      .patch('/eventos/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Não existe' })
      .expect(404);
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
      .send({ quantidadeDisponivel: 100 })
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
      ingresso: { quantidadeDisponivel: number };
    };
    expect(body.evento.status).toBe('publicado');
    expect(body.mesas).toHaveLength(1);
    expect(body.ingresso.quantidadeDisponivel).toBe(100);
  });

  it('lista o evento publicado na vitrine pública, sem exigir autenticação', async () => {
    const response = await request(app.getHttpServer())
      .get('/eventos/publicados')
      .expect(200);
    const publicados = response.body as Array<{ id: string }>;
    expect(publicados.some((e) => e.id === eventoComCroquiId)).toBe(true);
    expect(publicados.some((e) => e.id === eventoSemCroquiId)).toBe(false);
  });

  it('T-MOB-004 — detalha um evento publicado sem exigir autenticação, mas esconde rascunho', async () => {
    const publicado = await request(app.getHttpServer())
      .get(`/eventos/publicados/${eventoComCroquiId}`)
      .expect(200);
    const body = publicado.body as {
      evento: { id: string; status: string };
      mesas: unknown[];
    };
    expect(body.evento.id).toBe(eventoComCroquiId);
    expect(body.evento.status).toBe('publicado');
    expect(body.mesas).toHaveLength(1);

    await request(app.getHttpServer())
      .get(`/eventos/publicados/${eventoSemCroquiId}`)
      .expect(404);
  });

  it('recusa excluir mesa já usada numa configuração de evento (409)', () => {
    return request(app.getHttpServer())
      .delete(`/saloes/${salaoId}/mesas/${mesaId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(409);
  });
});
