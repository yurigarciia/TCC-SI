import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  AtualizacaoIngresso,
  IngressoRepositoryPort,
  NovoIngresso,
  ResumoIngressosEvento,
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

  async listarPaginadoPorEvento(
    eventoId: string,
    pagina: number,
    limite: number,
    nome?: string,
  ): Promise<{ itens: Ingresso[]; total: number }> {
    const [encontrados, total] = await this.repo.findAndCount({
      where: nome
        ? { eventoId, nomeComprador: ILike(`%${nome}%`) }
        : { eventoId },
      order: { criadoEm: 'DESC' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return {
      itens: encontrados.map((ingresso) => this.paraDominio(ingresso)),
      total,
    };
  }

  async atualizar(id: string, dados: AtualizacaoIngresso): Promise<Ingresso> {
    await this.repo.update({ id }, dados);
    const atualizado = await this.repo.findOneByOrFail({ id });
    return this.paraDominio(atualizado);
  }

  async resumoPorEvento(eventoId: string): Promise<ResumoIngressosEvento> {
    const [linha] = await this.repo.manager.query<
      Array<{
        total_emitidos: string;
        total_usados: string;
        total_pendentes: string;
        receita_total: string;
      }>
    >(
      `SELECT
         COUNT(*) AS total_emitidos,
         COUNT(*) FILTER (WHERE status = 'usado') AS total_usados,
         COUNT(*) FILTER (WHERE status = 'emitido') AS total_pendentes,
         COALESCE(SUM(preco), 0) AS receita_total
       FROM ingressos
       WHERE evento_id = $1`,
      [eventoId],
    );
    return {
      totalEmitidos: Number(linha?.total_emitidos ?? 0),
      totalUsados: Number(linha?.total_usados ?? 0),
      totalPendentes: Number(linha?.total_pendentes ?? 0),
      receitaTotal: Number(linha?.receita_total ?? 0),
    };
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
