import { Module } from '@nestjs/common';
import { ClockPort } from './application/ports/clock.port';
import { CheckHealthUseCase } from './application/use-cases/check-health.use-case';
import { SystemClockAdapter } from './infrastructure/adapters/system-clock.adapter';
import { HealthController } from './infrastructure/controllers/health.controller';

@Module({
  controllers: [HealthController],
  providers: [
    CheckHealthUseCase,
    { provide: ClockPort, useClass: SystemClockAdapter },
  ],
})
export class HealthModule {}
