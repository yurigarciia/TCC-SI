import { Inject, Injectable } from '@nestjs/common';
import { SalaoRepositoryPort } from '../ports/salao-repository.port';
import { Salao } from '../../domain/salao.entity';
import {
  montarPaginaResultado,
  PaginaResultado,
} from '../../../shared/pagination/pagina-resultado';

@Injectable()
export class ListarSaloesUseCase {
  constructor(
    @Inject(SalaoRepositoryPort) private readonly saloes: SalaoRepositoryPort,
  ) {}

  async execute(
    pagina: number,
    limite: number,
    busca?: string,
  ): Promise<PaginaResultado<Salao>> {
    const { itens, total } = await this.saloes.listarPaginado(
      pagina,
      limite,
      busca,
    );
    return montarPaginaResultado(itens, total, pagina, limite);
  }
}
