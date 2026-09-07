import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ElementoEstruturalRepositoryPort,
  NovoElementoEstrutural,
} from '../../application/ports/elemento-estrutural-repository.port';
import { ElementoEstrutural } from '../../domain/elemento-estrutural.entity';
import { ElementoEstruturalOrmEntity } from './elemento-estrutural.orm-entity';

@Injectable()
export class TypeOrmElementoEstruturalRepositoryAdapter extends ElementoEstruturalRepositoryPort {
  constructor(
    @InjectRepository(ElementoEstruturalOrmEntity)
    private readonly repo: Repository<ElementoEstruturalOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovoElementoEstrutural): Promise<ElementoEstrutural> {
    const criado = await this.repo.save(this.repo.create(dados));
    return this.paraDominio(criado);
  }

  async buscarPorId(id: string): Promise<ElementoEstrutural | null> {
    const encontrado = await this.repo.findOneBy({ id });
    return encontrado ? this.paraDominio(encontrado) : null;
  }

  async listarPorSalao(salaoId: string): Promise<ElementoEstrutural[]> {
    const encontrados = await this.repo.find({ where: { salaoId } });
    return encontrados.map((elemento) => this.paraDominio(elemento));
  }

  async remover(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private paraDominio(orm: ElementoEstruturalOrmEntity): ElementoEstrutural {
    return new ElementoEstrutural(
      orm.id,
      orm.salaoId,
      orm.tipo,
      orm.x1,
      orm.y1,
      orm.x2,
      orm.y2,
    );
  }
}
