import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MesaJaReservadaError,
  ReservaRepositoryPort,
} from '../ports/reserva-repository.port';
import { EventoRepositoryPort } from '../../../eventos/application/ports/evento-repository.port';
import { MesaRepositoryPort } from '../../../eventos/application/ports/mesa-repository.port';
import { ConfiguracaoMesaEventoRepositoryPort } from '../../../eventos/application/ports/configuracao-mesa-evento-repository.port';
import { PaymentGatewayPort } from '../../../shared/payments/application/ports/payment-gateway.port';
import { NotificationSenderPort } from '../../../shared/notifications/application/ports/notification-sender.port';
import {
  CanalReserva,
  FormaPagamentoReserva,
  Reserva,
  StatusReserva,
} from '../../domain/reserva.entity';

export interface DadosSolicitacaoReserva {
  canal: CanalReserva;
  formaPagamento: FormaPagamentoReserva;
  nomeTitular?: string;
  associadoId?: string;
}

// reserva-mesa.json: reserva sempre da mesa INTEIRA. Canal "mediado" (diretoria já recebeu ou
// encaminhou o pagamento no ato) confirma direto; canal "app" com pagamento presencial fica
// pendente até a diretoria confirmar o recebimento (ConfirmarReservaPendenteUseCase); com
// pagamento online, confirma direto após o gateway aprovar. A checagem "Mesa ainda disponível?"
// é a constraint de unicidade do banco (uma reserva pendente/confirmada por evento+mesa) — ver
// MesaJaReservadaError.
@Injectable()
export class SolicitarReservaUseCase {
  constructor(
    @Inject(ReservaRepositoryPort)
    private readonly reservas: ReservaRepositoryPort,
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(MesaRepositoryPort) private readonly mesas: MesaRepositoryPort,
    @Inject(ConfiguracaoMesaEventoRepositoryPort)
    private readonly configuracoesMesa: ConfiguracaoMesaEventoRepositoryPort,
    @Inject(PaymentGatewayPort) private readonly gateway: PaymentGatewayPort,
    @Inject(NotificationSenderPort)
    private readonly notificacoes: NotificationSenderPort,
  ) {}

  async execute(
    eventoId: string,
    mesaId: string,
    dados: DadosSolicitacaoReserva,
  ): Promise<Reserva> {
    const evento = await this.eventos.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }
    if (evento.salaoId !== (await this.mesas.buscarPorId(mesaId))?.salaoId) {
      throw new BadRequestException(
        'Mesa não pertence ao salão vinculado a este evento',
      );
    }

    const configuracoes =
      await this.configuracoesMesa.listarPorEvento(eventoId);
    const configuracaoDaMesa = configuracoes.find((c) => c.mesaId === mesaId);
    if (!configuracaoDaMesa) {
      throw new BadRequestException(
        'Mesa não está configurada para este evento',
      );
    }
    if (configuracaoDaMesa.bloqueada) {
      throw new BadRequestException('Mesa bloqueada para este evento');
    }

    let pagamentoExternoId: string | null = null;
    let status = StatusReserva.PENDENTE;

    if (dados.canal === CanalReserva.MEDIADO) {
      status = StatusReserva.CONFIRMADA;
    } else if (dados.formaPagamento === FormaPagamentoReserva.ONLINE) {
      const cobranca = await this.gateway.iniciarCobranca({
        valor: configuracaoDaMesa.preco,
        descricao: `Reserva de mesa — evento ${evento.nome}`,
        referenciaExterna: `${eventoId}:${mesaId}`,
      });
      pagamentoExternoId = cobranca.idGateway;
      status = StatusReserva.CONFIRMADA;
    }

    let reserva: Reserva;
    try {
      reserva = await this.reservas.salvar({
        eventoId,
        mesaId,
        canal: dados.canal,
        formaPagamento: dados.formaPagamento,
        status,
        pagamentoExternoId,
        nomeTitular: dados.nomeTitular ?? null,
        associadoId: dados.associadoId ?? null,
      });
    } catch (erro) {
      if (erro instanceof MesaJaReservadaError) {
        throw new ConflictException('Mesa já reservada — solicitação recusada');
      }
      throw erro;
    }

    if (reserva.status === StatusReserva.CONFIRMADA && reserva.associadoId) {
      await this.notificacoes.enviar({
        destinatarioId: reserva.associadoId,
        titulo: 'Reserva confirmada',
        mensagem: `Sua reserva de mesa para "${evento.nome}" foi confirmada.`,
      });
    }

    return reserva;
  }
}
