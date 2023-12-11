import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BotModule } from '../bot/bot.module';
import { CronsModule } from '../crons/crons.module';
import { DatabaseModule } from '../database/database.module';
import { DutyModule } from '../duty/duty.module';
import { getEnvConfig } from '../environments/env-config';
import { envValidation } from '../environments/env-validator';
import { HelloMessagesModule } from '../hello-messages/hello-messages.module';
import { LoggerModule } from '../logger/logger.module';
import { LoginModule } from '../login/login.module';
import { ReactionsModule } from '../reactions/reactions.module';
import { SettingsModule } from '../settings/settings.module';
import { StaticModule } from '../static/static.module';
import { VkApiModule } from '../vk-api/vk-api.module';

@Module({
  imports: [
    /**
     * Global Modules
     */
    SettingsModule,
    VkApiModule,
    BotModule,
    LoggerModule,
    /**
     * Functionality
     */
    LoginModule,
    DutyModule,
    HelloMessagesModule,
    ReactionsModule,
    CronsModule,
    /**
     * Core
     */
    StaticModule,
    DatabaseModule,
    ConfigModule.forRoot({
      load: [getEnvConfig],
      isGlobal: true,
      cache: true,
      validate: envValidation,
    }),
  ],
})
export class AppModule {}
