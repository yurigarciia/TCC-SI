export type StatusEvento = "rascunho" | "publicado";

export interface Evento {
  id: string;
  nome: string;
  data: string;
  local: string;
  descricao: string | null;
  salaoId: string | null;
  status: StatusEvento;
}

export interface ConfiguracaoMesaEvento {
  id: string;
  eventoId: string;
  mesaId: string;
  preco: number;
  bloqueada: boolean;
}

export interface ConfiguracaoIngressoEvento {
  id: string;
  eventoId: string;
  quantidadeDisponivel: number;
  preco: number;
}

export interface EventoDetalhado {
  evento: Evento;
  mesas: ConfiguracaoMesaEvento[];
  ingresso: ConfiguracaoIngressoEvento | null;
}

export interface NovoEventoInput {
  nome: string;
  data: string;
  local: string;
  descricao?: string;
  salaoId?: string;
}

export interface ConfiguracaoMesaInput {
  mesaId: string;
  preco: number;
  bloqueada: boolean;
}

export interface ConfigurarIngressoInput {
  quantidadeDisponivel: number;
  preco: number;
}
