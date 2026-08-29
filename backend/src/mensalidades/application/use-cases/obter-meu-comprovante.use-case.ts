import { Injectable } from '@nestjs/common';
import { ResolverMinhaMensalidadeUseCase } from './resolver-minha-mensalidade.use-case';
import {
  Comprovante,
  ObterComprovanteUseCase,
} from './obter-comprovante.use-case';

// Mesma lógica de ObterComprovanteUseCase, exposta pro associado (T-MOB-002) com checagem de
// propriedade via ResolverMinhaMensalidadeUseCase.
@Injectable()
export class ObterMeuComprovanteUseCase {
  constructor(
    private readonly resolverMinha: ResolverMinhaMensalidadeUseCase,
    private readonly obterComprovante: ObterComprovanteUseCase,
  ) {}

  async execute(
    usuarioId: string,
    mensalidadeId: string,
  ): Promise<Comprovante> {
    const mensalidade = await this.resolverMinha.execute(
      usuarioId,
      mensalidadeId,
    );
    return this.obterComprovante.execute(mensalidade.id);
  }
}
