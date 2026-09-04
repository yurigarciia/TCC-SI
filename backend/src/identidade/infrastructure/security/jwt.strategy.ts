import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Perfil } from '../../domain/usuario.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  perfil: Perfil;
  // Só preenchido pra administrador hoje — ver Usuario.nome. Nula pra associado (que ainda loga
  // sem nome no token).
  nome: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'change-me',
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
