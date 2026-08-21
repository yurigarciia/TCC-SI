import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ReservaRepositoryPort } from '../ports/reserva-repository.port';
import { EventoRepositoryPort } from '../../../eventos/application/ports/evento-repository.port';
import { MesaRepositoryPort } from '../../../eventos/application/ports/mesa-repository.port';
import { ConfiguracaoMesaEventoRepositoryPort } from '../../../eventos/application/ports/configuracao-mesa-evento-repository.port';
import { StatusReserva } from '../../domain/reserva.entity';

export type StatusMesaNoMapa = 'bloqueada' | 'pendente' | 'reservada' | 'livre';

export interface MesaNoMapa {
  mesaId: string;
  numero: number;
  capacidade: number;
  posicaoX: number;
  posicaoY: number;
  preco: number;
  status: StatusMesaNoMapa;
}

// RF14 — disponibilidade em tempo real: reflete direto o estado atual do banco (sem cache), já
// que reserva-mesa.json exige que o mapa mostre "quais mesas já estão reservadas" no momento em
// que o associado/diretoria consulta.
@Injectable()
export class ConsultarMapaMesasUseCase {
  constructor(
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(MesaRepositoryPort) private readonly mesas: MesaRepositoryPort,
    @Inject(ConfiguracaoMesaEventoRepositoryPort)
    private readonly configuracoesMesa: ConfiguracaoMesaEventoRepositoryPort,
    @Inject(ReservaRepositoryPort)
    private readonly reservas: ReservaRepositoryPort,
  ) {}

  async execute(eventoId: string): Promise<MesaNoMapa[]> {
    const evento = await this.eventos.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }
    if (!evento.salaoId) {
      return [];
    }

    const [todasMesasDoSalao, configuracoes, reservasAtivas] =
      await Promise.all([
        this.mesas.listarPorSalao(evento.salaoId),
        this.configuracoesMesa.listarPorEvento(eventoId),
        this.reservas.listarAtivasPorEvento(eventoId),
      ]);

    const configPorMesa = new Map(configuracoes.map((c) => [c.mesaId, c]));
    const reservaPorMesa = new Map(reservasAtivas.map((r) => [r.mesaId, r]));

    return todasMesasDoSalao
      .filter((mesa) => configPorMesa.has(mesa.id))
      .map((mesa) => {
        const configuracao = configPorMesa.get(mesa.id)!;
        const reserva = reservaPorMesa.get(mesa.id);

        let status: StatusMesaNoMapa = 'livre';
        if (configuracao.bloqueada) {
          status = 'bloqueada';
        } else if (reserva?.status === StatusReserva.PENDENTE) {
          status = 'pendente';
        } else if (reserva?.status === StatusReserva.CONFIRMADA) {
          status = 'reservada';
        }

        return {
          mesaId: mesa.id,
          numero: mesa.numero,
          capacidade: mesa.capacidade,
          posicaoX: mesa.posicaoX,
          posicaoY: mesa.posicaoY,
          preco: configuracao.preco,
          status,
        };
      });
  }
}
