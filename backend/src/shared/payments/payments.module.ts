import { Module } from '@nestjs/common';
import { PaymentGatewayPort } from './application/ports/payment-gateway.port';
import { FakePaymentGatewayAdapter } from './infrastructure/adapters/fake-payment-gateway.adapter';

@Module({
  providers: [
    { provide: PaymentGatewayPort, useClass: FakePaymentGatewayAdapter },
  ],
  exports: [PaymentGatewayPort],
})
export class PaymentsModule {}
