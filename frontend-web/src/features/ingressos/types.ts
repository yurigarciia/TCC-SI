export type PerfilComprador = "socio" | "nao_socio" | "crianca";
export type CanalIngresso = "app" | "mediado";
export type FormaPagamentoIngresso = "online" | "presencial";
export type StatusIngresso = "emitido" | "usado";

export interface Ingresso {
  id: string;
  eventoId: string;
  nomeComprador: string;
  perfilComprador: PerfilComprador;
  preco: number;
  canal: CanalIngresso;
  formaPagamento: FormaPagamentoIngresso;
  pagamentoExternoId: string | null;
  status: StatusIngresso;
  usadoEm: string | null;
}

// Números pra acompanhar o evento no dia — agregado no backend, cobre o evento inteiro, não só
// a página atual da listagem.
export interface ResumoIngressosEvento {
  totalEmitidos: number;
  totalUsados: number;
  totalPendentes: number;
  receitaTotal: number;
}

export interface EmitirIngressoInput {
  nomeComprador: string;
  perfilComprador: PerfilComprador;
  formaPagamento: FormaPagamentoIngresso;
  // Obrigatório quando perfilComprador = "socio" (preço varia por categoria de sócio).
  categoriaSocioId?: string;
  // Sobrescreve o preço resolvido por perfil/categoria — desconto, cortesia parcial, ou evento
  // sem preço configurado ainda pra esse perfil. Omitido = backend resolve como sempre.
  preco?: number;
}
