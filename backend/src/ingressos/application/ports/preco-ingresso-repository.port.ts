import { PerfilComprador } from '../../domain/ingresso.entity';
import { PrecoIngresso } from '../../domain/preco-ingresso.entity';

export abstract class PrecoIngressoRepositoryPort {
  // categoriaSocioId obrigatório quando perfil = SOCIO (validado no use case, não aqui — a porta
  // só guarda o que recebe); sempre null pra NAO_SOCIO/CRIANCA.
  abstract definirPadrao(
    perfil: PerfilComprador,
    preco: number,
    categoriaSocioId: string | null,
  ): Promise<PrecoIngresso>;
  abstract definirPorEvento(
    eventoId: string,
    perfil: PerfilComprador,
    preco: number,
    categoriaSocioId: string | null,
  ): Promise<PrecoIngresso>;
  // Resolve o preço efetivo: override do evento se existir, senão o padrão da entidade, senão null.
  abstract resolverPreco(
    eventoId: string,
    perfil: PerfilComprador,
    categoriaSocioId: string | null,
  ): Promise<number | null>;
}
