import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriaSocioRepositoryPort } from '../ports/categoria-socio-repository.port';

// Achado numa conversa com o usuário: categoria de sócio podia ser criada mas nunca editada ou
// excluída — mesmo padrão de "exclusão com checagem de uso" de RemoverMesaUseCase. A FK de
// associados.categoria_socio_id é ON DELETE SET NULL (não quebraria o banco), mas
// semanticamente seria perder a categoria de associados ativos sem aviso — por isso a exclusão
// é bloqueada enquanto houver qualquer associado vinculado.
@Injectable()
export class ExcluirCategoriaSocioUseCase {
  constructor(
    @Inject(CategoriaSocioRepositoryPort)
    private readonly categorias: CategoriaSocioRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existente = await this.categorias.buscarPorId(id);
    if (!existente) {
      throw new NotFoundException('Categoria de sócio não encontrada');
    }

    const vinculados = await this.categorias.contarAssociadosVinculados(id);
    if (vinculados > 0) {
      throw new ConflictException(
        `Esta categoria está vinculada a ${vinculados} associado(s) e não pode ser excluída`,
      );
    }

    await this.categorias.excluir(id);
  }
}
