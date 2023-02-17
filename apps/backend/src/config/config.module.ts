import { Module } from '@nestjs/common';

import { LoggerModule } from '../logger/logger.module';
import { ConfigService } from './config.service';

@Module({
  imports: [LoggerModule],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
