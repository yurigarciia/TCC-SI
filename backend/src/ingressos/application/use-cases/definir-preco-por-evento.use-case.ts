import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrecoIngressoRepositoryPort } from '../ports/preco-ingresso-repository.port';
import { EventoRepositoryPort } from '../../../eventos/application/ports/evento-repository.port';
import { CategoriaSocioRepositoryPort } from '../../../associados/application/ports/categoria-socio-repository.port';
import { PerfilComprador } from '../../domain/ingresso.entity';
import { PrecoIngresso } from '../../domain/preco-ingresso.entity';

@Injectable()
export class DefinirPrecoPorEventoUseCase {
  constructor(
    @Inject(PrecoIngressoRepositoryPort)
    private readonly precos: PrecoIngressoRepositoryPort,
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(CategoriaSocioRepositoryPort)
    private readonly categorias: CategoriaSocioRepositoryPort,
  ) {}

  async execute(
    eventoId: string,
    perfil: PerfilComprador,
    preco: number,
    categoriaSocioId?: string,
  ): Promise<PrecoIngresso> {
    const evento = await this.eventos.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    if (perfil === PerfilComprador.SOCIO) {
      if (!categoriaSocioId) {
        throw new BadRequestException(
          'Informe a categoria de sócio pra definir o preço',
        );
      }
      const categoria = await this.categorias.buscarPorId(categoriaSocioId);
      if (!categoria) {
        throw new NotFoundException('Categoria de sócio não encontrada');
      }
      return this.precos.definirPorEvento(eventoId, perfil, preco, categoriaSocioId);
    }
    return this.precos.definirPorEvento(eventoId, perfil, preco, null);
  }
}
