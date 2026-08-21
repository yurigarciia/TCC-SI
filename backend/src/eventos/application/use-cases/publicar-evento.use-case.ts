import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventoRepositoryPort } from '../ports/evento-repository.port';
import { Evento, StatusEvento } from '../../domain/evento.entity';

@Injectable()
export class PublicarEventoUseCase {
  constructor(
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
  ) {}

  async execute(id: string): Promise<Evento> {
    const evento = await this.eventos.buscarPorId(id);
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }
    if (evento.status === StatusEvento.PUBLICADO) {
      throw new BadRequestException('Evento já está publicado');
    }

    return this.eventos.atualizarStatus(id, StatusEvento.PUBLICADO);
  }
}
