import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservaRepositoryPort } from './application/ports/reserva-repository.port';
import { SolicitarReservaUseCase } from './application/use-cases/solicitar-reserva.use-case';
import { ConfirmarReservaPendenteUseCase } from './application/use-cases/confirmar-reserva-pendente.use-case';
import { CancelarReservaUseCase } from './application/use-cases/cancelar-reserva.use-case';
import { ConsultarMapaMesasUseCase } from './application/use-cases/consultar-mapa-mesas.use-case';
import { TransferirMesaReservaUseCase } from './application/use-cases/transferir-mesa-reserva.use-case';
import { TransferirTitularReservaUseCase } from './application/use-cases/transferir-titular-reserva.use-case';
import { ListarMinhasReservasUseCase } from './application/use-cases/listar-minhas-reservas.use-case';
import { SolicitarMinhaReservaUseCase } from './application/use-cases/solicitar-minha-reserva.use-case';
import { ReservaOrmEntity } from './infrastructure/persistence/reserva.orm-entity';
import { TypeOrmReservaRepositoryAdapter } from './infrastructure/persistence/typeorm-reserva-repository.adapter';
import { ReservasController } from './infrastructure/controllers/reservas.controller';
import { IdentidadeModule } from '../identidade/identidade.module';
import { EventosModule } from '../eventos/eventos.module';
import { AssociadosModule } from '../associados/associados.module';
import { PaymentsModule } from '../shared/payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReservaOrmEntity]),
    IdentidadeModule,
    EventosModule,
    AssociadosModule,
    PaymentsModule,
  ],
  controllers: [ReservasController],
  providers: [
    SolicitarReservaUseCase,
    ConfirmarReservaPendenteUseCase,
    CancelarReservaUseCase,
    ConsultarMapaMesasUseCase,
    TransferirMesaReservaUseCase,
    TransferirTitularReservaUseCase,
    ListarMinhasReservasUseCase,
    SolicitarMinhaReservaUseCase,
    {
      provide: ReservaRepositoryPort,
      useClass: TypeOrmReservaRepositoryAdapter,
    },
  ],
})
export class ReservasModule {}
