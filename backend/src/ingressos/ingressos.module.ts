import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngressoRepositoryPort } from './application/ports/ingresso-repository.port';
import { PrecoIngressoRepositoryPort } from './application/ports/preco-ingresso-repository.port';
import { DefinirPrecoPadraoUseCase } from './application/use-cases/definir-preco-padrao.use-case';
import { DefinirPrecoPorEventoUseCase } from './application/use-cases/definir-preco-por-evento.use-case';
import { EmitirIngressoUseCase } from './application/use-cases/emitir-ingresso.use-case';
import { RegistrarCheckinUseCase } from './application/use-cases/registrar-checkin.use-case';
import { ListarIngressosEventoUseCase } from './application/use-cases/listar-ingressos-evento.use-case';
import { ComprarMeuIngressoUseCase } from './application/use-cases/comprar-meu-ingresso.use-case';
import { ConsultarPrecosIngressoUseCase } from './application/use-cases/consultar-precos-ingresso.use-case';
import { ConsultarMeuPrecoIngressoUseCase } from './application/use-cases/consultar-meu-preco-ingresso.use-case';
import { ConsultarResumoIngressosUseCase } from './application/use-cases/consultar-resumo-ingressos.use-case';
import { ListarMeusIngressosUseCase } from './application/use-cases/listar-meus-ingressos.use-case';
import { IngressoOrmEntity } from './infrastructure/persistence/ingresso.orm-entity';
import { PrecoIngressoOrmEntity } from './infrastructure/persistence/preco-ingresso.orm-entity';
import { TypeOrmIngressoRepositoryAdapter } from './infrastructure/persistence/typeorm-ingresso-repository.adapter';
import { TypeOrmPrecoIngressoRepositoryAdapter } from './infrastructure/persistence/typeorm-preco-ingresso-repository.adapter';
import { IngressosController } from './infrastructure/controllers/ingressos.controller';
import { IdentidadeModule } from '../identidade/identidade.module';
import { EventosModule } from '../eventos/eventos.module';
import { AssociadosModule } from '../associados/associados.module';
import { PaymentsModule } from '../shared/payments/payments.module';
import { NotificationsModule } from '../shared/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IngressoOrmEntity, PrecoIngressoOrmEntity]),
    IdentidadeModule,
    EventosModule,
    AssociadosModule,
    PaymentsModule,
    NotificationsModule,
  ],
  controllers: [IngressosController],
  providers: [
    DefinirPrecoPadraoUseCase,
    DefinirPrecoPorEventoUseCase,
    EmitirIngressoUseCase,
    RegistrarCheckinUseCase,
    ListarIngressosEventoUseCase,
    ComprarMeuIngressoUseCase,
    ConsultarPrecosIngressoUseCase,
    ConsultarMeuPrecoIngressoUseCase,
    ConsultarResumoIngressosUseCase,
    ListarMeusIngressosUseCase,
    {
      provide: IngressoRepositoryPort,
      useClass: TypeOrmIngressoRepositoryAdapter,
    },
    {
      provide: PrecoIngressoRepositoryPort,
      useClass: TypeOrmPrecoIngressoRepositoryAdapter,
    },
  ],
})
export class IngressosModule {}
