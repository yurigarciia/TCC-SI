import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SalaoRepositoryPort } from '../ports/salao-repository.port';
import { AreaEstruturalRepositoryPort } from '../ports/area-estrutural-repository.port';
import { AreaEstrutural } from '../../domain/area-estrutural.entity';

export interface DadosNovaAreaEstrutural {
  nome: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
}

@Injectable()
export class AdicionarAreaEstruturalUseCase {
  constructor(
    @Inject(SalaoRepositoryPort) private readonly saloes: SalaoRepositoryPort,
    @Inject(AreaEstruturalRepositoryPort)
    private readonly areas: AreaEstruturalRepositoryPort,
  ) {}

  async execute(
    salaoId: string,
    dados: DadosNovaAreaEstrutural,
  ): Promise<AreaEstrutural> {
    const salao = await this.saloes.buscarPorId(salaoId);
    if (!salao) {
      throw new NotFoundException('Salão não encontrado');
    }

    return this.areas.salvar({ salaoId, ...dados });
  }
}
