export interface Notificacao {
  destinatarioId: string;
  titulo: string;
  mensagem: string;
}

// Abstrai push/e-mail (provedor ainda não escolhido). Usado hoje pelo lembrete automático de
// inadimplência; pensado para ser reaproveitado por confirmações de reserva/compra quando esses
// módulos forem implementados.
export abstract class NotificationSenderPort {
  abstract enviar(notificacao: Notificacao): Promise<void>;
}
