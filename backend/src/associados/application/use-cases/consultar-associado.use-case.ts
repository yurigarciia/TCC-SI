import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AssociadoRepositoryPort } from '../ports/associado-repository.port';
import { DependenteRepositoryPort } from '../ports/dependente-repository.port';
import { Associado } from '../../domain/associado.entity';
import { Dependente } from '../../domain/dependente.entity';

export interface AssociadoComDependentes {
  associado: Associado;
  dependentes: Dependente[];
}

@Injectable()
export class ConsultarAssociadoUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(DependenteRepositoryPort)
    private readonly dependentes: DependenteRepositoryPort,
  ) {}

  async execute(id: string): Promise<AssociadoComDependentes> {
    const associado = await this.associados.buscarPorId(id);
    if (!associado) {
      throw new NotFoundException('Associado não encontrado');
    }
    const dependentes = await this.dependentes.listarPorAssociado(id);
    return { associado, dependentes };
  }
}
