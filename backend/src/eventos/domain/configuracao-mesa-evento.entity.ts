export class ConfiguracaoMesaEvento {
  constructor(
    public readonly id: string,
    public readonly eventoId: string,
    public readonly mesaId: string,
    public readonly preco: number,
    public readonly bloqueada: boolean,
  ) {}
}
