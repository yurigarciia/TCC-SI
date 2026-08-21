export type Perfil = "administrador" | "associado";

export interface LoginInput {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface UsuarioAutenticado {
  sub: string;
  email: string;
  perfil: Perfil;
}
