import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ROUTES } from '@vera-reforged/common';

const { prefix } = ROUTES.health;

@Controller(prefix)
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck(this.config.get('dbName')),
      () => this.memory.checkHeap('memory_heap', 501 * 1024 * 1024),
    ]);
  }
}
