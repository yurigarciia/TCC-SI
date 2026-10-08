import { Inject, Injectable } from '@nestjs/common';
import { MensalidadeRepositoryPort } from '../ports/mensalidade-repository.port';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { CategoriaSocioRepositoryPort } from '../../../associados/application/ports/categoria-socio-repository.port';
import { StatusAssociado } from '../../../associados/domain/associado.entity';
import {
  Mensalidade,
  StatusMensalidade,
} from '../../domain/mensalidade.entity';

const DIA_VENCIMENTO = 10;

@Injectable()
export class GerarCobrancasMensaisUseCase {
  constructor(
    @Inject(MensalidadeRepositoryPort)
    private readonly mensalidades: MensalidadeRepositoryPort,
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(CategoriaSocioRepositoryPort)
    private readonly categorias: CategoriaSocioRepositoryPort,
  ) {}

  // Gera a cobrança do mês corrente para cada associado ativo com categoria de sócio definida,
  // pulando quem já tem cobrança para a competência (idempotente — pode ser chamado mais de uma
  // vez com segurança). Segue cadastro-associado.json / mensalidade.json: valor vem da categoria.
  // Categoria isenta (ex.: benemérito, honorário) nunca gera cobrança — nem de valor zero.
  async execute(referencia: Date = new Date()): Promise<Mensalidade[]> {
    const todosAssociados = await this.associados.listarTodos();
    const associadosAtivos = todosAssociados.filter(
      (associado) =>
        associado.status === StatusAssociado.ATIVO &&
        associado.categoriaSocioId,
    );

    const geradas: Mensalidade[] = [];
    for (const associado of associadosAtivos) {
      const gerada = await this.gerarParaAssociado(associado.id, referencia);
      if (gerada) {
        geradas.push(gerada);
      }
    }

    return geradas;
  }

  // Mesma regra de `execute`, mas para um único associado — usado na aprovação de cadastro
  // (RF04), pra que o recém-aprovado já saia com a mensalidade do mês em vigor pendente, em vez
  // de esperar o próximo disparo do cron mensal. Retorna null quando não há nada a gerar
  // (associado não ativo/sem categoria, categoria isenta, ou já existe cobrança da competência).
  async gerarParaAssociado(
    associadoId: string,
    referencia: Date = new Date(),
  ): Promise<Mensalidade | null> {
    const associado = await this.associados.buscarPorId(associadoId);
    if (
      !associado ||
      associado.status !== StatusAssociado.ATIVO ||
      !associado.categoriaSocioId
    ) {
      return null;
    }

    const competencia = `${referencia.getFullYear()}-${String(referencia.getMonth() + 1).padStart(2, '0')}`;
    const jaExiste = await this.mensalidades.existeParaCompetencia(
      associado.id,
      competencia,
    );
    if (jaExiste) {
      return null;
    }

    const categoria = await this.categorias.buscarPorId(
      associado.categoriaSocioId,
    );
    if (!categoria || categoria.isenta) {
      return null;
    }

    const vencimento = new Date(
      referencia.getFullYear(),
      referencia.getMonth(),
      DIA_VENCIMENTO,
    )
      .toISOString()
      .slice(0, 10);

    return this.mensalidades.salvar({
      associadoId: associado.id,
      competencia,
      valor: categoria.valorMensalidade,
      vencimento,
      status: StatusMensalidade.PENDENTE,
    });
  }
}
