export enum StatusMensalidade {
  PENDENTE = 'pendente',
  PAGA = 'paga',
  INADIMPLENTE = 'inadimplente',
}

export enum FormaPagamento {
  ONLINE = 'online',
  PRESENCIAL = 'presencial',
}

export class Mensalidade {
  constructor(
    public readonly id: string,
    public readonly associadoId: string,
    public readonly competencia: string, // 'YYYY-MM'
    public readonly valor: number,
    public readonly vencimento: string, // 'YYYY-MM-DD'
    public readonly status: StatusMensalidade,
    public readonly formaPagamento: FormaPagamento | null,
    public readonly pagoEm: Date | null,
    public readonly pagamentoExternoId: string | null,
    public readonly lembreteEnviadoEm: Date | null,
  ) {}
}
