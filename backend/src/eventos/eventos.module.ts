import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaoRepositoryPort } from './application/ports/salao-repository.port';
import { MesaRepositoryPort } from './application/ports/mesa-repository.port';
import { EventoRepositoryPort } from './application/ports/evento-repository.port';
import { ConfiguracaoMesaEventoRepositoryPort } from './application/ports/configuracao-mesa-evento-repository.port';
import { ConfiguracaoIngressoEventoRepositoryPort } from './application/ports/configuracao-ingresso-evento-repository.port';
import { CriarSalaoUseCase } from './application/use-cases/criar-salao.use-case';
import { AdicionarMesaUseCase } from './application/use-cases/adicionar-mesa.use-case';
import { ListarSaloesUseCase } from './application/use-cases/listar-saloes.use-case';
import { ConsultarSalaoUseCase } from './application/use-cases/consultar-salao.use-case';
import { CriarEventoUseCase } from './application/use-cases/criar-evento.use-case';
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
import { TypeOrmSalaoRepositoryAdapter } from './infrastructure/persistence/typeorm-salao-repository.adapter';
import { TypeOrmMesaRepositoryAdapter } from './infrastructure/persistence/typeorm-mesa-repository.adapter';
import { TypeOrmEventoRepositoryAdapter } from './infrastructure/persistence/typeorm-evento-repository.adapter';
import { TypeOrmConfiguracaoMesaEventoRepositoryAdapter } from './infrastructure/persistence/typeorm-configuracao-mesa-evento-repository.adapter';
import { TypeOrmConfiguracaoIngressoEventoRepositoryAdapter } from './infrastructure/persistence/typeorm-configuracao-ingresso-evento-repository.adapter';
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
    ]),
    IdentidadeModule,
  ],
  controllers: [SaloesController, EventosController],
  providers: [
    CriarSalaoUseCase,
    AdicionarMesaUseCase,
    ListarSaloesUseCase,
    ConsultarSalaoUseCase,
    CriarEventoUseCase,
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
