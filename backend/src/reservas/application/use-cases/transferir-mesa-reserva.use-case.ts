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
import { MesaRepositoryPort } from '../../../eventos/application/ports/mesa-repository.port';
import { ConfiguracaoMesaEventoRepositoryPort } from '../../../eventos/application/ports/configuracao-mesa-evento-repository.port';
import { Reserva, StatusReserva } from '../../domain/reserva.entity';

// cancelamento-transferencia-reserva.json, ramo "trocar mesa": só efetiva a troca se a nova mesa
// estiver disponível — por isso a ordem é criar a reserva na mesa nova PRIMEIRO (a constraint de
// unicidade do banco faz a checagem real) e só cancelar a reserva antiga se a nova for aceita; se
// a mesa nova estiver ocupada, a reserva original permanece intacta (mesmo comportamento do
// fluxograma: "não" não passa por "Libera mesa", só recusa).
@Injectable()
export class TransferirMesaReservaUseCase {
  constructor(
    @Inject(ReservaRepositoryPort)
    private readonly reservas: ReservaRepositoryPort,
    @Inject(MesaRepositoryPort) private readonly mesas: MesaRepositoryPort,
    @Inject(ConfiguracaoMesaEventoRepositoryPort)
    private readonly configuracoesMesa: ConfiguracaoMesaEventoRepositoryPort,
  ) {}

  async execute(id: string, novaMesaId: string): Promise<Reserva> {
    const reservaAtual = await this.reservas.buscarPorId(id);
    if (!reservaAtual) {
      throw new NotFoundException('Reserva não encontrada');
    }
    if (reservaAtual.status === StatusReserva.CANCELADA) {
      throw new BadRequestException(
        'Reserva cancelada não pode ser transferida',
      );
    }
    if (novaMesaId === reservaAtual.mesaId) {
      throw new BadRequestException('A nova mesa é igual à mesa atual');
    }

    const novaMesa = await this.mesas.buscarPorId(novaMesaId);
    if (!novaMesa) {
      throw new NotFoundException('Nova mesa não encontrada');
    }

    const configuracoes = await this.configuracoesMesa.listarPorEvento(
      reservaAtual.eventoId,
    );
    const configuracaoNovaMesa = configuracoes.find(
      (c) => c.mesaId === novaMesaId,
    );
    if (!configuracaoNovaMesa) {
      throw new BadRequestException(
        'Nova mesa não está configurada para este evento',
      );
    }
    if (configuracaoNovaMesa.bloqueada) {
      throw new BadRequestException(
        'Nova mesa está bloqueada para este evento',
      );
    }

    let novaReserva: Reserva;
    try {
      novaReserva = await this.reservas.salvar({
        eventoId: reservaAtual.eventoId,
        mesaId: novaMesaId,
        canal: reservaAtual.canal,
        formaPagamento: reservaAtual.formaPagamento,
        status: reservaAtual.status,
        pagamentoExternoId: reservaAtual.pagamentoExternoId,
        nomeTitular: reservaAtual.nomeTitular,
        associadoId: reservaAtual.associadoId,
      });
    } catch (erro) {
      if (erro instanceof MesaJaReservadaError) {
        throw new ConflictException('Nova mesa indisponível — recusada');
      }
      throw erro;
    }

    await this.reservas.atualizar(reservaAtual.id, {
      status: StatusReserva.CANCELADA,
    });
    return novaReserva;
  }
}
