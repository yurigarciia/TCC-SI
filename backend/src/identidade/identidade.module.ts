import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioRepositoryPort } from './application/ports/usuario-repository.port';
import { PasswordHasherPort } from './application/ports/password-hasher.port';
import { AutenticarUsuarioUseCase } from './application/use-cases/autenticar-usuario.use-case';
import { ListarUsuariosUseCase } from './application/use-cases/listar-usuarios.use-case';
import { UsuarioOrmEntity } from './infrastructure/persistence/usuario.orm-entity';
import { TypeOrmUsuarioRepositoryAdapter } from './infrastructure/persistence/typeorm-usuario-repository.adapter';
import { BcryptPasswordHasherAdapter } from './infrastructure/security/bcrypt-password-hasher.adapter';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { AuthController } from './infrastructure/controllers/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioOrmEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ??
            '1d') as unknown as number,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AutenticarUsuarioUseCase,
    ListarUsuariosUseCase,
    JwtStrategy,
    {
      provide: UsuarioRepositoryPort,
      useClass: TypeOrmUsuarioRepositoryAdapter,
    },
    { provide: PasswordHasherPort, useClass: BcryptPasswordHasherAdapter },
  ],
  exports: [UsuarioRepositoryPort, PasswordHasherPort],
})
export class IdentidadeModule {}
