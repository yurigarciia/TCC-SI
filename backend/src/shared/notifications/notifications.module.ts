import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSenderPort } from './application/ports/notification-sender.port';
import { PushTokenRepositoryPort } from './application/ports/push-token-repository.port';
import { RegistrarPushTokenUseCase } from './application/use-cases/registrar-push-token.use-case';
import { ExpoPushNotificationSenderAdapter } from './infrastructure/adapters/expo-push-notification-sender.adapter';
import { PushTokenOrmEntity } from './infrastructure/persistence/push-token.orm-entity';
import { TypeOrmPushTokenRepositoryAdapter } from './infrastructure/persistence/typeorm-push-token-repository.adapter';
import { NotificacoesController } from './infrastructure/controllers/notificacoes.controller';
import { IdentidadeModule } from '../../identidade/identidade.module';
import { AssociadosModule } from '../../associados/associados.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushTokenOrmEntity]),
    IdentidadeModule,
    AssociadosModule,
  ],
  controllers: [NotificacoesController],
  providers: [
    RegistrarPushTokenUseCase,
    {
      provide: NotificationSenderPort,
      useClass: ExpoPushNotificationSenderAdapter,
    },
    {
      provide: PushTokenRepositoryPort,
      useClass: TypeOrmPushTokenRepositoryAdapter,
    },
  ],
  exports: [NotificationSenderPort],
})
export class NotificationsModule {}
