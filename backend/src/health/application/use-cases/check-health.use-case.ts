import { Inject, Injectable } from '@nestjs/common';
import { ClockPort } from '../ports/clock.port';

export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
}

@Injectable()
export class CheckHealthUseCase {
  constructor(@Inject(ClockPort) private readonly clock: ClockPort) {}

  execute(): HealthStatus {
    return { status: 'ok', uptimeSeconds: this.clock.uptimeSeconds() };
  }
}
