import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from './roles.decorator';
import { Perfil } from '../../domain/usuario.entity';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfisPermitidos = this.reflector.getAllAndOverride<Perfil[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!perfisPermitidos || perfisPermitidos.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    return !!request.user && perfisPermitidos.includes(request.user.perfil);
  }
}
