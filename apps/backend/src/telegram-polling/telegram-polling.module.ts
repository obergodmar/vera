import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TelegramChat } from '../bot-platform/entities/telegram-chat.entity';
import { TelegramChatMember } from '../bot-platform/entities/telegram-chat-member.entity';
import { TelegramPollingService } from './telegram-polling.service';

@Module({
  imports: [TypeOrmModule.forFeature([TelegramChat, TelegramChatMember])],
  providers: [TelegramPollingService],
})
export class TelegramPollingModule {}
