import { Inject, Injectable } from '@nestjs/common';
import { SalaoRepositoryPort } from '../ports/salao-repository.port';
import { Salao } from '../../domain/salao.entity';

@Injectable()
export class ListarSaloesUseCase {
  constructor(
    @Inject(SalaoRepositoryPort) private readonly saloes: SalaoRepositoryPort,
  ) {}

  execute(): Promise<Salao[]> {
    return this.saloes.listarTodos();
  }
}
