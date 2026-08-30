import { Inject, Injectable } from '@nestjs/common';
import { PushTokenRepositoryPort } from '../ports/push-token-repository.port';

// Chamado pelo app assim que o expo-notifications resolve o token do device (após o associado
// conceder permissão) — ver T-MOB-005. Idempotente: registrar o mesmo token de novo não duplica.
@Injectable()
export class RegistrarPushTokenUseCase {
  constructor(
    @Inject(PushTokenRepositoryPort)
    private readonly pushTokens: PushTokenRepositoryPort,
  ) {}

  async execute(usuarioId: string, token: string): Promise<void> {
    await this.pushTokens.salvar(usuarioId, token);
  }
}
