import { Inject, Injectable } from '@nestjs/common';
import { SalaoRepositoryPort } from '../ports/salao-repository.port';
import { Salao } from '../../domain/salao.entity';

export interface DadosNovoSalao {
  nome: string;
  capacidadeTotal: number;
}

@Injectable()
export class CriarSalaoUseCase {
  constructor(
    @Inject(SalaoRepositoryPort) private readonly saloes: SalaoRepositoryPort,
  ) {}

  execute(dados: DadosNovoSalao): Promise<Salao> {
    return this.saloes.salvar(dados);
  }
}
