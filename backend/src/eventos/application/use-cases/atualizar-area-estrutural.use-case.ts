import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AreaEstruturalRepositoryPort } from '../ports/area-estrutural-repository.port';
import { AreaEstrutural } from '../../domain/area-estrutural.entity';

export interface DadosAtualizarAreaEstrutural {
  nome?: string;
  x?: number;
  y?: number;
  largura?: number;
  altura?: number;
}

// Separado de AdicionarAreaEstruturalUseCase pra cobrir tanto arrastar a área pro croqui (só
// x/y) quanto redimensionar ou renomear ela depois de criada.
@Injectable()
export class AtualizarAreaEstruturalUseCase {
  constructor(
    @Inject(AreaEstruturalRepositoryPort)
    private readonly areas: AreaEstruturalRepositoryPort,
  ) {}

  async execute(
    salaoId: string,
    areaId: string,
    dados: DadosAtualizarAreaEstrutural,
  ): Promise<AreaEstrutural> {
    const area = await this.areas.buscarPorId(areaId);
    if (!area || area.salaoId !== salaoId) {
      throw new NotFoundException('Área não encontrada');
    }

    return this.areas.atualizar(areaId, dados);
  }
}
