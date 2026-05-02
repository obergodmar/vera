import { Global, Module } from '@nestjs/common';

import { BotEventBusService } from './bot-event-bus.service';
import { TelegramApiService } from './telegram-api.service';

@Global()
@Module({
  providers: [BotEventBusService, TelegramApiService],
  exports: [BotEventBusService, TelegramApiService],
})
export class BotCoreModule {}
