import { Evento, StatusEvento } from '../../domain/evento.entity';

export interface NovoEvento {
  nome: string;
  data: string;
  local: string;
  descricao: string | null;
  salaoId: string | null;
  status: StatusEvento;
}

export abstract class EventoRepositoryPort {
  abstract salvar(dados: NovoEvento): Promise<Evento>;
  abstract buscarPorId(id: string): Promise<Evento | null>;
  abstract listarTodos(): Promise<Evento[]>;
  abstract listarPorStatus(status: StatusEvento): Promise<Evento[]>;
  abstract atualizarStatus(id: string, status: StatusEvento): Promise<Evento>;
}
