import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PasswordHasherPort } from '../../application/ports/password-hasher.port';

@Injectable()
export class BcryptPasswordHasherAdapter extends PasswordHasherPort {
  comparar(senhaTextoPlano: string, hash: string): Promise<boolean> {
    return bcrypt.compare(senhaTextoPlano, hash);
  }

  hash(senhaTextoPlano: string): Promise<string> {
    return bcrypt.hash(senhaTextoPlano, 10);
  }
}
