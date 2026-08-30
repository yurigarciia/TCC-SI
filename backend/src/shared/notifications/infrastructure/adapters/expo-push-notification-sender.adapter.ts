import { Inject, Injectable, Logger } from '@nestjs/common';
import { AssociadoRepositoryPort } from '../../../../associados/application/ports/associado-repository.port';
import {
  Notificacao,
  NotificationSenderPort,
} from '../../application/ports/notification-sender.port';
import { PushTokenRepositoryPort } from '../../application/ports/push-token-repository.port';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Substitui o ConsoleNotificationSenderAdapter provisório assim que há um device pra receber —
// mas continua logando sempre (ver `logger.log` abaixo), porque neste ambiente de dev não há
// device/emulador real pra confirmar entrega (ver T-MOB-005 no PLANEJAMENTO-GERAL.md: pendente de
// teste ponta a ponta em device físico antes de fechar a ticket).
//
// `destinatarioId` é sempre um associadoId (ver ProcessarInadimplenciaUseCase e os pontos de
// disparo em reservas/ingressos) — resolve pra usuarioId e daí pros tokens registrados. Nunca
// lança: falha ao notificar não pode derrubar a operação de negócio que disparou o aviso (reserva
// confirmada, mensalidade gerada etc. já aconteceram de verdade).
@Injectable()
export class ExpoPushNotificationSenderAdapter extends NotificationSenderPort {
  private readonly logger = new Logger(ExpoPushNotificationSenderAdapter.name);

  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(PushTokenRepositoryPort)
    private readonly pushTokens: PushTokenRepositoryPort,
  ) {
    super();
  }

  async enviar(notificacao: Notificacao): Promise<void> {
    this.logger.log(
      `[notificação] para=${notificacao.destinatarioId} título="${notificacao.titulo}" mensagem="${notificacao.mensagem}"`,
    );

    try {
      const associado = await this.associados.buscarPorId(
        notificacao.destinatarioId,
      );
      if (!associado?.usuarioId) {
        return;
      }
      const tokens = await this.pushTokens.listarTokensPorUsuarioId(
        associado.usuarioId,
      );
      if (tokens.length === 0) {
        return;
      }

      await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(
          tokens.map((to) => ({
            to,
            title: notificacao.titulo,
            body: notificacao.mensagem,
            sound: 'default',
          })),
        ),
      });
    } catch (erro) {
      this.logger.warn(
        `Falha ao enviar push para associado ${notificacao.destinatarioId}: ${String(erro)}`,
      );
    }
  }
}
