import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventoRepositoryPort } from '../ports/evento-repository.port';
import { MesaRepositoryPort } from '../ports/mesa-repository.port';
import { ConfiguracaoMesaEventoRepositoryPort } from '../ports/configuracao-mesa-evento-repository.port';
import { ConfiguracaoMesaEvento } from '../../domain/configuracao-mesa-evento.entity';

export interface ConfiguracaoMesaEntrada {
  mesaId: string;
  preco: number;
  bloqueada: boolean;
}

// evento.json: "o croqui dá a estrutura (número, capacidade, posição); cada evento define seu
// próprio preço por mesa e pode bloquear mesas específicas, sem alterar o croqui original."
@Injectable()
export class ConfigurarMesasEventoUseCase {
  constructor(
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(MesaRepositoryPort) private readonly mesas: MesaRepositoryPort,
    @Inject(ConfiguracaoMesaEventoRepositoryPort)
    private readonly configuracoes: ConfiguracaoMesaEventoRepositoryPort,
  ) {}

  async execute(
    eventoId: string,
    entrada: ConfiguracaoMesaEntrada[],
  ): Promise<ConfiguracaoMesaEvento[]> {
    const evento = await this.eventos.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }
    if (!evento.salaoId) {
      throw new BadRequestException('Evento não tem um salão/croqui vinculado');
    }

    for (const item of entrada) {
      const mesa = await this.mesas.buscarPorId(item.mesaId);
      if (!mesa || mesa.salaoId !== evento.salaoId) {
        throw new BadRequestException(
          `Mesa ${item.mesaId} não pertence ao salão vinculado a este evento`,
        );
      }
    }

    return this.configuracoes.substituirConfiguracoesDoEvento(
      eventoId,
      entrada.map((item) => ({ eventoId, ...item })),
    );
  }
}
