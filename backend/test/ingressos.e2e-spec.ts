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

describe('Ingressos (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let adminToken: string;
  let eventoId: string;

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

    const evento = await request(app.getHttpServer())
      .post('/eventos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Fandango Ingressos — e2e',
        data: new Date(Date.now() + 86400000).toISOString(),
        local: 'Galpão',
      });
    eventoId = (evento.body as { id: string }).id;

    // preço padrão da entidade (usado quando o evento não sobrescreve)
    await request(app.getHttpServer())
      .put('/precos-ingresso')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ perfil: 'socio', preco: 20 });
    await request(app.getHttpServer())
      .put('/precos-ingresso')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ perfil: 'nao_socio', preco: 40 });
    await request(app.getHttpServer())
      .put('/precos-ingresso')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ perfil: 'crianca', preco: 5 });

    // override específico deste evento para sócio
    await request(app.getHttpServer())
      .put(`/eventos/${eventoId}/precos-ingresso`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ perfil: 'socio', preco: 15 });

    await request(app.getHttpServer())
      .put(`/eventos/${eventoId}/ingresso`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantidadeDisponivel: 3, preco: 20 });
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM ingressos WHERE evento_id = $1', [
      eventoId,
    ]);
    await dataSource.query('DELETE FROM precos_ingresso WHERE evento_id = $1', [
      eventoId,
    ]);
    await dataSource.query(
      "DELETE FROM precos_ingresso WHERE evento_id IS NULL AND perfil IN ('socio','nao_socio','crianca')",
    );
    await dataSource.query(
      'DELETE FROM configuracoes_ingresso_evento WHERE evento_id = $1',
      [eventoId],
    );
    await dataSource.query('DELETE FROM eventos WHERE id = $1', [eventoId]);
    await app.close();
  });

  it('aplica o preço override do evento para sócio', async () => {
    const response = await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/ingressos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nomeComprador: 'Sócio Teste',
        perfilComprador: 'socio',
        canal: 'mediado',
        formaPagamento: 'presencial',
      })
      .expect(201);
    expect(Number((response.body as { preco: string }).preco)).toBe(15);
  });

  it('aplica o preço padrão da entidade para não-sócio (sem override no evento)', async () => {
    const response = await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/ingressos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nomeComprador: 'Visitante Teste',
        perfilComprador: 'nao_socio',
        canal: 'mediado',
        formaPagamento: 'presencial',
      })
      .expect(201);
    expect(Number((response.body as { preco: string }).preco)).toBe(40);
  });

  it('canal app com pagamento online inicia cobrança no gateway', async () => {
    const response = await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/ingressos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nomeComprador: 'Criança App',
        perfilComprador: 'crianca',
        canal: 'app',
        formaPagamento: 'online',
      })
      .expect(201);
    const body = response.body as {
      preco: string;
      pagamentoExternoId: string | null;
    };
    expect(Number(body.preco)).toBe(5);
    expect(body.pagamentoExternoId).toMatch(/^fake_/);
  });

  it('bloqueia emissão além da quantidade disponível (409)', () => {
    // já emitimos 3 (sócio + não-sócio + criança) para uma quantidadeDisponivel de 3
    return request(app.getHttpServer())
      .post(`/eventos/${eventoId}/ingressos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nomeComprador: 'Quarto Comprador',
        perfilComprador: 'crianca',
        canal: 'mediado',
        formaPagamento: 'presencial',
      })
      .expect(409);
  });

  it('busca manual por nome e faz check-in; reuso é recusado', async () => {
    const busca = await request(app.getHttpServer())
      .get(`/eventos/${eventoId}/ingressos`)
      .query({ nome: 'Sócio' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const encontrados = busca.body as Array<{
      id: string;
      nomeComprador: string;
    }>;
    expect(encontrados).toHaveLength(1);
    const ingressoId = encontrados[0].id;

    await request(app.getHttpServer())
      .post(`/ingressos/${ingressoId}/checkin`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/ingressos/${ingressoId}/checkin`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(409);
  });
});
