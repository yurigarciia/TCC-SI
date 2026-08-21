import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import {
  AtualizacaoReserva,
  MesaJaReservadaError,
  NovaReserva,
  ReservaRepositoryPort,
} from '../../application/ports/reserva-repository.port';
import { Reserva, StatusReserva } from '../../domain/reserva.entity';
import { ReservaOrmEntity } from './reserva.orm-entity';

const CODIGO_VIOLACAO_UNICIDADE_POSTGRES = '23505';

@Injectable()
export class TypeOrmReservaRepositoryAdapter extends ReservaRepositoryPort {
  constructor(
    @InjectRepository(ReservaOrmEntity)
    private readonly repo: Repository<ReservaOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovaReserva): Promise<Reserva> {
    try {
      const criada = await this.repo.save(this.repo.create(dados));
      return this.paraDominio(criada);
    } catch (erro) {
      if (
        erro instanceof QueryFailedError &&
        (erro as unknown as { code?: string }).code ===
          CODIGO_VIOLACAO_UNICIDADE_POSTGRES
      ) {
        throw new MesaJaReservadaError();
      }
      throw erro;
    }
  }

  async buscarPorId(id: string): Promise<Reserva | null> {
    const encontrada = await this.repo.findOneBy({ id });
    return encontrada ? this.paraDominio(encontrada) : null;
  }

  async listarAtivasPorEvento(eventoId: string): Promise<Reserva[]> {
    const encontradas = await this.repo.find({
      where: [
        { eventoId, status: StatusReserva.PENDENTE },
        { eventoId, status: StatusReserva.CONFIRMADA },
      ],
    });
    return encontradas.map((reserva) => this.paraDominio(reserva));
  }

  async listarPorAssociado(associadoId: string): Promise<Reserva[]> {
    const encontradas = await this.repo.find({
      where: { associadoId },
      order: { criadoEm: 'DESC' },
    });
    return encontradas.map((reserva) => this.paraDominio(reserva));
  }

  async atualizar(id: string, dados: AtualizacaoReserva): Promise<Reserva> {
    await this.repo.update({ id }, dados);
    const atualizada = await this.repo.findOneByOrFail({ id });
    return this.paraDominio(atualizada);
  }

  private paraDominio(orm: ReservaOrmEntity): Reserva {
    return new Reserva(
      orm.id,
      orm.eventoId,
      orm.mesaId,
      orm.canal,
      orm.formaPagamento,
      orm.status,
      orm.pagamentoExternoId,
      orm.nomeTitular,
      orm.associadoId,
    );
  }
}
