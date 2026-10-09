export enum FormatoMesa {
  REDONDA = 'redonda',
  RETANGULAR = 'retangular',
}

export class Mesa {
  constructor(
    public readonly id: string,
    public readonly salaoId: string,
    public readonly numero: number,
    public readonly capacidade: number,
    public readonly posicaoX: number,
    public readonly posicaoY: number,
    public readonly formato: FormatoMesa,
  ) {}
}
