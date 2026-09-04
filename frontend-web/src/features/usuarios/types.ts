export type Perfil = "administrador" | "associado";

export interface Usuario {
  id: string;
  // null pra contas de associado (ainda não passam nome no Usuario — quem tem nome é a entidade
  // Associado). Sempre preenchido pra administrador.
  nome: string | null;
  email: string;
  perfil: Perfil;
}

export interface CriarAdministradorInput {
  nome: string;
  email: string;
  senha: string;
}
