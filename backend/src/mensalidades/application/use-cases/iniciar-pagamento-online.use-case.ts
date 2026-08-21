import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MensalidadeRepositoryPort } from '../ports/mensalidade-repository.port';
import { PaymentGatewayPort } from '../../../shared/payments/application/ports/payment-gateway.port';
import { StatusMensalidade } from '../../domain/mensalidade.entity';

export interface PagamentoOnlineIniciado {
  mensalidadeId: string;
  linkPagamento: string;
}

@Injectable()
export class IniciarPagamentoOnlineUseCase {
  constructor(
    @Inject(MensalidadeRepositoryPort)
    private readonly mensalidades: MensalidadeRepositoryPort,
    @Inject(PaymentGatewayPort) private readonly gateway: PaymentGatewayPort,
  ) {}

  async execute(id: string): Promise<PagamentoOnlineIniciado> {
    const mensalidade = await this.mensalidades.buscarPorId(id);
    if (!mensalidade) {
      throw new NotFoundException('Mensalidade não encontrada');
    }
    if (mensalidade.status === StatusMensalidade.PAGA) {
      throw new BadRequestException('Mensalidade já está paga');
    }

    const cobranca = await this.gateway.iniciarCobranca({
      valor: mensalidade.valor,
      descricao: `Mensalidade ${mensalidade.competencia}`,
      referenciaExterna: mensalidade.id,
    });

    await this.mensalidades.atualizar(id, {
      pagamentoExternoId: cobranca.idGateway,
    });

    return {
      mensalidadeId: mensalidade.id,
      linkPagamento: cobranca.linkPagamento,
    };
  }
}
