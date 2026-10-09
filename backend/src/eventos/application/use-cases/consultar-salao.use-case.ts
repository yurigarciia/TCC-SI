import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SalaoRepositoryPort } from '../ports/salao-repository.port';
import { MesaRepositoryPort } from '../ports/mesa-repository.port';
import { ElementoEstruturalRepositoryPort } from '../ports/elemento-estrutural-repository.port';
import { AreaEstruturalRepositoryPort } from '../ports/area-estrutural-repository.port';
import { Salao } from '../../domain/salao.entity';
import { Mesa } from '../../domain/mesa.entity';
import { ElementoEstrutural } from '../../domain/elemento-estrutural.entity';
import { AreaEstrutural } from '../../domain/area-estrutural.entity';

export interface SalaoComMesas {
  salao: Salao;
  mesas: Mesa[];
  elementos: ElementoEstrutural[];
  areas: AreaEstrutural[];
}

@Injectable()
export class ConsultarSalaoUseCase {
  constructor(
    @Inject(SalaoRepositoryPort) private readonly saloes: SalaoRepositoryPort,
    @Inject(MesaRepositoryPort) private readonly mesas: MesaRepositoryPort,
    @Inject(ElementoEstruturalRepositoryPort)
    private readonly elementos: ElementoEstruturalRepositoryPort,
    @Inject(AreaEstruturalRepositoryPort)
    private readonly areas: AreaEstruturalRepositoryPort,
  ) {}

  async execute(id: string): Promise<SalaoComMesas> {
    const salao = await this.saloes.buscarPorId(id);
    if (!salao) {
      throw new NotFoundException('Salão não encontrado');
    }
    const [mesas, elementos, areas] = await Promise.all([
      this.mesas.listarPorSalao(id),
      this.elementos.listarPorSalao(id),
      this.areas.listarPorSalao(id),
    ]);
    return { salao, mesas, elementos, areas };
  }
}
