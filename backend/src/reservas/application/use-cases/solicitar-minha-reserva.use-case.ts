import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { EventoRepositoryPort } from '../../../eventos/application/ports/evento-repository.port';
import { SolicitarReservaUseCase } from './solicitar-reserva.use-case';
import {
  CanalReserva,
  FormaPagamentoReserva,
  Reserva,
} from '../../domain/reserva.entity';

// reserva-mesa.json: "dois canais de entrada convivem — diretoria lança reserva direto OU
// associado solicita pelo app". Diferente de SolicitarReservaUseCase (usado pela diretoria, que
// pode informar canal/titular/associadoId livremente), aqui o associado só escolhe a forma de
// pagamento — canal, titular e associadoId são sempre resolvidos/forçados a partir do próprio
// usuário autenticado, pra evitar que um associado reserve em nome de outro ou marque a reserva
// como já mediada pela diretoria.
@Injectable()
export class SolicitarMinhaReservaUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    private readonly solicitarReserva: SolicitarReservaUseCase,
  ) {}

  async execute(
    usuarioId: string,
    eventoId: string,
    mesaId: string,
    formaPagamento: FormaPagamentoReserva,
  ): Promise<Reserva> {
    const associado = await this.associados.buscarPorUsuarioId(usuarioId);
    if (!associado) {
      throw new NotFoundException('Nenhum associado vinculado a este usuário');
    }
    const evento = await this.eventos.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }
    if (new Date(evento.data).getTime() < Date.now()) {
      throw new BadRequestException(
        'Este evento já ocorreu e não aceita mais reserva de mesa',
      );
    }
    return this.solicitarReserva.execute(eventoId, mesaId, {
      canal: CanalReserva.APP,
      formaPagamento,
      nomeTitular: associado.nome,
      associadoId: associado.id,
    });
  }
}
