import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AreaEstruturalRepositoryPort } from '../ports/area-estrutural-repository.port';

@Injectable()
export class RemoverAreaEstruturalUseCase {
  constructor(
    @Inject(AreaEstruturalRepositoryPort)
    private readonly areas: AreaEstruturalRepositoryPort,
  ) {}

  async execute(salaoId: string, areaId: string): Promise<void> {
    const area = await this.areas.buscarPorId(areaId);
    if (!area || area.salaoId !== salaoId) {
      throw new NotFoundException('Área não encontrada');
    }
    await this.areas.remover(areaId);
  }
}
