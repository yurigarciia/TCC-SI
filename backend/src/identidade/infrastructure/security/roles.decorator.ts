import { SetMetadata } from '@nestjs/common';
import { Perfil } from '../../domain/usuario.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...perfis: Perfil[]) => SetMetadata(ROLES_KEY, perfis);
