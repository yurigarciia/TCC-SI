import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DependenteRepositoryPort } from '../ports/dependente-repository.port';
import { Dependente } from '../../domain/dependente.entity';

export interface DadosAtualizacaoDependente {
  nome?: string;
  dataNascimento?: string;
}

@Injectable()
export class AtualizarDependenteUseCase {
  constructor(
    @Inject(DependenteRepositoryPort)
    private readonly dependentes: DependenteRepositoryPort,
  ) {}

  async execute(
    associadoId: string,
    dependenteId: string,
    dados: DadosAtualizacaoDependente,
  ): Promise<Dependente> {
    const existente = await this.dependentes.buscarPorId(dependenteId);
    if (!existente || existente.associadoId !== associadoId) {
      throw new NotFoundException(
        'Dependente não encontrado para este associado',
      );
    }
    return this.dependentes.atualizar(dependenteId, dados);
  }
}
