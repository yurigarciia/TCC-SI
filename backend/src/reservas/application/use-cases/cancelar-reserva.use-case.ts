import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservaRepositoryPort } from '../ports/reserva-repository.port';
import { Reserva, StatusReserva } from '../../domain/reserva.entity';

// RF15 (Could) — caminho básico de cancelamento já previsto em reserva-mesa.json: pedido chega
// por fora, diretoria confirma e a mesa é liberada (a constraint de unicidade só cobre
// pendente/confirmada, então uma reserva cancelada libera a mesa para nova reserva).
@Injectable()
export class CancelarReservaUseCase {
  constructor(
    @Inject(ReservaRepositoryPort)
    private readonly reservas: ReservaRepositoryPort,
  ) {}

  async execute(id: string): Promise<Reserva> {
    const reserva = await this.reservas.buscarPorId(id);
    if (!reserva) {
      throw new NotFoundException('Reserva não encontrada');
    }
    if (reserva.status === StatusReserva.CANCELADA) {
      throw new BadRequestException('Reserva já está cancelada');
    }
    return this.reservas.atualizar(id, { status: StatusReserva.CANCELADA });
  }
}
