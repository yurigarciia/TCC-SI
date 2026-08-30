import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CheckHealthUseCase } from '../../application/use-cases/check-health.use-case';
import type { HealthStatus } from '../../application/use-cases/check-health.use-case';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly checkHealth: CheckHealthUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Verifica se a API está no ar (health check)' })
  @ApiResponse({ status: 200, description: 'API operacional' })
  check(): HealthStatus {
    return this.checkHealth.execute();
  }
}
