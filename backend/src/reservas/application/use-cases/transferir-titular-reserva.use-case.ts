import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservaRepositoryPort } from '../ports/reserva-repository.port';
import { Reserva, StatusReserva } from '../../domain/reserva.entity';

// cancelamento-transferencia-reserva.json, ramo "trocar titular": mesma mesa, muda só quem é o
// titular. Mantido como texto livre (não associado cadastrado) — a mesma lacuna documentada em
// T-BE-003/T-BE-008 sobre não haver linkagem Usuario↔Associado ainda; pendência #10 de
// decisoes.md sobre se o novo titular precisa ser associado cadastrado segue em aberto.
@Injectable()
export class TransferirTitularReservaUseCase {
  constructor(
    @Inject(ReservaRepositoryPort)
    private readonly reservas: ReservaRepositoryPort,
  ) {}

  async execute(id: string, novoTitular: string): Promise<Reserva> {
    const reserva = await this.reservas.buscarPorId(id);
    if (!reserva) {
      throw new NotFoundException('Reserva não encontrada');
    }
    if (reserva.status === StatusReserva.CANCELADA) {
      throw new BadRequestException(
        'Reserva cancelada não pode ser transferida',
      );
    }
    return this.reservas.atualizar(id, { nomeTitular: novoTitular });
  }
}
