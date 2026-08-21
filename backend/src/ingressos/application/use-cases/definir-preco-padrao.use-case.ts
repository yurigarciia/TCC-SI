import { Inject, Injectable } from '@nestjs/common';
import { PrecoIngressoRepositoryPort } from '../ports/preco-ingresso-repository.port';
import { PerfilComprador } from '../../domain/ingresso.entity';
import { PrecoIngresso } from '../../domain/preco-ingresso.entity';

@Injectable()
export class DefinirPrecoPadraoUseCase {
  constructor(
    @Inject(PrecoIngressoRepositoryPort)
    private readonly precos: PrecoIngressoRepositoryPort,
  ) {}

  execute(perfil: PerfilComprador, preco: number): Promise<PrecoIngresso> {
    return this.precos.definirPadrao(perfil, preco);
  }
}
