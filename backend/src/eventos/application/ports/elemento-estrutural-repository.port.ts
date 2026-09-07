import {
  ElementoEstrutural,
  TipoElementoEstrutural,
} from '../../domain/elemento-estrutural.entity';

export interface NovoElementoEstrutural {
  salaoId: string;
  tipo: TipoElementoEstrutural;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export abstract class ElementoEstruturalRepositoryPort {
  abstract salvar(dados: NovoElementoEstrutural): Promise<ElementoEstrutural>;
  abstract buscarPorId(id: string): Promise<ElementoEstrutural | null>;
  abstract listarPorSalao(salaoId: string): Promise<ElementoEstrutural[]>;
  abstract remover(id: string): Promise<void>;
}
