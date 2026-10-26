export type PerfilComprador = "socio" | "nao_socio" | "crianca";
export type CanalIngresso = "app" | "mediado";
export type FormaPagamentoIngresso = "online" | "presencial";
export type StatusIngresso = "emitido" | "usado";

export interface Ingresso {
  id: string;
  eventoId: string;
  // Contador sequencial por evento (1, 2, 3...) — identificador curto e legível, diferente do
  // `id` (UUID), que não serve pra diferenciar ingressos na listagem a olho/na fala.
  codigo: number;
  nomeComprador: string;
  perfilComprador: PerfilComprador;
  preco: number;
  canal: CanalIngresso;
  formaPagamento: FormaPagamentoIngresso;
  pagamentoExternoId: string | null;
  status: StatusIngresso;
  usadoEm: string | null;
}

// Detalhe de um ingresso (tela de conferência do check-in por QR) — inclui o nome do evento e a
// categoria de sócio (quando aplicável), que a listagem paginada não traz.
export interface IngressoDetalhado {
  id: string;
  codigo: number;
  nomeComprador: string;
  perfilComprador: PerfilComprador;
  preco: number;
  status: StatusIngresso;
  usadoEm: string | null;
  evento: { id: string; nome: string } | null;
  categoriaSocioNome: string | null;
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
