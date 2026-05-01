import { Global, Module } from '@nestjs/common';

import { BotEventBusService } from './bot-event-bus.service';
import { BotSenderService } from './bot-sender.service';
import { TelegramApiService } from './telegram-api.service';

@Global()
@Module({
  providers: [BotEventBusService, TelegramApiService, BotSenderService],
  exports: [BotEventBusService, TelegramApiService, BotSenderService],
})
export class BotCoreModule {}
