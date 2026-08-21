import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  AtualizacaoIngresso,
  IngressoRepositoryPort,
  NovoIngresso,
} from '../../application/ports/ingresso-repository.port';
import { Ingresso } from '../../domain/ingresso.entity';
import { IngressoOrmEntity } from './ingresso.orm-entity';

@Injectable()
export class TypeOrmIngressoRepositoryAdapter extends IngressoRepositoryPort {
  constructor(
    @InjectRepository(IngressoOrmEntity)
    private readonly repo: Repository<IngressoOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovoIngresso): Promise<Ingresso> {
    const criado = await this.repo.save(
      this.repo.create({ ...dados, preco: String(dados.preco) }),
    );
    return this.paraDominio(criado);
  }

  async buscarPorId(id: string): Promise<Ingresso | null> {
    const encontrado = await this.repo.findOneBy({ id });
    return encontrado ? this.paraDominio(encontrado) : null;
  }

  async contarPorEvento(eventoId: string): Promise<number> {
    return this.repo.count({ where: { eventoId } });
  }

  async listarPorEvento(eventoId: string): Promise<Ingresso[]> {
    const encontrados = await this.repo.find({ where: { eventoId } });
    return encontrados.map((ingresso) => this.paraDominio(ingresso));
  }

  async buscarPorNomeNoEvento(
    eventoId: string,
    nome: string,
  ): Promise<Ingresso[]> {
    const encontrados = await this.repo.find({
      where: { eventoId, nomeComprador: ILike(`%${nome}%`) },
    });
    return encontrados.map((ingresso) => this.paraDominio(ingresso));
  }

  async atualizar(id: string, dados: AtualizacaoIngresso): Promise<Ingresso> {
    await this.repo.update({ id }, dados);
    const atualizado = await this.repo.findOneByOrFail({ id });
    return this.paraDominio(atualizado);
  }

  private paraDominio(orm: IngressoOrmEntity): Ingresso {
    return new Ingresso(
      orm.id,
      orm.eventoId,
      orm.nomeComprador,
      orm.perfilComprador,
      Number(orm.preco),
      orm.canal,
      orm.formaPagamento,
      orm.pagamentoExternoId,
      orm.status,
      orm.usadoEm,
    );
  }
}
