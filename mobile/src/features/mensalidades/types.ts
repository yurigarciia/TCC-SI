export type StatusMensalidade = "pendente" | "paga" | "inadimplente";
export type FormaPagamento = "online" | "presencial";

export interface Mensalidade {
  id: string;
  associadoId: string;
  competencia: string; // "YYYY-MM"
  valor: number;
  vencimento: string; // "YYYY-MM-DD"
  status: StatusMensalidade;
  formaPagamento: FormaPagamento | null;
  pagoEm: string | null;
  pagamentoExternoId: string | null;
}
