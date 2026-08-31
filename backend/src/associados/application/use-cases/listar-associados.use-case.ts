import { Inject, Injectable } from '@nestjs/common';
import { AssociadoRepositoryPort } from '../ports/associado-repository.port';
import { Associado } from '../../domain/associado.entity';
import {
  montarPaginaResultado,
  PaginaResultado,
} from '../../../shared/pagination/pagina-resultado';

@Injectable()
export class ListarAssociadosUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
  ) {}

  async execute(
    pagina: number,
    limite: number,
  ): Promise<PaginaResultado<Associado>> {
    const { itens, total } = await this.associados.listarPaginado(
      pagina,
      limite,
    );
    return montarPaginaResultado(itens, total, pagina, limite);
  }
}
