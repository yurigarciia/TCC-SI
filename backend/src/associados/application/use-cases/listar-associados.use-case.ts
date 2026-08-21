import { Inject, Injectable } from '@nestjs/common';
import { AssociadoRepositoryPort } from '../ports/associado-repository.port';
import { Associado } from '../../domain/associado.entity';

@Injectable()
export class ListarAssociadosUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
  ) {}

  execute(): Promise<Associado[]> {
    return this.associados.listarTodos();
  }
}
