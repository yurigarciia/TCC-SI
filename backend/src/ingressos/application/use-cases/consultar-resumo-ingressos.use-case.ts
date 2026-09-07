import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IngressoRepositoryPort,
  ResumoIngressosEvento,
} from '../ports/ingresso-repository.port';
import { EventoRepositoryPort } from '../../../eventos/application/ports/evento-repository.port';

// Achado numa conversa com o usuário: acompanhar um evento no dia (quantos ingressos foram
// emitidos, quantos já entraram) precisa de números que cubram o evento inteiro, não só a página
// atual da listagem — daí um endpoint de resumo à parte, agregado em SQL.
@Injectable()
export class ConsultarResumoIngressosUseCase {
  constructor(
    @Inject(IngressoRepositoryPort)
    private readonly ingressos: IngressoRepositoryPort,
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
  ) {}

  async execute(eventoId: string): Promise<ResumoIngressosEvento> {
    const evento = await this.eventos.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }
    return this.ingressos.resumoPorEvento(eventoId);
  }
}
