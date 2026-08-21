import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MesaRepositoryPort,
  NovaMesa,
} from '../../application/ports/mesa-repository.port';
import { Mesa } from '../../domain/mesa.entity';
import { MesaOrmEntity } from './mesa.orm-entity';

@Injectable()
export class TypeOrmMesaRepositoryAdapter extends MesaRepositoryPort {
  constructor(
    @InjectRepository(MesaOrmEntity)
    private readonly repo: Repository<MesaOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovaMesa): Promise<Mesa> {
    const criada = await this.repo.save(this.repo.create(dados));
    return this.paraDominio(criada);
  }

  async buscarPorId(id: string): Promise<Mesa | null> {
    const encontrada = await this.repo.findOneBy({ id });
    return encontrada ? this.paraDominio(encontrada) : null;
  }

  async buscarPorSalaoENumero(
    salaoId: string,
    numero: number,
  ): Promise<Mesa | null> {
    const encontrada = await this.repo.findOneBy({ salaoId, numero });
    return encontrada ? this.paraDominio(encontrada) : null;
  }

  async listarPorSalao(salaoId: string): Promise<Mesa[]> {
    const encontradas = await this.repo.find({
      where: { salaoId },
      order: { numero: 'ASC' },
    });
    return encontradas.map((mesa) => this.paraDominio(mesa));
  }

  private paraDominio(orm: MesaOrmEntity): Mesa {
    return new Mesa(
      orm.id,
      orm.salaoId,
      orm.numero,
      orm.capacidade,
      orm.posicaoX,
      orm.posicaoY,
    );
  }
}
