import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DependenteRepositoryPort,
  NovoDependente,
} from '../../application/ports/dependente-repository.port';
import { Dependente } from '../../domain/dependente.entity';
import { DependenteOrmEntity } from './dependente.orm-entity';

@Injectable()
export class TypeOrmDependenteRepositoryAdapter extends DependenteRepositoryPort {
  constructor(
    @InjectRepository(DependenteOrmEntity)
    private readonly repo: Repository<DependenteOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovoDependente): Promise<Dependente> {
    const criado = await this.repo.save(this.repo.create(dados));
    return this.paraDominio(criado);
  }

  async listarPorAssociado(associadoId: string): Promise<Dependente[]> {
    const encontrados = await this.repo.find({ where: { associadoId } });
    return encontrados.map((dependente) => this.paraDominio(dependente));
  }

  private paraDominio(orm: DependenteOrmEntity): Dependente {
    return new Dependente(
      orm.id,
      orm.associadoId,
      orm.nome,
      orm.dataNascimento,
    );
  }
}
