import { Injectable } from '@nestjs/common';
import { ClockPort } from '../../application/ports/clock.port';

@Injectable()
export class SystemClockAdapter extends ClockPort {
  uptimeSeconds(): number {
    return process.uptime();
  }
}
