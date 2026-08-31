import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  EventoRepositoryPort,
  NovoEvento,
} from '../../application/ports/evento-repository.port';
import { Evento, StatusEvento } from '../../domain/evento.entity';
import { EventoOrmEntity } from './evento.orm-entity';

@Injectable()
export class TypeOrmEventoRepositoryAdapter extends EventoRepositoryPort {
  constructor(
    @InjectRepository(EventoOrmEntity)
    private readonly repo: Repository<EventoOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovoEvento): Promise<Evento> {
    const criado = await this.repo.save(
      this.repo.create({ ...dados, data: new Date(dados.data) }),
    );
    return this.paraDominio(criado);
  }

  async buscarPorId(id: string): Promise<Evento | null> {
    const encontrado = await this.repo.findOneBy({ id });
    return encontrado ? this.paraDominio(encontrado) : null;
  }

  async listarPaginado(
    pagina: number,
    limite: number,
    busca?: string,
  ): Promise<{ itens: Evento[]; total: number }> {
    const [encontrados, total] = await this.repo.findAndCount({
      where: busca ? { nome: ILike(`%${busca}%`) } : undefined,
      order: { data: 'ASC' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return { itens: encontrados.map((e) => this.paraDominio(e)), total };
  }

  async listarPorStatus(status: StatusEvento): Promise<Evento[]> {
    const encontrados = await this.repo.find({
      where: { status },
      order: { data: 'ASC' },
    });
    return encontrados.map((evento) => this.paraDominio(evento));
  }

  async atualizarStatus(id: string, status: StatusEvento): Promise<Evento> {
    await this.repo.update({ id }, { status });
    const atualizado = await this.repo.findOneByOrFail({ id });
    return this.paraDominio(atualizado);
  }

  private paraDominio(orm: EventoOrmEntity): Evento {
    return new Evento(
      orm.id,
      orm.nome,
      orm.data.toISOString(),
      orm.local,
      orm.descricao,
      orm.salaoId,
      orm.status,
    );
  }
}
