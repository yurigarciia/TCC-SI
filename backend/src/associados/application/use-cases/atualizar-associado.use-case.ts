import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AssociadoRepositoryPort,
  AtualizacaoAssociado,
} from '../ports/associado-repository.port';
import {
  EnderecoRepositoryPort,
  NovoEndereco,
} from '../ports/endereco-repository.port';
import { Associado } from '../../domain/associado.entity';

export interface DadosAtualizacaoAssociado extends AtualizacaoAssociado {
  endereco?: Omit<NovoEndereco, 'associadoId'>;
}

@Injectable()
export class AtualizarAssociadoUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(EnderecoRepositoryPort)
    private readonly enderecos: EnderecoRepositoryPort,
  ) {}

  async execute(
    id: string,
    dados: DadosAtualizacaoAssociado,
  ): Promise<Associado> {
    const existente = await this.associados.buscarPorId(id);
    if (!existente) {
      throw new NotFoundException('Associado não encontrado');
    }
    const { endereco, ...dadosAssociado } = dados;
    const atualizado = await this.associados.atualizar(id, dadosAssociado);

    if (endereco) {
      await this.enderecos.salvarOuAtualizar({ associadoId: id, ...endereco });
    }

    return atualizado;
  }
}
