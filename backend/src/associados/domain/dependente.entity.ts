export class Dependente {
  constructor(
    public readonly id: string,
    public readonly associadoId: string,
    public readonly nome: string,
    public readonly dataNascimento: string,
  ) {}
}
