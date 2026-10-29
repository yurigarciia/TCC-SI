export type StatusMesaNoMapa = "bloqueada" | "pendente" | "reservada" | "livre";

export type CanalReserva = "app" | "mediado";
export type FormaPagamentoReserva = "online" | "presencial";
export type FormatoMesaNoMapa = "redonda" | "retangular";

export interface MesaNoMapa {
  mesaId: string;
  numero: number;
  capacidade: number;
  posicaoX: number;
  posicaoY: number;
  formato: FormatoMesaNoMapa;
  preco: number;
  status: StatusMesaNoMapa;
  reservaId: string | null;
  nomeTitular: string | null;
  canal: CanalReserva | null;
}

export type TipoElementoEstruturalNoMapa = "parede" | "porta";

export interface ElementoEstruturalNoMapa {
  id: string;
  tipo: TipoElementoEstruturalNoMapa;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface AreaEstruturalNoMapa {
  id: string;
  nome: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export interface MapaMesasEvento {
  mesas: MesaNoMapa[];
  elementos: ElementoEstruturalNoMapa[];
  areas: AreaEstruturalNoMapa[];
}

export interface Reserva {
  id: string;
  eventoId: string;
  mesaId: string;
  canal: CanalReserva;
  formaPagamento: FormaPagamentoReserva;
  status: "pendente" | "confirmada" | "cancelada";
  pagamentoExternoId: string | null;
  nomeTitular: string | null;
  associadoId: string | null;
}

export interface SolicitarReservaInput {
  formaPagamento: FormaPagamentoReserva;
  nomeTitular: string;
}
