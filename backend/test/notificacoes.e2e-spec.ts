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

describe('Notificações — Push Token (e2e, T-MOB-005)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let adminToken: string;
  let associadoToken: string;

  const email = 'associado.notificacoes.e2e@example.com';
  const cpf = '11122233451';

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

    const autoCadastro = await request(app.getHttpServer())
      .post('/associados/auto-cadastro')
      .send({
        nome: 'Associado Notificações e2e',
        cpf,
        contato: '55999990099',
        endereco: {
          cep: '97000-000',
          logradouro: 'Rua Teste',
          numero: '100',
          bairro: 'Centro',
          cidade: 'Santa Maria',
          uf: 'RS',
        },
        email,
        senha: 'senha123',
      })
      .expect(201);
    const associadoId = (autoCadastro.body as { id: string }).id;

    await request(app.getHttpServer())
      .post(`/associados/${associadoId}/aprovar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, senha: 'senha123' })
      .expect(200);
    associadoToken = (login.body as { accessToken: string }).accessToken;
    // Timeout maior que o padrão do Jest (5s) — mesmo motivo do beforeAll de
    // ingressos.e2e-spec.ts: bootstrap do módulo + chamadas sequenciais (agora incluindo a
    // gravação do endereço no auto-cadastro) contra o Postgres remoto (Neon).
  }, 20000);

  afterAll(async () => {
    await dataSource.query(
      'DELETE FROM push_tokens WHERE usuario_id IN (SELECT usuario_id FROM associados WHERE cpf = $1)',
      [cpf],
    );
    await dataSource.query('DELETE FROM associados WHERE cpf = $1', [cpf]);
    await dataSource.query('DELETE FROM usuarios WHERE email = $1', [email]);
    await app.close();
  });

  it('associado registra o próprio token de push (idempotente)', async () => {
    const token = 'ExponentPushToken[e2e-teste-idempotencia]';

    await request(app.getHttpServer())
      .post('/notificacoes/push-token')
      .set('Authorization', `Bearer ${associadoToken}`)
      .send({ token })
      .expect(204);

    // registrar de novo o mesmo token não deve duplicar nem falhar
    await request(app.getHttpServer())
      .post('/notificacoes/push-token')
      .set('Authorization', `Bearer ${associadoToken}`)
      .send({ token })
      .expect(204);

    const linhas = await dataSource.query<Array<{ count: string }>>(
      `SELECT COUNT(*)::int AS count FROM push_tokens pt
       INNER JOIN associados a ON a.usuario_id = pt.usuario_id
       WHERE a.cpf = $1 AND pt.token = $2`,
      [cpf, token],
    );
    expect(Number(linhas[0].count)).toBe(1);
  });

  it('rejeita sem autenticação (401) e para perfil administrador (403)', async () => {
    await request(app.getHttpServer())
      .post('/notificacoes/push-token')
      .send({ token: 'ExponentPushToken[sem-auth]' })
      .expect(401);

    await request(app.getHttpServer())
      .post('/notificacoes/push-token')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ token: 'ExponentPushToken[admin]' })
      .expect(403);
  });

  it('rejeita token vazio/curto demais', async () => {
    await request(app.getHttpServer())
      .post('/notificacoes/push-token')
      .set('Authorization', `Bearer ${associadoToken}`)
      .send({ token: 'abc' })
      .expect(400);
  });
});
