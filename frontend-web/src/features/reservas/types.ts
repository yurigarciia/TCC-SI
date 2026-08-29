export type StatusMesaNoMapa = "bloqueada" | "pendente" | "reservada" | "livre";

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
