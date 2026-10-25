import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import {
  AtualizacaoMensalidade,
  MensalidadeRepositoryPort,
  NovaMensalidade,
} from '../../application/ports/mensalidade-repository.port';
import {
  Mensalidade,
  StatusMensalidade,
} from '../../domain/mensalidade.entity';
import { MensalidadeOrmEntity } from './mensalidade.orm-entity';

@Injectable()
export class TypeOrmMensalidadeRepositoryAdapter extends MensalidadeRepositoryPort {
  constructor(
    @InjectRepository(MensalidadeOrmEntity)
    private readonly repo: Repository<MensalidadeOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovaMensalidade): Promise<Mensalidade> {
    const criada = await this.repo.save(
      this.repo.create({ ...dados, valor: String(dados.valor) }),
    );
    return this.paraDominio(criada);
  }

  async salvarVarias(dados: NovaMensalidade[]): Promise<Mensalidade[]> {
    if (dados.length === 0) {
      return [];
    }
    const criadas = await this.repo.save(
      dados.map((item) =>
        this.repo.create({ ...item, valor: String(item.valor) }),
      ),
    );
    return criadas.map((criada) => this.paraDominio(criada));
  }

  async buscarPorId(id: string): Promise<Mensalidade | null> {
    const encontrada = await this.repo.findOneBy({ id });
    return encontrada ? this.paraDominio(encontrada) : null;
  }

  async existeParaCompetencia(
    associadoId: string,
    competencia: string,
  ): Promise<boolean> {
    const encontrada = await this.repo.findOneBy({ associadoId, competencia });
    return !!encontrada;
  }

  async listarAssociadosComCobrancaNaCompetencia(
    associadoIds: string[],
    competencia: string,
  ): Promise<Set<string>> {
    if (associadoIds.length === 0) {
      return new Set();
    }
    const encontradas = await this.repo.find({
      where: { associadoId: In(associadoIds), competencia },
      select: { associadoId: true },
    });
    return new Set(encontradas.map((mensalidade) => mensalidade.associadoId));
  }

  async listarPorAssociado(associadoId: string): Promise<Mensalidade[]> {
    const encontradas = await this.repo.find({
      where: { associadoId },
      order: { competencia: 'DESC' },
    });
    return encontradas.map((mensalidade) => this.paraDominio(mensalidade));
  }

  async listarPorStatus(status: StatusMensalidade): Promise<Mensalidade[]> {
    const encontradas = await this.repo.find({ where: { status } });
    return encontradas.map((mensalidade) => this.paraDominio(mensalidade));
  }

  async listarPendentesVencidasAte(dataLimite: string): Promise<Mensalidade[]> {
    const encontradas = await this.repo.find({
      where: {
        status: StatusMensalidade.PENDENTE,
        vencimento: LessThanOrEqual(dataLimite),
      },
    });
    return encontradas.map((mensalidade) => this.paraDominio(mensalidade));
  }

  async atualizar(
    id: string,
    dados: AtualizacaoMensalidade,
  ): Promise<Mensalidade> {
    await this.repo.update({ id }, dados);
    const atualizada = await this.repo.findOneByOrFail({ id });
    return this.paraDominio(atualizada);
  }

  private paraDominio(orm: MensalidadeOrmEntity): Mensalidade {
    return new Mensalidade(
      orm.id,
      orm.associadoId,
      orm.competencia,
      Number(orm.valor),
      orm.vencimento,
      orm.status,
      orm.formaPagamento,
      orm.pagoEm,
      orm.pagamentoExternoId,
      orm.lembreteEnviadoEm,
    );
  }
}
