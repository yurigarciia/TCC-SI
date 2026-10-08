export class Endereco {
  constructor(
    public readonly id: string,
    public readonly associadoId: string,
    public readonly cep: string,
    public readonly logradouro: string,
    public readonly numero: string,
    public readonly complemento: string | null,
    public readonly bairro: string,
    public readonly cidade: string,
    public readonly uf: string,
  ) {}
}
