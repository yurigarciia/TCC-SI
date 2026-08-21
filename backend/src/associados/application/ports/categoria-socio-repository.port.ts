import { CategoriaSocio } from '../../domain/categoria-socio.entity';

export interface NovaCategoriaSocio {
  nome: string;
  valorMensalidade: number;
}

export abstract class CategoriaSocioRepositoryPort {
  abstract salvar(dados: NovaCategoriaSocio): Promise<CategoriaSocio>;
  abstract buscarPorId(id: string): Promise<CategoriaSocio | null>;
  abstract listarTodas(): Promise<CategoriaSocio[]>;
}
