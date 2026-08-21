import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MensalidadeRepositoryPort } from '../ports/mensalidade-repository.port';
import { PaymentGatewayPort } from '../../../shared/payments/application/ports/payment-gateway.port';
import {
  FormaPagamento,
  Mensalidade,
  StatusMensalidade,
} from '../../domain/mensalidade.entity';

// Confirma o pagamento consultando o status atual no gateway — representa o que, com um provedor
// real, chegaria via webhook. Mantido como chamada explícita enquanto não há endpoint de webhook.
@Injectable()
export class ConfirmarPagamentoOnlineUseCase {
  constructor(
    @Inject(MensalidadeRepositoryPort)
    private readonly mensalidades: MensalidadeRepositoryPort,
    @Inject(PaymentGatewayPort) private readonly gateway: PaymentGatewayPort,
  ) {}

  async execute(id: string): Promise<Mensalidade> {
    const mensalidade = await this.mensalidades.buscarPorId(id);
    if (!mensalidade) {
      throw new NotFoundException('Mensalidade não encontrada');
    }
    if (!mensalidade.pagamentoExternoId) {
      throw new BadRequestException(
        'Pagamento online não foi iniciado para esta mensalidade',
      );
    }

    const status = await this.gateway.consultarStatus(
      mensalidade.pagamentoExternoId,
    );
    if (status !== 'aprovada') {
      throw new BadRequestException(
        `Pagamento ainda não aprovado (status do gateway: ${status})`,
      );
    }

    return this.mensalidades.atualizar(id, {
      status: StatusMensalidade.PAGA,
      formaPagamento: FormaPagamento.ONLINE,
      pagoEm: new Date(),
    });
  }
}
