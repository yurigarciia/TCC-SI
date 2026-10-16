import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AtualizacaoDependente,
  DependenteRepositoryPort,
  NovoDependente,
} from '../../application/ports/dependente-repository.port';
import { Dependente } from '../../domain/dependente.entity';
import { DependenteOrmEntity } from './dependente.orm-entity';

@Injectable()
export class TypeOrmDependenteRepositoryAdapter extends DependenteRepositoryPort {
  constructor(
    @InjectRepository(DependenteOrmEntity)
    private readonly repo: Repository<DependenteOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovoDependente): Promise<Dependente> {
    const criado = await this.repo.save(this.repo.create(dados));
    return this.paraDominio(criado);
  }

  async listarPorAssociado(associadoId: string): Promise<Dependente[]> {
    const encontrados = await this.repo.find({ where: { associadoId } });
    return encontrados.map((dependente) => this.paraDominio(dependente));
  }

  async buscarPorId(id: string): Promise<Dependente | null> {
    const encontrado = await this.repo.findOneBy({ id });
    return encontrado ? this.paraDominio(encontrado) : null;
  }

  async atualizar(
    id: string,
    dados: AtualizacaoDependente,
  ): Promise<Dependente> {
    const encontrado = await this.repo.findOneBy({ id });
    if (!encontrado) {
      throw new NotFoundException('Dependente não encontrado');
    }
    if (dados.nome !== undefined) {
      encontrado.nome = dados.nome;
    }
    if (dados.dataNascimento !== undefined) {
      encontrado.dataNascimento = dados.dataNascimento;
    }
    const salvo = await this.repo.save(encontrado);
    return this.paraDominio(salvo);
  }

  async excluir(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private paraDominio(orm: DependenteOrmEntity): Dependente {
    return new Dependente(
      orm.id,
      orm.associadoId,
      orm.nome,
      orm.dataNascimento,
    );
  }
}
