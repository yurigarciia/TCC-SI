import { PerfilComprador } from './ingresso.entity';

// eventoId null = preço padrão da entidade; eventoId preenchido = override daquele evento
// específico (mesmo padrão de override já usado em preço de mesa, ver evento.json).
// categoriaSocioId: obrigatório quando perfil = SOCIO (preço varia por categoria de sócio —
// Contribuinte, Benemérito etc. —, achado numa conversa com o usuário depois do preço "sócio"
// único ter sido implementado primeiro); sempre null pra NAO_SOCIO/CRIANCA, que continuam com um
// preço só (não têm categoria — não são sócios).
export class PrecoIngresso {
  constructor(
    public readonly id: string,
    public readonly eventoId: string | null,
    public readonly perfil: PerfilComprador,
    public readonly categoriaSocioId: string | null,
    public readonly preco: number,
  ) {}
}
