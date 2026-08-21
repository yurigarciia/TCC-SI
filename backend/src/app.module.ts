import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './shared/database/database.module';
import { IdentidadeModule } from './identidade/identidade.module';
import { AssociadosModule } from './associados/associados.module';
import { MensalidadesModule } from './mensalidades/mensalidades.module';
import { EventosModule } from './eventos/eventos.module';
import { ReservasModule } from './reservas/reservas.module';
import { IngressosModule } from './ingressos/ingressos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    HealthModule,
    IdentidadeModule,
    AssociadosModule,
    MensalidadesModule,
    EventosModule,
    ReservasModule,
    IngressosModule,
  ],
})
export class AppModule {}
