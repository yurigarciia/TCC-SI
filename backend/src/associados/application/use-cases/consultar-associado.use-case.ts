import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AssociadoRepositoryPort } from '../ports/associado-repository.port';
import { DependenteRepositoryPort } from '../ports/dependente-repository.port';
import { EnderecoRepositoryPort } from '../ports/endereco-repository.port';
import { Associado } from '../../domain/associado.entity';
import { Dependente } from '../../domain/dependente.entity';
import { Endereco } from '../../domain/endereco.entity';

export interface AssociadoComDependentes {
  associado: Associado;
  dependentes: Dependente[];
  endereco: Endereco | null;
}

@Injectable()
export class ConsultarAssociadoUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(DependenteRepositoryPort)
    private readonly dependentes: DependenteRepositoryPort,
    @Inject(EnderecoRepositoryPort)
    private readonly enderecos: EnderecoRepositoryPort,
  ) {}

  async execute(id: string): Promise<AssociadoComDependentes> {
    const associado = await this.associados.buscarPorId(id);
    if (!associado) {
      throw new NotFoundException('Associado não encontrado');
    }
    const dependentes = await this.dependentes.listarPorAssociado(id);
    const endereco = await this.enderecos.buscarPorAssociadoId(id);
    return { associado, dependentes, endereco };
  }
}
