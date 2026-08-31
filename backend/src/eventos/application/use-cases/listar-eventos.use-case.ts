import { Inject, Injectable } from '@nestjs/common';
import { EventoRepositoryPort } from '../ports/evento-repository.port';
import { Evento, StatusEvento } from '../../domain/evento.entity';
import {
  montarPaginaResultado,
  PaginaResultado,
} from '../../../shared/pagination/pagina-resultado';

@Injectable()
export class ListarEventosUseCase {
  constructor(
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
  ) {}

  async execute(
    pagina: number,
    limite: number,
  ): Promise<PaginaResultado<Evento>> {
    const { itens, total } = await this.eventos.listarPaginado(
      pagina,
      limite,
    );
    return montarPaginaResultado(itens, total, pagina, limite);
  }
}

// RF13 — só os eventos publicados são visíveis ao associado no app.
@Injectable()
export class ListarEventosPublicadosUseCase {
  constructor(
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
  ) {}

  execute(): Promise<Evento[]> {
    return this.eventos.listarPorStatus(StatusEvento.PUBLICADO);
  }
}
