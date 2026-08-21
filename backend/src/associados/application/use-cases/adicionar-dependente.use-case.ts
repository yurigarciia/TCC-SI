import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AssociadoRepositoryPort } from '../ports/associado-repository.port';
import { DependenteRepositoryPort } from '../ports/dependente-repository.port';
import { Dependente } from '../../domain/dependente.entity';

export interface DadosNovoDependente {
  nome: string;
  dataNascimento: string;
}

@Injectable()
export class AdicionarDependenteUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(DependenteRepositoryPort)
    private readonly dependentes: DependenteRepositoryPort,
  ) {}

  async execute(
    associadoId: string,
    dados: DadosNovoDependente,
  ): Promise<Dependente> {
    const associado = await this.associados.buscarPorId(associadoId);
    if (!associado) {
      throw new NotFoundException('Associado não encontrado');
    }
    return this.dependentes.salvar({
      associadoId,
      nome: dados.nome,
      dataNascimento: dados.dataNascimento,
    });
  }
}
