import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identidade/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '../../../../identidade/infrastructure/security/roles.guard';
import { Roles } from '../../../../identidade/infrastructure/security/roles.decorator';
import { CurrentUser } from '../../../../identidade/infrastructure/security/current-user.decorator';
import { Perfil } from '../../../../identidade/domain/usuario.entity';
import type { JwtPayload } from '../../../../identidade/infrastructure/security/jwt.strategy';
import { RegistrarPushTokenUseCase } from '../../application/use-cases/registrar-push-token.use-case';
import { RegistrarPushTokenDto } from './dto/registrar-push-token.dto';

// T-MOB-005 — registro do token de push (Expo) do device do associado. Só associado por ora: é
// o único canal com app hoje (o painel web da diretoria não usa push).
@ApiTags('notificacoes')
@ApiBearerAuth()
@Controller('notificacoes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Perfil.ASSOCIADO)
export class NotificacoesController {
  constructor(private readonly registrarPushToken: RegistrarPushTokenUseCase) {}

  @Post('push-token')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Registra o token de push (Expo) do device do associado autenticado (idempotente)',
  })
  @ApiResponse({ status: 204, description: 'Token registrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é associado',
  })
  registrar(
    @CurrentUser() usuario: JwtPayload,
    @Body() dto: RegistrarPushTokenDto,
  ) {
    return this.registrarPushToken.execute(usuario.sub, dto.token);
  }
}
