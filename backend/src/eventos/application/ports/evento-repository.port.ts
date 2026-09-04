import { Evento, StatusEvento } from '../../domain/evento.entity';

export interface NovoEvento {
  nome: string;
  data: string;
  local: string;
  descricao: string | null;
  salaoId: string | null;
  status: StatusEvento;
}

export interface AtualizacaoEvento {
  nome?: string;
  data?: string;
  local?: string;
  descricao?: string | null;
  salaoId?: string | null;
}

export abstract class EventoRepositoryPort {
  abstract salvar(dados: NovoEvento): Promise<Evento>;
  abstract buscarPorId(id: string): Promise<Evento | null>;
  abstract atualizar(id: string, dados: AtualizacaoEvento): Promise<Evento>;
  abstract listarPaginado(
    pagina: number,
    limite: number,
    busca?: string,
  ): Promise<{ itens: Evento[]; total: number }>;
  // Sem paginação de propósito — usado só pela vitrine pública de eventos publicados
  // (GET /eventos/publicados, consumido pelo app do associado).
  abstract listarPorStatus(status: StatusEvento): Promise<Evento[]>;
  abstract atualizarStatus(id: string, status: StatusEvento): Promise<Evento>;
}
