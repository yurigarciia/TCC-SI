import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PrecoIngressoRepositoryPort } from '../../application/ports/preco-ingresso-repository.port';
import { PerfilComprador } from '../../domain/ingresso.entity';
import { PrecoIngresso } from '../../domain/preco-ingresso.entity';
import { PrecoIngressoOrmEntity } from './preco-ingresso.orm-entity';

@Injectable()
export class TypeOrmPrecoIngressoRepositoryAdapter extends PrecoIngressoRepositoryPort {
  constructor(
    @InjectRepository(PrecoIngressoOrmEntity)
    private readonly repo: Repository<PrecoIngressoOrmEntity>,
  ) {
    super();
  }

  async definirPadrao(
    perfil: PerfilComprador,
    preco: number,
  ): Promise<PrecoIngresso> {
    return this.upsert(null, perfil, preco);
  }

  async definirPorEvento(
    eventoId: string,
    perfil: PerfilComprador,
    preco: number,
  ): Promise<PrecoIngresso> {
    return this.upsert(eventoId, perfil, preco);
  }

  async resolverPreco(
    eventoId: string,
    perfil: PerfilComprador,
  ): Promise<number | null> {
    const override = await this.repo.findOneBy({ eventoId, perfil });
    if (override) {
      return Number(override.preco);
    }
    const padrao = await this.repo.findOneBy({ eventoId: IsNull(), perfil });
    return padrao ? Number(padrao.preco) : null;
  }

  private async upsert(
    eventoId: string | null,
    perfil: PerfilComprador,
    preco: number,
  ): Promise<PrecoIngresso> {
    const existente = await this.repo.findOneBy({
      eventoId: eventoId ?? IsNull(),
      perfil,
    });
    const salvo = await this.repo.save(
      this.repo.create({
        ...(existente ? { id: existente.id } : {}),
        eventoId,
        perfil,
        preco: String(preco),
      }),
    );
    return this.paraDominio(salvo);
  }

  private paraDominio(orm: PrecoIngressoOrmEntity): PrecoIngresso {
    return new PrecoIngresso(
      orm.id,
      orm.eventoId,
      orm.perfil,
      Number(orm.preco),
    );
  }
}
