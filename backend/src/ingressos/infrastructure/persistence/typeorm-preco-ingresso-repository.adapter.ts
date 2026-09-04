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
    categoriaSocioId: string | null,
  ): Promise<PrecoIngresso> {
    return this.upsert(null, perfil, categoriaSocioId, preco);
  }

  async definirPorEvento(
    eventoId: string,
    perfil: PerfilComprador,
    preco: number,
    categoriaSocioId: string | null,
  ): Promise<PrecoIngresso> {
    return this.upsert(eventoId, perfil, categoriaSocioId, preco);
  }

  async resolverPreco(
    eventoId: string,
    perfil: PerfilComprador,
    categoriaSocioId: string | null,
  ): Promise<number | null> {
    const override = await this.repo.findOneBy({
      eventoId,
      perfil,
      categoriaSocioId: categoriaSocioId ?? IsNull(),
    });
    if (override) {
      return Number(override.preco);
    }
    const padrao = await this.repo.findOneBy({
      eventoId: IsNull(),
      perfil,
      categoriaSocioId: categoriaSocioId ?? IsNull(),
    });
    return padrao ? Number(padrao.preco) : null;
  }

  private async upsert(
    eventoId: string | null,
    perfil: PerfilComprador,
    categoriaSocioId: string | null,
    preco: number,
  ): Promise<PrecoIngresso> {
    const existente = await this.repo.findOneBy({
      eventoId: eventoId ?? IsNull(),
      perfil,
      categoriaSocioId: categoriaSocioId ?? IsNull(),
    });
    const salvo = await this.repo.save(
      this.repo.create({
        ...(existente ? { id: existente.id } : {}),
        eventoId,
        perfil,
        categoriaSocioId,
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
      orm.categoriaSocioId,
      Number(orm.preco),
    );
  }
}
