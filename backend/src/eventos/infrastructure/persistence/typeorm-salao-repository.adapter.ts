import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  NovoSalao,
  SalaoRepositoryPort,
} from '../../application/ports/salao-repository.port';
import { Salao } from '../../domain/salao.entity';
import { SalaoOrmEntity } from './salao.orm-entity';

@Injectable()
export class TypeOrmSalaoRepositoryAdapter extends SalaoRepositoryPort {
  constructor(
    @InjectRepository(SalaoOrmEntity)
    private readonly repo: Repository<SalaoOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovoSalao): Promise<Salao> {
    const criado = await this.repo.save(this.repo.create(dados));
    return this.paraDominio(criado);
  }

  async buscarPorId(id: string): Promise<Salao | null> {
    const encontrado = await this.repo.findOneBy({ id });
    return encontrado ? this.paraDominio(encontrado) : null;
  }

  async listarPaginado(
    pagina: number,
    limite: number,
    busca?: string,
  ): Promise<{ itens: Salao[]; total: number }> {
    const [encontrados, total] = await this.repo.findAndCount({
      where: busca ? { nome: ILike(`%${busca}%`) } : undefined,
      order: { nome: 'ASC' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return { itens: encontrados.map((salao) => this.paraDominio(salao)), total };
  }

  private paraDominio(orm: SalaoOrmEntity): Salao {
    return new Salao(orm.id, orm.nome, orm.capacidadeTotal);
  }
}
