export class CategoriaSocio {
  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly valorMensalidade: number,
    public readonly ativa: boolean,
  ) {}
}
