export class ConfiguracaoIngressoEvento {
  constructor(
    public readonly id: string,
    public readonly eventoId: string,
    public readonly quantidadeDisponivel: number,
    public readonly preco: number,
  ) {}
}
