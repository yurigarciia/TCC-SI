import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaoRepositoryPort } from './application/ports/salao-repository.port';
import { MesaRepositoryPort } from './application/ports/mesa-repository.port';
import { EventoRepositoryPort } from './application/ports/evento-repository.port';
import { ConfiguracaoMesaEventoRepositoryPort } from './application/ports/configuracao-mesa-evento-repository.port';
import { ConfiguracaoIngressoEventoRepositoryPort } from './application/ports/configuracao-ingresso-evento-repository.port';
import { ElementoEstruturalRepositoryPort } from './application/ports/elemento-estrutural-repository.port';
import { AreaEstruturalRepositoryPort } from './application/ports/area-estrutural-repository.port';
import { CriarSalaoUseCase } from './application/use-cases/criar-salao.use-case';
import { AdicionarMesaUseCase } from './application/use-cases/adicionar-mesa.use-case';
import { AtualizarMesaUseCase } from './application/use-cases/atualizar-mesa.use-case';
import { RemoverMesaUseCase } from './application/use-cases/remover-mesa.use-case';
import { AdicionarElementoEstruturalUseCase } from './application/use-cases/adicionar-elemento-estrutural.use-case';
import { RemoverElementoEstruturalUseCase } from './application/use-cases/remover-elemento-estrutural.use-case';
import { AdicionarAreaEstruturalUseCase } from './application/use-cases/adicionar-area-estrutural.use-case';
import { AtualizarAreaEstruturalUseCase } from './application/use-cases/atualizar-area-estrutural.use-case';
import { RemoverAreaEstruturalUseCase } from './application/use-cases/remover-area-estrutural.use-case';
import { ListarSaloesUseCase } from './application/use-cases/listar-saloes.use-case';
import { ConsultarSalaoUseCase } from './application/use-cases/consultar-salao.use-case';
import { CriarEventoUseCase } from './application/use-cases/criar-evento.use-case';
import { AtualizarEventoUseCase } from './application/use-cases/atualizar-evento.use-case';
import { ConfigurarMesasEventoUseCase } from './application/use-cases/configurar-mesas-evento.use-case';
import { ConfigurarIngressoEventoUseCase } from './application/use-cases/configurar-ingresso-evento.use-case';
import { PublicarEventoUseCase } from './application/use-cases/publicar-evento.use-case';
import {
  ListarEventosPublicadosUseCase,
  ListarEventosUseCase,
} from './application/use-cases/listar-eventos.use-case';
import { ConsultarEventoUseCase } from './application/use-cases/consultar-evento.use-case';
import { ConsultarEventoPublicadoUseCase } from './application/use-cases/consultar-evento-publicado.use-case';
import { SalaoOrmEntity } from './infrastructure/persistence/salao.orm-entity';
import { MesaOrmEntity } from './infrastructure/persistence/mesa.orm-entity';
import { EventoOrmEntity } from './infrastructure/persistence/evento.orm-entity';
import { ConfiguracaoMesaEventoOrmEntity } from './infrastructure/persistence/configuracao-mesa-evento.orm-entity';
import { ConfiguracaoIngressoEventoOrmEntity } from './infrastructure/persistence/configuracao-ingresso-evento.orm-entity';
import { ElementoEstruturalOrmEntity } from './infrastructure/persistence/elemento-estrutural.orm-entity';
import { AreaEstruturalOrmEntity } from './infrastructure/persistence/area-estrutural.orm-entity';
import { TypeOrmSalaoRepositoryAdapter } from './infrastructure/persistence/typeorm-salao-repository.adapter';
import { TypeOrmMesaRepositoryAdapter } from './infrastructure/persistence/typeorm-mesa-repository.adapter';
import { TypeOrmEventoRepositoryAdapter } from './infrastructure/persistence/typeorm-evento-repository.adapter';
import { TypeOrmConfiguracaoMesaEventoRepositoryAdapter } from './infrastructure/persistence/typeorm-configuracao-mesa-evento-repository.adapter';
import { TypeOrmConfiguracaoIngressoEventoRepositoryAdapter } from './infrastructure/persistence/typeorm-configuracao-ingresso-evento-repository.adapter';
import { TypeOrmElementoEstruturalRepositoryAdapter } from './infrastructure/persistence/typeorm-elemento-estrutural-repository.adapter';
import { TypeOrmAreaEstruturalRepositoryAdapter } from './infrastructure/persistence/typeorm-area-estrutural-repository.adapter';
import { SaloesController } from './infrastructure/controllers/saloes.controller';
import { EventosController } from './infrastructure/controllers/eventos.controller';
import { IdentidadeModule } from '../identidade/identidade.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalaoOrmEntity,
      MesaOrmEntity,
      EventoOrmEntity,
      ConfiguracaoMesaEventoOrmEntity,
      ConfiguracaoIngressoEventoOrmEntity,
      ElementoEstruturalOrmEntity,
      AreaEstruturalOrmEntity,
    ]),
    IdentidadeModule,
  ],
  controllers: [SaloesController, EventosController],
  providers: [
    CriarSalaoUseCase,
    AdicionarMesaUseCase,
    AtualizarMesaUseCase,
    RemoverMesaUseCase,
    AdicionarElementoEstruturalUseCase,
    RemoverElementoEstruturalUseCase,
    AdicionarAreaEstruturalUseCase,
    AtualizarAreaEstruturalUseCase,
    RemoverAreaEstruturalUseCase,
    ListarSaloesUseCase,
    ConsultarSalaoUseCase,
    CriarEventoUseCase,
    AtualizarEventoUseCase,
    ConfigurarMesasEventoUseCase,
    ConfigurarIngressoEventoUseCase,
    PublicarEventoUseCase,
    ListarEventosUseCase,
    ListarEventosPublicadosUseCase,
    ConsultarEventoUseCase,
    ConsultarEventoPublicadoUseCase,
    { provide: SalaoRepositoryPort, useClass: TypeOrmSalaoRepositoryAdapter },
    { provide: MesaRepositoryPort, useClass: TypeOrmMesaRepositoryAdapter },
    { provide: EventoRepositoryPort, useClass: TypeOrmEventoRepositoryAdapter },
    {
      provide: ConfiguracaoMesaEventoRepositoryPort,
      useClass: TypeOrmConfiguracaoMesaEventoRepositoryAdapter,
    },
    {
      provide: ConfiguracaoIngressoEventoRepositoryPort,
      useClass: TypeOrmConfiguracaoIngressoEventoRepositoryAdapter,
    },
    {
      provide: ElementoEstruturalRepositoryPort,
      useClass: TypeOrmElementoEstruturalRepositoryAdapter,
    },
    {
      provide: AreaEstruturalRepositoryPort,
      useClass: TypeOrmAreaEstruturalRepositoryAdapter,
    },
  ],
  exports: [
    SalaoRepositoryPort,
    MesaRepositoryPort,
    EventoRepositoryPort,
    ConfiguracaoMesaEventoRepositoryPort,
    ConfiguracaoIngressoEventoRepositoryPort,
  ],
})
export class EventosModule {}
