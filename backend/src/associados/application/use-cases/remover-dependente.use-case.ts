import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DependenteRepositoryPort } from '../ports/dependente-repository.port';

// Achado numa conversa com o usuário: dependente podia ser adicionado mas nunca editado nem
// removido pelo painel — único jeito de "desfazer" era direto no banco. Confere posse
// (dependente pertence mesmo ao associado da rota) antes de alterar/excluir, nunca confiando só
// no id do dependente vindo do cliente.
@Injectable()
export class RemoverDependenteUseCase {
  constructor(
    @Inject(DependenteRepositoryPort)
    private readonly dependentes: DependenteRepositoryPort,
  ) {}

  async execute(associadoId: string, dependenteId: string): Promise<void> {
    const existente = await this.dependentes.buscarPorId(dependenteId);
    if (!existente || existente.associadoId !== associadoId) {
      throw new NotFoundException(
        'Dependente não encontrado para este associado',
      );
    }
    await this.dependentes.excluir(dependenteId);
  }
}
