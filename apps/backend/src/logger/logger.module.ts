import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Setting } from '../settings/settings.entity';
import { LoggerService } from './logger.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
