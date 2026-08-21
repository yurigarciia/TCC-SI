export abstract class PasswordHasherPort {
  abstract comparar(senhaTextoPlano: string, hash: string): Promise<boolean>;
  abstract hash(senhaTextoPlano: string): Promise<string>;
}
