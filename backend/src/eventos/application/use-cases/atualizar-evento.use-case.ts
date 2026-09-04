import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AtualizacaoEvento,
  EventoRepositoryPort,
} from '../ports/evento-repository.port';
import { SalaoRepositoryPort } from '../ports/salao-repository.port';
import { Evento } from '../../domain/evento.entity';

// Dados básicos do evento (nome/data/local/descrição/salão) — status e configurações de
// mesas/ingresso têm seus próprios use cases (PublicarEventoUseCase, ConfigurarMesasEventoUseCase,
// ConfigurarIngressoEventoUseCase), esse aqui não mexe neles.
@Injectable()
export class AtualizarEventoUseCase {
  constructor(
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(SalaoRepositoryPort) private readonly saloes: SalaoRepositoryPort,
  ) {}

  async execute(id: string, dados: AtualizacaoEvento): Promise<Evento> {
    const existente = await this.eventos.buscarPorId(id);
    if (!existente) {
      throw new NotFoundException('Evento não encontrado');
    }
    if (dados.salaoId) {
      const salao = await this.saloes.buscarPorId(dados.salaoId);
      if (!salao) {
        throw new NotFoundException('Salão não encontrado');
      }
    }
    return this.eventos.atualizar(id, dados);
  }
}
