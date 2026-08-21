export type StatusMensalidade = "pendente" | "paga" | "inadimplente";
export type FormaPagamento = "online" | "presencial";

export interface Mensalidade {
  id: string;
  associadoId: string;
  competencia: string;
  valor: number;
  vencimento: string;
  status: StatusMensalidade;
  formaPagamento: FormaPagamento | null;
  pagoEm: string | null;
  pagamentoExternoId: string | null;
  lembreteEnviadoEm: string | null;
}

export interface ItemInadimplencia {
  mensalidade: Mensalidade;
  associadoNome: string;
  diasEmAtraso: number;
}
