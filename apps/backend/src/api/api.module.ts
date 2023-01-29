import { Module } from '@nestjs/common';

import { BotModule } from '../bot/bot.module';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  imports: [BotModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
