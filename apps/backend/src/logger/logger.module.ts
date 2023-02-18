import { Module } from '@nestjs/common';

import { BotModule } from '../bot/bot.module';
import { LoggerService } from './logger.service';

@Module({
  imports: [BotModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
