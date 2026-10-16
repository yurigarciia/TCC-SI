import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaSocioRepositoryPort } from '../ports/categoria-socio-repository.port';
import { CategoriaSocio } from '../../domain/categoria-socio.entity';

export interface DadosAtualizacaoCategoriaSocio {
  nome?: string;
  valorMensalidade?: number;
  isenta?: boolean;
}

@Injectable()
export class AtualizarCategoriaSocioUseCase {
  constructor(
    @Inject(CategoriaSocioRepositoryPort)
    private readonly categorias: CategoriaSocioRepositoryPort,
  ) {}

  async execute(
    id: string,
    dados: DadosAtualizacaoCategoriaSocio,
  ): Promise<CategoriaSocio> {
    const existente = await this.categorias.buscarPorId(id);
    if (!existente) {
      throw new NotFoundException('Categoria de sócio não encontrada');
    }
    return this.categorias.atualizar(id, dados);
  }
}
