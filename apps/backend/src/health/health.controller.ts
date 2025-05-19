import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { IApi, ROUTES } from '@vera-reforged/common';

import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';

const { prefix } = ROUTES.health;

@Controller(prefix)
export class HealthController {
  private readonly logger: DebugService;

  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    @Inject(LoggerService) loggerService: LoggerService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);
  }

  @Get()
  @HealthCheck()
  public async check(): Promise<IApi.IHealthApi.GetHealthResponse> {
    this.logger.debug('Health check run');

    const result = await this.health.check([
      () => this.db.pingCheck(this.config.get('dbName')),
      () => this.memory.checkHeap('memory_heap', 501 * 1024 * 1024),
    ]);

    this.logger.debug(JSON.stringify(result));

    return result;
  }
}
