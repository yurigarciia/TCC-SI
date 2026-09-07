import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SalaoRepositoryPort } from '../ports/salao-repository.port';
import { ElementoEstruturalRepositoryPort } from '../ports/elemento-estrutural-repository.port';
import {
  ElementoEstrutural,
  TipoElementoEstrutural,
} from '../../domain/elemento-estrutural.entity';

export interface DadosNovoElementoEstrutural {
  tipo: TipoElementoEstrutural;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// RF10/croqui-salao.json ampliado numa conversa com o usuário: além de mesas, o croqui precisa
// mostrar parede/porta pra ficar reconhecível como o salão de verdade. Sem validação de
// sobreposição/geometria de propósito — é um traço livre, a entidade desenha do jeito que
// representa o espaço real, não precisa fechar um polígono nem nada assim.
@Injectable()
export class AdicionarElementoEstruturalUseCase {
  constructor(
    @Inject(SalaoRepositoryPort) private readonly saloes: SalaoRepositoryPort,
    @Inject(ElementoEstruturalRepositoryPort)
    private readonly elementos: ElementoEstruturalRepositoryPort,
  ) {}

  async execute(
    salaoId: string,
    dados: DadosNovoElementoEstrutural,
  ): Promise<ElementoEstrutural> {
    const salao = await this.saloes.buscarPorId(salaoId);
    if (!salao) {
      throw new NotFoundException('Salão não encontrado');
    }

    return this.elementos.salvar({ salaoId, ...dados });
  }
}
