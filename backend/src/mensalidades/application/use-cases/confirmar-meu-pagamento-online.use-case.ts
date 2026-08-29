import { Injectable } from '@nestjs/common';
import { ResolverMinhaMensalidadeUseCase } from './resolver-minha-mensalidade.use-case';
import { ConfirmarPagamentoOnlineUseCase } from './confirmar-pagamento-online.use-case';
import { Mensalidade } from '../../domain/mensalidade.entity';

// Mesma lógica de ConfirmarPagamentoOnlineUseCase, exposta pro associado (T-MOB-002) com
// checagem de propriedade via ResolverMinhaMensalidadeUseCase.
@Injectable()
export class ConfirmarMeuPagamentoOnlineUseCase {
  constructor(
    private readonly resolverMinha: ResolverMinhaMensalidadeUseCase,
    private readonly confirmarPagamentoOnline: ConfirmarPagamentoOnlineUseCase,
  ) {}

  async execute(
    usuarioId: string,
    mensalidadeId: string,
  ): Promise<Mensalidade> {
    const mensalidade = await this.resolverMinha.execute(
      usuarioId,
      mensalidadeId,
    );
    return this.confirmarPagamentoOnline.execute(mensalidade.id);
  }
}
