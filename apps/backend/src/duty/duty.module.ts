import { Module } from '@nestjs/common';

import { BotModule } from '../bot/bot.module';
import { DutyService } from './duty.service';

@Module({
  imports: [BotModule],
  providers: [DutyService],
})
export class DutyModule {}
