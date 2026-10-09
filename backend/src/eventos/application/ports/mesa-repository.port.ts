import { FormatoMesa, Mesa } from '../../domain/mesa.entity';

export interface NovaMesa {
  salaoId: string;
  numero: number;
  capacidade: number;
  posicaoX: number;
  posicaoY: number;
  formato?: FormatoMesa;
}

export interface AtualizacaoMesa {
  numero?: number;
  capacidade?: number;
  posicaoX?: number;
  posicaoY?: number;
  formato?: FormatoMesa;
}

export abstract class MesaRepositoryPort {
  abstract salvar(dados: NovaMesa): Promise<Mesa>;
  abstract buscarPorId(id: string): Promise<Mesa | null>;
  abstract buscarPorSalaoENumero(
    salaoId: string,
    numero: number,
  ): Promise<Mesa | null>;
  abstract listarPorSalao(salaoId: string): Promise<Mesa[]>;
  abstract atualizar(id: string, dados: AtualizacaoMesa): Promise<Mesa>;
  abstract remover(id: string): Promise<void>;
  // true se a mesa já aparece em alguma reserva ou configuração de preço/bloqueio de evento —
  // excluir apagaria histórico de verdade (ambas as FKs são ON DELETE CASCADE, ver migrations
  // CreateReservasTable/CreateEventosTables), então o use case bloqueia antes de chegar aqui.
  abstract estaEmUso(id: string): Promise<boolean>;
}
