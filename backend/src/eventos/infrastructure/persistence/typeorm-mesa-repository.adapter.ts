import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AtualizacaoMesa,
  MesaRepositoryPort,
  NovaMesa,
} from '../../application/ports/mesa-repository.port';
import { Mesa } from '../../domain/mesa.entity';
import { MesaOrmEntity } from './mesa.orm-entity';

@Injectable()
export class TypeOrmMesaRepositoryAdapter extends MesaRepositoryPort {
  constructor(
    @InjectRepository(MesaOrmEntity)
    private readonly repo: Repository<MesaOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovaMesa): Promise<Mesa> {
    const criada = await this.repo.save(this.repo.create(dados));
    return this.paraDominio(criada);
  }

  async buscarPorId(id: string): Promise<Mesa | null> {
    const encontrada = await this.repo.findOneBy({ id });
    return encontrada ? this.paraDominio(encontrada) : null;
  }

  async buscarPorSalaoENumero(
    salaoId: string,
    numero: number,
  ): Promise<Mesa | null> {
    const encontrada = await this.repo.findOneBy({ salaoId, numero });
    return encontrada ? this.paraDominio(encontrada) : null;
  }

  async listarPorSalao(salaoId: string): Promise<Mesa[]> {
    const encontradas = await this.repo.find({
      where: { salaoId },
      order: { numero: 'ASC' },
    });
    return encontradas.map((mesa) => this.paraDominio(mesa));
  }

  async atualizar(id: string, dados: AtualizacaoMesa): Promise<Mesa> {
    await this.repo.update(id, dados);
    const atualizada = await this.repo.findOneByOrFail({ id });
    return this.paraDominio(atualizada);
  }

  async remover(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // Consulta direta nas tabelas de reservas/config. de evento em vez de injetar
  // ReservaRepositoryPort/ConfiguracaoMesaEventoRepositoryPort aqui — o módulo `reservas` já
  // importa `eventos` (não o contrário), então injetar o repositório de reservas de volta neste
  // módulo criaria um ciclo. É só uma checagem de referência, não lógica de negócio de reserva.
  async estaEmUso(id: string): Promise<boolean> {
    const reservas = await this.repo.manager.query<Array<{ existe: boolean }>>(
      'SELECT EXISTS(SELECT 1 FROM reservas WHERE mesa_id = $1) AS existe',
      [id],
    );
    if (reservas[0]?.existe) return true;

    const configuracoes = await this.repo.manager.query<
      Array<{ existe: boolean }>
    >(
      'SELECT EXISTS(SELECT 1 FROM configuracoes_mesa_evento WHERE mesa_id = $1) AS existe',
      [id],
    );
    return !!configuracoes[0]?.existe;
  }

  private paraDominio(orm: MesaOrmEntity): Mesa {
    return new Mesa(
      orm.id,
      orm.salaoId,
      orm.numero,
      orm.capacidade,
      orm.posicaoX,
      orm.posicaoY,
    );
  }
}
