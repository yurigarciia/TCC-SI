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
  ) {}
}
