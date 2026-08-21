import { PerfilComprador } from './ingresso.entity';

// eventoId null = preço padrão da entidade; eventoId preenchido = override daquele evento
// específico (mesmo padrão de override já usado em preço de mesa, ver evento.json).
export class PrecoIngresso {
  constructor(
    public readonly id: string,
    public readonly eventoId: string | null,
    public readonly perfil: PerfilComprador,
    public readonly preco: number,
  ) {}
}
