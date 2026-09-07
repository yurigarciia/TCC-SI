import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ElementoEstruturalRepositoryPort } from '../ports/elemento-estrutural-repository.port';

// Sem restrição de "em uso" igual mesa — parede/porta é só desenho, não é referenciada por
// reserva nem configuração de evento nenhuma.
@Injectable()
export class RemoverElementoEstruturalUseCase {
  constructor(
    @Inject(ElementoEstruturalRepositoryPort)
    private readonly elementos: ElementoEstruturalRepositoryPort,
  ) {}

  async execute(salaoId: string, elementoId: string): Promise<void> {
    const elemento = await this.elementos.buscarPorId(elementoId);
    if (!elemento || elemento.salaoId !== salaoId) {
      throw new NotFoundException('Elemento não encontrado');
    }

    await this.elementos.remover(elementoId);
  }
}
