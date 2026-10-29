import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ReservaRepositoryPort } from '../ports/reserva-repository.port';
import { EventoRepositoryPort } from '../../../eventos/application/ports/evento-repository.port';
import { MesaRepositoryPort } from '../../../eventos/application/ports/mesa-repository.port';
import { ConfiguracaoMesaEventoRepositoryPort } from '../../../eventos/application/ports/configuracao-mesa-evento-repository.port';
import { ElementoEstruturalRepositoryPort } from '../../../eventos/application/ports/elemento-estrutural-repository.port';
import { AreaEstruturalRepositoryPort } from '../../../eventos/application/ports/area-estrutural-repository.port';
import { CanalReserva, StatusReserva } from '../../domain/reserva.entity';
import { FormatoMesa } from '../../../eventos/domain/mesa.entity';
import { ElementoEstrutural } from '../../../eventos/domain/elemento-estrutural.entity';
import { AreaEstrutural } from '../../../eventos/domain/area-estrutural.entity';

export type StatusMesaNoMapa = 'bloqueada' | 'pendente' | 'reservada' | 'livre';

export interface MesaNoMapa {
  mesaId: string;
  numero: number;
  capacidade: number;
  posicaoX: number;
  posicaoY: number;
  formato: FormatoMesa;
  preco: number;
  status: StatusMesaNoMapa;
  // Presentes só quando status é "pendente"/"reservada" — a diretoria precisa do id da reserva
  // para acionar confirmar/cancelar/transferir direto a partir do mapa (T-FE-007).
  reservaId: string | null;
  nomeTitular: string | null;
  canal: CanalReserva | null;
}

// Mesmas paredes/portas/áreas desenhadas no editor de croqui do salão (ver MesaCanvas,
// frontend-web/src/features/saloes) — devolvidas junto do mapa de mesas pra que o mapa de
// reservas (admin e app do associado, já que o endpoint é compartilhado) deixe de mostrar as
// mesas soltas num plano em branco e passe a reconhecer o salão de verdade, igual ao editor.
export interface MapaMesasEvento {
  mesas: MesaNoMapa[];
  elementos: ElementoEstrutural[];
  areas: AreaEstrutural[];
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
    @Inject(ElementoEstruturalRepositoryPort)
    private readonly elementos: ElementoEstruturalRepositoryPort,
    @Inject(AreaEstruturalRepositoryPort)
    private readonly areas: AreaEstruturalRepositoryPort,
    @Inject(ReservaRepositoryPort)
    private readonly reservas: ReservaRepositoryPort,
  ) {}

  async execute(eventoId: string): Promise<MapaMesasEvento> {
    const evento = await this.eventos.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }
    if (!evento.salaoId) {
      return { mesas: [], elementos: [], areas: [] };
    }

    const [
      todasMesasDoSalao,
      configuracoes,
      reservasAtivas,
      elementosDoSalao,
      areasDoSalao,
    ] = await Promise.all([
      this.mesas.listarPorSalao(evento.salaoId),
      this.configuracoesMesa.listarPorEvento(eventoId),
      this.reservas.listarAtivasPorEvento(eventoId),
      this.elementos.listarPorSalao(evento.salaoId),
      this.areas.listarPorSalao(evento.salaoId),
    ]);

    const configPorMesa = new Map(configuracoes.map((c) => [c.mesaId, c]));
    const reservaPorMesa = new Map(reservasAtivas.map((r) => [r.mesaId, r]));

    const mesas = todasMesasDoSalao
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
          formato: mesa.formato,
          preco: configuracao.preco,
          status,
          reservaId: reserva?.id ?? null,
          nomeTitular: reserva?.nomeTitular ?? null,
          canal: reserva?.canal ?? null,
        };
      });

    return { mesas, elementos: elementosDoSalao, areas: areasDoSalao };
  }
}
