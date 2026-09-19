export enum PerfilComprador {
  SOCIO = 'socio',
  NAO_SOCIO = 'nao_socio',
  CRIANCA = 'crianca',
}

export enum CanalIngresso {
  APP = 'app',
  MEDIADO = 'mediado',
}

export enum FormaPagamentoIngresso {
  ONLINE = 'online',
  PRESENCIAL = 'presencial',
}

export enum StatusIngresso {
  EMITIDO = 'emitido',
  USADO = 'usado',
}

export class Ingresso {
  constructor(
    public readonly id: string,
    public readonly eventoId: string,
    public readonly nomeComprador: string,
    public readonly associadoId: string | null,
    public readonly perfilComprador: PerfilComprador,
    public readonly preco: number,
    public readonly canal: CanalIngresso,
    public readonly formaPagamento: FormaPagamentoIngresso,
    public readonly pagamentoExternoId: string | null,
    public readonly status: StatusIngresso,
    public readonly usadoEm: Date | null,
  ) {}
}
