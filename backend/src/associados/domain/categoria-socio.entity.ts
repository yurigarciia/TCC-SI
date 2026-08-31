export class CategoriaSocio {
  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly valorMensalidade: number,
    public readonly ativa: boolean,
    // Categoria isenta (ex.: benemérito, honorário) — associados nela nunca têm mensalidade
    // gerada (ver GerarCobrancasMensaisUseCase), valorMensalidade fica sempre 0 nesse caso.
    public readonly isenta: boolean,
  ) {}
}
