import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrecoIngressoRepositoryPort } from '../ports/preco-ingresso-repository.port';
import { EventoRepositoryPort } from '../../../eventos/application/ports/evento-repository.port';
import { PerfilComprador } from '../../domain/ingresso.entity';
import { PrecoIngresso } from '../../domain/preco-ingresso.entity';

@Injectable()
export class DefinirPrecoPorEventoUseCase {
  constructor(
    @Inject(PrecoIngressoRepositoryPort)
    private readonly precos: PrecoIngressoRepositoryPort,
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
  ) {}

  async execute(
    eventoId: string,
    perfil: PerfilComprador,
    preco: number,
  ): Promise<PrecoIngresso> {
    const evento = await this.eventos.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }
    return this.precos.definirPorEvento(eventoId, perfil, preco);
  }
}
