import { Inject, Injectable } from '@nestjs/common';
import { CategoriaSocioRepositoryPort } from '../ports/categoria-socio-repository.port';
import { CategoriaSocio } from '../../domain/categoria-socio.entity';

export interface DadosNovaCategoriaSocio {
  nome: string;
  valorMensalidade: number;
}

@Injectable()
export class CriarCategoriaSocioUseCase {
  constructor(
    @Inject(CategoriaSocioRepositoryPort)
    private readonly categorias: CategoriaSocioRepositoryPort,
  ) {}

  execute(dados: DadosNovaCategoriaSocio): Promise<CategoriaSocio> {
    return this.categorias.salvar(dados);
  }
}
