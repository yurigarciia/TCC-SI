import { Inject, Injectable } from '@nestjs/common';
import { CategoriaSocioRepositoryPort } from '../ports/categoria-socio-repository.port';
import { CategoriaSocio } from '../../domain/categoria-socio.entity';

@Injectable()
export class ListarCategoriasSocioUseCase {
  constructor(
    @Inject(CategoriaSocioRepositoryPort)
    private readonly categorias: CategoriaSocioRepositoryPort,
  ) {}

  execute(): Promise<CategoriaSocio[]> {
    return this.categorias.listarTodas();
  }
}
