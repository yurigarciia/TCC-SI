import { Injectable, Logger } from '@nestjs/common';
import {
  Notificacao,
  NotificationSenderPort,
} from '../../application/ports/notification-sender.port';

// Adapter provisório enquanto push/e-mail não são integrados — só loga, para deixar o comportamento
// visível em dev/testes sem depender de um provedor externo.
@Injectable()
export class ConsoleNotificationSenderAdapter extends NotificationSenderPort {
  private readonly logger = new Logger(ConsoleNotificationSenderAdapter.name);

  enviar(notificacao: Notificacao): Promise<void> {
    this.logger.log(
      `[notificação] para=${notificacao.destinatarioId} título="${notificacao.titulo}" mensagem="${notificacao.mensagem}"`,
    );
    return Promise.resolve();
  }
}
