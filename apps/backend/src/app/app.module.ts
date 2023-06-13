import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { DutyModule } from '../duty/duty.module';
import { LoggerModule } from '../logger/logger.module';
import { LoginModule } from '../login/login.module';
import { StaticModule } from '../static/static.module';
import { VkApiModule } from '../vk-api/vk-api.module';

@Module({
  imports: [
    LoggerModule,
    VkApiModule,
    ConfigModule,
    LoginModule,
    DutyModule,
    StaticModule,
  ],
})
export class AppModule {}
