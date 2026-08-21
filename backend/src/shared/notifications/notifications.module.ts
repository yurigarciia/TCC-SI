import { Module } from '@nestjs/common';
import { NotificationSenderPort } from './application/ports/notification-sender.port';
import { ConsoleNotificationSenderAdapter } from './infrastructure/adapters/console-notification-sender.adapter';

@Module({
  providers: [
    {
      provide: NotificationSenderPort,
      useClass: ConsoleNotificationSenderAdapter,
    },
  ],
  exports: [NotificationSenderPort],
})
export class NotificationsModule {}
