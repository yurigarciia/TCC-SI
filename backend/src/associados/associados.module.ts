import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociadoRepositoryPort } from './application/ports/associado-repository.port';
import { DependenteRepositoryPort } from './application/ports/dependente-repository.port';
import { CategoriaSocioRepositoryPort } from './application/ports/categoria-socio-repository.port';
import { AutoCadastrarAssociadoUseCase } from './application/use-cases/auto-cadastrar-associado.use-case';
import { CadastrarAssociadoMediadoUseCase } from './application/use-cases/cadastrar-associado-mediado.use-case';
import { ListarAssociadosUseCase } from './application/use-cases/listar-associados.use-case';
import { ConsultarAssociadoUseCase } from './application/use-cases/consultar-associado.use-case';
import { ConsultarMeuAssociadoUseCase } from './application/use-cases/consultar-meu-associado.use-case';
import { AtualizarAssociadoUseCase } from './application/use-cases/atualizar-associado.use-case';
import { AdicionarDependenteUseCase } from './application/use-cases/adicionar-dependente.use-case';
import { AprovarCadastroPendenteUseCase } from './application/use-cases/aprovar-cadastro-pendente.use-case';
import { RejeitarCadastroPendenteUseCase } from './application/use-cases/rejeitar-cadastro-pendente.use-case';
import { VincularContaAssociadoUseCase } from './application/use-cases/vincular-conta-associado.use-case';
import { CriarCategoriaSocioUseCase } from './application/use-cases/criar-categoria-socio.use-case';
import { ListarCategoriasSocioUseCase } from './application/use-cases/listar-categorias-socio.use-case';
import { AssociadoOrmEntity } from './infrastructure/persistence/associado.orm-entity';
import { DependenteOrmEntity } from './infrastructure/persistence/dependente.orm-entity';
import { CategoriaSocioOrmEntity } from './infrastructure/persistence/categoria-socio.orm-entity';
import { TypeOrmAssociadoRepositoryAdapter } from './infrastructure/persistence/typeorm-associado-repository.adapter';
import { TypeOrmDependenteRepositoryAdapter } from './infrastructure/persistence/typeorm-dependente-repository.adapter';
import { TypeOrmCategoriaSocioRepositoryAdapter } from './infrastructure/persistence/typeorm-categoria-socio-repository.adapter';
import { AssociadosController } from './infrastructure/controllers/associados.controller';
import { CategoriasSocioController } from './infrastructure/controllers/categorias-socio.controller';
import { IdentidadeModule } from '../identidade/identidade.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssociadoOrmEntity,
      DependenteOrmEntity,
      CategoriaSocioOrmEntity,
    ]),
    IdentidadeModule,
  ],
  controllers: [AssociadosController, CategoriasSocioController],
  providers: [
    AutoCadastrarAssociadoUseCase,
    CadastrarAssociadoMediadoUseCase,
    ListarAssociadosUseCase,
    ConsultarAssociadoUseCase,
    ConsultarMeuAssociadoUseCase,
    AtualizarAssociadoUseCase,
    AdicionarDependenteUseCase,
    AprovarCadastroPendenteUseCase,
    RejeitarCadastroPendenteUseCase,
    VincularContaAssociadoUseCase,
    CriarCategoriaSocioUseCase,
    ListarCategoriasSocioUseCase,
    {
      provide: AssociadoRepositoryPort,
      useClass: TypeOrmAssociadoRepositoryAdapter,
    },
    {
      provide: DependenteRepositoryPort,
      useClass: TypeOrmDependenteRepositoryAdapter,
    },
    {
      provide: CategoriaSocioRepositoryPort,
      useClass: TypeOrmCategoriaSocioRepositoryAdapter,
    },
  ],
  exports: [AssociadoRepositoryPort, CategoriaSocioRepositoryPort],
})
export class AssociadosModule {}
