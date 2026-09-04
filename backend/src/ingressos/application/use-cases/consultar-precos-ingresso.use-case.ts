import { Inject, Injectable } from '@nestjs/common';
import { PrecoIngressoRepositoryPort } from '../ports/preco-ingresso-repository.port';
import { CategoriaSocioRepositoryPort } from '../../../associados/application/ports/categoria-socio-repository.port';
import { PerfilComprador } from '../../domain/ingresso.entity';

export interface PrecoPorCategoriaSocio {
  categoriaSocioId: string;
  categoriaNome: string;
  preco: number | null;
}

export interface PrecosIngressoConfigurados {
  porCategoria: PrecoPorCategoriaSocio[];
  naoSocio: number | null;
  crianca: number | null;
}

// Preço efetivo pra um evento (override do evento se existir, senão o padrão da entidade, senão
// null — mesma resolução usada de fato na emissão, ver EmitirIngressoUseCase). Sem use
// case/endpoint próprio até aqui — só existia o PUT pra definir, nunca um jeito de consultar o
// que já estava configurado (achado numa conversa com o usuário). Preço de sócio varia por
// categoria (achado numa conversa seguinte, depois do preço "sócio" único já estar no ar) — por
// isso resolve um preço por categoria de sócio cadastrada, em vez de um único valor "sócio".
@Injectable()
export class ConsultarPrecosIngressoUseCase {
  constructor(
    @Inject(PrecoIngressoRepositoryPort)
    private readonly precos: PrecoIngressoRepositoryPort,
    @Inject(CategoriaSocioRepositoryPort)
    private readonly categorias: CategoriaSocioRepositoryPort,
  ) {}

  async execute(eventoId: string): Promise<PrecosIngressoConfigurados> {
    // Limite alto o bastante pra cobrir todas as categorias cadastradas sem paginar aqui (número
    // de categorias tende a ser pequeno — mesmo raciocínio já usado nos dropdowns do frontend).
    const { itens: todasCategorias } = await this.categorias.listarPaginado(1, 100);

    const [porCategoria, naoSocio, crianca] = await Promise.all([
      Promise.all(
        todasCategorias.map(async (categoria) => ({
          categoriaSocioId: categoria.id,
          categoriaNome: categoria.nome,
          preco: await this.precos.resolverPreco(
            eventoId,
            PerfilComprador.SOCIO,
            categoria.id,
          ),
        })),
      ),
      this.precos.resolverPreco(eventoId, PerfilComprador.NAO_SOCIO, null),
      this.precos.resolverPreco(eventoId, PerfilComprador.CRIANCA, null),
    ]);

    return { porCategoria, naoSocio, crianca };
  }
}
