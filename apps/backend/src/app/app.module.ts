import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../auth/auth.module';
import { BotModule } from '../bot/bot.module';
import { CommandsModule } from '../commands/commands.module';
import { CronsModule } from '../crons/crons.module';
import { DatabaseModule } from '../database/database.module';
import { DutyModule } from '../duty/duty.module';
import { IEnvironment } from '../environments/env-type';
import { HealthModule } from '../health/health.module';
import { HelloMessagesModule } from '../hello-messages/hello-messages.module';
import { LoggerModule } from '../logger/logger.module';
import { ReactionsModule } from '../reactions/reactions.module';
import { SettingsModule } from '../settings/settings.module';
import { StaticModule } from '../static/static.module';
import { VkApiModule } from '../vk-api/vk-api.module';

export class AppModule {
  public static forRoot(environment: IEnvironment): DynamicModule {
    return {
      module: AppModule,
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
        AuthModule,
        DutyModule,
        HelloMessagesModule,
        ReactionsModule,
        CronsModule,
        CommandsModule,
        /**
         * Core
         */
        StaticModule,
        DatabaseModule.forRoot(environment),
        ConfigModule.forRoot({
          load: [() => environment],
          isGlobal: true,
          cache: true,
        }),
        HealthModule,
      ],
    };
  }
}
