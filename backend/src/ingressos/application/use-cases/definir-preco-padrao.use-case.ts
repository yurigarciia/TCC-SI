import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrecoIngressoRepositoryPort } from '../ports/preco-ingresso-repository.port';
import { CategoriaSocioRepositoryPort } from '../../../associados/application/ports/categoria-socio-repository.port';
import { PerfilComprador } from '../../domain/ingresso.entity';
import { PrecoIngresso } from '../../domain/preco-ingresso.entity';

@Injectable()
export class DefinirPrecoPadraoUseCase {
  constructor(
    @Inject(PrecoIngressoRepositoryPort)
    private readonly precos: PrecoIngressoRepositoryPort,
    @Inject(CategoriaSocioRepositoryPort)
    private readonly categorias: CategoriaSocioRepositoryPort,
  ) {}

  // Preço de sócio varia por categoria (Contribuinte, Benemérito etc.) — categoriaSocioId é
  // obrigatório nesse caso, e ignorado (sempre null) pros demais perfis, que não têm categoria.
  async execute(
    perfil: PerfilComprador,
    preco: number,
    categoriaSocioId?: string,
  ): Promise<PrecoIngresso> {
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
      return this.precos.definirPadrao(perfil, preco, categoriaSocioId);
    }
    return this.precos.definirPadrao(perfil, preco, null);
  }
}
