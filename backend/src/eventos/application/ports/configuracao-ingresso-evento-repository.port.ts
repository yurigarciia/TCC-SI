import { ConfiguracaoIngressoEvento } from '../../domain/configuracao-ingresso-evento.entity';

export interface DadosConfiguracaoIngressoEvento {
  eventoId: string;
  quantidadeDisponivel: number;
  preco: number;
}

export abstract class ConfiguracaoIngressoEventoRepositoryPort {
  abstract definirParaEvento(
    dados: DadosConfiguracaoIngressoEvento,
  ): Promise<ConfiguracaoIngressoEvento>;
  abstract buscarPorEvento(
    eventoId: string,
  ): Promise<ConfiguracaoIngressoEvento | null>;
}
