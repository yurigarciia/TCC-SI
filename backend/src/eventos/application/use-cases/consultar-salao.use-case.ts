import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SalaoRepositoryPort } from '../ports/salao-repository.port';
import { MesaRepositoryPort } from '../ports/mesa-repository.port';
import { Salao } from '../../domain/salao.entity';
import { Mesa } from '../../domain/mesa.entity';

export interface SalaoComMesas {
  salao: Salao;
  mesas: Mesa[];
}

@Injectable()
export class ConsultarSalaoUseCase {
  constructor(
    @Inject(SalaoRepositoryPort) private readonly saloes: SalaoRepositoryPort,
    @Inject(MesaRepositoryPort) private readonly mesas: MesaRepositoryPort,
  ) {}

  async execute(id: string): Promise<SalaoComMesas> {
    const salao = await this.saloes.buscarPorId(id);
    if (!salao) {
      throw new NotFoundException('Salão não encontrado');
    }
    const mesas = await this.mesas.listarPorSalao(id);
    return { salao, mesas };
  }
}
