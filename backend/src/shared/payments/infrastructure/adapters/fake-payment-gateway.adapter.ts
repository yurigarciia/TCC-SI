import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CobrancaIniciada,
  DadosCobranca,
  PaymentGatewayPort,
  StatusCobrancaGateway,
} from '../../application/ports/payment-gateway.port';

// Adapter provisório enquanto o provedor real não é escolhido (ver Open Questions do backlog).
// Aprova a cobrança de imediato, só para exercitar o fluxo de ponta a ponta em dev/testes — não
// use em produção.
@Injectable()
export class FakePaymentGatewayAdapter extends PaymentGatewayPort {
  async iniciarCobranca(dados: DadosCobranca): Promise<CobrancaIniciada> {
    return Promise.resolve({
      idGateway: `fake_${randomUUID()}`,
      status: 'aprovada',
      linkPagamento: `https://pagamento.fake.local/cobranca/${dados.referenciaExterna}`,
    });
  }

  consultarStatus(): Promise<StatusCobrancaGateway> {
    return Promise.resolve('aprovada');
  }
}
