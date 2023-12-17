import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { BotModule } from '../bot/bot.module';
import { CronsModule } from '../crons/crons.module';
import { DatabaseModule } from '../database/database.module';
import { DutyModule } from '../duty/duty.module';
import { IEnvironment } from '../environments/env-type';
import { HelloMessagesModule } from '../hello-messages/hello-messages.module';
import { PostInterceptor } from '../interceptors/post.interceptor';
import { LoggerModule } from '../logger/logger.module';
import { LoginModule } from '../login/login.module';
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
        LoginModule,
        DutyModule,
        HelloMessagesModule,
        ReactionsModule,
        CronsModule,
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
      ],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: PostInterceptor,
        },
      ],
    };
  }
}
