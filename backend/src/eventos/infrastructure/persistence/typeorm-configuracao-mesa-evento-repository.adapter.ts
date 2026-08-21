import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConfiguracaoMesaEventoRepositoryPort,
  NovaConfiguracaoMesaEvento,
} from '../../application/ports/configuracao-mesa-evento-repository.port';
import { ConfiguracaoMesaEvento } from '../../domain/configuracao-mesa-evento.entity';
import { ConfiguracaoMesaEventoOrmEntity } from './configuracao-mesa-evento.orm-entity';

@Injectable()
export class TypeOrmConfiguracaoMesaEventoRepositoryAdapter extends ConfiguracaoMesaEventoRepositoryPort {
  constructor(
    @InjectRepository(ConfiguracaoMesaEventoOrmEntity)
    private readonly repo: Repository<ConfiguracaoMesaEventoOrmEntity>,
  ) {
    super();
  }

  async substituirConfiguracoesDoEvento(
    eventoId: string,
    configuracoes: NovaConfiguracaoMesaEvento[],
  ): Promise<ConfiguracaoMesaEvento[]> {
    await this.repo.delete({ eventoId });
    const criadas = await this.repo.save(
      configuracoes.map((c) =>
        this.repo.create({ ...c, preco: String(c.preco) }),
      ),
    );
    return criadas.map((c) => this.paraDominio(c));
  }

  async listarPorEvento(eventoId: string): Promise<ConfiguracaoMesaEvento[]> {
    const encontradas = await this.repo.find({ where: { eventoId } });
    return encontradas.map((c) => this.paraDominio(c));
  }

  private paraDominio(
    orm: ConfiguracaoMesaEventoOrmEntity,
  ): ConfiguracaoMesaEvento {
    return new ConfiguracaoMesaEvento(
      orm.id,
      orm.eventoId,
      orm.mesaId,
      Number(orm.preco),
      orm.bloqueada,
    );
  }
}
