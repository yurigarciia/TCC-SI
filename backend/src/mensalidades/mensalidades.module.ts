import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MensalidadeRepositoryPort } from './application/ports/mensalidade-repository.port';
import { GerarCobrancasMensaisUseCase } from './application/use-cases/gerar-cobrancas-mensais.use-case';
import { RegistrarPagamentoPresencialUseCase } from './application/use-cases/registrar-pagamento-presencial.use-case';
import { IniciarPagamentoOnlineUseCase } from './application/use-cases/iniciar-pagamento-online.use-case';
import { ConfirmarPagamentoOnlineUseCase } from './application/use-cases/confirmar-pagamento-online.use-case';
import { ListarHistoricoAssociadoUseCase } from './application/use-cases/listar-historico-associado.use-case';
import { ObterComprovanteUseCase } from './application/use-cases/obter-comprovante.use-case';
import { ProcessarInadimplenciaUseCase } from './application/use-cases/processar-inadimplencia.use-case';
import { ListarInadimplentesUseCase } from './application/use-cases/listar-inadimplentes.use-case';
import { ListarSituacaoPagamentoUseCase } from './application/use-cases/listar-situacao-pagamento.use-case';
import { ListarMinhasMensalidadesUseCase } from './application/use-cases/listar-minhas-mensalidades.use-case';
import { ResolverMinhaMensalidadeUseCase } from './application/use-cases/resolver-minha-mensalidade.use-case';
import { IniciarMeuPagamentoOnlineUseCase } from './application/use-cases/iniciar-meu-pagamento-online.use-case';
import { ConfirmarMeuPagamentoOnlineUseCase } from './application/use-cases/confirmar-meu-pagamento-online.use-case';
import { ObterMeuComprovanteUseCase } from './application/use-cases/obter-meu-comprovante.use-case';
import { MensalidadeOrmEntity } from './infrastructure/persistence/mensalidade.orm-entity';
import { TypeOrmMensalidadeRepositoryAdapter } from './infrastructure/persistence/typeorm-mensalidade-repository.adapter';
import { MensalidadesController } from './infrastructure/controllers/mensalidades.controller';
import { MensalidadesCron } from './infrastructure/jobs/mensalidades.cron';
import { IdentidadeModule } from '../identidade/identidade.module';
import { AssociadosModule } from '../associados/associados.module';
import { PaymentsModule } from '../shared/payments/payments.module';
import { NotificationsModule } from '../shared/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MensalidadeOrmEntity]),
    IdentidadeModule,
    AssociadosModule,
    PaymentsModule,
    NotificationsModule,
  ],
  controllers: [MensalidadesController],
  providers: [
    GerarCobrancasMensaisUseCase,
    RegistrarPagamentoPresencialUseCase,
    IniciarPagamentoOnlineUseCase,
    ConfirmarPagamentoOnlineUseCase,
    ListarHistoricoAssociadoUseCase,
    ObterComprovanteUseCase,
    ProcessarInadimplenciaUseCase,
    ListarInadimplentesUseCase,
    ListarSituacaoPagamentoUseCase,
    ListarMinhasMensalidadesUseCase,
    ResolverMinhaMensalidadeUseCase,
    IniciarMeuPagamentoOnlineUseCase,
    ConfirmarMeuPagamentoOnlineUseCase,
    ObterMeuComprovanteUseCase,
    MensalidadesCron,
    {
      provide: MensalidadeRepositoryPort,
      useClass: TypeOrmMensalidadeRepositoryAdapter,
    },
  ],
})
export class MensalidadesModule {}
