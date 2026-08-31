import {
  CanalIngresso,
  FormaPagamentoIngresso,
  Ingresso,
  PerfilComprador,
  StatusIngresso,
} from '../../domain/ingresso.entity';

export interface NovoIngresso {
  eventoId: string;
  nomeComprador: string;
  perfilComprador: PerfilComprador;
  preco: number;
  canal: CanalIngresso;
  formaPagamento: FormaPagamentoIngresso;
  pagamentoExternoId: string | null;
  status: StatusIngresso;
}

export interface AtualizacaoIngresso {
  status?: StatusIngresso;
  usadoEm?: Date | null;
}

export abstract class IngressoRepositoryPort {
  abstract salvar(dados: NovoIngresso): Promise<Ingresso>;
  abstract buscarPorId(id: string): Promise<Ingresso | null>;
  abstract contarPorEvento(eventoId: string): Promise<number>;
  abstract listarPaginadoPorEvento(
    eventoId: string,
    pagina: number,
    limite: number,
    nome?: string,
  ): Promise<{ itens: Ingresso[]; total: number }>;
  abstract atualizar(id: string, dados: AtualizacaoIngresso): Promise<Ingresso>;
}
