export interface LoginInput {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface EnderecoInput {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface AutoCadastroInput {
  nome: string;
  cpf: string;
  telefone: string;
  endereco: EnderecoInput;
  email: string;
  senha: string;
}

export interface VincularContaInput {
  cpf: string;
  email: string;
  senha: string;
}

export type OrigemCadastro = "auto_cadastro" | "mediado";
export type StatusAssociado = "pendente_validacao" | "ativo" | "rejeitado";

export interface Associado {
  id: string;
  nome: string;
  cpf: string;
  email: string | null;
  telefone: string | null;
  vinculoInstitucional: string | null;
  categoriaSocioId: string | null;
  origem: OrigemCadastro;
  status: StatusAssociado;
  usuarioId: string | null;
}
