import { Module } from '@nestjs/common';

import { TelegramPollingService } from './telegram-polling.service';

@Module({
  providers: [TelegramPollingService],
})
export class TelegramPollingModule {}
