import { Controller, Get, HttpCode } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PublicRoute } from '@/modules/Auth/guards/jwt.guard';

@Controller('system_db')
@PublicRoute()
@SkipThrottle()
export class SystemDatabaseController {
  constructor() {}

  @Get()
  @HttpCode(200)
  ping() {
    return { status: 'ok' };
  }
}
