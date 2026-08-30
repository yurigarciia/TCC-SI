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

export type StatusMesaNoMapa = "livre" | "pendente" | "reservada" | "bloqueada";
export type CanalReserva = "app" | "mediado";
export type FormaPagamentoReserva = "online" | "presencial";

export interface MesaNoMapa {
  mesaId: string;
  numero: number;
  capacidade: number;
  posicaoX: number;
  posicaoY: number;
  preco: number;
  status: StatusMesaNoMapa;
  reservaId: string | null;
  nomeTitular: string | null;
  canal: CanalReserva | null;
}
