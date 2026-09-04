import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConfiguracaoIngressoEventoRepositoryPort,
  DadosConfiguracaoIngressoEvento,
} from '../../application/ports/configuracao-ingresso-evento-repository.port';
import { ConfiguracaoIngressoEvento } from '../../domain/configuracao-ingresso-evento.entity';
import { ConfiguracaoIngressoEventoOrmEntity } from './configuracao-ingresso-evento.orm-entity';

@Injectable()
export class TypeOrmConfiguracaoIngressoEventoRepositoryAdapter extends ConfiguracaoIngressoEventoRepositoryPort {
  constructor(
    @InjectRepository(ConfiguracaoIngressoEventoOrmEntity)
    private readonly repo: Repository<ConfiguracaoIngressoEventoOrmEntity>,
  ) {
    super();
  }

  async definirParaEvento(
    dados: DadosConfiguracaoIngressoEvento,
  ): Promise<ConfiguracaoIngressoEvento> {
    const existente = await this.repo.findOneBy({ eventoId: dados.eventoId });
    const salvo = await this.repo.save(
      this.repo.create({
        ...(existente ? { id: existente.id } : {}),
        eventoId: dados.eventoId,
        quantidadeDisponivel: dados.quantidadeDisponivel,
      }),
    );
    return this.paraDominio(salvo);
  }

  async buscarPorEvento(
    eventoId: string,
  ): Promise<ConfiguracaoIngressoEvento | null> {
    const encontrada = await this.repo.findOneBy({ eventoId });
    return encontrada ? this.paraDominio(encontrada) : null;
  }

  private paraDominio(
    orm: ConfiguracaoIngressoEventoOrmEntity,
  ): ConfiguracaoIngressoEvento {
    return new ConfiguracaoIngressoEvento(
      orm.id,
      orm.eventoId,
      orm.quantidadeDisponivel,
    );
  }
}
