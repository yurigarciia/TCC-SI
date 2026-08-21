import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AssociadoRepositoryPort,
  AtualizacaoAssociado,
} from '../ports/associado-repository.port';
import { Associado } from '../../domain/associado.entity';

@Injectable()
export class AtualizarAssociadoUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
  ) {}

  async execute(id: string, dados: AtualizacaoAssociado): Promise<Associado> {
    const existente = await this.associados.buscarPorId(id);
    if (!existente) {
      throw new NotFoundException('Associado não encontrado');
    }
    return this.associados.atualizar(id, dados);
  }
}
