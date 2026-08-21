export enum StatusEvento {
  RASCUNHO = 'rascunho',
  PUBLICADO = 'publicado',
}

export class Evento {
  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly data: string, // ISO datetime
    public readonly local: string,
    public readonly descricao: string | null,
    public readonly salaoId: string | null,
    public readonly status: StatusEvento,
  ) {}
}
