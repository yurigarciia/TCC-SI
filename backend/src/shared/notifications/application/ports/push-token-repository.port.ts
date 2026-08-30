// Um usuário pode ter mais de um device registrado (troca de celular sem deslogar do antigo) —
// por isso "salvar" é um upsert por (usuarioId, token), nunca substitui os tokens anteriores.
export abstract class PushTokenRepositoryPort {
  abstract salvar(usuarioId: string, token: string): Promise<void>;
  abstract listarTokensPorUsuarioId(usuarioId: string): Promise<string[]>;
  abstract remover(usuarioId: string, token: string): Promise<void>;
}
