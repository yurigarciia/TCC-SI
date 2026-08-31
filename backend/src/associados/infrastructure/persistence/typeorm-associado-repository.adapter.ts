import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  AssociadoRepositoryPort,
  AtualizacaoAssociado,
  NovoAssociado,
} from '../../application/ports/associado-repository.port';
import { Associado } from '../../domain/associado.entity';
import { AssociadoOrmEntity } from './associado.orm-entity';

@Injectable()
export class TypeOrmAssociadoRepositoryAdapter extends AssociadoRepositoryPort {
  constructor(
    @InjectRepository(AssociadoOrmEntity)
    private readonly repo: Repository<AssociadoOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovoAssociado): Promise<Associado> {
    const criado = await this.repo.save(this.repo.create(dados));
    return this.paraDominio(criado);
  }

  async buscarPorId(id: string): Promise<Associado | null> {
    const encontrado = await this.repo.findOneBy({ id });
    return encontrado ? this.paraDominio(encontrado) : null;
  }

  async buscarPorCpf(cpf: string): Promise<Associado | null> {
    const encontrado = await this.repo.findOneBy({ cpf });
    return encontrado ? this.paraDominio(encontrado) : null;
  }

  async buscarPorUsuarioId(usuarioId: string): Promise<Associado | null> {
    const encontrado = await this.repo.findOneBy({ usuarioId });
    return encontrado ? this.paraDominio(encontrado) : null;
  }

  async listarTodos(): Promise<Associado[]> {
    const encontrados = await this.repo.find({ order: { criadoEm: 'DESC' } });
    return encontrados.map((associado) => this.paraDominio(associado));
  }

  async listarPaginado(
    pagina: number,
    limite: number,
    busca?: string,
  ): Promise<{ itens: Associado[]; total: number }> {
    const [encontrados, total] = await this.repo.findAndCount({
      where: busca
        ? [{ nome: ILike(`%${busca}%`) }, { cpf: ILike(`%${busca}%`) }]
        : undefined,
      order: { criadoEm: 'DESC' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return { itens: encontrados.map((a) => this.paraDominio(a)), total };
  }

  async atualizar(id: string, dados: AtualizacaoAssociado): Promise<Associado> {
    await this.repo.update({ id }, dados);
    const atualizado = await this.repo.findOneByOrFail({ id });
    return this.paraDominio(atualizado);
  }

  private paraDominio(orm: AssociadoOrmEntity): Associado {
    return new Associado(
      orm.id,
      orm.nome,
      orm.cpf,
      orm.contato,
      orm.vinculoInstitucional,
      orm.categoriaSocioId,
      orm.origem,
      orm.status,
      orm.usuarioId,
    );
  }
}
