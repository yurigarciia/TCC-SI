import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  AtualizacaoCategoriaSocio,
  CategoriaSocioRepositoryPort,
  NovaCategoriaSocio,
} from '../../application/ports/categoria-socio-repository.port';
import { CategoriaSocio } from '../../domain/categoria-socio.entity';
import { CategoriaSocioOrmEntity } from './categoria-socio.orm-entity';
import { AssociadoOrmEntity } from './associado.orm-entity';

@Injectable()
export class TypeOrmCategoriaSocioRepositoryAdapter extends CategoriaSocioRepositoryPort {
  constructor(
    @InjectRepository(CategoriaSocioOrmEntity)
    private readonly repo: Repository<CategoriaSocioOrmEntity>,
    @InjectRepository(AssociadoOrmEntity)
    private readonly associadosRepo: Repository<AssociadoOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovaCategoriaSocio): Promise<CategoriaSocio> {
    const criado = await this.repo.save(
      this.repo.create({
        nome: dados.nome,
        valorMensalidade: String(dados.valorMensalidade),
        isenta: dados.isenta,
      }),
    );
    return this.paraDominio(criado);
  }

  async buscarPorId(id: string): Promise<CategoriaSocio | null> {
    const encontrado = await this.repo.findOneBy({ id });
    return encontrado ? this.paraDominio(encontrado) : null;
  }

  async listarPaginado(
    pagina: number,
    limite: number,
    busca?: string,
  ): Promise<{ itens: CategoriaSocio[]; total: number }> {
    const [encontradas, total] = await this.repo.findAndCount({
      where: busca ? { nome: ILike(`%${busca}%`) } : undefined,
      order: { nome: 'ASC' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return {
      itens: encontradas.map((categoria) => this.paraDominio(categoria)),
      total,
    };
  }

  async atualizar(
    id: string,
    dados: AtualizacaoCategoriaSocio,
  ): Promise<CategoriaSocio> {
    const encontrada = await this.repo.findOneBy({ id });
    if (!encontrada) {
      throw new NotFoundException('Categoria de sócio não encontrada');
    }
    if (dados.nome !== undefined) {
      encontrada.nome = dados.nome;
    }
    if (dados.isenta !== undefined) {
      encontrada.isenta = dados.isenta;
    }
    if (dados.ativa !== undefined) {
      encontrada.ativa = dados.ativa;
    }
    if (dados.valorMensalidade !== undefined) {
      encontrada.valorMensalidade = String(dados.valorMensalidade);
    }
    if (encontrada.isenta) {
      encontrada.valorMensalidade = '0';
    }
    const salva = await this.repo.save(encontrada);
    return this.paraDominio(salva);
  }

  async excluir(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async contarAssociadosVinculados(categoriaId: string): Promise<number> {
    return this.associadosRepo.count({
      where: { categoriaSocioId: categoriaId },
    });
  }

  private paraDominio(orm: CategoriaSocioOrmEntity): CategoriaSocio {
    return new CategoriaSocio(
      orm.id,
      orm.nome,
      Number(orm.valorMensalidade),
      orm.ativa,
      orm.isenta,
    );
  }
}
