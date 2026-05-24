import { Controller, Get } from '@nestjs/common';
import { Public } from '@app/common';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
