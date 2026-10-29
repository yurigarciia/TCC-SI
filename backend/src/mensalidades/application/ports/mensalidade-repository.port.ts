import {
  FormaPagamento,
  Mensalidade,
  StatusMensalidade,
} from '../../domain/mensalidade.entity';

export interface NovaMensalidade {
  associadoId: string;
  competencia: string;
  valor: number;
  vencimento: string;
  status: StatusMensalidade;
}

export interface AtualizacaoMensalidade {
  status?: StatusMensalidade;
  valor?: number;
  formaPagamento?: FormaPagamento | null;
  pagoEm?: Date | null;
  pagamentoExternoId?: string | null;
  lembreteEnviadoEm?: Date | null;
}

export abstract class MensalidadeRepositoryPort {
  abstract salvar(dados: NovaMensalidade): Promise<Mensalidade>;
  // Insere várias de uma vez (uma query), usado por GerarCobrancasMensaisUseCase.execute() pra
  // não fazer um INSERT sequencial por associado.
  abstract salvarVarias(dados: NovaMensalidade[]): Promise<Mensalidade[]>;
  abstract buscarPorId(id: string): Promise<Mensalidade | null>;
  abstract existeParaCompetencia(
    associadoId: string,
    competencia: string,
  ): Promise<boolean>;
  // Versão em lote de existeParaCompetencia — uma query pra descobrir, entre vários associados,
  // quais já têm mensalidade da competência informada. Usado por
  // GerarCobrancasMensaisUseCase.execute() pra não fazer uma query de existência por associado.
  abstract listarAssociadosComCobrancaNaCompetencia(
    associadoIds: string[],
    competencia: string,
  ): Promise<Set<string>>;
  abstract listarPorAssociado(associadoId: string): Promise<Mensalidade[]>;
  abstract listarPorStatus(status: StatusMensalidade): Promise<Mensalidade[]>;
  abstract listarPendentesVencidasAte(
    dataLimite: string,
  ): Promise<Mensalidade[]>;
  abstract atualizar(
    id: string,
    dados: AtualizacaoMensalidade,
  ): Promise<Mensalidade>;
}
