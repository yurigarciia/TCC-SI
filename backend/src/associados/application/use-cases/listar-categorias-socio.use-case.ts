import { Inject, Injectable } from '@nestjs/common';
import { CategoriaSocioRepositoryPort } from '../ports/categoria-socio-repository.port';
import { CategoriaSocio } from '../../domain/categoria-socio.entity';
import {
  montarPaginaResultado,
  PaginaResultado,
} from '../../../shared/pagination/pagina-resultado';

@Injectable()
export class ListarCategoriasSocioUseCase {
  constructor(
    @Inject(CategoriaSocioRepositoryPort)
    private readonly categorias: CategoriaSocioRepositoryPort,
  ) {}

  async execute(
    pagina: number,
    limite: number,
  ): Promise<PaginaResultado<CategoriaSocio>> {
    const { itens, total } = await this.categorias.listarPaginado(
      pagina,
      limite,
    );
    return montarPaginaResultado(itens, total, pagina, limite);
  }
}
