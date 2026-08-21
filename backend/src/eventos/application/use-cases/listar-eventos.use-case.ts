import { Inject, Injectable } from '@nestjs/common';
import { EventoRepositoryPort } from '../ports/evento-repository.port';
import { Evento, StatusEvento } from '../../domain/evento.entity';

@Injectable()
export class ListarEventosUseCase {
  constructor(
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
  ) {}

  execute(): Promise<Evento[]> {
    return this.eventos.listarTodos();
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
