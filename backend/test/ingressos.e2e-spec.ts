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
  let categoriaId: string;

  const nomeCategoria = 'Contribuinte — ingressos e2e';

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

    // preço de sócio varia por categoria — precisa de uma categoria existente pra testar.
    const categoria = await request(app.getHttpServer())
      .post('/categorias-socio')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: nomeCategoria, valorMensalidade: 60 });
    categoriaId = (categoria.body as { id: string }).id;

    // preço padrão da entidade (usado quando o evento não sobrescreve)
    await request(app.getHttpServer())
      .put('/precos-ingresso')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ perfil: 'socio', preco: 20, categoriaSocioId: categoriaId });
    await request(app.getHttpServer())
      .put('/precos-ingresso')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ perfil: 'nao_socio', preco: 40 });
    await request(app.getHttpServer())
      .put('/precos-ingresso')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ perfil: 'crianca', preco: 5 });

    // override específico deste evento para sócio (mesma categoria)
    await request(app.getHttpServer())
      .put(`/eventos/${eventoId}/precos-ingresso`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ perfil: 'socio', preco: 15, categoriaSocioId: categoriaId });

    await request(app.getHttpServer())
      .put(`/eventos/${eventoId}/ingresso`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantidadeDisponivel: 4 });
    // Timeout maior que o padrão do Jest (5s) — este hook faz o bootstrap do módulo (Nest +
    // conexão TypeORM) mais várias requisições HTTP sequenciais de setup, e o banco de testes é o
    // mesmo Postgres remoto (Neon) usado em dev, sem baixa latência garantida (achado numa
    // conversa com o usuário: essa suíte estourava o hook de forma consistente, não só
    // esporádica — as outras suítes têm menos chamadas sequenciais no beforeAll e raramente
    // encostam no limite).
  }, 20000);

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
    await dataSource.query('DELETE FROM categorias_socio WHERE nome = $1', [
      nomeCategoria,
    ]);
    await app.close();
  });

  it('aplica o preço override do evento para sócio', async () => {
    const response = await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/ingressos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nomeComprador: 'Sócio Teste',
        perfilComprador: 'socio',
        categoriaSocioId: categoriaId,
        canal: 'mediado',
        formaPagamento: 'presencial',
      })
      .expect(201);
    expect(Number((response.body as { preco: string }).preco)).toBe(15);
  });

  it('recusa emitir ingresso de sócio sem informar a categoria (400)', () => {
    return request(app.getHttpServer())
      .post(`/eventos/${eventoId}/ingressos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nomeComprador: 'Sócio Sem Categoria',
        perfilComprador: 'socio',
        canal: 'mediado',
        formaPagamento: 'presencial',
      })
      .expect(400);
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

  it('preço informado na venda sobrescreve o preço resolvido por perfil/categoria', async () => {
    const response = await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/ingressos`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nomeComprador: 'Criança Cortesia',
        perfilComprador: 'crianca',
        canal: 'mediado',
        formaPagamento: 'presencial',
        preco: 12,
      })
      .expect(201);
    // Padrão da entidade pra criança é 5 (ver beforeAll) — 12 aqui prova que o valor informado
    // venceu, não o resolvido automaticamente.
    expect(Number((response.body as { preco: string }).preco)).toBe(12);
  });

  it('consulta os preços resolvidos pra este evento, por categoria de sócio (override + padrão)', async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/eventos/${eventoId}/precos-ingresso`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const corpo = resposta.body as {
      porCategoria: Array<{
        categoriaSocioId: string;
        categoriaNome: string;
        preco: number | string | null;
      }>;
      naoSocio: number | string | null;
      crianca: number | string | null;
    };
    const precoCategoria = corpo.porCategoria.find(
      (item) => item.categoriaSocioId === categoriaId,
    );
    expect(precoCategoria).toBeDefined();
    expect(precoCategoria!.categoriaNome).toBe(nomeCategoria);
    expect(Number(precoCategoria!.preco)).toBe(15); // override específico do evento
    expect(Number(corpo.naoSocio)).toBe(40); // cai pro padrão da entidade
    expect(Number(corpo.crianca)).toBe(5); // cai pro padrão da entidade
  });

  it('preço não configurado (nem padrão, nem override) resolve como null', async () => {
    const outroEvento = await request(app.getHttpServer())
      .post('/eventos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Evento sem preços configurados — e2e',
        data: new Date(Date.now() + 86400000).toISOString(),
        local: 'Galpão',
      });
    const outroEventoId = (outroEvento.body as { id: string }).id;

    const outraCategoria = await request(app.getHttpServer())
      .post('/categorias-socio')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Categoria sem preço — ingressos e2e', valorMensalidade: 30 });
    const outraCategoriaId = (outraCategoria.body as { id: string }).id;

    const resposta = await request(app.getHttpServer())
      .get(`/eventos/${outroEventoId}/precos-ingresso`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const corpo = resposta.body as {
      porCategoria: Array<{ categoriaSocioId: string; preco: number | null }>;
      naoSocio: number | null;
      crianca: number | null;
    };
    const precoCategoria = corpo.porCategoria.find(
      (item) => item.categoriaSocioId === outraCategoriaId,
    );
    expect(precoCategoria?.preco).toBeNull();

    await dataSource.query('DELETE FROM eventos WHERE id = $1', [
      outroEventoId,
    ]);
    await dataSource.query('DELETE FROM categorias_socio WHERE id = $1', [
      outraCategoriaId,
    ]);
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
    // já emitimos 4 (sócio + não-sócio + criança com preço sobrescrito + criança via app) para
    // uma quantidadeDisponivel de 4
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
    const { itens: encontrados } = busca.body as {
      itens: Array<{ id: string; nomeComprador: string }>;
    };
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

  it('resumo do evento reflete emitidos, check-ins, pendentes e receita total', async () => {
    const resposta = await request(app.getHttpServer())
      .get(`/eventos/${eventoId}/ingressos/resumo`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const resumo = resposta.body as {
      totalEmitidos: number;
      totalUsados: number;
      totalPendentes: number;
      receitaTotal: number | string;
    };
    // 4 emitidos até aqui: sócio (15) + não-sócio (40) + criança com preço sobrescrito (12) +
    // criança via app (5); só o sócio fez check-in.
    expect(resumo.totalEmitidos).toBe(4);
    expect(resumo.totalUsados).toBe(1);
    expect(resumo.totalPendentes).toBe(3);
    expect(Number(resumo.receitaTotal)).toBe(72);

    await request(app.getHttpServer())
      .get('/eventos/00000000-0000-0000-0000-000000000000/ingressos/resumo')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('T-MOB-004 — associado compra o próprio ingresso pelo app (RF12)', async () => {
    // Timeout maior que o padrão do Jest (5s) — mesmo motivo do beforeAll acima: várias
    // requisições sequenciais (incluindo um auto-cadastro com hash de senha) contra o Postgres
    // remoto (Neon) usado em dev/teste.
    const cpf = '99988877766';
    const email = 'associado.ingresso@e2e.local';

    const autoCadastro = await request(app.getHttpServer())
      .post('/associados/auto-cadastro')
      .send({
        nome: 'Associado Compra Ingresso',
        cpf,
        contato: '55999990011',
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

    // Preço de sócio varia por categoria — associado precisa ter uma categoria definida antes de
    // conseguir comprar (ComprarMeuIngressoUseCase recusa sem isso).
    await request(app.getHttpServer())
      .patch(`/associados/${associadoId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ categoriaSocioId: categoriaId })
      .expect(200);

    const eventoAssociado = await request(app.getHttpServer())
      .post('/eventos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Fandango Compra Ingresso — e2e',
        data: new Date(Date.now() + 86400000).toISOString(),
        local: 'Galpão',
      })
      .expect(201);
    const eventoAssociadoId = (eventoAssociado.body as { id: string }).id;

    await request(app.getHttpServer())
      .put(`/eventos/${eventoAssociadoId}/ingresso`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantidadeDisponivel: 5 })
      .expect(200);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, senha: 'senha123' })
      .expect(200);
    const associadoToken = (login.body as { accessToken: string }).accessToken;

    const meuPreco = await request(app.getHttpServer())
      .get(`/eventos/${eventoAssociadoId}/meu-preco-ingresso`)
      .set('Authorization', `Bearer ${associadoToken}`)
      .expect(200);
    expect(Number((meuPreco.body as { preco: number | string }).preco)).toBe(20); // padrão da entidade pra essa categoria

    // administrador não deve conseguir usar a rota exclusiva do associado
    await request(app.getHttpServer())
      .get(`/eventos/${eventoAssociadoId}/meu-preco-ingresso`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);

    const compra = await request(app.getHttpServer())
      .post(`/eventos/${eventoAssociadoId}/meu-ingresso`)
      .set('Authorization', `Bearer ${associadoToken}`)
      .expect(201);
    const ingresso = compra.body as {
      nomeComprador: string;
      perfilComprador: string;
      canal: string;
      formaPagamento: string;
      pagamentoExternoId: string | null;
    };
    expect(ingresso.nomeComprador).toBe('Associado Compra Ingresso');
    expect(ingresso.perfilComprador).toBe('socio');
    expect(ingresso.canal).toBe('app');
    expect(ingresso.formaPagamento).toBe('online');
    expect(ingresso.pagamentoExternoId).toMatch(/^fake_/);

    // administrador não deve conseguir usar a rota exclusiva do associado
    await request(app.getHttpServer())
      .post(`/eventos/${eventoAssociadoId}/meu-ingresso`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);

    // "Meus Ingressos" — achado numa conversa com o usuário: comprar pelo app não bastava, o
    // associado precisa conseguir ver o ingresso depois (pra abrir o QR na portaria).
    const meusIngressos = await request(app.getHttpServer())
      .get('/ingressos/minhas')
      .set('Authorization', `Bearer ${associadoToken}`)
      .expect(200);
    const listaIngressos = meusIngressos.body as Array<{
      id: string;
      status: string;
      evento: { id: string; nome: string } | null;
    }>;
    expect(listaIngressos).toHaveLength(1);
    expect(listaIngressos[0].status).toBe('emitido');
    expect(listaIngressos[0].evento?.id).toBe(eventoAssociadoId);

    // administrador não deve conseguir usar a rota exclusiva do associado
    await request(app.getHttpServer())
      .get('/ingressos/minhas')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);

    await dataSource.query('DELETE FROM ingressos WHERE evento_id = $1', [
      eventoAssociadoId,
    ]);
    await dataSource.query(
      'DELETE FROM configuracoes_ingresso_evento WHERE evento_id = $1',
      [eventoAssociadoId],
    );
    await dataSource.query('DELETE FROM eventos WHERE id = $1', [
      eventoAssociadoId,
    ]);
    const usuarioIds = await dataSource.query<
      Array<{ usuario_id: string | null }>
    >('SELECT usuario_id FROM associados WHERE cpf = $1', [cpf]);
    await dataSource.query('DELETE FROM associados WHERE cpf = $1', [cpf]);
    const usuarioId = usuarioIds[0]?.usuario_id;
    if (usuarioId) {
      await dataSource.query('DELETE FROM usuarios WHERE id = $1', [usuarioId]);
    }
  }, 15000);
});
