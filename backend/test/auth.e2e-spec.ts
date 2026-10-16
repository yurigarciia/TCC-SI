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
      .send({
        nome: 'Novo Diretor',
        email: novoEmail,
        senha: 'senhaProvisoria123',
      })
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
      .send({
        nome: 'Qualquer Nome',
        email: adminEmail,
        senha: 'qualquerSenha123',
      })
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

  it('permite editar e excluir uma conta administrador, mas recusa autoexclusão', async () => {
    const { accessToken } = await login(app, adminEmail, adminSenha);
    const email = 'editar.excluir@piadosul.org.br';

    const criado = await request(app.getHttpServer())
      .post('/auth/usuarios')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Para Editar', email, senha: 'senhaProvisoria123' })
      .expect(201);
    const id = (criado.body as UsuarioResponseBody).id;

    const atualizado = await request(app.getHttpServer())
      .patch(`/auth/usuarios/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'Nome Editado' })
      .expect(200);
    expect((atualizado.body as UsuarioResponseBody).nome).toBe('Nome Editado');

    // e-mail duplicado (o do próprio admin logado) é recusado
    await request(app.getHttpServer())
      .patch(`/auth/usuarios/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: adminEmail })
      .expect(409);

    // administrador não pode excluir a própria conta
    const meInfo = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/auth/usuarios/${(meInfo.body as { sub: string }).sub}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    await request(app.getHttpServer())
      .delete(`/auth/usuarios/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .delete(`/auth/usuarios/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('permite trocar a própria senha e recusa senha atual errada ou igual à nova', async () => {
    const email = 'trocar.senha@piadosul.org.br';
    await request(app.getHttpServer())
      .post('/auth/usuarios')
      .set(
        'Authorization',
        `Bearer ${(await login(app, adminEmail, adminSenha)).accessToken}`,
      )
      .send({ nome: 'Troca Senha', email, senha: 'senhaAntiga123' })
      .expect(201);

    const { accessToken } = await login(app, email, 'senhaAntiga123');

    await request(app.getHttpServer())
      .post('/auth/alterar-senha')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ senhaAtual: 'senhaErrada', senhaNova: 'senhaNova123' })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/alterar-senha')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ senhaAtual: 'senhaAntiga123', senhaNova: 'senhaAntiga123' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/auth/alterar-senha')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ senhaAtual: 'senhaAntiga123', senhaNova: 'senhaNova123' })
      .expect(204);

    // senha antiga não funciona mais, a nova sim
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, senha: 'senhaAntiga123' })
      .expect(401);
    const novoLogin = await login(app, email, 'senhaNova123');
    expect(typeof novoLogin.accessToken).toBe('string');

    await dataSource.query('DELETE FROM usuarios WHERE email = $1', [email]);
  });
});
