import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventoRepositoryPort } from '../ports/evento-repository.port';
import { ConfiguracaoMesaEventoRepositoryPort } from '../ports/configuracao-mesa-evento-repository.port';
import { ConfiguracaoIngressoEventoRepositoryPort } from '../ports/configuracao-ingresso-evento-repository.port';
import { Evento } from '../../domain/evento.entity';
import { ConfiguracaoMesaEvento } from '../../domain/configuracao-mesa-evento.entity';
import { ConfiguracaoIngressoEvento } from '../../domain/configuracao-ingresso-evento.entity';

export interface EventoDetalhado {
  evento: Evento;
  mesas: ConfiguracaoMesaEvento[];
  ingresso: ConfiguracaoIngressoEvento | null;
}

@Injectable()
export class ConsultarEventoUseCase {
  constructor(
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(ConfiguracaoMesaEventoRepositoryPort)
    private readonly configMesas: ConfiguracaoMesaEventoRepositoryPort,
    @Inject(ConfiguracaoIngressoEventoRepositoryPort)
    private readonly configIngresso: ConfiguracaoIngressoEventoRepositoryPort,
  ) {}

  async execute(id: string): Promise<EventoDetalhado> {
    const evento = await this.eventos.buscarPorId(id);
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }
    const mesas = await this.configMesas.listarPorEvento(id);
    const ingresso = await this.configIngresso.buscarPorEvento(id);
    return { evento, mesas, ingresso };
  }
}
