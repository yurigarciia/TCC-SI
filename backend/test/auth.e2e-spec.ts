import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface LoginResponseBody {
  accessToken: string;
}

interface UsuarioResponseBody {
  id: string;
  nome: string | null;
  email: string;
  perfil: string;
}

async function login(app: INestApplication<App>, email: string, senha: string) {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, senha });
  return response.body as LoginResponseBody;
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  const adminEmail =
    process.env.SEED_ADMIN_EMAIL ?? 'diretoria@piadosul.org.br';
  const adminSenha = process.env.SEED_ADMIN_SENHA ?? 'mudar123';

  const associadoEmail = 'associado.teste@piadosul.org.br';
  const associadoSenha = 'senha123';

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
    const senhaHash = await bcrypt.hash(associadoSenha, 10);
    await dataSource.query(
      `INSERT INTO usuarios (email, senha_hash, perfil) VALUES ($1, $2, 'associado')
       ON CONFLICT (email) DO NOTHING`,
      [associadoEmail, senhaHash],
    );
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM usuarios WHERE email = $1', [
      associadoEmail,
    ]);
    await app.close();
  });

  it('rejeita login com credenciais inválidas (401)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, senha: 'senha-errada' })
      .expect(401);
  });

  it('faz login com credenciais válidas e retorna um token', async () => {
    const { accessToken } = await login(app, adminEmail, adminSenha);
    expect(typeof accessToken).toBe('string');
  });

  it('rejeita rota protegida sem token (401)', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('permite rota protegida com token válido (200)', async () => {
    const { accessToken } = await login(app, adminEmail, adminSenha);

    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }: { body: UsuarioResponseBody }) => {
        expect(body.email).toBe(adminEmail);
        expect(body.perfil).toBe('administrador');
      });
  });

  it('permite rota restrita a administrador para um administrador (200)', async () => {
    const { accessToken } = await login(app, adminEmail, adminSenha);

    return request(app.getHttpServer())
      .get('/auth/usuarios')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }: { body: { itens: UsuarioResponseBody[] } }) => {
        expect(Array.isArray(body.itens)).toBe(true);
        expect(body.itens.some((u) => u.email === adminEmail)).toBe(true);
      });
  });

  it('nega rota restrita a administrador para um associado (403)', async () => {
    const { accessToken } = await login(app, associadoEmail, associadoSenha);

    return request(app.getHttpServer())
      .get('/auth/usuarios')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('administrador cria uma nova conta de administrador, que consegue logar em seguida', async () => {
    const { accessToken } = await login(app, adminEmail, adminSenha);
    const novoEmail = 'novo.diretor@piadosul.org.br';

    const criado = await request(app.getHttpServer())
      .post('/auth/usuarios')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Novo Diretor', email: novoEmail, senha: 'senhaProvisoria123' })
      .expect(201);
    expect((criado.body as UsuarioResponseBody).perfil).toBe('administrador');
    expect((criado.body as UsuarioResponseBody).nome).toBe('Novo Diretor');

    const novoLogin = await login(app, novoEmail, 'senhaProvisoria123');
    expect(typeof novoLogin.accessToken).toBe('string');

    await dataSource.query('DELETE FROM usuarios WHERE email = $1', [
      novoEmail,
    ]);
  });

  it('recusa criar administrador com e-mail já cadastrado (409)', async () => {
    const { accessToken } = await login(app, adminEmail, adminSenha);

    return request(app.getHttpServer())
      .post('/auth/usuarios')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Qualquer Nome', email: adminEmail, senha: 'qualquerSenha123' })
      .expect(409);
  });

  it('nega criação de administrador para um associado (403) e sem token (401)', async () => {
    const { accessToken } = await login(app, associadoEmail, associadoSenha);

    await request(app.getHttpServer())
      .post('/auth/usuarios')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'outro@piadosul.org.br', senha: 'qualquerSenha123' })
      .expect(403);

    await request(app.getHttpServer())
      .post('/auth/usuarios')
      .send({ email: 'outro@piadosul.org.br', senha: 'qualquerSenha123' })
      .expect(401);
  });
});
