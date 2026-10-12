import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { ReservaRepositoryPort } from '../ports/reserva-repository.port';
import { CancelarReservaUseCase } from './cancelar-reserva.use-case';
import { Reserva } from '../../domain/reserva.entity';

// Achado numa conversa com o usuário: RF15 (cancelar reserva) já existia no backend, mas só pra
// diretoria (ReservasController é admin por padrão) — o associado não tinha como desistir de
// uma mesa reservada pelo próprio app sem ligar pra diretoria. Mesmo padrão de
// SolicitarMinhaReservaUseCase (resolve o Associado a partir do Usuario autenticado), mas aqui
// também confere que a reserva é realmente dele antes de cancelar — nunca confia num id de
// reserva de terceiro vindo do cliente.
@Injectable()
export class CancelarMinhaReservaUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(ReservaRepositoryPort)
    private readonly reservas: ReservaRepositoryPort,
    private readonly cancelarReserva: CancelarReservaUseCase,
  ) {}

  async execute(usuarioId: string, reservaId: string): Promise<Reserva> {
    const associado = await this.associados.buscarPorUsuarioId(usuarioId);
    if (!associado) {
      throw new NotFoundException('Nenhum associado vinculado a este usuário');
    }

    const reserva = await this.reservas.buscarPorId(reservaId);
    if (!reserva) {
      throw new NotFoundException('Reserva não encontrada');
    }
    if (reserva.associadoId !== associado.id) {
      throw new ForbiddenException(
        'Esta reserva não pertence ao associado autenticado',
      );
    }

    return this.cancelarReserva.execute(reservaId);
  }
}
