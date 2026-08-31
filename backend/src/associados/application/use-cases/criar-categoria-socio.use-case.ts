import { Inject, Injectable } from '@nestjs/common';
import { CategoriaSocioRepositoryPort } from '../ports/categoria-socio-repository.port';
import { CategoriaSocio } from '../../domain/categoria-socio.entity';

export interface DadosNovaCategoriaSocio {
  nome: string;
  valorMensalidade?: number;
  isenta?: boolean;
}

@Injectable()
export class CriarCategoriaSocioUseCase {
  constructor(
    @Inject(CategoriaSocioRepositoryPort)
    private readonly categorias: CategoriaSocioRepositoryPort,
  ) {}

  execute(dados: DadosNovaCategoriaSocio): Promise<CategoriaSocio> {
    const isenta = dados.isenta ?? false;
    return this.categorias.salvar({
      nome: dados.nome,
      // Categoria isenta nunca guarda um valor de mensalidade — zera aqui em vez de confiar no
      // que o cliente mandou, pra não deixar um valor "fantasma" armazenado sem uso.
      valorMensalidade: isenta ? 0 : dados.valorMensalidade!,
      isenta,
    });
  }
}
