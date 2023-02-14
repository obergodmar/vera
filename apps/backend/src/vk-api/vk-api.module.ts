import { Module } from '@nestjs/common';

import { BotModule } from '../bot/bot.module';
import { VkApiService } from './vk-api.service';

@Module({
  imports: [BotModule],
  providers: [VkApiService],
  exports: [VkApiService],
})
export class VkApiModule {}
