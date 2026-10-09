import { AreaEstrutural } from '../../domain/area-estrutural.entity';

export interface NovaAreaEstrutural {
  salaoId: string;
  nome: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export interface AtualizacaoAreaEstrutural {
  nome?: string;
  x?: number;
  y?: number;
  largura?: number;
  altura?: number;
}

export abstract class AreaEstruturalRepositoryPort {
  abstract salvar(dados: NovaAreaEstrutural): Promise<AreaEstrutural>;
  abstract buscarPorId(id: string): Promise<AreaEstrutural | null>;
  abstract listarPorSalao(salaoId: string): Promise<AreaEstrutural[]>;
  abstract atualizar(
    id: string,
    dados: AtualizacaoAreaEstrutural,
  ): Promise<AreaEstrutural>;
  abstract remover(id: string): Promise<void>;
}
