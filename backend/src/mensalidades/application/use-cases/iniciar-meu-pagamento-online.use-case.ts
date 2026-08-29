import { Injectable } from '@nestjs/common';
import { ResolverMinhaMensalidadeUseCase } from './resolver-minha-mensalidade.use-case';
import {
  IniciarPagamentoOnlineUseCase,
  PagamentoOnlineIniciado,
} from './iniciar-pagamento-online.use-case';

// Mesma lógica de IniciarPagamentoOnlineUseCase, exposta pro associado (T-MOB-002) com checagem
// de propriedade via ResolverMinhaMensalidadeUseCase.
@Injectable()
export class IniciarMeuPagamentoOnlineUseCase {
  constructor(
    private readonly resolverMinha: ResolverMinhaMensalidadeUseCase,
    private readonly iniciarPagamentoOnline: IniciarPagamentoOnlineUseCase,
  ) {}

  async execute(
    usuarioId: string,
    mensalidadeId: string,
  ): Promise<PagamentoOnlineIniciado> {
    const mensalidade = await this.resolverMinha.execute(
      usuarioId,
      mensalidadeId,
    );
    return this.iniciarPagamentoOnline.execute(mensalidade.id);
  }
}
