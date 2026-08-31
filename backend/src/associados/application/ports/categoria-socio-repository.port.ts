import { CategoriaSocio } from '../../domain/categoria-socio.entity';

export interface NovaCategoriaSocio {
  nome: string;
  valorMensalidade: number;
  isenta: boolean;
}

export abstract class CategoriaSocioRepositoryPort {
  abstract salvar(dados: NovaCategoriaSocio): Promise<CategoriaSocio>;
  abstract buscarPorId(id: string): Promise<CategoriaSocio | null>;
  abstract listarPaginado(
    pagina: number,
    limite: number,
  ): Promise<{ itens: CategoriaSocio[]; total: number }>;
}
