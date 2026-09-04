export enum Perfil {
  ADMINISTRADOR = 'administrador',
  ASSOCIADO = 'associado',
}

export class Usuario {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly senhaHash: string,
    public readonly perfil: Perfil,
    // Nullable — só é exigido pra contas de administrador (ver CriarAdministradorDto). Contas de
    // associado ainda não passam nome aqui; quem tem nome de associado é a entidade Associado.
    public readonly nome: string | null = null,
  ) {}
}
