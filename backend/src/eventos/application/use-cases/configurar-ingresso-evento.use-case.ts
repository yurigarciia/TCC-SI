import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventoRepositoryPort } from '../ports/evento-repository.port';
import { ConfiguracaoIngressoEventoRepositoryPort } from '../ports/configuracao-ingresso-evento-repository.port';
import { ConfiguracaoIngressoEvento } from '../../domain/configuracao-ingresso-evento.entity';

export interface DadosConfigurarIngresso {
  quantidadeDisponivel: number;
}

@Injectable()
export class ConfigurarIngressoEventoUseCase {
  constructor(
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(ConfiguracaoIngressoEventoRepositoryPort)
    private readonly configuracoes: ConfiguracaoIngressoEventoRepositoryPort,
  ) {}

  async execute(
    eventoId: string,
    dados: DadosConfigurarIngresso,
  ): Promise<ConfiguracaoIngressoEvento> {
    const evento = await this.eventos.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    return this.configuracoes.definirParaEvento({ eventoId, ...dados });
  }
}
