export type StatusAssociado = "pendente_validacao" | "ativo" | "rejeitado";
export type OrigemCadastro = "auto_cadastro" | "mediado";

export interface Associado {
  id: string;
  nome: string;
  cpf: string;
  contato: string;
  vinculoInstitucional: string | null;
  categoriaSocioId: string | null;
  origem: OrigemCadastro;
  status: StatusAssociado;
  usuarioId: string | null;
}

export interface Dependente {
  id: string;
  associadoId: string;
  nome: string;
  dataNascimento: string;
}

export interface AssociadoDetalhado {
  associado: Associado;
  dependentes: Dependente[];
}

export interface CategoriaSocio {
  id: string;
  nome: string;
  valorMensalidade: number;
  ativa: boolean;
}

export interface CadastrarAssociadoMediadoInput {
  nome: string;
  cpf: string;
  contato: string;
  vinculoInstitucional?: string;
  categoriaSocioId?: string;
  dependentes?: Array<{ nome: string; dataNascimento: string }>;
}

export interface AtualizarAssociadoInput {
  nome?: string;
  contato?: string;
  vinculoInstitucional?: string | null;
  categoriaSocioId?: string | null;
}
