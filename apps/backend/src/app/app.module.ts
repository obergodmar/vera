import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { DutyModule } from '../duty/duty.module';
import { HelloMessagesModule } from '../hello-messages/hello-messages.module';
import { LoggerModule } from '../logger/logger.module';
import { LoginModule } from '../login/login.module';
import { StaticModule } from '../static/static.module';
import { VkApiModule } from '../vk-api/vk-api.module';

@Module({
  imports: [
    VkApiModule,
    /**
     * Global Modules
     */
    LoggerModule,
    ConfigModule,
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
  ],
})
export class AppModule {}
