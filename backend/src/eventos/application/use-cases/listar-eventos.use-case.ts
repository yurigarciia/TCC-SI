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
    busca?: string,
  ): Promise<PaginaResultado<Evento>> {
    const { itens, total } = await this.eventos.listarPaginado(
      pagina,
      limite,
      busca,
    );
    return montarPaginaResultado(itens, total, pagina, limite);
  }
}

// RF13 — só os eventos publicados são visíveis ao associado no app, e só os que ainda não
// ocorreram: o sistema não encerra evento automaticamente, mas a listagem de navegação/compra
// do associado não deve oferecer um evento cuja data já passou.
@Injectable()
export class ListarEventosPublicadosUseCase {
  constructor(
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
  ) {}

  async execute(): Promise<Evento[]> {
    const publicados = await this.eventos.listarPorStatus(
      StatusEvento.PUBLICADO,
    );
    const agora = Date.now();
    return publicados.filter((evento) => new Date(evento.data).getTime() >= agora);
  }
}
