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

describe('Reservas de Mesa (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let adminToken: string;

  const nomeSalao = 'Salão Reservas — e2e';
  let salaoId: string;
  let mesaConcorrenciaId: string;
  let mesaPendenteId: string;
  let mesaTitularId: string;
  let mesaOrigemTransferenciaId: string;
  let mesaDestinoTransferenciaId: string;
  let mesaOcupadaId: string;
  let mesaAssociadoId: string;
  let mesaMinhaReservaId: string;
  let eventoId: string;
  const cpfAssociadoMinhasReservas = '55555555555';
  const emailAssociadoMinhasReservas = 'associado.minhasreservas@e2e.local';

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

    const salao = await request(app.getHttpServer())
      .post('/saloes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: nomeSalao, capacidadeTotal: 100 });
    salaoId = (salao.body as { id: string }).id;

    const mesa1 = await request(app.getHttpServer())
      .post(`/saloes/${salaoId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero: 1, capacidade: 8, posicaoX: 0, posicaoY: 0 });
    mesaConcorrenciaId = (mesa1.body as { id: string }).id;

    const mesa2 = await request(app.getHttpServer())
      .post(`/saloes/${salaoId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero: 2, capacidade: 8, posicaoX: 10, posicaoY: 0 });
    mesaPendenteId = (mesa2.body as { id: string }).id;

    const mesa3 = await request(app.getHttpServer())
      .post(`/saloes/${salaoId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero: 3, capacidade: 8, posicaoX: 20, posicaoY: 0 });
    mesaTitularId = (mesa3.body as { id: string }).id;

    const mesa4 = await request(app.getHttpServer())
      .post(`/saloes/${salaoId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero: 4, capacidade: 8, posicaoX: 30, posicaoY: 0 });
    mesaOrigemTransferenciaId = (mesa4.body as { id: string }).id;

    const mesa5 = await request(app.getHttpServer())
      .post(`/saloes/${salaoId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero: 5, capacidade: 8, posicaoX: 40, posicaoY: 0 });
    mesaDestinoTransferenciaId = (mesa5.body as { id: string }).id;

    const mesa6 = await request(app.getHttpServer())
      .post(`/saloes/${salaoId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero: 6, capacidade: 8, posicaoX: 50, posicaoY: 0 });
    mesaOcupadaId = (mesa6.body as { id: string }).id;

    const mesa7 = await request(app.getHttpServer())
      .post(`/saloes/${salaoId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero: 7, capacidade: 8, posicaoX: 70, posicaoY: 0 });
    mesaAssociadoId = (mesa7.body as { id: string }).id;

    const mesa9 = await request(app.getHttpServer())
      .post(`/saloes/${salaoId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero: 9, capacidade: 8, posicaoX: 90, posicaoY: 0 });
    mesaMinhaReservaId = (mesa9.body as { id: string }).id;

    const evento = await request(app.getHttpServer())
      .post('/eventos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Baile Reservas — e2e',
        data: new Date(Date.now() + 86400000).toISOString(),
        local: 'Salão Reservas',
        salaoId,
      });
    eventoId = (evento.body as { id: string }).id;

    await request(app.getHttpServer())
      .put(`/eventos/${eventoId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        mesas: [
          { mesaId: mesaConcorrenciaId, preco: 100, bloqueada: false },
          { mesaId: mesaPendenteId, preco: 80, bloqueada: false },
          { mesaId: mesaTitularId, preco: 90, bloqueada: false },
          { mesaId: mesaOrigemTransferenciaId, preco: 90, bloqueada: false },
          { mesaId: mesaDestinoTransferenciaId, preco: 90, bloqueada: false },
          { mesaId: mesaOcupadaId, preco: 90, bloqueada: false },
          { mesaId: mesaAssociadoId, preco: 90, bloqueada: false },
          { mesaId: mesaMinhaReservaId, preco: 90, bloqueada: false },
        ],
      });
    // Timeout maior que o padrão do Jest (5s) — este hook faz o bootstrap do módulo mais ~11
    // requisições HTTP sequenciais de setup (salão + 9 mesas + evento + configuração de mesas)
    // contra o Postgres remoto (Neon) usado em dev/teste, sem baixa latência garantida (mesmo
    // achado do ingressos.e2e-spec.ts).
  }, 30000);

  afterAll(async () => {
    await dataSource.query('DELETE FROM reservas WHERE evento_id = $1', [
      eventoId,
    ]);
    await dataSource.query(
      'DELETE FROM configuracoes_mesa_evento WHERE evento_id = $1',
      [eventoId],
    );
    await dataSource.query('DELETE FROM eventos WHERE id = $1', [eventoId]);
    await dataSource.query('DELETE FROM mesas WHERE salao_id = $1', [salaoId]);
    await dataSource.query('DELETE FROM saloes WHERE id = $1', [salaoId]);

    const usuarioIds = await dataSource.query<
      Array<{ usuario_id: string | null }>
    >('SELECT usuario_id FROM associados WHERE cpf = $1', [
      cpfAssociadoMinhasReservas,
    ]);
    await dataSource.query('DELETE FROM associados WHERE cpf = $1', [
      cpfAssociadoMinhasReservas,
    ]);
    const usuarioId = usuarioIds[0]?.usuario_id;
    if (usuarioId) {
      await dataSource.query('DELETE FROM usuarios WHERE id = $1', [usuarioId]);
    }

    await app.close();
  });

  it('duas requisições concorrentes na mesma mesa: uma confirma, outra é recusada (409)', async () => {
    const [primeira, segunda] = await Promise.all([
      request(app.getHttpServer())
        .post(`/eventos/${eventoId}/mesas/${mesaConcorrenciaId}/reservar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ canal: 'mediado', formaPagamento: 'presencial' }),
      request(app.getHttpServer())
        .post(`/eventos/${eventoId}/mesas/${mesaConcorrenciaId}/reservar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ canal: 'mediado', formaPagamento: 'presencial' }),
    ]);

    const statusCodes = [primeira.status, segunda.status].sort();
    expect(statusCodes).toEqual([201, 409]);

    const mapa = await request(app.getHttpServer())
      .get(`/eventos/${eventoId}/mapa-mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const mesaNoMapa = (
      mapa.body as Array<{ mesaId: string; status: string }>
    ).find((m) => m.mesaId === mesaConcorrenciaId);
    expect(mesaNoMapa?.status).toBe('reservada');
  });

  it('canal app com pagamento presencial fica pendente até a diretoria confirmar', async () => {
    const solicitacao = await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/mesas/${mesaPendenteId}/reservar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ canal: 'app', formaPagamento: 'presencial' })
      .expect(201);
    const reservaId = (solicitacao.body as { id: string; status: string }).id;
    expect((solicitacao.body as { status: string }).status).toBe('pendente');

    let mapa = await request(app.getHttpServer())
      .get(`/eventos/${eventoId}/mapa-mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(
      (mapa.body as Array<{ mesaId: string; status: string }>).find(
        (m) => m.mesaId === mesaPendenteId,
      )?.status,
    ).toBe('pendente');

    await request(app.getHttpServer())
      .post(`/reservas/${reservaId}/confirmar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    mapa = await request(app.getHttpServer())
      .get(`/eventos/${eventoId}/mapa-mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(
      (mapa.body as Array<{ mesaId: string; status: string }>).find(
        (m) => m.mesaId === mesaPendenteId,
      )?.status,
    ).toBe('reservada');
  });

  it('cancelar uma reserva libera a mesa para nova reserva', async () => {
    await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/mesas/${mesaPendenteId}/reservar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ canal: 'mediado', formaPagamento: 'presencial' })
      .expect(409); // ainda reservada pelo teste anterior

    const reservaAtiva = await dataSource.query<Array<{ id: string }>>(
      `SELECT id FROM reservas WHERE evento_id = $1 AND mesa_id = $2 AND status = 'confirmada'`,
      [eventoId, mesaPendenteId],
    );
    const reservaId = reservaAtiva[0].id;

    await request(app.getHttpServer())
      .post(`/reservas/${reservaId}/cancelar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    const novaReserva = await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/mesas/${mesaPendenteId}/reservar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ canal: 'mediado', formaPagamento: 'presencial' })
      .expect(201);
    expect((novaReserva.body as { status: string }).status).toBe('confirmada');
  });

  it('transfere o titular mantendo a mesma mesa', async () => {
    const solicitacao = await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/mesas/${mesaTitularId}/reservar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        canal: 'mediado',
        formaPagamento: 'presencial',
        nomeTitular: 'Titular Original',
      })
      .expect(201);
    const reservaId = (solicitacao.body as { id: string }).id;

    const transferida = await request(app.getHttpServer())
      .post(`/reservas/${reservaId}/transferir-titular`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ novoTitular: 'Novo Titular' })
      .expect(201);

    const body = transferida.body as {
      id: string;
      mesaId: string;
      nomeTitular: string;
    };
    expect(body.id).toBe(reservaId);
    expect(body.mesaId).toBe(mesaTitularId);
    expect(body.nomeTitular).toBe('Novo Titular');
  });

  it('transfere a reserva para outra mesa disponível, liberando a mesa original', async () => {
    const solicitacao = await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/mesas/${mesaOrigemTransferenciaId}/reservar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ canal: 'mediado', formaPagamento: 'presencial' })
      .expect(201);
    const reservaOriginalId = (solicitacao.body as { id: string }).id;

    const transferida = await request(app.getHttpServer())
      .post(`/reservas/${reservaOriginalId}/transferir-mesa`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ novaMesaId: mesaDestinoTransferenciaId })
      .expect(201);
    const body = transferida.body as {
      id: string;
      mesaId: string;
      status: string;
    };
    expect(body.mesaId).toBe(mesaDestinoTransferenciaId);
    expect(body.status).toBe('confirmada');
    expect(body.id).not.toBe(reservaOriginalId);

    const consultaOriginal = await dataSource.query<Array<{ status: string }>>(
      'SELECT status FROM reservas WHERE id = $1',
      [reservaOriginalId],
    );
    expect(consultaOriginal[0].status).toBe('cancelada');

    // mesa original liberada — dá pra reservar de novo
    await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/mesas/${mesaOrigemTransferenciaId}/reservar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ canal: 'mediado', formaPagamento: 'presencial' })
      .expect(201);
  });

  it('recusa transferência de mesa quando a mesa nova já está ocupada, mantendo a original intacta', async () => {
    // Timeout maior que o padrão do Jest (5s) — mesmo motivo do beforeAll acima: várias
    // requisições sequenciais contra o Postgres remoto (Neon).
    await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/mesas/${mesaOcupadaId}/reservar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ canal: 'mediado', formaPagamento: 'presencial' })
      .expect(201);

    const outraOrigem = await request(app.getHttpServer())
      .post('/saloes/' + salaoId + '/mesas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ numero: 8, capacidade: 8, posicaoX: 80, posicaoY: 0 });
    const mesaOutraOrigemId = (outraOrigem.body as { id: string }).id;
    await request(app.getHttpServer())
      .put(`/eventos/${eventoId}/mesas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        mesas: [
          { mesaId: mesaConcorrenciaId, preco: 100, bloqueada: false },
          { mesaId: mesaPendenteId, preco: 80, bloqueada: false },
          { mesaId: mesaOrigemTransferenciaId, preco: 90, bloqueada: false },
          { mesaId: mesaDestinoTransferenciaId, preco: 90, bloqueada: false },
          { mesaId: mesaOcupadaId, preco: 90, bloqueada: false },
          { mesaId: mesaOutraOrigemId, preco: 90, bloqueada: false },
          { mesaId: mesaAssociadoId, preco: 90, bloqueada: false },
          { mesaId: mesaMinhaReservaId, preco: 90, bloqueada: false },
        ],
      });

    const reservaParaTransferir = await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/mesas/${mesaOutraOrigemId}/reservar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ canal: 'mediado', formaPagamento: 'presencial' })
      .expect(201);
    const reservaId = (reservaParaTransferir.body as { id: string }).id;

    await request(app.getHttpServer())
      .post(`/reservas/${reservaId}/transferir-mesa`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ novaMesaId: mesaOcupadaId })
      .expect(409);

    const consultaOriginal = await dataSource.query<Array<{ status: string }>>(
      'SELECT status FROM reservas WHERE id = $1',
      [reservaId],
    );
    expect(consultaOriginal[0].status).toBe('confirmada');
  }, 15000);

  it('RF13 — associado autenticado consulta suas próprias reservas em /reservas/minhas', async () => {
    // Timeout maior que o padrão do Jest (5s) — mesmo motivo do beforeAll acima.
    const autoCadastro = await request(app.getHttpServer())
      .post('/associados/auto-cadastro')
      .send({
        nome: 'Associado Minhas Reservas',
        cpf: cpfAssociadoMinhasReservas,
        contato: '55999990010',
        endereco: {
          cep: '97000-000',
          logradouro: 'Rua Teste',
          numero: '100',
          bairro: 'Centro',
          cidade: 'Santa Maria',
          uf: 'RS',
        },
        email: emailAssociadoMinhasReservas,
        senha: 'senha123',
      })
      .expect(201);
    const associadoId = (autoCadastro.body as { id: string }).id;

    await request(app.getHttpServer())
      .post(`/associados/${associadoId}/aprovar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/mesas/${mesaAssociadoId}/reservar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ canal: 'mediado', formaPagamento: 'presencial', associadoId })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: emailAssociadoMinhasReservas, senha: 'senha123' })
      .expect(200);
    const associadoToken = (login.body as { accessToken: string }).accessToken;

    const minhas = await request(app.getHttpServer())
      .get('/reservas/minhas')
      .set('Authorization', `Bearer ${associadoToken}`)
      .expect(200);
    const reservas = minhas.body as Array<{
      mesa: { id: string; numero: number } | null;
      evento: { id: string; nome: string } | null;
    }>;
    const minha = reservas.find((r) => r.mesa?.id === mesaAssociadoId);
    expect(minha).toBeDefined();
    expect(minha!.evento?.id).toBe(eventoId);

    // administrador não deve conseguir usar a rota exclusiva do associado
    await request(app.getHttpServer())
      .get('/reservas/minhas')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);
  }, 15000);

  it('T-MOB-004 — associado solicita a própria reserva pelo app (reservar-minha)', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: emailAssociadoMinhasReservas, senha: 'senha123' })
      .expect(200);
    const associadoToken = (login.body as { accessToken: string }).accessToken;

    // GET mapa-mesas também é acessível pelo associado (RF14), pra escolher mesa livre
    await request(app.getHttpServer())
      .get(`/eventos/${eventoId}/mapa-mesas`)
      .set('Authorization', `Bearer ${associadoToken}`)
      .expect(200);

    const reserva = await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/mesas/${mesaMinhaReservaId}/reservar-minha`)
      .set('Authorization', `Bearer ${associadoToken}`)
      .send({ formaPagamento: 'online' })
      .expect(201);

    const body = reserva.body as {
      status: string;
      canal: string;
      associadoId: string;
      nomeTitular: string;
    };
    expect(body.status).toBe('confirmada');
    expect(body.canal).toBe('app');
    expect(body.nomeTitular).toBe('Associado Minhas Reservas');

    // administrador não deve conseguir usar a rota exclusiva do associado
    await request(app.getHttpServer())
      .post(`/eventos/${eventoId}/mesas/${mesaMinhaReservaId}/reservar-minha`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ formaPagamento: 'online' })
      .expect(403);
  });
});
