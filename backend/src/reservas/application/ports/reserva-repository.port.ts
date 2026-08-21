import {
  CanalReserva,
  FormaPagamentoReserva,
  Reserva,
  StatusReserva,
} from '../../domain/reserva.entity';

export interface NovaReserva {
  eventoId: string;
  mesaId: string;
  canal: CanalReserva;
  formaPagamento: FormaPagamentoReserva;
  status: StatusReserva;
  pagamentoExternoId: string | null;
  nomeTitular: string | null;
  associadoId: string | null;
}

export interface AtualizacaoReserva {
  status?: StatusReserva;
  pagamentoExternoId?: string | null;
  nomeTitular?: string | null;
}

// Lançada pelo adapter quando a constraint de unicidade (uma reserva ativa por evento+mesa) é
// violada — é a materialização em banco do nó "Mesa ainda disponível?" de reserva-mesa.json,
// segura mesmo sob concorrência real (duas requisições simultâneas), diferente de um simples
// check-then-insert em memória.
export class MesaJaReservadaError extends Error {}

export abstract class ReservaRepositoryPort {
  abstract salvar(dados: NovaReserva): Promise<Reserva>;
  abstract buscarPorId(id: string): Promise<Reserva | null>;
  abstract listarAtivasPorEvento(eventoId: string): Promise<Reserva[]>;
  abstract listarPorAssociado(associadoId: string): Promise<Reserva[]>;
  abstract atualizar(id: string, dados: AtualizacaoReserva): Promise<Reserva>;
}
