export enum CanalReserva {
  APP = 'app',
  MEDIADO = 'mediado',
}

export enum FormaPagamentoReserva {
  ONLINE = 'online',
  PRESENCIAL = 'presencial',
}

export enum StatusReserva {
  PENDENTE = 'pendente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
}

export class Reserva {
  constructor(
    public readonly id: string,
    public readonly eventoId: string,
    public readonly mesaId: string,
    public readonly canal: CanalReserva,
    public readonly formaPagamento: FormaPagamentoReserva,
    public readonly status: StatusReserva,
    public readonly pagamentoExternoId: string | null,
    public readonly nomeTitular: string | null,
    public readonly associadoId: string | null,
  ) {}
}
