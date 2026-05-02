import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IEnvironment } from '../environments/env-type';
import { TelegramChat } from './entities/telegram-chat.entity';
import { TelegramChatMember } from './entities/telegram-chat-member.entity';
import { BOT_PLATFORM_TOKEN } from './IBotPlatform';
import { TelegramBotPlatformService } from './telegram-bot-platform.service';
import { VkBotPlatformService } from './vk-bot-platform.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([TelegramChat, TelegramChatMember])],
  providers: [
    VkBotPlatformService,
    TelegramBotPlatformService,
    {
      provide: BOT_PLATFORM_TOKEN,
      useFactory: (
        config: ConfigService,
        vk: VkBotPlatformService,
        tg: TelegramBotPlatformService,
      ) => {
        const platform =
          config.get<IEnvironment['botPlatform']>('botPlatform') ?? 'vk';
        return platform === 'telegram' ? tg : vk;
      },
      inject: [ConfigService, VkBotPlatformService, TelegramBotPlatformService],
    },
  ],
  exports: [BOT_PLATFORM_TOKEN],
})
export class BotPlatformModule {}
