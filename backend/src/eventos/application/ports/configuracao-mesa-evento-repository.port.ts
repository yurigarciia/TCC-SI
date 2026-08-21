import { ConfiguracaoMesaEvento } from '../../domain/configuracao-mesa-evento.entity';

export interface NovaConfiguracaoMesaEvento {
  eventoId: string;
  mesaId: string;
  preco: number;
  bloqueada: boolean;
}

export abstract class ConfiguracaoMesaEventoRepositoryPort {
  abstract substituirConfiguracoesDoEvento(
    eventoId: string,
    configuracoes: NovaConfiguracaoMesaEvento[],
  ): Promise<ConfiguracaoMesaEvento[]>;
  abstract listarPorEvento(eventoId: string): Promise<ConfiguracaoMesaEvento[]>;
}
