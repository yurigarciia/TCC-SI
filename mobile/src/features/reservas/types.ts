export type StatusReserva = "pendente" | "confirmada" | "cancelada";
export type CanalReserva = "app" | "mediado";
export type FormaPagamentoReserva = "online" | "presencial";

export interface ReservaDoAssociado {
  id: string;
  status: StatusReserva;
  canal: CanalReserva;
  formaPagamento: FormaPagamentoReserva;
  nomeTitular: string | null;
  evento: { id: string; nome: string; data: string; local: string } | null;
  mesa: { id: string; numero: number } | null;
}
