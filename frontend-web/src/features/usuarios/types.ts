export type Perfil = "administrador" | "associado";

export interface Usuario {
  id: string;
  email: string;
  perfil: Perfil;
}

export interface CriarAdministradorInput {
  email: string;
  senha: string;
}
