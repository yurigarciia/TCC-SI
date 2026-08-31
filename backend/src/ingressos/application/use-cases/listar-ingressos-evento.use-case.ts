import { Inject, Injectable } from '@nestjs/common';
import { IngressoRepositoryPort } from '../ports/ingresso-repository.port';
import { Ingresso } from '../../domain/ingresso.entity';
import {
  montarPaginaResultado,
  PaginaResultado,
} from '../../../shared/pagination/pagina-resultado';

@Injectable()
export class ListarIngressosEventoUseCase {
  constructor(
    @Inject(IngressoRepositoryPort)
    private readonly ingressos: IngressoRepositoryPort,
  ) {}

  async execute(
    eventoId: string,
    pagina: number,
    limite: number,
    nome?: string,
  ): Promise<PaginaResultado<Ingresso>> {
    const { itens, total } = await this.ingressos.listarPaginadoPorEvento(
      eventoId,
      pagina,
      limite,
      nome,
    );
    return montarPaginaResultado(itens, total, pagina, limite);
  }
}
