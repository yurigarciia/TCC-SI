import { PerfilComprador } from '../../domain/ingresso.entity';
import { PrecoIngresso } from '../../domain/preco-ingresso.entity';

export abstract class PrecoIngressoRepositoryPort {
  abstract definirPadrao(
    perfil: PerfilComprador,
    preco: number,
  ): Promise<PrecoIngresso>;
  abstract definirPorEvento(
    eventoId: string,
    perfil: PerfilComprador,
    preco: number,
  ): Promise<PrecoIngresso>;
  // Resolve o preço efetivo: override do evento se existir, senão o padrão da entidade, senão null.
  abstract resolverPreco(
    eventoId: string,
    perfil: PerfilComprador,
  ): Promise<number | null>;
}
