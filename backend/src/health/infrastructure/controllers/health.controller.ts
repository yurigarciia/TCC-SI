import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CheckHealthUseCase } from '../../application/use-cases/check-health.use-case';
import type { HealthStatus } from '../../application/use-cases/check-health.use-case';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly checkHealth: CheckHealthUseCase) {}

  @Get()
  check(): HealthStatus {
    return this.checkHealth.execute();
  }
}
