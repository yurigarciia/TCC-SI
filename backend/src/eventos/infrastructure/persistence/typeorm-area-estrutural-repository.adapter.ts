import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AreaEstruturalRepositoryPort,
  AtualizacaoAreaEstrutural,
  NovaAreaEstrutural,
} from '../../application/ports/area-estrutural-repository.port';
import { AreaEstrutural } from '../../domain/area-estrutural.entity';
import { AreaEstruturalOrmEntity } from './area-estrutural.orm-entity';

@Injectable()
export class TypeOrmAreaEstruturalRepositoryAdapter extends AreaEstruturalRepositoryPort {
  constructor(
    @InjectRepository(AreaEstruturalOrmEntity)
    private readonly repo: Repository<AreaEstruturalOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovaAreaEstrutural): Promise<AreaEstrutural> {
    const criada = await this.repo.save(this.repo.create(dados));
    return this.paraDominio(criada);
  }

  async buscarPorId(id: string): Promise<AreaEstrutural | null> {
    const encontrada = await this.repo.findOneBy({ id });
    return encontrada ? this.paraDominio(encontrada) : null;
  }

  async listarPorSalao(salaoId: string): Promise<AreaEstrutural[]> {
    const encontradas = await this.repo.find({ where: { salaoId } });
    return encontradas.map((area) => this.paraDominio(area));
  }

  async atualizar(
    id: string,
    dados: AtualizacaoAreaEstrutural,
  ): Promise<AreaEstrutural> {
    await this.repo.update(id, dados);
    const atualizada = await this.repo.findOneByOrFail({ id });
    return this.paraDominio(atualizada);
  }

  async remover(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private paraDominio(orm: AreaEstruturalOrmEntity): AreaEstrutural {
    return new AreaEstrutural(
      orm.id,
      orm.salaoId,
      orm.nome,
      orm.x,
      orm.y,
      orm.largura,
      orm.altura,
    );
  }
}
