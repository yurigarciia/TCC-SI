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
  abstract listarPaginado(
    pagina: number,
    limite: number,
  ): Promise<{ itens: Evento[]; total: number }>;
  // Sem paginação de propósito — usado só pela vitrine pública de eventos publicados
  // (GET /eventos/publicados, consumido pelo app do associado).
  abstract listarPorStatus(status: StatusEvento): Promise<Evento[]>;
  abstract atualizarStatus(id: string, status: StatusEvento): Promise<Evento>;
}
