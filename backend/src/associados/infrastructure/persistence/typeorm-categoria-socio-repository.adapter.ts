import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CategoriaSocioRepositoryPort,
  NovaCategoriaSocio,
} from '../../application/ports/categoria-socio-repository.port';
import { CategoriaSocio } from '../../domain/categoria-socio.entity';
import { CategoriaSocioOrmEntity } from './categoria-socio.orm-entity';

@Injectable()
export class TypeOrmCategoriaSocioRepositoryAdapter extends CategoriaSocioRepositoryPort {
  constructor(
    @InjectRepository(CategoriaSocioOrmEntity)
    private readonly repo: Repository<CategoriaSocioOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovaCategoriaSocio): Promise<CategoriaSocio> {
    const criado = await this.repo.save(
      this.repo.create({
        nome: dados.nome,
        valorMensalidade: String(dados.valorMensalidade),
        isenta: dados.isenta,
      }),
    );
    return this.paraDominio(criado);
  }

  async buscarPorId(id: string): Promise<CategoriaSocio | null> {
    const encontrado = await this.repo.findOneBy({ id });
    return encontrado ? this.paraDominio(encontrado) : null;
  }

  async listarTodas(): Promise<CategoriaSocio[]> {
    const encontradas = await this.repo.find({ order: { nome: 'ASC' } });
    return encontradas.map((categoria) => this.paraDominio(categoria));
  }

  private paraDominio(orm: CategoriaSocioOrmEntity): CategoriaSocio {
    return new CategoriaSocio(
      orm.id,
      orm.nome,
      Number(orm.valorMensalidade),
      orm.ativa,
      orm.isenta,
    );
  }
}
