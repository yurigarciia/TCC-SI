import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ReservaRepositoryPort } from '../ports/reserva-repository.port';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { EventoRepositoryPort } from '../../../eventos/application/ports/evento-repository.port';
import { MesaRepositoryPort } from '../../../eventos/application/ports/mesa-repository.port';
import {
  CanalReserva,
  FormaPagamentoReserva,
  StatusReserva,
} from '../../domain/reserva.entity';

export interface ReservaDoAssociado {
  id: string;
  status: StatusReserva;
  canal: CanalReserva;
  formaPagamento: FormaPagamentoReserva;
  nomeTitular: string | null;
  evento: { id: string; nome: string; data: string; local: string } | null;
  mesa: { id: string; numero: number } | null;
}

// RF13 — "Associado consultar suas reservas pelo aplicativo mobile". Resolve o Associado a partir
// do Usuario autenticado (mesmo caminho de /associados/me) e lista as reservas vinculadas a ele.
// Só funciona para reservas que tinham um associadoId informado no momento da criação (a
// diretoria pode continuar registrando reservas sem vínculo, para visitantes ou quando o
// associado ainda não tem conta — ver AutoCadastrarAssociadoUseCase).
//
// Enriquecida com nome do evento e número da mesa (T-MOB-003) — a Reserva "crua" só tem
// eventoId/mesaId, inútil pra exibir numa lista pro associado (DESIGN-SYSTEM.md §6: nunca
// jargão técnico, e um UUID solto é pior que jargão). `evento`/`mesa` vêm `null` só no caso
// (não esperado em uso normal) de a mesa/evento ter sido removido depois da reserva — não há
// hoje endpoint de exclusão de evento/mesa, então isso não deve acontecer na prática.
@Injectable()
export class ListarMinhasReservasUseCase {
  constructor(
    @Inject(ReservaRepositoryPort)
    private readonly reservas: ReservaRepositoryPort,
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(MesaRepositoryPort)
    private readonly mesas: MesaRepositoryPort,
  ) {}

  async execute(usuarioId: string): Promise<ReservaDoAssociado[]> {
    const associado = await this.associados.buscarPorUsuarioId(usuarioId);
    if (!associado) {
      throw new NotFoundException('Nenhum associado vinculado a este usuário');
    }

    const reservas = await this.reservas.listarPorAssociado(associado.id);

    return Promise.all(
      reservas.map(async (reserva) => {
        const [evento, mesa] = await Promise.all([
          this.eventos.buscarPorId(reserva.eventoId),
          this.mesas.buscarPorId(reserva.mesaId),
        ]);
        return {
          id: reserva.id,
          status: reserva.status,
          canal: reserva.canal,
          formaPagamento: reserva.formaPagamento,
          nomeTitular: reserva.nomeTitular,
          evento: evento
            ? {
                id: evento.id,
                nome: evento.nome,
                data: evento.data,
                local: evento.local,
              }
            : null,
          mesa: mesa ? { id: mesa.id, numero: mesa.numero } : null,
        };
      }),
    );
  }
}
