import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../database/database.module';
import { DutyModule } from '../duty/duty.module';
import { getEnvConfig } from '../environments/env-config';
import { envValidation } from '../environments/env-validator';
import { HelloMessagesModule } from '../hello-messages/hello-messages.module';
import { LoggerModule } from '../logger/logger.module';
import { LoginModule } from '../login/login.module';
import { StaticModule } from '../static/static.module';
import { VkApiModule } from '../vk-api/vk-api.module';

@Module({
  imports: [
    /**
     * Global Modules
     */
    VkApiModule,
    LoggerModule,
    /**
     * Functionality
     */
    LoginModule,
    DutyModule,
    HelloMessagesModule,
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
