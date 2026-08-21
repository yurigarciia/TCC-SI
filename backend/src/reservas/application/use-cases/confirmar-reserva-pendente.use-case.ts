import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservaRepositoryPort } from '../ports/reserva-repository.port';
import { Reserva, StatusReserva } from '../../domain/reserva.entity';

// d-confirm em reserva-mesa.json: diretoria confirma o recebimento do pagamento presencial de
// uma solicitação feita pelo app. Não precisa repetir a checagem de disponibilidade — a própria
// existência da reserva pendente já garante exclusividade (ver comentário em
// ReservaRepositoryPort/MesaJaReservadaError).
@Injectable()
export class ConfirmarReservaPendenteUseCase {
  constructor(
    @Inject(ReservaRepositoryPort)
    private readonly reservas: ReservaRepositoryPort,
  ) {}

  async execute(id: string): Promise<Reserva> {
    const reserva = await this.reservas.buscarPorId(id);
    if (!reserva) {
      throw new NotFoundException('Reserva não encontrada');
    }
    if (reserva.status !== StatusReserva.PENDENTE) {
      throw new BadRequestException('Reserva não está pendente de confirmação');
    }
    return this.reservas.atualizar(id, { status: StatusReserva.CONFIRMADA });
  }
}
